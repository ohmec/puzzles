const gameName = 'nurikabe';

const incorrectRiverColor = "#802020";  // dark reddish
const incorrectPoolColor = "#202080";   // dark bluish

let incompleteCount = 0;
let indeterminates = 0;
let curClickType = constClickUnknown;

const constStateWhite = 1;
const constStateBlack = 2;
const constStateIndet = 3;

// which keys are handled
let handledKeys = [ constKeyBackspace, constKeyCR, constKeyEsc,
  constKeySpace, constKeyLeft, constKeyUp, constKeyRight, constKeyDown,
  constKey0, constKey1, constKeyAlt0, constKeyAlt1 ];

let moveHistory, puzzleRoomList, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;
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
      etext = "there are errors and incomplete numbers";
    } else if (playState.errorCount) {
      etext = "there are errors";
    } else if (incompleteCount) {
      etext = "there are incomplete numbers";
    } else if (indeterminates) {
      etext = "there are indeterminate tiles";
    } else {
      etext = "there are no errors nor incomplete numbers";
    }
  } else {
    if (playState.errorCount || incompleteCount) {
      etext = "there are " + playState.errorCount + " errors and " +
                        incompleteCount + " incomplete numbers";
    } else if (indeterminates) {
      etext = "there are " + indeterminates + " indeterminate tiles";
    } else {
      etext = "there are no errors nor incomplete numbers";
    }
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
      case constKeyEsc:
        console.log(puzzleBoardStates);
        break;
      case constKeyUp:
      case constKeyDown:
      case constKeyLeft:
      case constKeyRight:
        moveGlobalCursor(keynum);
        break;
      case constKeySpace: // toggle through states
        if (globalBoardValues[globalCursorY][globalCursorX] == "") {
          if (puzzleBoardStates[globalCursorY][globalCursorX] == constStateIndet) {
            addMove(constStateBlack,globalCursorY,globalCursorX);
          } else if (puzzleBoardStates[globalCursorY][globalCursorX] == constStateBlack) {
            addMove(constStateWhite,globalCursorY,globalCursorX);
          } else {
            addMove(constStateIndet,globalCursorY,globalCursorX);
          }
        }
        break;
      case constKeyBackspace:
        if (globalBoardValues[globalCursorY][globalCursorX] == "") {
          addMove(constStateIndet,globalCursorY,globalCursorX);
        }
        break;
      case constKey0:
      case constKeyAlt0:
        if (globalBoardValues[globalCursorY][globalCursorX] == "") {
          addMove(constStateWhite,globalCursorY,globalCursorX);
        }
        break;
      case constKey1:
      case constKeyAlt1:
        if (globalBoardValues[globalCursorY][globalCursorX] == "") {
          addMove(constStateBlack,globalCursorY,globalCursorX);
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
  let hexParams = puzzleSplit[2];
  // reset to non-demo
  isDemo = false;

  basicInitStructures(size,indetCellColor,constWallStandard,constWallStandard,stdFontColor);

  globalBoardValues = initBoardValuesFromParams(numParams);
  puzzleBoardStates = initYXFromValue(constStateIndet);

  // override board states and colors for the initial digits, set to WHITE
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (globalBoardValues[y][x] != "") {
        puzzleBoardStates[y][x] = constStateWhite;
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
        puzzleBoardStates[y][x] = constStateBlack;
      } else if (numParamsExt[ptr] == '_') {
        puzzleBoardStates[y][x] = constStateWhite;
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
  // ignore if already the same state, or if a numbered tile which
  // can't be changed
  if (globalBoardValues[yCell][xCell] == "") {
    if ((curClickType == constClickLeft)   && puzzleBoardStates[yCell][xCell] != constStateBlack) {
      addMove(constStateBlack,yCell,xCell);
    }
    if ((curClickType == constClickMiddle) && puzzleBoardStates[yCell][xCell] != constStateIndet) {
      addMove(constStateIndet,yCell,xCell);
    }
    if ((curClickType == constClickRight)  && puzzleBoardStates[yCell][xCell] != constStateWhite) {
      addMove(constStateWhite,yCell,xCell);
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
  playState.errorCount = 0;

  // also count how many numbers and tiles haven't been completed yet
  incompleteCount = 0;
  indeterminates = 0;

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
          let roomArrayWhite =    travelRiver(puzzleBoardStates,y,x,true, constStateWhite);
          let roomArrayNonBlack = travelRiver(puzzleBoardStates,y,x,false,constStateBlack);
          if (roomArrayWhite.length != roomArrayNonBlack.length) {
            incompleteCount++;
          } else if (roomArrayWhite.length == cellValue) {
            // success
            if (playState.assistState == 2) {
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
                  playState.errorCount++;
                  if (playState.assistState == 2) {
                    globalBoardTextColors[y][x] = errorFontColor;
                  }
                }
              }
            }
          } else {
            // violates rule 1
            playState.errorCount++;
            if (playState.assistState == 2) {
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
      if ((puzzleBoardStates[y][x] != constStateWhite) &&
          (nonWhiteCells.indexOf(y+","+x) == -1)) {
        let visitedCells = travelRiver(puzzleBoardStates,y,x,false,constStateWhite);
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
          (puzzleBoardStates[y  ][x  ] == constStateBlack) &&
          (puzzleBoardStates[y+1][x  ] == constStateBlack) &&
          (puzzleBoardStates[y  ][x+1] == constStateBlack) &&
          (puzzleBoardStates[y+1][x+1] == constStateBlack)) {
      playState.errorCount++;
      globalBoardColors[y  ][x  ] = incorrectPoolColor;
      globalBoardColors[y+1][x  ] = incorrectPoolColor;
      globalBoardColors[y  ][x+1] = incorrectPoolColor;
      globalBoardColors[y+1][x+1] = incorrectPoolColor;
      }
    }
  }

  updateDynTextFields();
  if ((playState.errorCount == 0) && (incompleteCount == 0) && (indeterminates == 0)) {
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
    // start by reseting all non-number cells to indeterminate
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if (globalBoardValues[y][x] == "") {
          puzzleBoardStates[y][x] = constStateIndet;
        }
      }
    }
  }, function (steps) {
    let s0 = (steps[0] == 'W') ? constStateWhite : constStateBlack;
    addMove(s0,steps[1],steps[2]);
  });
}
