const emptyCellColor = "white";         // not-filled
const indetCellColor = "#e0e0e0";       // indeterminant color (default)
const fillCellColor  = "#000040";       // filled, slightly dark blue to contrast with black walls
const incorrectRiverColor = "#802020";  // dark reddish
const incorrectPoolColor = "#202080";   // dark bluish

const stdFontColor = "black";
const offFontColor = "white";
const errorFontColor = "red";
const correctFontColor = "green";

let clicking = false;
let dragging = false;
let errorCount = 0;
let incompleteCount = 0;
let indeterminates = 0;
let assistState = 0;
let curClickType = CLICK_UNKNOWN;
let debugMode = false;

const STATE_WHITE = 1;
const STATE_BLACK = 2;
const STATE_INDET = 3;

// which keys are handled
let handledKeys =
  [ KEY_BS, KEY_CR, KEY_ESC, KEY_SP, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN,
    KEY_0, KEY_1, ALT_0, ALT_1 ];

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
    handleClick(evnt);
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
      etext = "there are errors and incomplete numbers";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteCount) {
      etext = "there are incomplete numbers";
    } else if (indeterminates) {
      etext = "there are indeterminate tiles";
    } else {
      etext = "there are no errors nor incomplete numbers";
    }
  } else {
    if (errorCount || incompleteCount) {
      etext = "there are " + errorCount + " errors and " +
                        incompleteCount + " incomplete numbers";
    } else if (indeterminates) {
      etext = "there are " + indeterminates + " indeterminate tiles";
    } else {
      etext = "there are no errors nor incomplete numbers";
    }
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
      case KEY_ESC:
        console.log(puzzleBoardStates);
        debugMode = true;
        break;
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
      case KEY_SP: // toggle through states
        if (globalBoardValues[globalCursorY][globalCursorX] == "") {
          if (puzzleBoardStates[globalCursorY][globalCursorX] == STATE_INDET) {
            addMove(STATE_BLACK,globalCursorY,globalCursorX,STATE_INDET);
          } else if (puzzleBoardStates[globalCursorY][globalCursorX] == STATE_BLACK) {
            addMove(STATE_WHITE,globalCursorY,globalCursorX,STATE_BLACK);
          } else {
            addMove(STATE_INDET,globalCursorY,globalCursorX,STATE_WHITE);
          }
        }
        break;
      case KEY_BS:
        if (globalBoardValues[globalCursorY][globalCursorX] == "") {
          addMove(STATE_INDET,globalCursorY,globalCursorX);
        }
        break;
      case KEY_0:
      case ALT_0:
        if (globalBoardValues[globalCursorY][globalCursorX] == "") {
          addMove(STATE_WHITE,globalCursorY,globalCursorX);
        }
        break;
      case KEY_1:
      case ALT_1:
        if (globalBoardValues[globalCursorY][globalCursorX] == "") {
          addMove(STATE_BLACK,globalCursorY,globalCursorX);
        }
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
  globalInitWallStates  = initWallStates(constWallStandard);
  globalWallStates =      initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  globalBoardTextColors = initYXFromValue(stdFontColor); // all text is black

  // override board states and colors for the initial digits, set to WHITE
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (globalBoardValues[y][x] != "") {
        puzzleBoardStates[y][x] = STATE_WHITE;
        globalBoardColors[y][x] = emptyCellColor;
      }
    }
  }

  // override state if given (* for black _ for white)
  let numParamsExt = expandNumParams(numParams).split("");
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let ptr = y*globalPuzzleW+x;
      if (numParamsExt[ptr] == '*') {
        puzzleBoardStates[y][x] = STATE_BLACK;
      } else if (numParamsExt[ptr] == '_') {
        puzzleBoardStates[y][x] = STATE_WHITE;
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
  if (!dragging) {
    curClickType = clickType(evnt);
  }
  $("#userPuzzleField").blur();
  let coords = findPosition(evnt, "puzzleCanvas");
  coords = coords.split(",");
  let yCell, xCell, isEdge, yEdge, xEdge;
  [ yCell, xCell, isEdge, yEdge, xEdge ] = getClickCellInfo(coords);

  // dragging, but no move yet 
  if (dragging && ((yCell == globalCursorY) && (xCell == globalCursorX))) {
    return;
  }
  
  globalCursorY = yCell;
  globalCursorX = xCell;
  // left sets to black, right sets to white, middle sets to indet
  // ignore if already the same state, or if a numbered tile which
  // can't be changed
  if (globalBoardValues[yCell][xCell] == "") {
    if ((curClickType == CLICK_LEFT)   && puzzleBoardStates[yCell][xCell] != STATE_BLACK) {
      addMove(STATE_BLACK,yCell,xCell,puzzleBoardStates[yCell][xCell]);
    }
    if ((curClickType == CLICK_MIDDLE) && puzzleBoardStates[yCell][xCell] != STATE_INDET) {
      addMove(STATE_INDET,yCell,xCell,puzzleBoardStates[yCell][xCell]);
    }
    if ((curClickType == CLICK_RIGHT)  && puzzleBoardStates[yCell][xCell] != STATE_WHITE) {
      addMove(STATE_WHITE,yCell,xCell,puzzleBoardStates[yCell][xCell]);
    }
  }
  updateBoardStatus();
  drawBoard();
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) "white rivers" that aren't the length of a number inside
  //  2) a "white river" that contains two numbers
  //  3) more than one "black river"
  //  4) pools in the black river
  errorCount = 0;

  // also count how many numbers and tiles haven't been completed yet
  incompleteCount = 0;
  indeterminates = 0;

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
        indeterminates++;
      }
    }
  }

  // now go through all of the cells with digits. get both
  // their "== WHITE" rivers and their "!= BLACK" rivers.
  // if they are not the same, they are still in progress,
  // so ignore. if they are the same length, then proceed
  // to check that the length is the digit, else error.
  // then double-check that there aren't two digits within.
  let nonBlackCells = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let cellValue = globalBoardValues[y][x];
      // look for a numerical value
      if (cellValue != "") {
        // skip if already in the nonBlackCell list, since it is covered already
        if (nonBlackCells.indexOf(y+","+x) == -1) {
          let roomArrayWhite =    travelRiver(puzzleBoardStates,y,x,true, STATE_WHITE);
          let roomArrayNonBlack = travelRiver(puzzleBoardStates,y,x,false,STATE_BLACK);
          if (roomArrayWhite.length != roomArrayNonBlack.length) {
            incompleteCount++;
          } else if (roomArrayWhite.length == cellValue) {
            // success
            if (assistState == 2) {
              globalBoardTextColors[y][x] = correctFontColor;
            }
            // just make sure there aren't two digits in the room
            let digitCount = 0;
            for (let r=0;r<roomArrayWhite.length;r++) {
              let cell = roomArrayWhite[r].split(",");
              if (globalBoardValues[cell[0]][cell[1]] != "") {
                digitCount++;
              }
            }
            if (digitCount != 1) {
              for (let r=0;r<roomArrayWhite.length;r++) {
                let cell = roomArrayWhite[r].split(",");
                if (globalBoardValues[cell[0]][cell[1]] != "") {
                  errorCount++;
                  if (assistState == 2) {
                    globalBoardTextColors[y][x] = errorFontColor;
                  }
                }
              }
            }
          } else {
            // violates rule 1
            errorCount++;
            if (assistState == 2) {
              globalBoardTextColors[y][x] = errorFontColor;
            }
          }
        nonBlackCells.push.apply(nonBlackCells, roomArrayNonBlack);
        }
      }
    }
  }

  // Now look for non-white rivers, allowing the indeterminate
  // cells to be counted as potentially black. If there is more
  // than one, then color all of the black squares in everything
  // but the first one as erroneous if in assistState 2
  let nonWhiteCells = new Array();
  let riverCount = 0;
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((puzzleBoardStates[y][x] != STATE_WHITE) &&
          (nonWhiteCells.indexOf(y+","+x) == -1)) {
        let visitedCells = travelRiver(puzzleBoardStates,y,x,false,STATE_WHITE);
        if (riverCount) {
          errorCount++;
          // if in assistState==2 then color these second river
          // cells differently
          if (assistState==2) {
            for (let i=0;i<visitedCells.length;i++) {
              let curCell = visitedCells[i].split(",");
              let iy = curCell[0];
              let ix = curCell[1];
              globalBoardColors[iy][ix] = incorrectRiverColor;
            }
          }
        }
        nonWhiteCells.push.apply(nonWhiteCells, visitedCells);
        riverCount++;
      }
    }
  }

  // finally look for pools of black cells of 2x2 or larger
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((y!=(globalPuzzleH-1)) &&
          (x!=(globalPuzzleW-1)) &&
          (puzzleBoardStates[y  ][x  ] == STATE_BLACK) &&
          (puzzleBoardStates[y+1][x  ] == STATE_BLACK) &&
          (puzzleBoardStates[y  ][x+1] == STATE_BLACK) &&
          (puzzleBoardStates[y+1][x+1] == STATE_BLACK)) {
      errorCount++;
      globalBoardColors[y  ][x  ] = incorrectPoolColor;
      globalBoardColors[y+1][x  ] = incorrectPoolColor;
      globalBoardColors[y  ][x+1] = incorrectPoolColor;
      globalBoardColors[y+1][x+1] = incorrectPoolColor;
      }
    }
  }

  updateDynTextFields();
  if ((errorCount == 0) && (incompleteCount == 0) && (indeterminates == 0)) {
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
        "many indeterminate cell which we need to turn white or black to " +
        "solve the puzzle. For our first time through we can turn on Assist " +
        "Mode 2 to see any errors that we might generate in the process of " +
        "the solve.</p>",
      "In Nurikabe, the easiest 'freebies' are the '1' digits, which must be " +
        "surrounded by all black cells in order to keep them contained into a " +
        "room of size 1.",
      "The next observation is that all numbered cells must be kept away from " +
        "other ones to avoid violating rule 3, so we can isolate them if they " +
        "are too close by setting their neighbor cells to black.",
      "Now we can see that some directions are already determinable. The '2' " +
        "in the NW corner must move downward, the '5' in the SW corner must " +
        "move to the left and then up, and the '2' next to it must move up. We " +
        "can begin to set their squares to white in those directions.",
      "For the two '2' rooms that have been created, we can set their borders " +
        "by setting the boundary squares to black. But sure to not assume that " +
        "you need to set the diagonal boundary squares.",
      "It is now clear how to complete the '5' room in the lower left.",
      "Now two new observations can be made. The first is that the black square " +
        "in the left column is isolated, as is the one in the bottom row. They " +
        "must be connected to the others, and the only way to do so is to set " +
        "their neighbor to black. Secondly, the single isolated indeterminate " +
        "square in the middle can only be set to black, else setting it to " +
        "white would isolate it as a '1' room with no digit, which violates " +
        "rule 2.",
      "Now we have two potential 'pool violations' brewing, below the '3' and " + 
        "above the incomplete '2'. Setting a 4th black square to create a 2x2 " +
        "grid of black squares would violate rule 5, and thus they must be set " +
        "to white.",
      "For the unsolved '2', this completes its room, and its neighbors can be " +
        "set to black. For the cell below the '3', it is now clear that it can " +
        "only be satisfied from above; all other digits are not long enough to " +
        "'make it' to that white square.",
      "In the upper row we have another pool forming, and it must be avoided " +
        "with a white cell, which can only be reached by the '4' to its right.",
      "Now the path for the '4', the final remaining unsolved number is clear.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      [],
      ["B23","B14","B25","B34"],
      ["B01","B51","B62","B53"],
      ["W10","W60","W50","W40","W42"],
      ["B20","B11","B41","B32","B43"],
      ["W30","B31"],
      ["B21","B63","B33"],
      ["W22","W44"],
      ["B45","B55","B64","W12","B03","B13"],
      ["W04","W05","W06","B15","B26"],
      ["W36","W46","W56","B66","B65"]];
  } else {
    demotext = [
      "<p>In this demo we will walk more quickly through the steps of solving " +
        "this puzzle. It is recommended to go through demo 1 first. Press the " +
        "'next' button to walk through the solving steps, or the 'back' button " +
        "to return to the previous step. You can also use the undo button to move " +
        "backwards individual steps, or continue playing forward if you wish.</p>" +
        "<p>The first thing to do is to turn on the assist mode to let us know " +
        "which rooms still need completion. Let's start with the '1' solves and " +
        "the number separation like in the first demo.</p>",
      "We can extend the direction of the '6' in the NW corner, complete the '3' " +
        "in the SW corner, and begin working on the middle bottom '3' and the '4' " +
        "in the SE corner. Meanwhile we can extend the black squares where they " +
        "would otherwise be stranded from connecting with others.",
      "The bottom row '3' is now completeable, as is the SE '4'. Their completions " +
        "and the previous ones strand more black 'rivers' that must be extended " +
        "to connect with others.",
      "The forcing downwards of the '6' and '3' rooms continues to force the " +
        "black river between them to grow downwards as well, until it is at risk " +
        "of being cut off completely. Meanwhile we can grow the '4' in the SW " +
        "corner upwards.",
      "Now the need for that left-side river to connect to the others forces it " +
        "to flow to the right, forcing a turn in the '3' and '4' numbers that " +
        "are coming together.",
      "Now the river to the left of the '2' must connect, so the '2' is forced " +
        "to the right.",
      "Now there are two inner squares at risk of being 'black pools' and must " +
        "be set to white. Also, the black square next to the six must extend " +
        "south one to avoid being stranded.",
      "Finally it should be clear how to complete the six without stranding the " +
        "black square on the right column. In this way you've completed the " +
        "puzzle by attacking those regions that are solveable and saving the " +
        "rest for last.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      ["B02","B11","B54","B45","B56","B65","B61","B72","B76"],
      ["W00","W10","W20","W70","W60","B50","W74","W67","W57","B03","B73","B66"],
      ["W64","B63","W47","B37","B46","B13","B21","B51","B53"],
      ["W30","W22","B31","W40","B41","W52","W42"],
      ["B32","B33","W23","B24","W43","B44","B34"],
      ["B14","W05","B15","B06"],
      ["W25","W35","B16"],
      ["W17","W27","W26","B36"]];
  }
  if (demoStepNum < demotext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHtmlText('demotext', demotext[demoStepNum]);
    // start by reseting all non-number cells to indeterminate
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if (globalBoardValues[y][x] == "") {
          puzzleBoardStates[y][x] = STATE_INDET;
        }
      }
    }
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
