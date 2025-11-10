const gameName = 'hitori';

const incorrectCellColor  = "#802020";  // dark reddish
const duplicateStateColor = "#FFC0C0";  // light reddish
const incorrectRiverColor = "#C0C040";  // light brown

const constMoveToggle = 1;
const constMoveSet    = 2;
const constMoveReset  = 3;

const handledKeys = [ constKeyCR, constKeySpace, constKeyLeft,
  constKeyUp, constKeyRight, constKeyDown, constKey0, constKey1,
  constKeyAlt0, constKeyAlt1 ];

let moveHistory, puzzleBoardStates;

function puzzleInit() {
  initElements();
  initRibbons(gameName);
  listenKeys(handledKeys,handleKey);
  listenClick(handleClick,initStructures,undoMove);

  if(cannedPuzzles[puzzleChoice]) {
    initPuzzle = cannedPuzzles[puzzleChoice];
  } else {
    initPuzzle = cannedPuzzles[0];
  }

  puzzle = removeDot(initPuzzle);
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
    if (playState.errorCount) {
      etext = "there are errors";
    } else {
      etext = "there are no errors";
    }
  } else {
    etext = "there are " + playState.errorCount + " errors";
  }
  updateDynamicHtmlEntries(etext,playState.assistState);
}

function addHistory(setOrReset,y,x) {
  moveHistory.push([setOrReset,y,x]);
}

function addMove(move,y,x) {
  switch (move) {
    case constMoveToggle:
      puzzleBoardStates[y][x] = puzzleBoardStates[y][x] ? false : true;
      addHistory(puzzleBoardStates[y][x],y,x);
      break;
    case constMoveSet:
      puzzleBoardStates[y][x] = true;
      addHistory(true,y,x);
      break;
    case constMoveReset:
      puzzleBoardStates[y][x] = false;
      addHistory(false,y,x);
      break;
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
      case constKeyUp:
      case constKeyDown:
      case constKeyLeft:
      case constKeyRight:
        globalCursorOn = true;
        moveGlobalCursor(keynum);
        break;
      case constKeySpace: // toggle on/off under cursor
        globalCursorOn = true;
        addMove(constMoveToggle,globalCursorY,globalCursorX);
        break;
      case constKey0: // set off
      case constKeyAlt0:
        globalCursorOn = true;
        addMove(constMoveReset,globalCursorY,globalCursorX);
        break;
      case constKey1: // set on
      case constKeyAlt1:
        globalCursorOn = true;
        addMove(constMoveSet,globalCursorY,globalCursorX);
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

  basicInitStructures(size,emptyCellColor,constWallLight,constWallBorder,stdFontColor);

  globalBoardValues = initBoardValuesFromParams(numParams);
  puzzleBoardStates = initYXFromValue(false); // states are true/false for "black"

  // look for pre-black ones (denoted with *)
  let numParamsExp = expandNumParams(numParams);
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (numParamsExp[y*globalPuzzleW+x] == '*') {
        puzzleBoardStates[y][x] = true;
      }
    }
  }
  updateBoardStatus();
  drawBoard();
  updateDynTextFields();
}

function handleClick(evnt) {
  // don't allow dragging
  if (playState.dragging) return;

  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  globalCursorY = yCell;
  globalCursorX = xCell;

  // click toggles state
  addMove(constMoveToggle,yCell,xCell);

  // update status
  updateBoardStatus();

  // re-draw the board
  drawBoard();
}

function updateBoardStatus() {
  // set all cells to black or white before figuring out error conditions
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalBoardColors[y][x]     = puzzleBoardStates[y][x] ? fillCellColor : emptyCellColor;
      globalBoardTextColors[y][x] = puzzleBoardStates[y][x] ?  offFontColor :   stdFontColor;
    }
  }

  // figure out how many illegal rows and columns there are,
  // determined by the repeated values found. don't count the
  // same cell twice
  playState.errorCount = 0;
  for (let y=0;y<globalPuzzleH;y++) {
    let count = new Array(globalPuzzleW);
    for (let c=0;c<=globalPuzzleW;c++) {
      count[c] = 0;
    }
    for (let x=0;x<globalPuzzleW;x++) {
      if (!puzzleBoardStates[y][x]) {
        count[globalBoardValues[y][x]]++;
      }
    }
    for (let c=0;c<=globalPuzzleW;c++) {
      if (count[c] > 1) {
        playState.errorCount += (count[c]-1);
        // if in assistState==2 then color these light red
        if (playState.assistState==2) {
          for (let x=0;x<globalPuzzleW;x++) {
            if (!puzzleBoardStates[y][x] && globalBoardValues[y][x]==c) {
              globalBoardColors[y][x] = duplicateStateColor;
            }
          }
        }
      }
    }
  }
  for (let x=0;x<globalPuzzleW;x++) {
    let count = new Array(globalPuzzleH);
    for (let c=0;c<=globalPuzzleH;c++) {
      count[c] = 0;
    }
    for (let y=0;y<globalPuzzleH;y++) {
      if (!puzzleBoardStates[y][x]) {
        count[globalBoardValues[y][x]]++;
      }
    }
    for (let c=0;c<=globalPuzzleH;c++) {
      if (count[c] > 1) {
        playState.errorCount += (count[c]-1);
        // if in assistState==2 then color these light red
        if (playState.assistState==2) {
          for (let y=0;y<globalPuzzleH;y++) {
            if (!puzzleBoardStates[y][x] && globalBoardValues[y][x]==c) {
              globalBoardColors[y][x] = duplicateStateColor;
            }
          }
        }
      }
    }
  }

  // now count adjacent black cells, only counting
  // one error per "clump"
  let filledCells = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] && (filledCells.indexOf(y+","+x) == -1)) {
        let visitedCells = travelRiver(puzzleBoardStates,y,x,true,true);
        if (visitedCells.length != 1) {
          playState.errorCount++;
          // color them if in assistState==2
          if (playState.assistState==2) {
            for (let cc of visitedCells) {
              let curCell = cc.split(",");
              let iy = curCell[0];
              let ix = curCell[1];
              globalBoardColors[iy][ix] = incorrectCellColor;
            }
          }
        }
        filledCells.push.apply(filledCells, visitedCells);
      }
    }
  }

  // next count an error for any number of white "streams" greater than 1
  let whiteCells = new Array();
  let riverCount = 0;
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (!puzzleBoardStates[y][x] && (whiteCells.indexOf(y+","+x) == -1)) {
        let visitedCells = travelRiver(puzzleBoardStates,y,x,true,false);
        if (riverCount) {
          playState.errorCount++;
          // if in assistState==2 then color these second river
          // cells differently
          if (playState.assistState==2) {
            for (let cc of visitedCells) {
              let curCell = cc.split(",");
              let iy = curCell[0];
              let ix = curCell[1];
              globalBoardColors[iy][ix] = incorrectRiverColor;
            }
          }
        }
        whiteCells.push.apply(whiteCells, visitedCells);
        riverCount++;
      }
    }
  }

  updateDynTextFields();
  if (playState.errorCount == 0) {
    canvasSuccess(isDemo,gameName,puzzleChoice);
  } else {
    canvasIncomplete();
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    puzzleBoardStates[lastMove[1]][lastMove[2]] = lastMove[0] ? false : true;
    updateBoardStatus();
    drawBoard();
  }
}

function updateDemoRegion(demoNum) {
  updateDemoFunction(demoNum,function () {
    puzzleBoardStates = initYXFromValue(false);
  }, function (steps) {
    addMove(constMoveSet,steps[0],steps[1]);
  });
}
