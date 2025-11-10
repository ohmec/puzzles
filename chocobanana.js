const gameName = 'chocobanana';

const incorrectBlackColor = "#802020";  // dark reddish
const incorrectWhiteColor = "#FFE0E0";  // light red

let incompleteCount = 0;
let curClickType = constClickUnknown;

const constStateWhite = 1;
const constStateBlack = 2;
const constStateIndet = 3;

// which keys are handled
let handledKeys = [ constKeyBackspace, constKeyCR, constKeySpace,
  constKeyLeft, constKeyUp, constKeyRight, constKeyDown,
  constKey0, constKey1, constKeyAlt0, constKeyAlt1 ];

let moveHistory, puzzleRoomList, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;
  globalTextOutline = true; // outline style text
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
      etext = "there are errors and indeterminate squares";
    } else if (playState.errorCount) {
      etext = "there are errors";
    } else if (incompleteCount) {
      etext = "there are indeterminate squares";
    } else {
      etext = "there are no errors nor indeterminate squares";
    }
  } else {
    etext = "there are " + playState.errorCount + " errors and " +
                      incompleteCount + " indeterminate squares";
  }
  updateDynamicHtmlEntries(etext,playState.assistState);
}

function addHistory(y,x,prevvalue,newvalue) {
  moveHistory.push([y,x,prevvalue,newvalue]);
}

function addMove(moveType,y,x) {
  addHistory(y,x,puzzleBoardStates[y][x],moveType);
  puzzleBoardStates[y][x] = moveType;
  // colors will be overridden based upon error status
  globalBoardColors[y][x] =
    (moveType == constStateWhite) ? emptyCellColor :
    (moveType == constStateBlack) ? fillCellColorDB :
                                    indetCellColor;
  globalBoardTextColors[y][x] = (moveType == constStateBlack) ? offFontColor : stdFontColor;
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
      case constKeySpace: // toggle through states
        if (puzzleBoardStates[globalCursorY][globalCursorX] == constStateIndet) {
          addMove(constStateBlack,globalCursorY,globalCursorX);
        } else if (puzzleBoardStates[globalCursorY][globalCursorX] == constStateBlack) {
          addMove(constStateWhite,globalCursorY,globalCursorX);
        } else {
          addMove(constStateIndet,globalCursorY,globalCursorX);
        }
        break;
      case constKeyBackspace:
        addMove(constStateIndet,globalCursorY,globalCursorX);
        break;
      case constKey0:
      case constKeyAlt0:
        addMove(constStateWhite,globalCursorY,globalCursorX);
        break;
      case constKey1:
      case constKeyAlt1:
        addMove(constStateBlack,globalCursorY,globalCursorX);
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
  let hexParams = puzzleSplit[2];
  // reset to non-demo
  isDemo = false;

  basicInitStructures(size,indetCellColor,constWallDash,constWallBorder,stdFontColor);

  globalBoardValues = initBoardValuesFromParams(numParams);
  puzzleBoardStates = initYXFromValue(constStateIndet);

  // override board colors if the hexParams are included, just for 0th
  // entry of the puzzles (example completed puzzle). this uses hex values
  // to define the black (1) or white (0) states
  if (hexParams) {
    let stateHexes = hexParams.split("");
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        let stateHex = stateHexes[y*Math.ceil(globalPuzzleW/4)+Math.floor(x/4)];
        let stateTrue = (parseInt(stateHex,16) & (1<<(3-(x%4)))) ? 1 : 0;
        puzzleBoardStates[y][x] = stateTrue ? constStateBlack : constStateWhite;
      }
    }
  }

  updateBoardStatus();
  drawBoard();
}

function handleClick(evnt) {
  if (!playState.dragging) {
    curClickType = clickType(evnt);
  }
  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  // dragging, but no move yet
  if (playState.dragging && ((yCell == globalCursorY) && (xCell == globalCursorX))) {
    return;
  }

  globalCursorY = yCell;
  globalCursorX = xCell;

  // left sets to black, right sets to white, middle sets to indet
  // ignore if already the same state
  if ((curClickType == constClickLeft)   && puzzleBoardStates[yCell][xCell] != constStateBlack) {
    addMove(constStateBlack,yCell,xCell);
  }
  if ((curClickType == constClickMiddle) && puzzleBoardStates[yCell][xCell] != constStateIndet) {
    addMove(constStateIndet,yCell,xCell);
  }
  if ((curClickType == constClickRight)  && puzzleBoardStates[yCell][xCell] != constStateWhite) {
    addMove(constStateWhite,yCell,xCell);
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
  playState.errorCount = 0;

  // also count how many cells are still indeterminate
  incompleteCount = 0;

  // start by reseting all cell and font colors to "standard"
  // before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] == constStateBlack) {
        globalBoardColors[y][x] = fillCellColorDB;
        globalBoardTextColors[y][x] = offFontColor;
      } else if (puzzleBoardStates[y][x] == constStateWhite) {
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
      if ((cellValue != "") && (cellState != constStateIndet)) {
        let roomArray = travelRiver(puzzleBoardStates,y,x,true,cellState);
        if (cellValue != roomArray.length) {
          // violates rule 1
          playState.errorCount++;
          if (playState.assistState == 2) {
            globalBoardTextColors[y][x] = errorFontColor;
          }
        } else if (roomIsRectangle(roomArray)) {
          if (cellState == constStateBlack) {
            // success
            if (playState.assistState == 2) {
              globalBoardTextColors[y][x] = correctFontColor;
            }
          } else {
            // violates rule 2
            playState.errorCount++;
            if (playState.assistState == 2) {
              globalBoardTextColors[y][x] = errorFontColor;
            }
          }
        } else {
          if (cellState == constStateWhite) {
            // success
            if (playState.assistState == 2) {
              globalBoardTextColors[y][x] = correctFontColor;
            }
          } else {
            // violates rule 3
            playState.errorCount++;
            if (playState.assistState == 2) {
              globalBoardTextColors[y][x] = errorFontColor;
            }
          }
        }
      } else if (cellState == constStateIndet) {
        incompleteCount++;
      }
    }
  }

  // final step is to check the shape of all white and black rooms
  let checkedCells = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let cellState = puzzleBoardStates[y][x];
      if ((cellState != constStateIndet) && (checkedCells.indexOf(y+","+x) == -1)) {
        let roomArray = travelRiver(puzzleBoardStates,y,x,true,cellState);
        let roomRect = roomIsRectangle(roomArray);
        let errBlack = (cellState == constStateBlack && !roomRect) ? true : false;
        let errWhite = (cellState == constStateWhite &&  roomRect) ? true : false;
        if (errBlack || errWhite) {
          // if there is a digit somewhere within the room then don't double-count
          // the error, it was counted above
          let hasDigit = 0;
          for (let rc of roomArray) {
            let rcell = rc.split(",");
            let ry = rcell[0];
            let rx = rcell[1];
            if (globalBoardValues[ry][rx] != '') {
              hasDigit = globalBoardValues[ry][rx];
            }
            if (playState.assistState == 2) {
              globalBoardColors[ry][rx] = errBlack ? incorrectBlackColor : incorrectWhiteColor;
            }
          }
          if (hasDigit==0) {
            playState.errorCount++;
          }
        }
        checkedCells.push.apply(checkedCells, roomArray);
      }
    }
  }

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
    puzzleBoardStates[lastMove[0]][lastMove[1]] = lastMove[2];
    updateBoardStatus();
    drawBoard();
  }
}

function updateDemoRegion(demoNum) {
  updateDemoFunction(demoNum,function () {
    puzzleBoardStates = initYXFromValue(constStateIndet);
    globalBoardColors = initYXFromValue(indetCellColor);
  }, function (steps) {
    let s0 = (steps[0] == 'W') ? constStateWhite : constStateBlack;
    addMove(s0,steps[1],steps[2]);
  });
}
