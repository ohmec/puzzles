const gameName = 'akari';

let incompleteDigits = 0;
let incompleteCells = 0;
let curClickType = constClickUnknown;

const constCellBlack = 1;
const constCellBlackNum = 2;
const constCellWhite = 3;
const constCellDot   = 4;
const constCellBulb  = 5;
const constCellIlluminated = 6;
const constCellDotIlluminated = 7;

// which keys are handled
let handledKeys =
  [ constKeyBackspace, constKeyCR, constKeyEsc, constKeySpace,
    constKeyLeft, constKeyUp, constKeyRight, constKeyDown, constKeyDot,
    constKey1, constKeyAlt1, constKey0, constKeyAlt0 ];

let moveHistory, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;
  globalCircleRadius = 0.3; // slightly smaller circle for light bulbs
  initElements();
  initRibbons(gameName);
  listenKeys(handledKeys,handleKey);
  listenClick(handleClick,initStructures,undoMove);

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
  if (playState.assistState == 0) {
    if (playState.errorCount && incompleteCells && incompleteDigits) {
      etext = "there are errors and incomplete digits and cells that aren't illuminated";
    } else if (incompleteDigits && incompleteCells) {
      etext = "there are incomplete digits and white cells that aren't illuminated";
    } else if (playState.errorCount && incompleteDigits) {
      etext = "there are errors and incomplete digits";
    } else if (playState.errorCount) {
      etext = "there are errors";
    } else if (incompleteDigits) {
      etext = "there are incomplete digits";
    } else if (incompleteCells) {
      etext = "there are cells that are not illuminated yet";
    } else {
      etext = "the puzzle is complete!";
    }
  } else {
    if (playState.errorCount || incompleteCells || incompleteDigits) {
      etext = "there are " + playState.errorCount  + " errors and " +
                        incompleteDigits + " incomplete digits " +
                        incompleteCells  + " cells not illuminated";
    } else {
      etext = "the puzzle is complete!";
    }
  }
  updateDynamicHtmlEntries(etext,playState.assistState);
}

function addHistory(y,x,prevvalue) {
  moveHistory.push([y,x,prevvalue]);
}

function addMove(moveType,y,x,noHistory=false) {
  // don't try and change a black cell
  if (puzzleBoardStates[y][x] <= constCellBlackNum) {
    return;
  }
  if (!noHistory) {
    addHistory(y,x,puzzleBoardStates[y][x]);
  }
  puzzleBoardStates[y][x] = moveType;
  if (moveType == constCellBulb) {
    globalCircleStates[y][x] = constCircleWhite;
  } else {
    globalCircleStates[y][x] = constCircleNone;
  }
  if (moveType == constCellDot) {
    globalLineStates[y][x] = constPathDot;
  } else {
    globalLineStates[y][x] = constPathNone;
  }
}

function handleKey(keynum) {
  const focusedElement = document.activeElement;
  // look for CR within puzzle display field
  if ((keynum == constKeyCR) && focusedElement && focusedElement.id == "userPuzzle") {
    let pval = elemStruct.userPuzzle.value;
    if (pval.search(/:/) == -1) {
      if (pval < cannedPuzzles.length) {
        puzzleChoice = pval;
        initPuzzle = cannedPuzzles[pval];
        puzzle = removeDot(initPuzzle);
        updateHtmlDescr(initPuzzle);
        // check to see if this is a demo puzzle
        let search = demoPuzzles.find(element => element == pval);
        if (search !== undefined) {
          elemStruct.demotab.style.display = 'block';
          demoStepNum = 0;
          updateDemoRegion(pval);
        } else {
          elemStruct.demotab.style.display = 'none';
        }
      }
    } else {
      elemStruct.demotab.style.display = 'none';
      initPuzzle = pval;
      puzzle = removeDot(initPuzzle);
      updateHtmlDescr(initPuzzle);
    }
    initStructures(puzzle);
  // else look for keys not in puzzle display field
  } else if (focusedElement && focusedElement.id != "userPuzzle") {
    switch (keynum) {
      case constKeyEsc:
        console.log(puzzleBoardStates);
        console.log(globalBoardValues);
        break;
      case constKeyUp:
      case constKeyDown:
      case constKeyLeft:
      case constKeyRight:
        moveGlobalCursor(keynum);
        break;
      case constKeySpace: // toggle through bulb/no-bulb
        if (puzzleBoardStates[globalCursorY][globalCursorX] == constCellBulb) {
          addMove(constCellWhite,globalCursorY,globalCursorX);
        } else {
          addMove(constCellBulb,globalCursorY,globalCursorX);
        }
        break;
      case constKey0:
      case constKeyAlt0:
      case constKeyBackspace:
        addMove(constCellWhite,globalCursorY,globalCursorX);
        break;
      case constKey1:
      case constKeyAlt1:
        addMove(constCellBulb,globalCursorY,globalCursorX);
        break;
      case constKeyDot:
        addMove(constCellDot,globalCursorY,globalCursorX);
        break;
      }
    updateBoardStatus();
    drawBoard();
  }
}

function initStructures(puzzle) {
  elemStruct.canvasDiv.style.borderColor = "black";
  moveHistory = new Array();
  // get the size and the digits out of the puzzle entry
  let puzzleSplit = puzzle.split(":");
  let size = puzzleSplit[0];
  let numParams = puzzleSplit[1];
  // reset to non-demo
  isDemo = false;

  basicInitStructures(size,"white",constWallLight,constWallBorder,offFontColor);

  globalBoardValues =     initBoardValuesFromParams(numParams);
  globalBoardColors =     initBoardColorsBlackWhite(numParams);
  puzzleBoardStates =     initYXFromValue(constCellWhite);

  // add light bulbs if numParams includes solution, and use num params to
  // set board state
  let numParamsExt = expandNumParams(numParams).split("");
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let ptr = y*globalPuzzleW+x;
      let param = numParams[ptr];
      if (numParamsExt[ptr] == '*') {
        puzzleBoardStates[y][x] = constCellBlack;
      } else if (numParamsExt[ptr].search(/[01234]/) != -1) {
        puzzleBoardStates[y][x] = constCellBlackNum;
      } else if (numParamsExt[ptr] == '@') {
        puzzleBoardStates[y][x] = constCellBulb;
        globalCircleStates[y][x] = constCircleWhite;
      }
    }
  }

  updateBoardStatus();
  drawBoard();
}

function handleClick(evnt) {
  // don't allow dragging
  if (playState.dragging) return;

  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  curClickType = clickType(evnt);
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  globalCursorY = yCell;
  globalCursorX = xCell;

  // left toggles between bulb and no bulb
  if (curClickType == constClickLeft) {
    if (puzzleBoardStates[globalCursorY][globalCursorX] == constCellBulb) {
      addMove(constCellWhite,globalCursorY,globalCursorX);
    } else {
      addMove(constCellBulb,globalCursorY,globalCursorX);
    }
  }
  // right toggles between dot and no dot
  if (curClickType == constClickRight) {
    if ((puzzleBoardStates[globalCursorY][globalCursorX] == constCellDot) ||
        (puzzleBoardStates[globalCursorY][globalCursorX] == constCellDotIlluminated)) {
      addMove(constCellWhite,globalCursorY,globalCursorX);
    } else if ((puzzleBoardStates[globalCursorY][globalCursorX] == constCellWhite) ||
               (puzzleBoardStates[globalCursorY][globalCursorX] == constCellIlluminated)) {
      addMove(constCellDot,globalCursorY,globalCursorX);
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
  playState.errorCount = 0;

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
      if (puzzleBoardStates[y][x] > constCellBlackNum) {
        globalBoardColors[y][x] = "white";
      }
      if (puzzleBoardStates[y][x] == constCellIlluminated) {
        puzzleBoardStates[y][x] = constCellWhite;
      } else if (puzzleBoardStates[y][x] == constCellDotIlluminated) {
        puzzleBoardStates[y][x] = constCellDot;
      }
    }
  }

  // now go through all of the bulbs and illuminate their "hallways"
  // count illuminated bulb errors while at it.
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] == constCellBulb) {
        let keepgoing = true;
        let xi = x+1;
        while (keepgoing) {
          if (xi==globalPuzzleW) {
            keepgoing = false;
          } else if (puzzleBoardStates[y][xi] <= constCellBlackNum) {
            keepgoing = false;
          } else if (puzzleBoardStates[y][xi] == constCellBulb) {
            playState.errorCount++;
            if (playState.assistState==2) {
              globalCircleColors[y][x] = errorCircleColor;
              globalCircleColors[y][xi] = errorCircleColor;
            }
          } else {
            puzzleBoardStates[y][xi] = (puzzleBoardStates[y][xi] == constCellDot) ? constCellDotIlluminated : constCellIlluminated;
          }
          xi++;
        }
        keepgoing = true;
        xi = x-1;
        while (keepgoing) {
          if (xi<0) {
            keepgoing = false;
          } else if (puzzleBoardStates[y][xi] <= constCellBlackNum) {
            keepgoing = false;
          } else if (puzzleBoardStates[y][xi] == constCellBulb) {
            playState.errorCount++;
            if (playState.assistState==2) {
              globalCircleColors[y][x] = errorCircleColor;
              globalCircleColors[y][xi] = errorCircleColor;
            }
          } else {
            puzzleBoardStates[y][xi] = (puzzleBoardStates[y][xi] == constCellDot) ? constCellDotIlluminated : constCellIlluminated;
          }
          xi--;
        }
        keepgoing = true;
        let yi = y+1;
        while (keepgoing) {
          if (yi==globalPuzzleH) {
            keepgoing = false;
          } else if (puzzleBoardStates[yi][x] <= constCellBlackNum) {
            keepgoing = false;
          } else if (puzzleBoardStates[yi][x] == constCellBulb) {
            playState.errorCount++;
            if (playState.assistState==2) {
              globalCircleColors[y][x] = errorCircleColor;
              globalCircleColors[yi][x] = errorCircleColor;
            }
          } else {
            puzzleBoardStates[yi][x] = (puzzleBoardStates[yi][x] == constCellDot) ? constCellDotIlluminated : constCellIlluminated;
          }
          yi++;
        }
        keepgoing = true;
        yi = y-1;
        while (keepgoing) {
          if (yi<0) {
            keepgoing = false;
          } else if (puzzleBoardStates[yi][x] <= constCellBlackNum) {
            keepgoing = false;
          } else if (puzzleBoardStates[yi][x] == constCellBulb) {
            playState.errorCount++;
            if (playState.assistState==2) {
              globalCircleColors[y][x] = errorCircleColor;
              globalCircleColors[yi][x] = errorCircleColor;
            }
          } else {
            puzzleBoardStates[yi][x] = (puzzleBoardStates[yi][x] == constCellDot) ? constCellDotIlluminated : constCellIlluminated;
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
      if (puzzleBoardStates[y][x] == constCellBlackNum) {
        let cellValue = globalBoardValues[y][x];
        let bulbCount = 0;
        if ((y<(globalPuzzleH-1)) && (puzzleBoardStates[y+1][x] == constCellBulb)) { bulbCount++; }
        if ((y>0)                 && (puzzleBoardStates[y-1][x] == constCellBulb)) { bulbCount++; }
        if ((x<(globalPuzzleW-1)) && (puzzleBoardStates[y][x+1] == constCellBulb)) { bulbCount++; }
        if ((x>0)                 && (puzzleBoardStates[y][x-1] == constCellBulb)) { bulbCount++; }
        if (bulbCount==cellValue) {
          if (playState.assistState==2) {
            globalBoardTextColors[y][x] = correctFontColorBr;
          }
        } else if (bulbCount>cellValue) {
          playState.errorCount++;
          if (playState.assistState==2) {
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
      if ((puzzleBoardStates[y][x] == constCellWhite) ||
          (puzzleBoardStates[y][x] == constCellDot)) {
        incompleteCells++;
      } else if (puzzleBoardStates[y][x] >= constCellBulb) {
        if (playState.assistState==2) {
          globalBoardColors[y][x] = litCellColor;
        }
      }
    }
  }

  updateDynTextFields();
  if ((playState.errorCount==0) && (incompleteCells==0) && (incompleteDigits==0)) {
    canvasSuccess(isDemo,gameName,puzzleChoice);
  } else {
    canvasIncomplete();
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    if (lastMove[2] == 0) {
      addMove(constPathClear,lastMove[0],lastMove[1],true);
    } else {
      addMove(lastMove[2],lastMove[0],lastMove[1],true);
    }
    updateBoardStatus();
    drawBoard();
  }
}

function updateDemoRegionGeneric(demoNum,initFunc,stepFunc) {
  let which = 0;
  for (let i=0;i<demoPuzzles.length;i++) {
    if (demoNum==demoPuzzles[i]) which = i;
  }
  let dtext  =  demoText[which];
  let dmoves = demoMoves[which];
  if (demoStepNum < dtext.length) {
    if (demoStepNum) {
      playState.assistState = 2;
    } else {
      playState.assistState = 0;
    }
    updateHtmlText('demotext', dtext[demoStepNum]);
    initFunc();
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      for (let dstep of dmoves[step]) {
        stepFunc(dstep);
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}

function updateDemoRegion(demoNum) {
  updateDemoFunction(demoNum,function () {
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if (puzzleBoardStates[y][x] > constCellBlackNum) {
          puzzleBoardStates[y][x] = constCellWhite;
          globalCircleStates[y][x] = constCircleNone;
          globalLineStates[y][x] = constPathNone;
        }
      }
    }
  }, function (steps) {
    let s0 = (steps[0] == '@') ? constCellBulb : constCellDot;
    addMove(s0,parseInt(steps[1],36),parseInt(steps[2],36));
  });
}
