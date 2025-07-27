const emptyCellColor = "white";         // not-filled
const indetCellColor = "#e0e0e0";       // indeterminant color (default)
const fillCellColor = "black";          // filled
const incorrectCellColor = "#802020";   // dark reddish
const tooLongSpanColor = "#FFC0C0";     // light reddish
const incorrectRiverColor = "#FFE0A0";  // light brown

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

const STATE_WHITE = 1;
const STATE_BLACK = 2;
const STATE_INDET = 3;

// which keys are handled
let handledKeys = [ KEY_BS, KEY_CR, KEY_SP, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_0, KEY_1 ];

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
        updateHTML('puzzledescr', cannedPuzzles[pval]);
        initPuzzle = cannedPuzzles[pval];
        puzzle = removeDot(initPuzzle);
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
      updateHTML('puzzledescr', puzzle);
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

  updateHTML('puzzlecount1', puzzleCount-1);
  updateHTML('puzzlecount2', puzzleCount-1);
  updateHTML('descr1',       cannedPuzzles[1]);
  updateHTML('demolist1', '[' + demoPuzzles.join(", ") + ']');
  updateHTML('demolist2', '[' + demoPuzzles.join(", ") + ']');
  updateHTML('democount', demoPuzzles.length);
}

// update HTML data
function updateHTML(spanName, value, isbutton=false) {
  let spanHandle = document.querySelector('#' + spanName);
  if (isbutton) {
    spanHandle.value = value;
  } else {
    spanHandle.innerHTML = value;
  }
}

function updateTextFields() {
  let errorTextHandle = document.querySelector('#errortext');
  if (assistState == 0) { 
    if (errorCount && incompleteCount) {
      updateHTML('errortext', "there are errors and incomplete rooms");
    } else if (errorCount) {
      updateHTML('errortext', "there are errors");
    } else if (incompleteCount) {
      updateHTML('errortext', "there are incomplete rooms");
    } else {
      updateHTML('errortext', "there are no errors nor incomplete rooms");
    }
  } else {
    updateHTML('errortext', "there are " + errorCount + " errors and " +
                            incompleteCount + " incomplete rooms");
  }
  updateHTML('puzzledescr', "puzzle descriptor:<br/>" + initPuzzle);
  updateHTML('assistButton', 'Current Assist Mode (' + assistState + ')', true);
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
        updateHTML('puzzledescr', puzzle);
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
      updateHTML('puzzledescr', puzzle);
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
        addMove(STATE_WHITE,globalCursorY,globalCursorX);
        break;
      case KEY_1:
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
  let roomParams = puzzleSplit[2];
  globalPuzzleW = parseInt(wxh[0]);
  globalPuzzleH = parseInt(wxh[1]);
  setGridSize(globalPuzzleW);
  canvas.height = globalPuzzleH*globalGridSize;
  canvas.width  = globalPuzzleW*globalGridSize;

  globalInitBoardValues = initBoardValuesFromParams(numParams,false,true);
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  globalCircleStates =    initYXFromValue(0);     // no circles, lines needed in this puzzle
  globalLineStates   =    initYXFromValue(0);
  globalBoardColors =     initYXFromValue(indetCellColor);
  puzzleBoardStates =     initYXFromValue(STATE_INDET);
  globalBoardTextColors = initYXFromValue(stdFontColor); // all text is black

  // override board values and colors with _ for white and * for black
  // and for special case of 0th puzzle, A-J for black and K-T for white
  let numParamsExp = expandNumParams(numParams);
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (numParamsExp[y*globalPuzzleH+x] == '_') {
        puzzleBoardStates[y][x] = STATE_WHITE;
        globalBoardColors[y][x] = emptyCellColor;
      } else if (numParamsExp[y*globalPuzzleH+x] == '*') {
        puzzleBoardStates[y][x] = STATE_BLACK;
        globalBoardColors[y][x] = fillCellColor;
      } else if (numParamsExp[y*globalPuzzleH+x].search(/[K-T]/) != -1) {
        puzzleBoardStates[y][x] = STATE_WHITE;
        globalBoardColors[y][x] = emptyCellColor;
      } else if (numParamsExp[y*globalPuzzleH+x].search(/[A-J]/) != -1) {
        puzzleBoardStates[y][x] = STATE_BLACK;
        globalBoardColors[y][x] = fillCellColor;
      }
    }
  }

  // initialize the wall states based upon the room parameters
  globalInitWallStates  = initWallStatesFromBoxes(roomParams, constWallLight);
  globalWallStates = initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  puzzleRoomList  = initRoomsFromBoxes(roomParams,numParams);
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

// look for errors and incompletions
function updateBoardStatus() {
  // accounting the errors:
  //  1) too many set squares in a room with a number
  //  2) two black cells next to each other
  //  3) a white span that goes across 3 rooms
  //  4) white spans that are "blocked" from making a long river
  //
  // also count the incomplete rooms, which are rooms
  // that don't have the correct number of black squares
  errorCount = 0;
  let incompleteRooms = new Array();
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

  for (let p=0;p<puzzleRoomList.length;p++) {
    let roomInfo = puzzleRoomList[p];
    let roomCount = roomInfo[4];
    let bcount = 0;
    let isIncomplete = 0;
    for (let y=roomInfo[0];y<(roomInfo[0]+roomInfo[2]);y++) {
      for (let x=roomInfo[1];x<(roomInfo[1]+roomInfo[3]);x++) {
        if (puzzleBoardStates[y][x] == STATE_BLACK) {
          bcount++;
        } else if (puzzleBoardStates[y][x] == STATE_INDET) {
          isIncomplete = 1;
        }
      }
    }
    if ((roomCount != EMPTYCELL) && (bcount > roomCount)) {
      errorCount++;
    }
    if (isIncomplete) {
      incompleteCount++;
    }
    // if isn't incomplete, also count errors if < expected count
    if (!isIncomplete && (roomCount != EMPTYCELL) && (bcount < roomCount)) {
      errorCount++;
    }
    // if is complete and room count is off and in assist mode 2,
    // turn any digit inside red. if complete and correct, turn
    // green. since this needs to be undoable, we need to set it
    // to black in all other cases
    for (let y=roomInfo[0];y<(roomInfo[0]+roomInfo[2]);y++) {
      for (let x=roomInfo[1];x<(roomInfo[1]+roomInfo[3]);x++) {
        if ((globalBoardValues[y][x] == "0") || (globalBoardValues[y][x] != "")) {
          if (!isIncomplete && (roomCount != EMPTYCELL) && (assistState == 2)) {
            globalBoardTextColors[y][x] =
              (bcount == roomCount) ? correctFontColor : errorFontColor;
          } else {
            globalBoardTextColors[y][x] =
              (puzzleBoardStates[y][x] == STATE_BLACK) ?
                offFontColor : stdFontColor;
          }
        }
      }
    }
  }

  // rule 2: now count adjacent black cells, only counting
  // one error per "clump". in assist mode 2 these error
  // cells should be colored to indicate the error.
  let filledCells = new Array();
  for (let y=0;y<(globalPuzzleH-1);y++) {
    for (let x=0;x<(globalPuzzleW-1);x++) {
      if ((puzzleBoardStates[y  ][x] == STATE_BLACK) &&
          (puzzleBoardStates[y+1][x] == STATE_BLACK)) {
        errorCount++;
        if (assistState == 2) {
          globalBoardColors[y  ][x] = incorrectCellColor;
          globalBoardColors[y+1][x] = incorrectCellColor;
        }
      }
      if ((puzzleBoardStates[y][x  ] == STATE_BLACK) &&
          (puzzleBoardStates[y][x+1] == STATE_BLACK)) {
        errorCount++;
        if (assistState == 2) {
          globalBoardColors[y][x  ] = incorrectCellColor;
          globalBoardColors[y][x+1] = incorrectCellColor;
        }
      }
    }
  }

  // rule 3: look for too many crossings of room walls
  // for contiguous white cells. if in assist mode 2,
  // color the walls differently to indicate the error

  // start horizontally
  for (let y=0;y<globalPuzzleH;y++) {
    let inwhite = false;
    let crossings = 0;
    let x0;
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] == STATE_WHITE) {
        if (inwhite) {
          if (globalWallStates[2*y+1][2*x] == constWallBorder) {
            crossings++;
            if (crossings==2) {
              errorCount++;
              if (assistState==2) {
                for (let xi=x0;xi<=x;xi++) {
                  globalBoardColors[y][xi] = tooLongSpanColor;
                }
              }
            } else if ((assistState==2) && (crossings>=2)) {
              globalBoardColors[y][x] = tooLongSpanColor;
            }
          } else if ((assistState==2) && (crossings>=2)) {
            globalBoardColors[y][x] = tooLongSpanColor;
          }
        } else {
          inwhite = true;
          crossings = 0;
          x0 = x;
        }
      } else {
        inwhite = false;
        crossings = 0;
      }
    }
  }

  // now vertically
  for (let x=0;x<globalPuzzleW;x++) {
    let inwhite = false;
    let crossings = 0;
    let y0;
    for (let y=0;y<globalPuzzleH;y++) {
      if (puzzleBoardStates[y][x] == STATE_WHITE) {
        if (inwhite) {
          if (globalWallStates[2*y][2*x+1] == constWallBorder) {
            crossings++;
            if (crossings==2) {
              errorCount++;
              if (assistState==2) {
                for (let yi=y0;yi<=y;yi++) {
                  globalBoardColors[yi][x] = tooLongSpanColor;
                }
              }
            } else if ((assistState==2) && (crossings>=2)) {
              globalBoardColors[y][x] = tooLongSpanColor;
            }
          } else if ((assistState==2) && (crossings>=2)) {
            globalBoardColors[y][x] = tooLongSpanColor;
          }
        } else {
          inwhite = true;
          crossings = 0;
          y0 = y;
        }
      } else {
        inwhite = false;
        crossings = 0;
      }
    }
  }

  // now rule 4: check for stranded rivers. make sure to not
  // consider indeterminant cells as blocking
  let unfilledCells = new Array();
  let riverCount = 0;
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((puzzleBoardStates[y][x] != STATE_BLACK) &&
          (unfilledCells.indexOf(y+","+x) == -1)) {
        let visitedCells = travelRiver(puzzleBoardStates,y,x,false,STATE_BLACK);
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
        unfilledCells.push.apply(unfilledCells, visitedCells);
        riverCount++;
      }
    }
  }

  updateTextFields();
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
  if (demoNum==1) {
    demotext = [
      "<p>In this demo we will walk through the steps of solving this puzzle. " +
        "Press the 'next' button to walk through the solving steps, or the " +
        "'back' button to return to the previous step.</p>" +
        "<p>At the beginning of a solve, there are no errors, but there are " +
        "many incomplete rooms (rooms). For our first time through we can " +
        "turn on Assist Mode 2 to see any errors that we might generate in the " +
        "process of the solve.</p>",
      "Easy ones to knock out single-tile rooms, where the only solution " +
        "is to insert a '1' into the box.",
      "Now that these are inserted, it is clear where to place some other '1' " +
        "digits in adjacent rooms so as to not violate the second rule about " +
        "adjacent digits within their distance.",
      "We can now place a '2' to complete the 2-wide room above the bottom " +
        "right room, then then complete that bottom right room given that the " +
        "'2' forces its digit arrangement.",
      "Now that the '3' is placed in that bottom right room, it forces the " +
        "location of the '3' digit in the L-shaped room to its left, which " +
        "in turn affects the placement of the '3' in the square above that, " +
        "which is then easy to complete.",
      "Now looking at the L shape in the rightmost column above the (2,1) room, " + 
        "we can see that the '2's below it knock out the bottom row and the 2 " +
        "must thus sit on top. Similarly the '3' is blocked from the bottom " +
        "left corner and must be in the bottom right, allowing easy completion " +
        "of the room.",
      "Moving to the L near the middle, we can see an easy solution given the " +
        "effects of the '3' and '2' digits to its right. Similarly the inverted " +
        "L on the rightmost column is easy to complete given the digits below.",
      "The '2' and '3' digits in the 5-box room in the upper middle are now easy " +
        "to complete. Once they are placed the 3-high room in the second column " +
        "is easy to complete, also making the NW corner room solvable.",
      "Now observe the left-most square of the top row's 5-wide rectangle. " +
        "Below are 4 inhibitors for digits '1'-'4', so the only other possibility " +
        "is for it to have the '5' digit. Once the '5' is placed there is only " +
        "one legal spot for the '4' digit, then the other 3 fall into place.",
      "Propagating '2' digits in the bottom sector completes a few more rooms,",
      "Now the '4' digits have their effect, and the rest of the pieces should " +
        "fall into place.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      [],
      ["2,0,1","1,2,1","5,5,1"],
      ["3,1,1","4,6,1","6,6,1"],
      ["4,5,2","6,5,3","5,6,2"],
      ["5,4,3","4,3,3","4,4,1","3,4,4"],
      ["2,6,2","3,6,3","3,5,1"],
      ["3,2,3","5,2,2","5,3,1","1,6,1","1,5,2","2,5,3"],
      ["2,2,2","1,4,3","1,1,2","2,1,3","0,0,2","1,0,3","0,1,1"],
      ["0,2,5","0,6,4","0,5,1","0,4,2","0,3,3"],
      ["6,1,2","5,1,1","6,3,4","6,2,1","6,4,2"],
      ["1,3,4","2,3,5","5,0,4","6,0,3","4,0,1","3,0,2","4,1,5"]];
  } else {
    demotext = [
      "<p>In this demo we will walk more quickly through the steps of solving " +
        "this puzzle, which is actually easier. It is recommended to go through " +
        "demo 1 first. Press the 'next' button to walk through the solving steps, " +
        "or the 'back' button to return to the previous step. You can also use " +
        "the undo button to move backwards individual steps, or continue playing " +
        "forward if you wish.</p>" +
        "<p>The first thing to do is to turn on the assist mode to let us know " +
        "which rooms still need completion. Then we can set the '1' digits in " +
        "the single-square rooms.</p>",
      "With these '1' digits set, we see a lot of boxes that can immediately " +
        "set their '1' digit and then be completed.",
      "The '3' digits begin to propagate in the upper region and several more " +
        "rooms can be completed.",
      "The '3' digits continue to propagate downwards, and the '1' and '2' " +
        "digits make the rest fall into place pretty easily.",
      "All the pieces are on the board for the final completion",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      ["0,2,1","0,6,1","2,6,1","3,1,1","4,5,1","6,0,1"],
      ["0,4,1","0,5,2","1,5,1","2,4,1","2,5,3","2,2,1","4,2,1","4,1,2","5,4,1","5,5,2","7,1,1"],
      ["0,3,3","1,4,4","1,3,1","1,2,2","3,2,3","2,1,4","2,3,2","0,1,2","1,0,1","1,7,1","2,7,4"],
      ["3,6,3","4,6,2","3,5,4","5,3,3","6,3,1","6,4,2","2,0,3","5,0,4","6,2,4","5,1,1","5,2,2"],
      ["7,2,3","7,3,2","7,4,4","7,5,1","5,6,4","7,6,2","6,5,3","5,7,3","6,7,2"]];
  }
  if (demoStepNum < demotext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHTML('demotext', demotext[demoStepNum]);
    globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      let demosteps = demomoves[step];
      for (let i=0;i<demosteps.length;i++) {
        let steps = demosteps[i].split(",");
        addMove(steps[0],steps[1],steps[2]);
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
