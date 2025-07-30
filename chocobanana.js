const emptyCellColor = "white";         // not-filled
const indetCellColor = "#e0e0e0";       // indeterminant color (default)
const fillCellColor = "#000040";        // filled, slightly dark blue to contrast with black walls
const incorrectBlackColor = "#802020";  // dark reddish
const incorrectWhiteColor = "#FFE0E0";  // light red

const stdFontColor = "black";
const offFontColor = "white";
const errorFontColor = "red";
const correctFontColor = "green";

let clicking = false;
let dragging = false;
let errorCount = 0;
let incompleteCount = 0;
let assistState = 0;

const KEY_BS    = 0x08;
const KEY_CR    = 0x0d;
const KEY_SP    = 0x20;
const KEY_LEFT  = 0x25;
const KEY_UP    = 0x26;
const KEY_RIGHT = 0x27;
const KEY_DOWN  = 0x28;
const KEY_0     = 0x30;
const KEY_1     = 0x31;
const ALT_0     = 0x60; // these are the number pad versions
const ALT_1     = 0x61;

const STATE_WHITE = 1;
const STATE_BLACK = 2;
const STATE_INDET = 3;

// which keys are handled
let handledKeys = [ KEY_BS, KEY_CR, KEY_SP, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_0, KEY_1, ALT_0, ALT_1 ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleRoomList, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;

  // any key anywhere as long as canvas is in focus
  $(document).keydown(function(evnt) {
    $("#saveButton").blur();
    $("#loadButton").blur();
    $("#resetButton").blur();
    $("#showButton").blur();
    $("#undoButton").blur();
    $("#assistButton").blur();
    if (evnt.which === KEY_SP && !$(evnt.target).is("input")) {
      evnt.preventDefault();
    }
    if (evnt.which >= KEY_LEFT && evnt.which <= KEY_DOWN && !$(evnt.target).is("input, textarea")) {
      evnt.preventDefault();
    }
    if (handledKeys.find(element => element == evnt.which)) {
      handleKey(evnt.which);
    }
  });

  // a click (except right-click i.e. ctrl-click) on tabs.
  // hide old, show new
  $("#tabs li").click(function() {      
    $("#tabs li").removeClass('active');    
    $(this).addClass("active");     
    $(".tab_content").hide();
    $($(this).find("a").attr("href")).show();
    clicking = false;
    return false;
  });
  
  $("#tab1").show();
  $("#demotab").hide();

  // a click on display button; currently fails on Invalid Array
  // if the field in front of it doesn't work
  // Length in displayPuzzle (height?)
  $("#displayButton").click(function() {
    $("#userSolvePuzzle").val("");
    let pval = $("#userPuzzle").val();
    if (pval.search(/:/) == -1) {
      if (pval < cannedPuzzles.length) {
        puzzleChoice = pval;
        initPuzzle = cannedPuzzles[pval];
        puzzle = removeDot(initPuzzle);
        updateHtmlDescr(initPuzzle);
        // check to see if this is a demo puzzle
        let search = demoPuzzles.find(element => element == pval);
        if (search !== undefined) {
          $("#demotab").show();
          demoStepNum = 0;
          updateDemoRegion(pval);
        } else {
          $("#demotab").hide();
        }
      }
    } else {
      $("#demotab").hide();
      initPuzzle = pval;
      puzzle = removeDot(pval);
      updateHtmlDescr(initPuzzle);
    }
    initStructures(puzzle);
  });

  $("#nextDemoButton").click(function() {
    demoStepNum++;
    updateDemoRegion(puzzleChoice);
  });

  $("#prevDemoButton").click(function() {
    if (demoStepNum) {
      demoStepNum--;
    }
    updateDemoRegion(puzzleChoice);
  });

  // click (down) within puzzle number entry, remove clicking
  // effect on canvas
  $("#userPuzzle").mousedown(function(evnt) {
    clicking = false;
  });

  // click (down) within puzzle frame, find out if contains number already
  $("#puzzleCanvas").mousedown(function(evnt) {
    clicking = true;
    $("#puzzleCanvas").css("border-color", "black");
    handleClick(evnt);
  });

  // moving mouse within puzzle area (clicking is true if already moused down => dragging)
  $("#puzzleCanvas").mousemove(function(evnt) {
    if (clicking == false) return;
    evnt.preventDefault();
    dragging = true;
  });

  // releasing mouse within puzzle or not within puzzle
  $(document).mouseup(function() {
    clicking = false;
    dragging = false;
  });

  // undo click, remove the last move
  $("#undoButton").click(function() {
    $("#canvasDiv").css("border-color", "black");
    undoMove();
  });

  // click on reset, brings up confirmation, then resets puzzle
  $("#resetButton").click(function() {
    $("#canvasDiv").css("border-color", "black");
    let resetDialog = confirm("Reset puzzle?");
    if (resetDialog == true) {
      resetBoard();
    }
  });

  // click on show errors, converts to show how many errors remain
  $("#assistButton").click(function() {
    assistState = (assistState+1)%3;
    updateBoardStatus();
    drawBoard();
  });

  // unknown at this point, but contextmenu is within jquery.js
  // I added the ; which seems to not have changed anything so
  // I don't think it is related to what follows
  $("#puzzleCanvas").bind("contextmenu", function(evnt) { evnt.preventDefault(); });

  canvas = document.getElementById('puzzleCanvas');  
  globalContext = canvas.getContext('2d');

  if(cannedPuzzles[puzzleChoice]) {
    initPuzzle = cannedPuzzles[puzzleChoice];
    puzzle = removeDot(initPuzzle);
  } else {
    initPuzzle = cannedPuzzles[0];
    puzzle = removeDot(initPuzzle);
  }

  initStructures(puzzle);

  updateStaticHtmlEntries(
    initPuzzle,
    cannedPuzzles[1],
    puzzleCount,
    '[' + demoPuzzles.join(", ") + ']',
    demoPuzzles.length);
}

function updateDynTextFields() {
  let etext = '';
  if (assistState == 0) { 
    if (errorCount && incompleteCount) {
      etext = "there are errors and indeterminate squares";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteCount) {
      etext = "there are indeterminate squares";
    } else {
      etext = "there are no errors nor indeterminate squares";
    }
  } else {
    etext = "there are " + errorCount + " errors and " +
                      incompleteCount + " indeterminate squares";
  }
  updateDynamicHtmlEntries(etext,assistState);
}

function addHistory(y,x,prevvalue,newvalue) {
  moveHistory.push([y,x,prevvalue,newvalue]);
}

function addMove(moveType,y,x) {
  addHistory(y,x,puzzleBoardStates[y][x],moveType);
  puzzleBoardStates[y][x] = moveType;
  // colors will be overridden based upon error status
  globalBoardColors[y][x] =
    (moveType == STATE_WHITE) ? emptyCellColor :
    (moveType == STATE_BLACK) ? fillCellColor :
                                indetCellColor;
  globalBoardTextColors[y][x] = (moveType == STATE_BLACK) ? offFontColor : stdFontColor;
}

function handleKey(keynum) {
  const focusedElement = document.activeElement;
  // look for CR within puzzle display field
  if ((keynum == KEY_CR) && focusedElement && focusedElement.id == "userPuzzle") {
    let pval = $("#userPuzzle").val();
    if (pval.search(/:/) == -1) {
      if (pval < cannedPuzzles.length) {
        puzzleChoice = pval;
        initPuzzle = cannedPuzzles[pval];
        puzzle = removeDot(initPuzzle);
        updateHtmlDescr(initPuzzle);
        // check to see if this is a demo puzzle
        let search = demoPuzzles.find(element => element == pval);
        if (search !== undefined) {
          $("#demotab").show();
          demoStepNum = 0;
          updateDemoRegion(pval);
        } else {
          $("#demotab").hide();
        }
      }
    } else {
      $("#demotab").hide();
      initPuzzle = pval;
      puzzle = removeDot(initPuzzle);
      updateHtmlDescr(initPuzzle);
    }
    initStructures(puzzle);
  // else look for keys not in puzzle display field
  } else if (focusedElement && focusedElement.id != "userPuzzle") {
    switch (keynum) {
      case KEY_UP:
        if (globalCursorY) {
          globalCursorY--;
        }
        break;
      case KEY_DOWN:
        if (globalCursorY < (globalPuzzleH-1)) {
          globalCursorY++;
        }
        break;
      case KEY_LEFT:
        if (globalCursorX) {
          globalCursorX--;
        }
        break;
      case KEY_RIGHT:
        if (globalCursorX < (globalPuzzleW-1)) {
          globalCursorX++;
        }
        break;
      case KEY_SP: // toggle through states like the click
        if (puzzleBoardStates[globalCursorY][globalCursorX] == STATE_INDET) {
          addMove(STATE_BLACK,globalCursorY,globalCursorX,STATE_INDET);
        } else if (puzzleBoardStates[globalCursorY][globalCursorX] == STATE_BLACK) {
          addMove(STATE_WHITE,globalCursorY,globalCursorX,STATE_BLACK);
        } else {
          addMove(STATE_INDET,globalCursorY,globalCursorX,STATE_WHITE);
        }
        break;
      case KEY_BS:
        addMove(STATE_INDET,globalCursorY,globalCursorX);
        break;
      case KEY_0:
      case ALT_0:
        addMove(STATE_WHITE,globalCursorY,globalCursorX);
        break;
      case KEY_1:
      case ALT_1:
        addMove(STATE_BLACK,globalCursorY,globalCursorX);
        break;
      }
    updateBoardStatus();
    drawBoard();
  }
}

function initStructures(puzzle) {
  $("#canvasDiv").css("border-color", "black");
  moveHistory = new Array();
  // get the size and the digits out of the puzzle entry
  let puzzleSplit = puzzle.split(":");
  let size = puzzleSplit[0];
  let wxh = size.split("x");
  let numParams = puzzleSplit[1];
  let hexParams = puzzleSplit[2];
  globalPuzzleW = parseInt(wxh[0]);
  globalPuzzleH = parseInt(wxh[1]);
  setGridSize(globalPuzzleW);
  canvas.height = globalPuzzleH*globalGridSize;
  canvas.width  = globalPuzzleW*globalGridSize;

  globalInitBoardValues = initBoardValuesFromParams(numParams);
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  globalCircleStates =    initYXFromValue(0);     // no circles, lines needed in this puzzle
  globalLineStates   =    initYXFromValue(0);
  globalBoardColors =     initYXFromValue(indetCellColor);
  puzzleBoardStates =     initYXFromValue(STATE_INDET);
  globalInitWallStates  = initWallStates(constWallDash);
  globalWallStates =      initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  globalBoardTextColors = initYXFromValue(stdFontColor); // all text is black

  // override board colors if the hexParams are included, just for 0th
  // entry of the puzzles (example completed puzzle). this uses hex values
  // to define the black (1) or white (0) states
  if (hexParams) {
    let stateHexes = hexParams.split("");
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        let stateHex = stateHexes[y*Math.ceil(globalPuzzleW/4)+Math.floor(x/4)];
        let stateTrue = (parseInt(stateHex,16) & (1<<(3-(x%4)))) ? 1 : 0;
        puzzleBoardStates[y][x] = stateTrue ? STATE_BLACK : STATE_WHITE;
      }
    }
  }

  updateBoardStatus();
  drawBoard();
}

function removeDot(strval) {
  return strval.replace(/\./gi, "");
}

function findPosition(evnt, canvas) {
  let canvasElement = document.getElementById(canvas);
  let x = evnt.pageX-$(canvasElement).offset().left-parseInt($(canvasElement).css("border-left-width"));
  let y = evnt.pageY-$(canvasElement).offset().top-parseInt( $(canvasElement).css("border-top-width"));
  return x+","+y;
}

function handleClick(evnt) {
  let tileColor;
  $("#userPuzzleField").blur();
  let coords = findPosition(evnt, "puzzleCanvas");
  coords = coords.split(",");
  let yCell, xCell, isEdge, yEdge, xEdge;
  [ yCell, xCell, isEdge, yEdge, xEdge ] = getClickCellInfo(coords);
//console.log(yCell + "," + xCell + "," + isEdge + "," + yEdge + "," + xEdge);
  
  globalCursorY = yCell;
  globalCursorX = xCell;
  // switch through the board states, indet --> black --> white --> indet
  if (puzzleBoardStates[yCell][xCell] == STATE_INDET) {
    addMove(STATE_BLACK,yCell,xCell,STATE_INDET);
  } else if (puzzleBoardStates[yCell][xCell] == STATE_BLACK) {
    addMove(STATE_WHITE,yCell,xCell,STATE_BLACK);
  } else {
    addMove(STATE_INDET,yCell,xCell,STATE_WHITE);
  }
  updateBoardStatus();
  drawBoard();
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) digits within rooms that don't equate
  //  2) black rooms that are not rectangular
  //  3) white rooms that are rectangular
  errorCount = 0;

  // also count how many cells are still indeterminate
  incompleteCount = 0;

  // start by reseting all cell and font colors to "standard"
  // before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] == STATE_BLACK) {
        globalBoardColors[y][x] = fillCellColor;
        globalBoardTextColors[y][x] = offFontColor;
      } else if (puzzleBoardStates[y][x] == STATE_WHITE) {
        globalBoardColors[y][x] = emptyCellColor;
        globalBoardTextColors[y][x] = stdFontColor;
      } else {
        globalBoardColors[y][x] = indetCellColor;
        globalBoardTextColors[y][x] = stdFontColor;
      }
    }
  }

  // now go through all of the cells with digits. first
  // check if they are black or white, and then check
  // that they have the right number, and then that
  // the right number is the right shape based upon the
  // color. ignore if still indeterminate.
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let cellValue = globalBoardValues[y][x];
      let cellState = puzzleBoardStates[y][x];
      if ((cellValue != "") && (cellState != STATE_INDET)) {
        let roomArray = travelRiver(puzzleBoardStates,y,x,true,cellState);
        if (cellValue != roomArray.length) {
          // violates rule 1
          errorCount++;
          if (assistState == 2) {
            globalBoardTextColors[y][x] = errorFontColor;
          }
        } else if (roomIsRectangle(roomArray)) {
          if (cellState == STATE_BLACK) {
            // success
            if (assistState == 2) {
              globalBoardTextColors[y][x] = correctFontColor;
            }
          } else {
            // violates rule 2
            errorCount++;
            if (assistState == 2) {
              globalBoardTextColors[y][x] = errorFontColor;
            }
          }
        } else {
          if (cellState == STATE_WHITE) {
            // success
            if (assistState == 2) {
              globalBoardTextColors[y][x] = correctFontColor;
            }
          } else {
            // violates rule 3
            errorCount++;
            if (assistState == 2) {
              globalBoardTextColors[y][x] = errorFontColor;
            }
          }
        }
      } else if (cellState == STATE_INDET) {
        incompleteCount++;
      }
    }
  }

  // final step is to check the shape of all white and black rooms
  let checkedCells = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let cellState = puzzleBoardStates[y][x];
      if ((cellState != STATE_INDET) && (checkedCells.indexOf(y+","+x) == -1)) {
        let roomArray = travelRiver(puzzleBoardStates,y,x,true,cellState);
        let roomRect = roomIsRectangle(roomArray);
        let errBlack = (cellState == STATE_BLACK && !roomRect) ? true : false;
        let errWhite = (cellState == STATE_WHITE &&  roomRect) ? true : false;
        if (errBlack || errWhite) {
          // if there is a digit somewhere within the room then don't double-count
          // the error, it was counted above
          let hasDigit = 0;
          for (let i=0;i<roomArray.length;i++) {
            let rcell = roomArray[i].split(",");
            let ry = rcell[0];
            let rx = rcell[1];
            if (globalBoardValues[ry][rx] != '') {
              hasDigit = globalBoardValues[ry][rx];
            }
            if (assistState == 2) {
              globalBoardColors[ry][rx] = errBlack ? incorrectBlackColor : incorrectWhiteColor;
            }
          }
          if (hasDigit==0) {
            errorCount++;
          }
        }
        checkedCells.push.apply(checkedCells, roomArray);
      }
    }
  }

  updateDynTextFields();
  if ((errorCount == 0) && (incompleteCount == 0)) {
    $("#canvasDiv").css("border-color", constColorSuccess);
  } else {
    $("#canvasDiv").css("border-color", "black");
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    puzzleBoardStates[lastMove[0]][lastMove[1]] = lastMove[2];
    updateBoardStatus();
    drawBoard();
  }
}

function resetBoard() {
  $("#resetButton").blur();
  $("#showButton").blur();
  $("#assistButton").blur();
  initStructures(puzzle);
}

function updateDemoRegion(demoNum) {
  let demotext, demomoves;
  // for brevity in the demo steps below, use B and W for black and white
  if (demoNum==1) {
    demotext = [
      "<p>In this demo we will walk through the steps of solving this puzzle. " +
        "Press the 'next' button to walk through the solving steps, or the " +
        "'back' button to return to the previous step.</p>" +
        "<p>At the beginning of a solve, there are no errors, but there are " +
        "many indeterminate squares which we need to turn white or black to " +
        "solve the puzzle. For our first time through we can turn on Assist " +
        "Mode 2 to see any errors that we might generate in the process of " +
        "the solve. Note as the 'rooms' are forming, there will temporarily " +
        "be errors denoted, for instance as you are forming a square of 2x2 " +
        "black squares, the first three clicked will create a non-rectangular " +
        "black square room, which is temporarily erroneous. These can be ignored.</p>",
      "In Choco Banana, it is always easiest to solve two types of rooms: those " +
        "with a '1' digit inside, and those with a '2'. By definition, these " +
        "must be rectangular, and thus must be black. These rooms can be " +
        "satisfied, though recognize that a '2' digit by itself can be set " +
        "black, but it isn't always obvious where its second neighbor is as " +
        "in this case.",
      "Now we can turn to the definition of a region and infer that all " +
        "horizontal and vertical neighbors of these black rooms can now be " +
        "set to white, so as to not add any more black squares to the completed " +
        "rooms. Since we're in assist mode two, these are highlighted as " +
        "erroneous for indeed at the moment they are all rectangular white " +
        "regions, which violates rule 3.",
      "Now an important observation must be made in order to proceed. Looking " +
        "at the upper-right isolated white square, it <b>must</b> have a white " +
        "square to its left, as a black square would isolate it as a white " +
        "1x1 rectangle, which would violate rule 3. So we can set its left " +
        "neighbor to white as well. Similarly, the white square above the " +
        "two black '1' cells must be set to white as well, for the same " +
        "reason. This declares that the '4' digit is indeed a 4-square " +
        "room of white cells. This 'validates' those two white squares, " +
        "combining them into legal non-rectangular white rooms.",
      "Now we must lock in the shape of the '4' digit room with four white " +
        "squares. In order to not grow any larger, its above neighbors and " +
        "right neighbor must be set to black.",
      "Now this sets the stage for the final steps. The '6' digit is in " +
        "violation of rule 1, as there are only 3 black squares in its room " +
        "at the moment. But it is clear there is only one geometric arrangement " +
        "of black squares that would make it a 6-square rectangle at this point. " +
        "We can set those 3 cells above it to black, and the 3 above that to " +
        "white to ensure it doesn't 'grow'.",
      "Now there is only one indeterminate square remaining. It might seem there " + 
        "are two potential solutions to this puzzle, that either black or white " +
        "would satisfy the puzzle. But recall that even rooms without digits " +
        "in them must satisfy rules 2 and 3. If we were to set the bottom " +
        "right square to black, then the white squares would be isolated as " +
        "1x1 rectangles, which violated rule 3. Thus white is the only correct " +
        "solution.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      [],
      ["B14","B24","B40","B42"],
      ["W04","W13","W23","W34","W30","W41","W32","W43"],
      ["W03","W31"],
      ["B20","B21","B22","B33"],
      ["B10","B11","B12","W00","W01","W02"],
      ["W44"]];
  } else {
    demotext = [
      "<p>In this demo we will walk more quickly through the steps of solving " +
        "this puzzle. It is recommended to go through demo 1 first. Press the " +
        "'next' button to walk through the solving steps, or the 'back' button " +
        "to return to the previous step. You can also use the undo button to move " +
        "backwards individual steps, or continue playing forward if you wish.</p>" +
        "<p>The first thing to do is to turn on the assist mode to let us know " +
        "which rooms still need completion. Then there are two easy rooms to solve, " +
        "again the 1-digit and 2-digit rooms. We can set them to black and their " +
        "horizontal and vertical neighbors to white.</p>",
      "Like the first demo, we can extend the white region in the isolated room " +
        "in the bottom left, which guarantees that the 3-digit in the leftmost " +
        "column must be white. Once that is ensured, we can set its neighbors to " +
        "black to ensure it doesn't grow.",
      "Now we see several areas that can be solved. The isolated white square on " +
        "the leftmost column must be connected to a white non-rectangular room, " +
        "so setting its righthand neighbor to white completes the '4'-digit room. " +
        "Its righthand neighbors can thus be set to black. Now looking at the " +
        "'3'-digit in violation in the second to bottom row, there is only one " +
        "direction that rectangular room can grow, and that is to the right. So " +
        "we can set its neighbors to white to bound its size.",
      "At this point we can't be sure if the '6'-digit pertains to a black " +
        "rectangle or a white non-rectangular room. But looking at the '4'-digit " +
        "we can see that setting it to white would join it into a region that is " +
        "already larger than 4. Thus it must be black. And then it is clear that " +
        "growing upwards is the only option. While we are at it we can set the " +
        "bottom right square to white to connect the otherwise isolated rectangular " +
        "region of white on the bottom row.",
      "Now it is clear there is no way to make a white region including the " +
        "'6'-digit, so it must be part of a 3x2 rectangle, completing the solve.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      ["B00","B10","W01","W11","W20","B51","W50","W41","W52"],
      ["W40","B30","B31","B42",],
      ["W21","B02","B12","B22","B43","B44","W32","W33","W34","W45","W53","W54"],
      ["B35","B25","B15","B05","W24","W14","W04","W55"],
      ["B23","B13","B03"]];
  }
  if (demoStepNum < demotext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHtmlText('demotext', demotext[demoStepNum]);
    puzzleBoardStates = initYXFromValue(STATE_INDET);
    globalBoardColors = initYXFromValue(indetCellColor);
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      let demosteps = demomoves[step];
      for (let i=0;i<demosteps.length;i++) {
        let steps = demosteps[i].split("");
        let s0 = (steps[0] == 'W') ? STATE_WHITE : STATE_BLACK;
        addMove(s0,steps[1],steps[2]);
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}

function fdelay(num) {
  let now = new Date();
  let stop = now.getTime() + num;
  while (true) {
    now = new Date();
    if (now.getTime() > stop) {
      return;
    }
  }
}
