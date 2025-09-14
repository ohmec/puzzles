const emptyCellColor = "white";         // not-filled
const indetCellColor = "#e0e0e0";       // indeterminant color (default)
const fillCellColor = "#6060b0";        // filled, more dark blue to contrast with black walls
const incorrectShapeColor = "#f0f020";  // yellowish
const duplicateShapeColor = "#f08020";  // orangeish
const incorrectCellColor = "#e04040";   // reddish

const stdFontColor = "black";

const STATE_WHITE = 1;
const STATE_BLACK = 2;
const STATE_INDET = 3;

const SHAPE_NONE = 0;
const SHAPE_L = 1;
const SHAPE_I = 2;
const SHAPE_T = 3;
const SHAPE_S = 4;

const canonicalL = canonicalizeShape([[0,0],[0,1],[0,2],[1,2]]);
const canonicalI = canonicalizeShape([[0,0],[0,1],[0,2],[0,3]]);
const canonicalT = canonicalizeShape([[0,0],[0,1],[1,1],[0,2]]);
const canonicalS = canonicalizeShape([[0,0],[0,1],[1,1],[1,2]]);

// four different shades of green
const colorL = "#90f090";
const colorI = "#40e040";
const colorT = "#008000";
const colorS = "#105010";

let clicking = false;
let dragging = false;
let shifting = false;
let errorCount = 0;
let incompleteCount = 0;
let brokenRiver = true;
let assistState = 0;
let curShiftState = STATE_INDET;

// which keys are handled
let handledKeys = [ KEY_BS, KEY_CR, KEY_SP, KEY_ESC, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_0, KEY_1, ALT_0, ALT_1 ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleBoardStates;
let puzzleRoomList, puzzleRoomShapes, puzzleCellRooms;

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
    if (evnt.which == KEY_SHIFT) {
      shifting = true;
      curShiftState = puzzleBoardStates[globalCursorY][globalCursorX];
    }
    if (handledKeys.find(element => element == evnt.which)) {
      handleKey(evnt.which);
    }
  });

  $(document).keyup(function(evnt) {
    if (evnt.which == KEY_SHIFT) {
      shifting = false;
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
    if (errorCount && incompleteCount && brokenRiver) {
      etext = "there are errors and incomplete rooms, and a broken river of dark cells";
    } else if (errorCount && incompleteCount) {
      etext = "there are errors and incomplete rooms";
    } else if (errorCount && brokenRiver) {
      etext = "there are errors and a broken river of dark cells";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteCount && brokenRiver) {
      etext = "there are incomplete rooms and a broken river of dark cells";
    } else if (incompleteCount) {
      etext = "there are incomplete rooms";
    } else if (brokenRiver) {
      etext = "there is a broken river of dark cells";
    } else {
      etext = "there are no errors nor incomplete rooms";
    }
  } else {
    etext = "there are " + errorCount + " errors and " +
                      incompleteCount + " incomplete rooms";
    if (brokenRiver) {
      etext += " and a broken river of dark cells";
    }
  }
  updateDynamicHtmlEntries(etext,assistState);
}

function addHistory(y,x,prevvalue) {
  moveHistory.push([y,x,prevvalue]);
}

function addMove(moveType,y,x) {
  addHistory(y,x,puzzleBoardStates[y][x]);
  puzzleBoardStates[y][x] = moveType;
  // colors will be overridden based upon error status
  globalBoardColors[y][x] =
    (moveType == STATE_WHITE) ? emptyCellColor :
    (moveType == STATE_BLACK) ? fillCellColor :
                                indetCellColor;
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
        console.log(puzzleRoomList);
        console.log(puzzleRoomShapes);
        console.log(puzzleCellRooms);
        break;
      case KEY_UP:
        if (globalCursorY) {
          globalCursorY--;
          if (shifting) {
            addMove(curShiftState,globalCursorY,globalCursorX);
          }
        }
        break;
      case KEY_DOWN:
        if (globalCursorY < (globalPuzzleH-1)) {
          globalCursorY++;
          if (shifting) {
            addMove(curShiftState,globalCursorY,globalCursorX);
          }
        }
        break;
      case KEY_LEFT:
        if (globalCursorX) {
          globalCursorX--;
          if (shifting) {
            addMove(curShiftState,globalCursorY,globalCursorX);
          }
        }
        break;
      case KEY_RIGHT:
        if (globalCursorX < (globalPuzzleW-1)) {
          globalCursorX++;
          if (shifting) {
            addMove(curShiftState,globalCursorY,globalCursorX);
          }
        }
        break;
      case KEY_SP: // toggle through states like the click
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
  let rwallParams = puzzleSplit[1];
  let cwallParams = puzzleSplit[2];
  let hexParams = puzzleSplit[3];

  basicInitStructures(size,indetCellColor,constWallLight,stdFontColor);

  // initialize the wall states based upon the given parameters
  globalInitWallStates  = initWallStatesFromHexes(rwallParams, cwallParams, constWallLight);
  globalWallStates = initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  puzzleBoardStates = initYXFromValue(STATE_INDET);

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
        globalBoardColors[y][x] = stateTrue ? fillCellColor : emptyCellColor;
      }
    }
  }

  // find all the rooms
  puzzleRoomList = findRooms();
  // prepare shapes for later
  puzzleRoomShapes = new Array(puzzleRoomList.length);
  puzzleCellRooms = initYXFromValue(0);
  // reverse look up cell to room number
  for (let r=0;r<puzzleRoomList.length;r++) {
    let roomInfo = puzzleRoomList[r];
    for (let cell of roomInfo) {
      let cinfo = cell.split(",");
      let y = parseInt(cinfo[0]);
      let x = parseInt(cinfo[1]);
      puzzleCellRooms[y][x] = r;
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

function colorShape(roomInfo, color) {
  for (let cell of roomInfo) {
    let y = cell[0];
    let x = cell[1];
    globalBoardColors[y][x] = color;
  }
}

// look for errors and incompletions
function updateBoardStatus() {
  // accounting the errors:
  //  1) more than 4 black cells in a room
  //  2) 4 black cells in a room that don't match L I T or S
  //  3) two rooms with the same shape (LITS) as a neighbor
  //  4) 2x2 section of black
  //  5) no "black river"
  //
  // also count the incomplete rooms, which are rooms
  // that don't have the correct number of black squares
  errorCount = 0;
  incompleteCount = 0;

  // start by reseting all cell colors to "standard" before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] == STATE_BLACK) {
        globalBoardColors[y][x] = fillCellColor;
      } else if (puzzleBoardStates[y][x] == STATE_WHITE) {
        globalBoardColors[y][x] = emptyCellColor;
      } else {
        globalBoardColors[y][x] = indetCellColor;
      }
    }
  }

  // look for incomplete rooms, and any rooms with more than 4 black
  // cells. then for those with 4 cells, check that they are "canonical"
  // (i.e. L I T or S)
  let puzzleRoomShapeCells = new Array();
  for (let r=0;r<puzzleRoomList.length;r++) {
    let roomInfo = puzzleRoomList[r];
    let bcount = 0;
    let isIncomplete = 0;
    let blackCells = new Array();
    // default, overwritten below
    puzzleRoomShapes[r] = SHAPE_NONE;
    for (let cell of roomInfo) {
      let cinfo = cell.split(",");
      let y = parseInt(cinfo[0]);
      let x = parseInt(cinfo[1]);
      if (puzzleBoardStates[y][x] == STATE_BLACK) {
        bcount++;
        blackCells.push([y,x]);
      } else if (puzzleBoardStates[y][x] == STATE_INDET) {
        isIncomplete = 1;
      }
    }
    if (bcount > 4) {
      errorCount++;
      if (assistState==2) {
        colorShape(blackCells,incorrectShapeColor);
      }
    } else if (bcount==4) {
      let canonicalRoomBlack = canonicalizeShape(blackCells);
      let isL = compareRooms(canonicalRoomBlack,canonicalL);
      let isI = compareRooms(canonicalRoomBlack,canonicalI);
      let isT = compareRooms(canonicalRoomBlack,canonicalT);
      let isS = compareRooms(canonicalRoomBlack,canonicalS);
      if (isL) {
        if (assistState==2) {
          colorShape(blackCells,colorL);
        }
        puzzleRoomShapes[r] = SHAPE_L;
      } else if (isI) {
        if (assistState==2) {
          colorShape(blackCells,colorI);
        }
        puzzleRoomShapes[r] = SHAPE_I;
      } else if (isT) {
        if (assistState==2) {
          colorShape(blackCells,colorT);
        }
        puzzleRoomShapes[r] = SHAPE_T;
      } else if (isS) {
        if (assistState==2) {
          colorShape(blackCells,colorS);
        }
        puzzleRoomShapes[r] = SHAPE_S;
      } else {
        errorCount++;
        if (assistState==2) {
          colorShape(blackCells,incorrectShapeColor);
        }
      }
    }
    if (isIncomplete || (bcount < 4)) {
      incompleteCount++;
    }
    puzzleRoomShapeCells.push(blackCells);
  }

  // now look for 2x2 squares of black cells, thus in error
  let filledCells = new Array();
  for (let y=0;y<(globalPuzzleH-1);y++) {
    for (let x=0;x<globalPuzzleW-1;x++) {
      if ((puzzleBoardStates[y  ][x  ] == STATE_BLACK) &&
          (puzzleBoardStates[y+1][x  ] == STATE_BLACK) &&
          (puzzleBoardStates[y  ][x+1] == STATE_BLACK) &&
          (puzzleBoardStates[y+1][x+1] == STATE_BLACK)) {
        errorCount++;
        if (assistState == 2) {
          globalBoardColors[y  ][x  ] = incorrectCellColor;
          globalBoardColors[y+1][x  ] = incorrectCellColor;
          globalBoardColors[y  ][x+1] = incorrectCellColor;
          globalBoardColors[y+1][x+1] = incorrectCellColor;
        }
      }
    }
  }

  // now go through each "good" room and make sure that it isn't touching
  // a shape of the same type
  for (let r=0;r<puzzleRoomList.length;r++) {
    let ourShape = puzzleRoomShapes[r];
    if (ourShape != SHAPE_NONE) {
      let roomInfo = puzzleRoomList[r];
      for (let cell of roomInfo) {
        let cinfo = cell.split(",");
        let y = parseInt(cinfo[0]);
        let x = parseInt(cinfo[1]);
        // now go to the neighbor of each black cell in this
        // shape and check to see if any of its neighbors
        // are a) also black, b) in a different room, and c) that room
        // is of the same shape
        if (puzzleBoardStates[y][x] == STATE_BLACK) {
          for (let neighbor=0;neighbor<4;neighbor++) {
            let yi = (neighbor==0) ? y-1 : (neighbor==1) ? y+1 : y;
            let xi = (neighbor==2) ? x-1 : (neighbor==3) ? x+1 : x;
            if (yi>=0 && xi >=0 && yi<globalPuzzleH && xi<globalPuzzleW) {
              let oppRoom = puzzleCellRooms[yi][xi];
              let oppShape = puzzleRoomShapes[oppRoom];
              if ((puzzleBoardStates[yi][xi] == STATE_BLACK) && (oppRoom != r) && (ourShape == oppShape)) {
                errorCount++;
                if (assistState==2) {
                  // draw both shapes "duplicate" color
                  colorShape(puzzleRoomShapeCells[r],duplicateShapeColor);
                  colorShape(puzzleRoomShapeCells[oppRoom],duplicateShapeColor);
                }
              }
            }
          } 
        }
      }
    }
  }

  // now rule 4: check for stranded rivers. make sure to not
  // consider indeterminant cells as blocking
  let unfilledCells = new Array();
  let riverCount = 0;
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((puzzleBoardStates[y][x] != STATE_WHITE) &&
          (unfilledCells.indexOf(y+","+x) == -1)) {
        let visitedCells = travelRiver(puzzleBoardStates,y,x,false,STATE_WHITE);
        unfilledCells.push.apply(unfilledCells, visitedCells);
        riverCount++;
      }
    }
  }

  brokenRiver = riverCount > 1;

  updateDynTextFields();
  if ((errorCount == 0) && (incompleteCount == 0) && !brokenRiver) {
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
      for (let dsteps of dmoves[step]) {
        let steps = dsteps.split("");
        let s0 = (steps[0] == 'W') ? STATE_WHITE : STATE_BLACK;
        addMove(s0,steps[1],steps[2]);
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}
