const emptyCellColor = "white";         // not-filled
const indetCellColor = "#e0e0e0";       // indeterminant color (default)
const fillCellColor = "#5050a0";        // filled, more dark blue to contrast with black walls
const incorrectCellColor = "#802020";   // dark reddish
const tooLongSpanColor = "#FFC0C0";     // light reddish
const incorrectRiverColor = "#FFE0A0";  // light brown

const stdFontColor = "black";
const offFontColor = "white";
const errorFontColor = "red";
const correctFontColor = "green";

const gameName = 'heyawake';

let clicking = false;
let dragging = false;
let errorCount = 0;
let incompleteCount = 0;
let assistState = 0;
let isDemo = false;

const STATE_WHITE = 1;
const STATE_BLACK = 2;
const STATE_INDET = 3;

// which keys are handled
let handledKeys = [ KEY_BS, KEY_CR, KEY_SP, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_0, KEY_1, ALT_0, ALT_1 ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleRoomList, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;
  initRibbons(gameName);

  // any key anywhere as long as canvas is in focus
  $(document).keydown(function(evnt) {
    $("#resetButton").blur();
    $("#clearButton").blur();
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
      puzzleChoice = 0;
      updateHtmlDescr(initPuzzle);
    }
    initStructures(puzzle);
  });

  $("#nextDemoButton").click(function() {
    isDemo = true;
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

  // click on clear ribbons, brings up confirmation, then resets puzzle
  $("#clearButton").click(function() {
    let resetDialog = confirm("Clear Ribbons Shelf?");
    if (resetDialog == true) {
      localStorage.setItem("OPSaved" + gameName,'');
      const ribbonBar = document.getElementById("ribbonbar");
      ribbonBar.innerHTML = '';
      $("#clearButton").hide();
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
      etext = "there are errors and incomplete rooms";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteCount) {
      etext = "there are incomplete rooms";
    } else {
      etext = "there are no errors nor incomplete rooms";
    }
  } else {
    etext = "there are " + errorCount + " errors and " +
                      incompleteCount + " incomplete rooms";
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
  let roomParams = puzzleSplit[1];
  let hexParams = puzzleSplit[2];
  // reset to non-demo
  isDemo = false;

  basicInitStructures(size,indetCellColor,constWallLight,constWallBorder,stdFontColor);

  globalBoardValues = initBoardValuesFromBoxes(roomParams);
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
      }
    }
  }

  // initialize the wall states based upon the room parameters
  globalWallStates = initWallStatesFromBoxes(roomParams, constWallLight);
  puzzleRoomList = initRoomsFromBoxes(roomParams);
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

  // look for incomplete rooms, and rule 1 accounting of digits
  // within rooms
  for (let roomInfo of puzzleRoomList) {
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
    for (let x=0;x<globalPuzzleW;x++) {
      if ((puzzleBoardStates[y  ][x] == STATE_BLACK) &&
          (puzzleBoardStates[y+1][x] == STATE_BLACK)) {
        errorCount++;
        if (assistState == 2) {
          globalBoardColors[y  ][x] = incorrectCellColor;
          globalBoardColors[y+1][x] = incorrectCellColor;
        }
      }
    }
  }
  for (let x=0;x<(globalPuzzleW-1);x++) {
    for (let y=0;y<globalPuzzleH;y++) {
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
            for (let cc of visitedCells) {
              let curCell = cc.split(",");
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

  updateDynTextFields();
  if ((errorCount == 0) && (incompleteCount == 0)) {
    canvasSuccess(isDemo,gameName,puzzleChoice);
  } else {
    canvasIncomplete();
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
  $("#clearButton").blur();
  $("#assistButton").blur();
  initStructures(puzzle);
}

function updateDemoRegion(demoNum) {
  updateDemoFunction(demoNum,function () {
    puzzleBoardStates = initYXFromValue(STATE_INDET);
    globalBoardColors = initYXFromValue(indetCellColor);
  }, function (steps) {
    let s0 = (steps[0] == 'W') ? STATE_WHITE : STATE_BLACK;
    addMove(s0,steps[1],steps[2]);
  });
}
