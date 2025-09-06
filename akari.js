const emptyCellColor = "white";         // not-filled
const litCellColor = "#ffffd0";         // yellow lit hallway color
const errorCircleColor = "red";         // not-filled

const offFontColor = "white";
const errorFontColor = "red";
const correctFontColor = "#a0ffa0";     // bright green

let clicking = false;
let errorCount = 0;
let incompleteDigits = 0;
let incompleteCells = 0;
let assistState = 0;
let curClickType = CLICK_UNKNOWN;
let debugMode = false;

const CELL_BLACK = 1;
const CELL_BLACK_NUM = 2;
const CELL_WHITE = 3;
const CELL_DOT   = 4;
const CELL_BULB  = 5;
const CELL_ILLUMINATED = 6;
const CELL_DOT_ILLUMINATED = 7;

// which keys are handled
let handledKeys =
  [ KEY_BS, KEY_CR, KEY_ESC, KEY_SP, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_DOT,
    KEY_1, ALT_1, KEY_0, ALT_0 ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;
  globalCircleRadius = 0.3; // slightly smaller circle for light bulbs

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
    $("#puzzleCanvas").css("border-color", "black");
    handleClick(evnt);
  });

  // releasing mouse within puzzle or not within puzzle
  $(document).mouseup(function() {
    clicking = false;
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
    if (errorCount && incompleteCells && incompleteDigits) {
      etext = "there are errors and incomplete digits and cells that aren't illuminated";
    } else if (incompleteDigits && incompleteCells) {
      etext = "there are incomplete digits and white cells that aren't illuminated";
    } else if (errorCount && incompleteDigits) {
      etext = "there are errors and incomplete digits";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteDigits) {
      etext = "there are incomplete digits";
    } else if (incompleteCells) {
      etext = "there are cells that are not illuminated yet";
    } else {
      etext = "the puzzle is complete!";
    }
  } else {
    if (errorCount || incompleteCells || incompleteDigits) {
      etext = "there are " + errorCount  + " errors and " +
                        incompleteDigits + " incomplete digits " +
                        incompleteCells  + " cells not illuminated";
    } else {
      etext = "the puzzle is complete!";
    }
  }
  updateDynamicHtmlEntries(etext,assistState);
}

function addHistory(y,x,prevvalue) {
  moveHistory.push([y,x,prevvalue]);
}

function addMove(moveType,y,x,noHistory=false) {
  // don't try and change a black cell
  if (puzzleBoardStates[y][x] <= CELL_BLACK_NUM) {
    return;
  }
  if (!noHistory) {
    addHistory(y,x,puzzleBoardStates[y][x]);
  }
  puzzleBoardStates[y][x] = moveType;
  if (moveType == CELL_BULB) {
    globalCircleStates[y][x] = CIRCLE_WHITE;
  } else {
    globalCircleStates[y][x] = CIRCLE_NONE;
  }
  if (moveType == CELL_DOT) {
    globalLineStates[y][x] = PATH_DOT;
  } else {
    globalLineStates[y][x] = PATH_NONE;
  }
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
        console.log(globalBoardValues);
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
      case KEY_SP: // toggle through bulb/no-bulb
        if (puzzleBoardStates[globalCursorY][globalCursorX] == CELL_BULB) {
          addMove(CELL_WHITE,globalCursorY,globalCursorX);
        } else {
          addMove(CELL_BULB,globalCursorY,globalCursorX);
        }
        break;
      case KEY_0:
      case ALT_0:
      case KEY_BS:
        addMove(CELL_WHITE,globalCursorY,globalCursorX);
        break;
      case KEY_1:
      case ALT_1:
        addMove(CELL_BULB,globalCursorY,globalCursorX);
        break;
      case KEY_DOT:
        addMove(CELL_DOT,globalCursorY,globalCursorX);
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

  basicInitStructures(size,"white",constWallLight,offFontColor);

  globalInitBoardValues = initBoardValuesFromParams(numParams);
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  globalBoardColors =     initBoardColorsBlackWhite(numParams);
  puzzleBoardStates =     initYXFromValue(CELL_WHITE);

  // add light bulbs if numParams includes solution, and use num params to
  // set board state
  let numParamsExt = expandNumParams(numParams).split("");
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let ptr = y*globalPuzzleW+x;
      let param = numParams[ptr];
      if (numParamsExt[ptr] == '*') {
        puzzleBoardStates[y][x] = CELL_BLACK;
      } else if (numParamsExt[ptr].search(/[01234]/) != -1) {
        puzzleBoardStates[y][x] = CELL_BLACK_NUM;
      } else if (numParamsExt[ptr] == '@') {
        puzzleBoardStates[y][x] = CELL_BULB;
        globalCircleStates[y][x] = CIRCLE_WHITE;
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
  curClickType = clickType(evnt);
  $("#userPuzzleField").blur();
  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  globalCursorY = yCell;
  globalCursorX = xCell;

  // left toggles between bulb and no bulb
  if (curClickType == CLICK_LEFT) {
    if (puzzleBoardStates[globalCursorY][globalCursorX] == CELL_BULB) {
      addMove(CELL_WHITE,globalCursorY,globalCursorX);
    } else {
      addMove(CELL_BULB,globalCursorY,globalCursorX);
    }
  }
  // right toggles between dot and no dot
  if (curClickType == CLICK_RIGHT) {
    if ((puzzleBoardStates[globalCursorY][globalCursorX] == CELL_DOT) ||
        (puzzleBoardStates[globalCursorY][globalCursorX] == CELL_DOT_ILLUMINATED)) {
      addMove(CELL_WHITE,globalCursorY,globalCursorX);
    } else if ((puzzleBoardStates[globalCursorY][globalCursorX] == CELL_WHITE) ||
               (puzzleBoardStates[globalCursorY][globalCursorX] == CELL_ILLUMINATED)) {
      addMove(CELL_DOT,globalCursorY,globalCursorX);
    }
  }
  updateBoardStatus();
  drawBoard();
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) number cells with more bulbs than accounted for
  //  2) two bulbs facing each other
  errorCount = 0;

  // also count how many cells haven't been illuminated yet
  // and how many digits are incomplete
  incompleteCells = 0;
  incompleteDigits = 0;

  // start by reseting all cell, circle and font colors to "standard"
  // before evaluating errors, and clear any illuminated state
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalBoardTextColors[y][x] = offFontColor;
      globalCircleColors[y][x] = "black";
      if (puzzleBoardStates[y][x] > CELL_BLACK_NUM) {
        globalBoardColors[y][x] = "white";
      }
      if (puzzleBoardStates[y][x] == CELL_ILLUMINATED) {
        puzzleBoardStates[y][x] = CELL_WHITE;
      } else if (puzzleBoardStates[y][x] == CELL_DOT_ILLUMINATED) {
        puzzleBoardStates[y][x] = CELL_DOT;
      }
    }
  }

  // now go through all of the bulbs and illuminate their "hallways"
  // count illuminated bulb errors while at it.
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] == CELL_BULB) {
        let keepgoing = true;
        let xi = x+1;
        while (keepgoing) {
          if (xi==globalPuzzleW) {
            keepgoing = false;
          } else if (puzzleBoardStates[y][xi] <= CELL_BLACK_NUM) {
            keepgoing = false;
          } else if (puzzleBoardStates[y][xi] == CELL_BULB) {
            errorCount++;
            if (assistState==2) {
              globalCircleColors[y][x] = errorCircleColor;
              globalCircleColors[y][xi] = errorCircleColor;
            }
          } else {
            puzzleBoardStates[y][xi] = (puzzleBoardStates[y][xi] == CELL_DOT) ? CELL_DOT_ILLUMINATED : CELL_ILLUMINATED;
          }
          xi++;
        }
        keepgoing = true;
        xi = x-1;
        while (keepgoing) {
          if (xi<0) {
            keepgoing = false;
          } else if (puzzleBoardStates[y][xi] <= CELL_BLACK_NUM) {
            keepgoing = false;
          } else if (puzzleBoardStates[y][xi] == CELL_BULB) {
            errorCount++;
            if (assistState==2) {
              globalCircleColors[y][x] = errorCircleColor;
              globalCircleColors[y][xi] = errorCircleColor;
            }
          } else {
            puzzleBoardStates[y][xi] = (puzzleBoardStates[y][xi] == CELL_DOT) ? CELL_DOT_ILLUMINATED : CELL_ILLUMINATED;
          }
          xi--;
        }
        keepgoing = true;
        let yi = y+1;
        while (keepgoing) {
          if (yi==globalPuzzleH) {
            keepgoing = false;
          } else if (puzzleBoardStates[yi][x] <= CELL_BLACK_NUM) {
            keepgoing = false;
          } else if (puzzleBoardStates[yi][x] == CELL_BULB) {
            errorCount++;
            if (assistState==2) {
              globalCircleColors[y][x] = errorCircleColor;
              globalCircleColors[yi][x] = errorCircleColor;
            }
          } else {
            puzzleBoardStates[yi][x] = (puzzleBoardStates[yi][x] == CELL_DOT) ? CELL_DOT_ILLUMINATED : CELL_ILLUMINATED;
          }
          yi++;
        }
        keepgoing = true;
        yi = y-1;
        while (keepgoing) {
          if (yi<0) {
            keepgoing = false;
          } else if (puzzleBoardStates[yi][x] <= CELL_BLACK_NUM) {
            keepgoing = false;
          } else if (puzzleBoardStates[yi][x] == CELL_BULB) {
            errorCount++;
            if (assistState==2) {
              globalCircleColors[y][x] = errorCircleColor;
              globalCircleColors[yi][x] = errorCircleColor;
            }
          } else {
            puzzleBoardStates[yi][x] = (puzzleBoardStates[yi][x] == CELL_DOT) ? CELL_DOT_ILLUMINATED : CELL_ILLUMINATED;
          }
          yi--;
        }
      }
    }
  }

  // go through all of the cells with digits. count the number
  // of bulbs adjacent. if greater than the number, they are in error,
  // else just indeterminate
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] == CELL_BLACK_NUM) {
        let cellValue = globalBoardValues[y][x];
        let bulbCount = 0;
        if ((y<(globalPuzzleH-1)) && (puzzleBoardStates[y+1][x] == CELL_BULB)) { bulbCount++; }
        if ((y>0)                 && (puzzleBoardStates[y-1][x] == CELL_BULB)) { bulbCount++; }
        if ((x<(globalPuzzleW-1)) && (puzzleBoardStates[y][x+1] == CELL_BULB)) { bulbCount++; }
        if ((x>0)                 && (puzzleBoardStates[y][x-1] == CELL_BULB)) { bulbCount++; }
        if (bulbCount==cellValue) {
          if (assistState==2) {
            globalBoardTextColors[y][x] = correctFontColor;
          }
        } else if (bulbCount>cellValue) {
          errorCount++;
          if (assistState==2) {
            globalBoardTextColors[y][x] = errorFontColor;
          }
        } else {
          incompleteDigits++;
        }
      }
    }
  }

  // finally go through and see how many cells are unilluminated
  // if in assist (2) then color the illuminated cells
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((puzzleBoardStates[y][x] == CELL_WHITE) || 
          (puzzleBoardStates[y][x] == CELL_DOT)) {
        incompleteCells++;
      } else if (puzzleBoardStates[y][x] >= CELL_BULB) {
        if (assistState==2) {
          globalBoardColors[y][x] = litCellColor;
        }
      }
    }
  }

  updateDynTextFields();
  if ((errorCount==0) && (incompleteCells==0) && (incompleteDigits==0)) {
    $("#canvasDiv").css("border-color", constColorSuccess);
  } else {
    $("#canvasDiv").css("border-color", "black");
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    if (lastMove[2] == 0) {
      addMove(PATH_CLEAR,lastMove[0],lastMove[1],true);
    } else {
      addMove(lastMove[2],lastMove[0],lastMove[1],true);
    }
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
  let dtext  = (demoNum==1) ?  demoText[0] : (demoNum==2) ?  demoText[1] :  demoText[2];
  let dmoves = (demoNum==1) ? demoMoves[0] : (demoNum==2) ? demoMoves[1] : demoMoves[2];
  if (demoStepNum < dtext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHtmlText('demotext', dtext[demoStepNum]);
    // start by reseting all non-black cells to bulb-less
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if (puzzleBoardStates[y][x] > CELL_BLACK_NUM) {
          puzzleBoardStates[y][x] = CELL_WHITE;
          globalCircleStates[y][x] = CIRCLE_NONE;
          globalLineStates[y][x] = PATH_NONE;
        }
      }
    }
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      for (let dsteps of dmoves[step]) {
        let steps = dsteps.split("");
        let s0 = (steps[0] == '@') ? CELL_BULB : CELL_DOT;
        addMove(s0,parseInt(steps[1],36),parseInt(steps[2],36));
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}
