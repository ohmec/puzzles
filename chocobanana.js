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
let curClickType = CLICK_UNKNOWN;

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
    $("#resetButton").blur();
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

  // click (down) within puzzle frame
  $("#puzzleCanvas").mousedown(function(evnt) {
    clicking = true;
    curClickType = clickType(evnt);
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
      case KEY_SP: // toggle through states
        if (puzzleBoardStates[globalCursorY][globalCursorX] == STATE_INDET) {
          addMove(STATE_BLACK,globalCursorY,globalCursorX);
        } else if (puzzleBoardStates[globalCursorY][globalCursorX] == STATE_BLACK) {
          addMove(STATE_WHITE,globalCursorY,globalCursorX);
        } else {
          addMove(STATE_INDET,globalCursorY,globalCursorX);
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
  globalLineColors =      initYXFromValue("black"); // default line is black
  globalCircleColors =    initYXFromValue("black");
  globalTextBold =        initYXFromValue(true);

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

function handleClick(evnt) {
  if (!dragging) {
    curClickType = clickType(evnt);
  }
  $("#userPuzzleField").blur();
  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  // dragging, but no move yet 
  if (dragging && ((yCell == globalCursorY) && (xCell == globalCursorX))) {
    return;
  }

  globalCursorY = yCell;
  globalCursorX = xCell;

  // left sets to black, right sets to white, middle sets to indet
  // ignore if already the same state
  if ((curClickType == CLICK_LEFT)   && puzzleBoardStates[yCell][xCell] != STATE_BLACK) {
    addMove(STATE_BLACK,yCell,xCell);
  }
  if ((curClickType == CLICK_MIDDLE) && puzzleBoardStates[yCell][xCell] != STATE_INDET) {
    addMove(STATE_INDET,yCell,xCell);
  }
  if ((curClickType == CLICK_RIGHT)  && puzzleBoardStates[yCell][xCell] != STATE_WHITE) {
    addMove(STATE_WHITE,yCell,xCell);
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
  $("#assistButton").blur();
  initStructures(puzzle);
}

function updateDemoRegion(demoNum) {
  let dtext  = (demoNum==1) ?  demoText[0] :  demoText[1];
  let dmoves = (demoNum==1) ? demoMoves[0] : demoMoves[1];
  if (demoStepNum < dtext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHtmlText('demotext', dtext[demoStepNum]);
    puzzleBoardStates = initYXFromValue(STATE_INDET);
    globalBoardColors = initYXFromValue(indetCellColor);
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      let demosteps = dmoves[step];
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
