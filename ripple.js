const gameName = 'rippleeffect';

const completeFillColor = "#e0ffe0";    // light green

let incompleteCount = 0;

const constMoveClear  = 1;
const constMoveSet    = 2;

// the digits and letters are added below
const handledKeys = [ constKeyBackspace, constKeyCR, constKeySpace,
  constKeyLeft, constKeyUp, constKeyRight, constKeyDown ];

let moveHistory, puzzleInitBoardValues, boardStates, puzzleRoomList, largestPolyo;

function puzzleInit() {
  globalCursorOn = true;

  // add digits and letters to handled key list
  for (let key=constKey1;key<=constKey9;key++) {
    handledKeys.push(key);
  }
  for (let key=constKeyAlt1;key<=constKeyAlt9;key++) {
    handledKeys.push(key);
  }
  for (let key=constKeyAlc;key<=constKeyZlc;key++) {
    handledKeys.push(key);
  }
  for (let key=constKeyA;key<=constKeyZ;key++) {
    handledKeys.push(key);
  }

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
    if (playState.errorCount && incompleteCount) {
      etext = "there are errors and incomplete rooms";
    } else if (playState.errorCount) {
      etext = "there are errors";
    } else if (incompleteCount) {
      etext = "there are incomplete rooms";
    } else {
      etext = "there are no errors nor incomplete rooms";
    }
  } else {
    etext = "there are " + playState.errorCount + " errors and " +
                      incompleteCount + " incomplete rooms";
  }
  updateDynamicHtmlEntries(etext,playState.assistState);
}

function addHistory(y,x,prevvalue,newvalue) {
  moveHistory.push([y,x,prevvalue,newvalue]);
}

function addMove(y,x,value) {
  addHistory(y,x,globalBoardValues[y][x],value);
  globalBoardValues[y][x] = value;
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
      case constKeyUp:
      case constKeyDown:
      case constKeyLeft:
      case constKeyRight:
        moveGlobalCursor(keynum);
        break;
      case constKeyBackspace:
      case constKeySpace: // clear the board contents unless default
        // don't delete those that are pre-set
        if (puzzleInitBoardValues[globalCursorY][globalCursorX] == '') {
          addMove(globalCursorY,globalCursorX,'');
        }
        break;
      default:    // here we handle all digit keys including A-Z
        // don't overwrite those that are pre-set
        let setValue = 0;
        if (puzzleInitBoardValues[globalCursorY][globalCursorX] == '') {
          if (keynum >= constKey1 && keynum <= constKey9) {
            setValue = keynum-constKey0;
          } else if (keynum >= constKeyAlt1 && keynum <= constKeyAlt9) {
            setValue = keynum-constKeyAlt0;
          } else if(keynum >= constKeyAlc && keynum <= constKeyZlc) {
            setValue = keynum-constKeyAlc+10;
          } else {
            setValue = keynum-constKeyA+10;
          }
        }
        if (setValue && setValue <= largestPolyo) {
          addMove(globalCursorY,globalCursorX,setValue);
        }
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
  let rwallParams = puzzleSplit[2];
  let cwallParams = puzzleSplit[3];
  // reset to non-demo
  isDemo = false;

  basicInitStructures(size,emptyCellColor,constWallLight,constWallBorder,fillCellColor);

  puzzleInitBoardValues = initBoardValuesFromParams(numParams);
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,puzzleInitBoardValues);

  // initialize the wall states based upon the given parameters
  globalWallStates = initWallStatesFromHexes(rwallParams, cwallParams, constWallBorder, constWallLight);

  // find all the rooms
  puzzleRoomList = findRooms();
  largestPolyo = 0;
  for (let i=0;i<puzzleRoomList.length;i++) {
    if (puzzleRoomList[i].length > largestPolyo) {
      largestPolyo = puzzleRoomList[i].length;
    }
  }
  updateBoardStatus();
  drawBoard();
}

function handleClick(evnt) {
  // don't allow dragging
  if (playState.dragging) return;

  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  globalCursorY = yCell;
  globalCursorX = xCell;
  drawBoard();
}

// look for errors and incompletions
function updateBoardStatus() {
  // accounting the errors:
  //  1) duplicates of a digit in a room
  //  2) too large of a value in a room
  //  3) two digits too close to each other
  // also count the incompletes, which are rooms
  // that don't have all of the digits filled correctly
  let errorCells = new Array();
  let incompleteRooms = new Array();
  incompleteCount = 0;

  for (let p=0;p<puzzleRoomList.length;p++) {
    let room = puzzleRoomList[p];
    let vcounts = new Array();
    for (let i=1;i<=room.length;i++) {
      vcounts[i] = 0;
    }
    for (let r of room) {
      let pcell = r.split(",");
      let py = pcell[0];
      let px = pcell[1];
      let pv = globalBoardValues[py][px];
      if (pv > room.length && (errorCells.indexOf(pcell) == -1)) {
        errorCells.push(room[i]);
      }
      vcounts[pv]++;
    }
    for (let c=1;c<=room.length;c++) {
      // if more than one, mark all in the room with that number in error
      if (vcounts[c] > 1) {
        for (let r of room) {
          let pcell = r.split(",");
          let py = pcell[0];
          let px = pcell[1];
          let pv = globalBoardValues[py][px];
          if ((pv == c) && (errorCells.indexOf(pcell) == -1)) {
            errorCells.push(r);
          }
        }
      // if zero, then this is an incomplete room
      } else if (vcounts[c] == 0) {
        if (incompleteRooms.indexOf(p) == -1) {
          incompleteRooms.push(p);
        }
      }
    }
  }

  // now check the ripple effect. only need to go in the positive
  // direction so as to not double count
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (globalBoardValues[y][x]) {
        // count forward in both directions and look for duplicates
        for (let i=1;i<=globalBoardValues[y][x];i++) {
          let xi = x+i;
          let yi = y+i;
          let cellyx  = y +","+x;
          let cellyxi = y +","+xi;
          let cellyix = yi+","+x;
          if ((xi < globalPuzzleW) &&
              (globalBoardValues[y][xi] == globalBoardValues[y][x])) {
            if (errorCells.indexOf(cellyx) == -1) {
              errorCells.push(cellyx);
            }
            if (errorCells.indexOf(cellyxi) == -1) {
              errorCells.push(cellyxi);
            }
          }
          if ((yi < globalPuzzleH) &&
              (globalBoardValues[yi][x] == globalBoardValues[y][x])) {
            if (errorCells.indexOf(cellyx) == -1) {
              errorCells.push(cellyx);
            }
            if (errorCells.indexOf(cellyix) == -1) {
              errorCells.push(cellyix);
            }
          }
        }
      }
    }
  }

  // in assistState 2, color completed rooms light green,
  // and error cells with red font
  for (let p=0;p<puzzleRoomList.length;p++) {
    let room = puzzleRoomList[p];
    for (let i=0;i<room.length;i++) {
      let pcell = room[i].split(",");
      let py = pcell[0];
      let px = pcell[1];
      if ((playState.assistState == 2) && (incompleteRooms.indexOf(p) == -1)) {
        globalBoardColors[py][px] = completeFillColor;
      } else {
        globalBoardColors[py][px] = emptyCellColor;
      }
      if ((playState.assistState == 2) && (errorCells.indexOf(room[i]) != -1)) {
        globalBoardTextColors[py][px] = errorFontColor;
      } else {
        globalBoardTextColors[py][px] = fillCellColor;
      }
    }
  }

  playState.errorCount = errorCells.length;
  incompleteCount = incompleteRooms.length;
  updateDynTextFields();
  if ((playState.errorCount == 0) && (incompleteCount == 0)) {
    canvasSuccess(isDemo,gameName,puzzleChoice);
  } else {
    canvasIncomplete();
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    globalBoardValues[lastMove[0]][lastMove[1]] = lastMove[2];
    updateBoardStatus();
    drawBoard();
  }
}

function updateDemoRegion(demoNum) {
  updateDemoFunction(demoNum,function () {
    globalBoardValues = initYXFromArray(globalPuzzleH,globalPuzzleW,puzzleInitBoardValues);
  }, function (steps) {
    addMove(steps[0],steps[1],steps[2]);
  });
}
