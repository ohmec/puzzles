const gameName = 'fillomino';

const constMoveEraseCell =  50;
const constMoveEraseWall =  51;
const constMoveAddWall =    52;
const constMoveToggleWall = 53;

let incompleteCount = 0;
let incompleteBoard = true;
let curClickType = constClickUnknown;
let curClickIsWall = false;

// which keys are handled, letters and numbers handled algorithmically afterwards
let handledKeys =
  [ constKeyBackspace, constKeySpace, constKeyCR, constKeyEsc,
    constKeyLeft, constKeyUp, constKeyRight, constKeyDown ];

let moveHistory, puzzleInitBoardValues;

function shiftFunc() {
  playState.shiftNumber = globalBoardValues[globalCursorY][globalCursorX];
}

function puzzleInit() {
  globalCursorOn = true;
  initElements();
  initRibbons(gameName);

  // add digits and letters to handled key list
  for (let key=constKey1;key<=constKey9;key++) {
    handledKeys.push(key);
  }
  for (let key=constKeyAlt1;key<=constKeyAlt9;key++) {
    handledKeys.push(key);
  }
  for (let key=constKeyA;key<=constKeyZ;key++) {
    handledKeys.push(key);
  }

  listenKeys(handledKeys,handleKey,shiftFunc);
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
    if (playState.errorCount && incompleteCount) {
      etext = "there are errors and incomplete numbers";
    } else if (playState.errorCount) {
      etext = "there are errors";
    } else if (incompleteCount) {
      etext = "there are incomplete numbers";
    } else if (incompleteBoard) {
      etext = "there are pending white cells";
    } else {
      etext = "the puzzle is complete!!";
    }
  } else {
    if (playState.errorCount || incompleteCount) {
      etext = "there are " + playState.errorCount + " errors and " +
                        incompleteCount + " incomplete numbers";
    } else if (incompleteBoard) {
      etext = "there are pending white cells";
    } else {
      etext = "the puzzle is complete!!";
    }
  }
  updateDynamicHtmlEntries(etext,playState.assistState);
}

function addHistory(movetype,y,x,prevvalue) {
  moveHistory.push([movetype,y,x,prevvalue]);
}

function addMove(y,x,moveType) {
  if (moveType==constMoveEraseWall) {
    if (globalWallStates[y][x] & constWallUserEdge) {
      addHistory(moveType,y,x,globalWallStates[y][x]);
      globalWallStates[y][x] &= ~constWallUserEdge;
    }
  } else if (moveType==constMoveAddWall) {
    if ((globalWallStates[y][x] & constWallUserEdge) == 0) {
      addHistory(moveType,y,x,globalWallStates[y][x]);
      globalWallStates[y][x] |= constWallUserEdge;
    }
  } else if (moveType==constMoveToggleWall) {
    addHistory(moveType,y,x,globalWallStates[y][x]);
    globalWallStates[y][x] ^= constWallUserEdge;
  } else {
    // don't change a static value
    if (puzzleInitBoardValues[y][x] != "") {
      return;
    }
    if (moveType==constMoveEraseCell) {
      addHistory(moveType,y,x,globalBoardValues[y][x]);
      globalBoardValues[y][x] = "";
    } else {
      addHistory(moveType,y,x,globalBoardValues[y][x]);
      globalBoardValues[y][x] = moveType;
    }
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
    if (keynum >= constKey1 && keynum <= constKey9) {
      addMove(globalCursorY,globalCursorX,keynum-constKey0);
    } else if (keynum >= constKeyAlt1 && keynum <= constKeyAlt9) {
      addMove(globalCursorY,globalCursorX,keynum-constKeyAlt0);
    } else if (keynum >= constKeyA && keynum <= constKeyZ) {
      addMove(globalCursorY,globalCursorX,keynum-constKeyA+10);
    } else {
      switch (keynum) {
        case constKeyEsc:
          console.log(globalBoardValues);
          console.log(globalWallStates);
          break;
        case constKeyUp:
          if (globalCursorOn) {
            if (globalCursorY) {
              globalCursorY--;
              if (playState.shifting) {
                addMove(globalCursorY,globalCursorX,playState.shiftNumber);
              }
            }
          // we can only move the wall cursor up if we're already on a vert wall
          // or corner
          } else if (globalWallCursorOn && ((globalWallCursorX%2)==0)) {
            if (globalWallCursorY) {
              globalWallCursorY--;
              if (playState.shifting && ((globalWallCursorX%2) || (globalWallCursorY%2))) {
                addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
              }
              // if shifting on a corner move up two (to the next corner), else one
              if (playState.shifting && (globalWallCursorY%2)) {
                globalWallCursorY--;
              }
            }
          }
          break;
        case constKeyDown:
          if (globalCursorOn) {
            if (globalCursorY < (globalPuzzleH-1)) {
              globalCursorY++;
              if (playState.shifting) {
                addMove(globalCursorY,globalCursorX,playState.shiftNumber);
              }
            }
          // we can only move the wall cursor down if we're already on a vert wall
          // or corner
          } else if (globalWallCursorOn && ((globalWallCursorX%2)==0)) {
            if (globalWallCursorOn && (globalWallCursorY<=(2*globalPuzzleH))) {
              globalWallCursorY++;
              if (playState.shifting && ((globalWallCursorX%2) || (globalWallCursorY%2))) {
                addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
              }
              // if shifting on a corner move down two (to the next corner), else one
              if (playState.shifting && (globalWallCursorY%2)) {
                globalWallCursorY++;
              }
            }
          }
          break;
        case constKeyLeft:
          if (globalCursorOn) {
            if (globalCursorX) {
              globalCursorX--;
              if (playState.shifting) {
                addMove(globalCursorY,globalCursorX,playState.shiftNumber);
              }
            }
          // we can only move the wall cursor left if we're already on a horz wall
          // or corner
          } else if (globalWallCursorOn && ((globalWallCursorY%2)==0)) {
            if (globalWallCursorX) {
              globalWallCursorX--;
              if (playState.shifting && ((globalWallCursorX%2) || (globalWallCursorY%2))) {
                addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
              }
              // if shifting on a corner move left two (to the next corner), else one
              if (playState.shifting && (globalWallCursorX%2)) {
                globalWallCursorX--;
              }
            }
          }
          break;
        case constKeyRight:
          if (globalCursorOn) {
            if (globalCursorX < (globalPuzzleW-1)) {
              globalCursorX++;
              if (playState.shifting) {
                addMove(globalCursorY,globalCursorX,playState.shiftNumber);
              }
            }
          // we can only move the wall cursor right if we're already on a horz wall
          // or corner
          } else if (globalWallCursorOn && ((globalWallCursorY%2)==0)) {
            if (globalWallCursorX<=(2*globalPuzzleW)) {
              globalWallCursorX++;
              if (playState.shifting && ((globalWallCursorX%2) || (globalWallCursorY%2))) {
                addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
              }
              // if shifting on a corner move right two (to the next corner), else one
              if (playState.shifting && (globalWallCursorX%2)) {
                globalWallCursorX++;
              }
            }
          }
          break;
        // if on wall, toggle wall value
        case constKeySpace:
          if (globalWallCursorOn) {
            if ((globalWallStates[globalWallCursorY][globalWallCursorX] & constWallUserEdge)==0) {
              addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
            } else {
              addMove(globalWallCursorY,globalWallCursorX,constMoveEraseWall);
            }
          }
          break;
        case constKeyBackspace:
          if (globalCursorOn) {
            addMove(globalCursorY,globalCursorX,constMoveEraseCell);
          } else {
            addMove(globalWallCursorY,globalWallCursorX,constMoveEraseWall);
          }
          break;
      }
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

  basicInitStructures(size,emptyCellColor,constWallLight,constWallBorder,stdFontColor);

  puzzleInitBoardValues = initBoardValuesFromParams(numParams);
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,puzzleInitBoardValues);
  globalTextBold =        initYXFromValue(false);

  // bold the cells with fixed digits
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (globalBoardValues[y][x] != "") {
        globalTextBold[y][x] = true;
      }
    }
  }

  updateBoardStatus();
  drawBoard();
}

function handleClick(evnt) {
  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  if (!playState.dragging) {
    curClickType = clickType(evnt);
    curClickIsWall = isEdge;
    if ((globalBoardValues[yCell][xCell] == "") || isEdge || (curClickType != constClickLeft)) {
      playState.clickNumber = constMoveEraseCell;
    } else {
      playState.clickNumber = globalBoardValues[yCell][xCell];;
    }
  }

  // ignoring middle click
  if (curClickType == constClickMiddle) {
    return;
  }
  // dragging wall, but no move yet
  if (playState.dragging && curClickIsWall && (yEdge == globalWallCursorY) && (xEdge == globalWallCursorX)) {
    return;
  }
  // dragging wall, but currently fell off wall
  if (playState.dragging && curClickIsWall && !isEdge) {
    return;
  }
  // dragging cell, but no move yet
  if (playState.dragging && !curClickIsWall && (yCell == globalCursorY) && (xCell == globalCursorX)) {
    return;
  }
  // dragging cell, but on a wall or corner
  if (playState.dragging && !curClickIsWall && (isEdge || isCorner)) {
    return;
  }

  if (isEdge || isCorner) {
    globalWallCursorY = yEdge;
    globalWallCursorX = xEdge;
    globalWallCursorOn = true;
    globalCursorOn = false;
  } else {
    globalCursorY = yCell;
    globalCursorX = xCell;
    globalWallCursorOn = false;
    globalCursorOn = true;
  }

  // left click on edge toggles the edge
  if (!playState.dragging && isEdge && (curClickType==constClickLeft)) {
    addMove(yEdge,xEdge,constMoveToggleWall);
  // right drag or non-drag on edge clears the edge
  } else if (isEdge && curClickIsWall && (curClickType==constClickRight)) {
    addMove(yEdge,xEdge,constMoveEraseWall);
  // left drag on edge adds an edge
  } else if (playState.dragging && isEdge && curClickIsWall && (curClickType==constClickLeft)) {
    addMove(yEdge,xEdge,constMoveAddWall);
  // right drag on non-edge clears the cells
  } else if (playState.dragging && !isEdge && !curClickIsWall && (curClickType==constClickRight)) {
    addMove(yCell,xCell,constMoveEraseCell);
  // left drag propagates the current number
  } else if (playState.dragging && !isEdge && !curClickIsWall && (curClickType==constClickLeft)) {
    addMove(yCell,xCell,playState.clickNumber);
  }
  updateBoardStatus();
  drawBoard();
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) rooms with a digit that are larger than digit value
  //  2) rooms with a digit and no room to grow that are smaller than digit value
  playState.errorCount = 0;

  // also count how many numbers haven't been completed yet
  incompleteCount = 0;
  incompleteBoard = false;

  // start by reseting all cell colors to "standard",
  // and all wall borders should remove the SolveEdge
  // before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalBoardColors[y][x] = emptyCellColor;
      globalBoardTextColors[y][x] = stdFontColor;
    }
  }
  for (let y=0;y<globalPuzzleH*2+1;y++) {
    for (let x=0;x<globalPuzzleW*2+1;x++) {
      globalWallStates[y][x] &= ~constWallSolveEdge;
    }
  }

  // if in assist mode 1 or higher, color the cells by
  // the number
  if (playState.assistState >= 1) {
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if (globalBoardValues[y][x]) {
          globalBoardColors[y][x] = numberColor[globalBoardValues[y][x]];
        }
      }
    }
  }

  // now go through all of the cells with digits. get their room
  // of like-numbered neighboring cells. If it is larger than
  // that number it is an error. if it is smaller and there
  // is no more room to grow, it is in error. else if they
  // are unequal it is still in progress.
  let allDigitCells = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let cellValue = globalBoardValues[y][x];
      // look for a white cells
      if (cellValue == "") {
        incompleteBoard = true;
      // look for a numerical value
      } else if (cellValue != "") {
        // skip if already in the allDigitCell list, since it is covered already
        if (allDigitCells.indexOf(y+","+x) == -1) {
          let roomArray, hasGrowth;
          [roomArray,hasGrowth] = findDigitRoom(globalBoardValues,y,x,cellValue);
          if (roomArray.length > cellValue) {
            playState.errorCount++;
            // if in assist state 2 mark with error font
            if (playState.assistState == 2) {
              for (let cell of roomArray) {
                let yx = cell.split(",");
                globalBoardTextColors[yx[0]][yx[1]] = errorFontColor;
              }
            }
          } else if ((roomArray.length < cellValue) && !hasGrowth) {
            playState.errorCount++;
            // if in assist state 2 mark with error font
            if (playState.assistState == 2) {
              for (let cell of roomArray) {
                let yx = cell.split(",");
                globalBoardTextColors[yx[0]][yx[1]] = errorFontColor;
              }
            }
          } else if (roomArray.length != cellValue) {
            incompleteCount++;
          } else {
            // if in assist state >= 1, draw boundaries around completed rooms
            if (playState.assistState >= 1) {
              for (let cell of roomArray) {
                let yx = cell.split(",");
                let iy = yx[0];
                let ix = yx[1];
                // check all 4 edges for membership in room array
                let yxn = (parseInt(iy)-1) + "," + (ix);
                let yxs = (parseInt(iy)+1) + "," + (ix);
                let yxw = (iy)   + "," + (parseInt(ix)-1);
                let yxe = (iy)   + "," + (parseInt(ix)+1);
                let yxnWall = (roomArray.indexOf(yxn) == -1);
                let yxsWall = (roomArray.indexOf(yxs) == -1);
                let yxwWall = (roomArray.indexOf(yxw) == -1);
                let yxeWall = (roomArray.indexOf(yxe) == -1);
                if (yxnWall) { globalWallStates[2*iy  ][2*ix+1] |= constWallSolveEdge; }
                if (yxsWall) { globalWallStates[2*iy+2][2*ix+1] |= constWallSolveEdge; }
                if (yxwWall) { globalWallStates[2*iy+1][2*ix  ] |= constWallSolveEdge; }
                if (yxeWall) { globalWallStates[2*iy+1][2*ix+2] |= constWallSolveEdge; }
              }
            }
          }
        allDigitCells.push.apply(allDigitCells, roomArray);
        }
      }
    }
  }

  updateDynTextFields();
  if ((playState.errorCount == 0) && (incompleteCount == 0) && !incompleteBoard) {
    canvasSuccess(isDemo,gameName,puzzleChoice);
  } else {
    canvasIncomplete();
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    if (lastMove[0] <= constMoveEraseCell) {
      globalBoardValues[lastMove[1]][lastMove[2]] = lastMove[3];
    } else {
      globalWallStates[lastMove[1]][lastMove[2]] = lastMove[3];
    }
    updateBoardStatus();
    drawBoard();
  }
}

function updateDemoRegion(demoNum) {
  globalCursorOn = false;
  updateDemoFunction(demoNum,function () {
    // start by reseting all non-number cells to empty
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if (puzzleInitBoardValues[y][x] == "") {
          globalBoardValues[y][x] = "";
        }
      }
    }
    // and all walls to no user edge
    for (let y=0;y<(globalPuzzleH*2+1);y++) {
      for (let x=0;x<(globalPuzzleW*2+1);x++) {
        globalWallStates[y][x] &= ~constWallUserEdge;
      }
    }
  }, function (steps) {
    if (steps[0]=="_") {          // south wall
      addMove(2*parseInt(steps[1],36)+2,2*parseInt(steps[2],36)+1,constMoveAddWall);
    } else if (steps[0]=="|") {   // east wall
      addMove(2*parseInt(steps[1],36)+1,2*parseInt(steps[2],36)+2,constMoveAddWall);
    } else {                      // digit entry
      addMove(parseInt(steps[1],36),parseInt(steps[2],36),parseInt(steps[0],36));
    }
  });
}
