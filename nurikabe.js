const emptyCellColor = "white";         // not-filled
const indetCellColor = "#e0e0e0";       // indeterminant color (default)
const fillCellColor  = "#000040";       // filled, slightly dark blue to contrast with black walls
const incorrectRiverColor = "#802020";  // dark reddish
const incorrectPoolColor = "#202080";   // dark bluish

const stdFontColor = "black";
const offFontColor = "white";
const errorFontColor = "red";
const correctFontColor = "green";

const gameName = 'nurikabe';

let clicking = false;
let dragging = false;
let errorCount = 0;
let incompleteCount = 0;
let indeterminates = 0;
let assistState = 0;
let curClickType = CLICK_UNKNOWN;
let isDemo = false;

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
            addMove(STATE_BLACK,globalCursorY,globalCursorX);
          } else if (puzzleBoardStates[globalCursorY][globalCursorX] == STATE_BLACK) {
            addMove(STATE_WHITE,globalCursorY,globalCursorX);
          } else {
            addMove(STATE_INDET,globalCursorY,globalCursorX);
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
  let numParams = puzzleSplit[1];
  let hexParams = puzzleSplit[2];
  // reset to non-demo
  isDemo = false;

  basicInitStructures(size,indetCellColor,constWallStandard,constWallStandard,stdFontColor);

  globalBoardValues = initBoardValuesFromParams(numParams);
  puzzleBoardStates = initYXFromValue(STATE_INDET);

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
  // ignore if already the same state, or if a numbered tile which
  // can't be changed
  if (globalBoardValues[yCell][xCell] == "") {
    if ((curClickType == CLICK_LEFT)   && puzzleBoardStates[yCell][xCell] != STATE_BLACK) {
      addMove(STATE_BLACK,yCell,xCell);
    }
    if ((curClickType == CLICK_MIDDLE) && puzzleBoardStates[yCell][xCell] != STATE_INDET) {
      addMove(STATE_INDET,yCell,xCell);
    }
    if ((curClickType == CLICK_RIGHT)  && puzzleBoardStates[yCell][xCell] != STATE_WHITE) {
      addMove(STATE_WHITE,yCell,xCell);
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
            for (let rw of roomArrayWhite) {
              let cell = rw.split(",");
              if (globalBoardValues[cell[0]][cell[1]] != "") {
                digitCount++;
              }
            }
            if (digitCount != 1) {
              for (let rw of roomArrayWhite) {
                let cell = rw.split(",");
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
            for (let cc of visitedCells) {
              let curCell = cc.split(",");
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
    // start by reseting all non-number cells to indeterminate
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if (globalBoardValues[y][x] == "") {
          puzzleBoardStates[y][x] = STATE_INDET;
        }
      }
    }
  }, function (steps) {
    let s0 = (steps[0] == 'W') ? STATE_WHITE : STATE_BLACK;
    addMove(s0,steps[1],steps[2]);
  });
}
