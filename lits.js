const gameName = 'lits';

const incorrectShapeColor = "#f0f020";  // yellowish
const duplicateShapeColor = "#f08020";  // orangeish
const incorrectCellColor = "#e04040";   // reddish

const constStateWhite = 1;
const constStateBlack = 2;
const constStateIndet = 3;

const constShapeNone = 0;
const constShapeL = 1;
const constShapeI = 2;
const constShapeT = 3;
const constShapeS = 4;

const canonicalL = canonicalizeShape([[0,0],[0,1],[0,2],[1,2]]);
const canonicalI = canonicalizeShape([[0,0],[0,1],[0,2],[0,3]]);
const canonicalT = canonicalizeShape([[0,0],[0,1],[1,1],[0,2]]);
const canonicalS = canonicalizeShape([[0,0],[0,1],[1,1],[1,2]]);

// four different shades of green
const colorL = "#90f090";
const colorI = "#40e040";
const colorT = "#008000";
const colorS = "#105010";

let incompleteCount = 0;
let brokenRiver = true;

// which keys are handled
let handledKeys = [ constKeyBackspace, constKeyCR, constKeySpace,
  constKeyEsc, constKeyLeft, constKeyUp, constKeyRight, constKeyDown,
  constKey0, constKey1, constKeyAlt0, constKeyAlt1 ];

let moveHistory, puzzleBoardStates, puzzleRoomList, puzzleRoomShapes, puzzleCellRooms;

function shiftFunc() {
  playState.shiftState = puzzleBoardStates[globalCursorY][globalCursorX];
}

function puzzleInit() {
  globalCursorOn = true;
  initElements();
  initRibbons(gameName);
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
    if (playState.errorCount && incompleteCount && brokenRiver) {
      etext = "there are errors and incomplete rooms, and a broken river of dark cells";
    } else if (playState.errorCount && incompleteCount) {
      etext = "there are errors and incomplete rooms";
    } else if (playState.errorCount && brokenRiver) {
      etext = "there are errors and a broken river of dark cells";
    } else if (playState.errorCount) {
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
    etext = "there are " + playState.errorCount + " errors and " +
                      incompleteCount + " incomplete rooms";
    if (brokenRiver) {
      etext += " and a broken river of dark cells";
    }
  }
  updateDynamicHtmlEntries(etext,playState.assistState);
}

function addHistory(y,x,prevvalue) {
  moveHistory.push([y,x,prevvalue]);
}

function addMove(moveType,y,x) {
  addHistory(y,x,puzzleBoardStates[y][x]);
  puzzleBoardStates[y][x] = moveType;
  // colors will be overridden based upon error status
  globalBoardColors[y][x] =
    (moveType == constStateWhite) ? emptyCellColor    :
    (moveType == constStateBlack) ? fillCellColorBlue :
                                    indetCellColor;
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
        console.log(puzzleRoomList);
        console.log(puzzleRoomShapes);
        console.log(puzzleCellRooms);
        break;
      case constKeyUp:
        if (globalCursorY) {
          globalCursorY--;
          if (playState.shifting) {
            addMove(playState.shiftState,globalCursorY,globalCursorX);
          }
        }
        break;
      case constKeyDown:
        if (globalCursorY < (globalPuzzleH-1)) {
          globalCursorY++;
          if (playState.shifting) {
            addMove(playState.shiftState,globalCursorY,globalCursorX);
          }
        }
        break;
      case constKeyLeft:
        if (globalCursorX) {
          globalCursorX--;
          if (playState.shifting) {
            addMove(playState.shiftState,globalCursorY,globalCursorX);
          }
        }
        break;
      case constKeyRight:
        if (globalCursorX < (globalPuzzleW-1)) {
          globalCursorX++;
          if (playState.shifting) {
            addMove(playState.shiftState,globalCursorY,globalCursorX);
          }
        }
        break;
      case constKeySpace: // toggle through states like the click
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
  let rwallParams = puzzleSplit[1];
  let cwallParams = puzzleSplit[2];
  let hexParams = puzzleSplit[3];
  // reset to non-demo
  isDemo = false;

  basicInitStructures(size,indetCellColor,constWallLight,constWallBorder,stdFontColor);

  // initialize the wall states based upon the given parameters
  globalWallStates = initWallStatesFromHexes(rwallParams, cwallParams, constWallBorder, constWallLight);
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
        globalBoardColors[y][x] = stateTrue ? fillCellColorBlue : emptyCellColor;
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
  playState.errorCount = 0;
  incompleteCount = 0;

  // start by reseting all cell colors to "standard" before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] == constStateBlack) {
        globalBoardColors[y][x] = fillCellColorBlue;
      } else if (puzzleBoardStates[y][x] == constStateWhite) {
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
    puzzleRoomShapes[r] = constShapeNone;
    for (let cell of roomInfo) {
      let cinfo = cell.split(",");
      let y = parseInt(cinfo[0]);
      let x = parseInt(cinfo[1]);
      if (puzzleBoardStates[y][x] == constStateBlack) {
        bcount++;
        blackCells.push([y,x]);
      } else if (puzzleBoardStates[y][x] == constStateIndet) {
        isIncomplete = 1;
      }
    }
    if (bcount > 4) {
      playState.errorCount++;
      if (playState.assistState==2) {
        colorShape(blackCells,incorrectShapeColor);
      }
    } else if (bcount==4) {
      let canonicalRoomBlack = canonicalizeShape(blackCells);
      let isL = compareRooms(canonicalRoomBlack,canonicalL);
      let isI = compareRooms(canonicalRoomBlack,canonicalI);
      let isT = compareRooms(canonicalRoomBlack,canonicalT);
      let isS = compareRooms(canonicalRoomBlack,canonicalS);
      if (isL) {
        if (playState.assistState==2) {
          colorShape(blackCells,colorL);
        }
        puzzleRoomShapes[r] = constShapeL;
      } else if (isI) {
        if (playState.assistState==2) {
          colorShape(blackCells,colorI);
        }
        puzzleRoomShapes[r] = constShapeI;
      } else if (isT) {
        if (playState.assistState==2) {
          colorShape(blackCells,colorT);
        }
        puzzleRoomShapes[r] = constShapeT;
      } else if (isS) {
        if (playState.assistState==2) {
          colorShape(blackCells,colorS);
        }
        puzzleRoomShapes[r] = constShapeS;
      } else {
        playState.errorCount++;
        if (playState.assistState==2) {
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
      if ((puzzleBoardStates[y  ][x  ] == constStateBlack) &&
          (puzzleBoardStates[y+1][x  ] == constStateBlack) &&
          (puzzleBoardStates[y  ][x+1] == constStateBlack) &&
          (puzzleBoardStates[y+1][x+1] == constStateBlack)) {
        playState.errorCount++;
        if (playState.assistState == 2) {
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
    if (ourShape != constShapeNone) {
      let roomInfo = puzzleRoomList[r];
      for (let cell of roomInfo) {
        let cinfo = cell.split(",");
        let y = parseInt(cinfo[0]);
        let x = parseInt(cinfo[1]);
        // now go to the neighbor of each black cell in this
        // shape and check to see if any of its neighbors
        // are a) also black, b) in a different room, and c) that room
        // is of the same shape
        if (puzzleBoardStates[y][x] == constStateBlack) {
          for (let neighbor=0;neighbor<4;neighbor++) {
            let yi = (neighbor==0) ? y-1 : (neighbor==1) ? y+1 : y;
            let xi = (neighbor==2) ? x-1 : (neighbor==3) ? x+1 : x;
            if (yi>=0 && xi >=0 && yi<globalPuzzleH && xi<globalPuzzleW) {
              let oppRoom = puzzleCellRooms[yi][xi];
              let oppShape = puzzleRoomShapes[oppRoom];
              if ((puzzleBoardStates[yi][xi] == constStateBlack) && (oppRoom != r) && (ourShape == oppShape)) {
                playState.errorCount++;
                if (playState.assistState==2) {
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
      if ((puzzleBoardStates[y][x] != constStateWhite) &&
          (unfilledCells.indexOf(y+","+x) == -1)) {
        let visitedCells = travelRiver(puzzleBoardStates,y,x,false,constStateWhite);
        unfilledCells.push.apply(unfilledCells, visitedCells);
        riverCount++;
      }
    }
  }

  brokenRiver = riverCount > 1;

  updateDynTextFields();
  if ((playState.errorCount == 0) && (incompleteCount == 0) && !brokenRiver) {
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
