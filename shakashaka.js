const gameName = 'shakashaka';

const completeRectColor = "#d8ffff";      // light teal

let incompleteDigits = 0;
let curClickType = constClickUnknown;

const constCellWhite =      0;
const constCellDiagonalNE = 1;
const constCellDiagonalSE = 2;
const constCellDiagonalSW = 3;
const constCellDiagonalNW = 4;
const constCellDot =        9;
const constCellBlack =      10;
const constCellBlack0 =     20;
const constCellBlack1 =     21;
const constCellBlack2 =     22;
const constCellBlack3 =     23;
const constCellBlack4 =     24;

// which keys are handled; 1-4 added below
let handledKeys = [ constKeyBackspace, constKeyCR, constKeyEsc,
  constKeySpace, constKeyLeft, constKeyUp, constKeyRight, constKeyDown,
  constKeyDot ];

let moveHistory, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;
  globalCircleRadius = 0.3; // slightly smaller circle for light bulbs

  // add digits to handled key list
  for (let key=constKey0;key<=constKey4;key++) {
    handledKeys.push(key);
  }
  for (let key=constKeyAlt0;key<=constKeyAlt4;key++) {
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
    if (playState.errorCount && incompleteDigits) {
      etext = "there are errors and incomplete digits";
    } else if (playState.errorCount) {
      etext = "there are errors";
    } else if (incompleteDigits) {
      etext = "there are incomplete rectangles";
    } else {
      etext = "the puzzle is complete!";
    }
  } else {
    if (playState.errorCount || incompleteDigits) {
      etext = "there are " + playState.errorCount  + " errors and " +
                        incompleteDigits + " incomplete digits";
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
  if (puzzleBoardStates[y][x] >= constCellBlack) {
    return;
  }
  if (!noHistory) {
    addHistory(y,x,puzzleBoardStates[y][x]);
  }
  puzzleBoardStates[y][x] = moveType;
  if ((moveType >= constCellDiagonalNE) && (moveType != constCellDot)) {
    globalCircleStates[y][x] = constCircleTriNE + moveType - constCellDiagonalNE;
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
        console.log(globalCircleStates);
        break;
      case constKeyUp:
      case constKeyDown:
      case constKeyLeft:
      case constKeyRight:
        moveGlobalCursor(keynum);
        break;
      case constKeySpace: // toggle through white -> NE -> SE -> SW -> NW -> white
        if ((puzzleBoardStates[globalCursorY][globalCursorX] == constCellWhite) ||
            (puzzleBoardStates[globalCursorY][globalCursorX] == constCellDot)) {
          addMove(constCellDiagonalNE,globalCursorY,globalCursorX);
        } else if (puzzleBoardStates[globalCursorY][globalCursorX] == constCellDiagonalNW) {
          addMove(constCellWhite,globalCursorY,globalCursorX);
        } else {
          addMove(puzzleBoardStates[globalCursorY][globalCursorX]+1,globalCursorY,globalCursorX);
        }
        break;
      case constKey0:
      case constKeyAlt0:
      case constKeyBackspace:
        addMove(constCellWhite,globalCursorY,globalCursorX);
        break;
      case constKey1:
      case constKeyAlt1:
        addMove(constCellDiagonalNE,globalCursorY,globalCursorX);
        break;
      case constKey2:
      case constKeyAlt2:
        addMove(constCellDiagonalSE,globalCursorY,globalCursorX);
        break;
      case constKey3:
      case constKeyAlt3:
        addMove(constCellDiagonalSW,globalCursorY,globalCursorX);
        break;
      case constKey4:
      case constKeyAlt4:
        addMove(constCellDiagonalNW,globalCursorY,globalCursorX);
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
  puzzleBoardStates = initYXFromValue(constCellWhite);

  // add triangles if numParams includes solution, and
  // use num params to set board state
  let numParamsExt = expandNumParams(numParams).split("");
  if (numParamsExt.length != (globalPuzzleH*globalPuzzleW)) {
    throw "ERROR in puzzle descriptor nums, got length " + numParamsExt.length +
          " expected " + (globalPuzzleH*globalPuzzleW);
  }
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let ptr = y*globalPuzzleW+x;
      let param = numParams[ptr];
      if (numParamsExt[ptr] == '*') {
        puzzleBoardStates[y][x] = constCellBlack;
        globalBoardColors[y][x] = "black";
      } else if (numParamsExt[ptr].search(/[01234]/) != -1) {
        puzzleBoardStates[y][x] = constCellBlack0 + parseInt(numParamsExt[ptr]);
        globalBoardValues[y][x] = parseInt(numParamsExt[ptr]);
        globalBoardColors[y][x] = "black";
      } else if (numParamsExt[ptr].search(/[ABCD]/) != -1) {
        globalBoardValues[y][x] = "";
        globalBoardColors[y][x] = "white";
        puzzleBoardStates[y][x] = constCellDiagonalNE + parseInt(numParamsExt[ptr],16) - 10;
        globalCircleStates[y][x] = constCircleTriNE + parseInt(numParamsExt[ptr],16) - 10;
        globalCircleColors[y][x] = "black";
      } else if (numParamsExt[ptr] != '-') {
        throw "ERROR: what is this in descriptor: " + numParamsExt[ptr];
      }
    }
  }

  updateBoardStatus();
  drawBoard();
}

function handleClick(evnt) {
  // don't allow dragging
  if (playState.dragging) return;

  curClickType = clickType(evnt);

  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  globalCursorY = yCell;
  globalCursorX = xCell;

  // left toggles between triangle shapes
  if (curClickType == constClickLeft) {
    if (puzzleBoardStates[globalCursorY][globalCursorX] == constCellWhite) {
      addMove(constCellDiagonalNE,globalCursorY,globalCursorX);
    } else if (puzzleBoardStates[globalCursorY][globalCursorX] == constCellDot) {
      addMove(constCellDiagonalNE,globalCursorY,globalCursorX);
    } else if (puzzleBoardStates[globalCursorY][globalCursorX] == constCellDiagonalNW) {
      addMove(constCellWhite,globalCursorY,globalCursorX);
    } else {
      addMove(puzzleBoardStates[globalCursorY][globalCursorX]+1,globalCursorY,globalCursorX);
    }
  }
  // right toggles between dot and no dot
  if (curClickType == constClickRight) {
    if (puzzleBoardStates[globalCursorY][globalCursorX] == constCellDot) {
      addMove(constCellWhite,globalCursorY,globalCursorX);
    } else {
      addMove(constCellDot,globalCursorY,globalCursorX);
    }
  }
  updateBoardStatus();
  drawBoard();
}

// return true if the north way is open
function nOpen (y,x) {
  let pbs = puzzleBoardStates[y][x];
  switch (pbs) {
    case constCellWhite:
    case constCellDot:
    case constCellDiagonalSW:
    case constCellDiagonalSE:
      return true;
    }
  return false;
}

// return true if the south way is open
function sOpen (y,x) {
  let pbs = puzzleBoardStates[y][x];
  switch (pbs) {
    case constCellWhite:
    case constCellDot:
    case constCellDiagonalNW:
    case constCellDiagonalNE:
      return true;
    }
  return false;
}

// return true if the east way is open
function eOpen (y,x) {
  let pbs = puzzleBoardStates[y][x];
  switch (pbs) {
    case constCellWhite:
    case constCellDot:
    case constCellDiagonalNW:
    case constCellDiagonalSW:
      return true;
    }
  return false;
}

// return true if the west way is open
function wOpen (y,x) {
  let pbs = puzzleBoardStates[y][x];
  switch (pbs) {
    case constCellWhite:
    case constCellDot:
    case constCellDiagonalNE:
    case constCellDiagonalSE:
      return true;
    }
  return false;
}

function getShapeExtremes (cellArray) {
  let maxy = 0;
  let maxx = 0;
  let miny = 999;
  let minx = 999;
  for (let c of cellArray) {
    let cyx = c.split(",");
    let cy = parseInt(cyx[0]);
    let cx = parseInt(cyx[1]);
    if (cy<miny) miny = cyx[0];
    if (cx<minx) minx = cyx[1];
    if (cy>maxy) maxy = cyx[0];
    if (cx>maxx) maxx = cyx[1];
  }
  return [miny,minx,maxy,maxx];
}

// perform a search to see if the grab all non-blocked
// (with black cell or diagonal cells) squares.
// just return all of the cells found until reaching
// the edges determined by black cells, puzzle edges,
// or diagonal walls. the success or failure will be
// determined by the calling routine and is a function
// of a diagonal rectangle or a non-diagonal rectangle
function shapeSearch(y,x) {
  let searchCells = new Array();
  let tryindex = 0;
  searchCells.push(y+","+x);
  while (searchCells.length > tryindex) {
    let curCell = searchCells[tryindex].split(",");
    let iy = parseInt(curCell[0]);
    let ix = parseInt(curCell[1]);
    // check to the direction if not blocked by own diagonal,
    // or to neighbor in that direction.
    if (sOpen(iy,ix) && (iy != (globalPuzzleH-1)) &&
        (searchCells.indexOf((iy+1)+","+ix) == -1) &&
        nOpen(iy+1,ix)) {
      searchCells.push((iy+1)+","+ix);
    }
    if (nOpen(iy,ix) && (iy != 0) &&
        (searchCells.indexOf((iy-1)+","+ix) == -1) &&
        sOpen(iy-1,ix)) {
      searchCells.push((iy-1)+","+ix);
    }
    if (eOpen(iy,ix) && (ix != (globalPuzzleW-1)) &&
        (searchCells.indexOf(iy+","+(ix+1)) == -1) &&
        wOpen(iy,ix+1)) {
      searchCells.push(iy+","+(ix+1));
    }
    if (wOpen(iy,ix) && (ix != 0) &&
        (searchCells.indexOf(iy+","+(ix-1)) == -1) &&
        eOpen(iy,ix-1)) {
      searchCells.push(iy+","+(ix-1));
    }
    tryindex++;
  }
  return searchCells;
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) number cells with more bulbs than accounted for
  //  2) two bulbs facing each other
  playState.errorCount = 0;

  // also count how many cells haven't been illuminated yet
  // and how many digits are incomplete
  incompleteDigits = 0;

  // start by reseting all cell and font colors to "standard"
  // before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalBoardTextColors[y][x] = offFontColor;
      if (puzzleBoardStates[y][x] < constCellBlack) {
        globalBoardColors[y][x] = "white";
      }
    }
  }

  // go through all of the cells with digits. count the number
  // of diagonals adjacent. if greater than the number, they are
  // in error, else just indeterminate
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] > constCellBlack) {
        let cellValue = globalBoardValues[y][x];
        let diagCount = 0;
        if ((y<(globalPuzzleH-1)) &&
            (puzzleBoardStates[y+1][x] >= constCellDiagonalNE) &&
            (puzzleBoardStates[y+1][x] <= constCellDiagonalNW)) {
          diagCount++;
        }
        if ((y>0)                 &&
            (puzzleBoardStates[y-1][x] >= constCellDiagonalNE) &&
            (puzzleBoardStates[y-1][x] <= constCellDiagonalNW)) {
          diagCount++;
        }
        if ((x<(globalPuzzleW-1)) &&
            (puzzleBoardStates[y][x+1] >= constCellDiagonalNE) &&
            (puzzleBoardStates[y][x+1] <= constCellDiagonalNW)) {
          diagCount++;
        }
        if ((x>0)                 &&
            (puzzleBoardStates[y][x-1] >= constCellDiagonalNE) &&
            (puzzleBoardStates[y][x-1] <= constCellDiagonalNW)) {
          diagCount++;
        }
        if (diagCount==cellValue) {
          if (playState.assistState==2) {
            globalBoardTextColors[y][x] = correctFontColorBr;
          }
        } else if (diagCount>cellValue) {
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

  // now go through each non-black cell and search for rectangles.
  // since most of the search will be early in the solve, it is
  // not worth coloring them differently. Only color correct ones
  // and count incorrect ones.

  // there are two search types: cell-based rectangles (that is,
  // no diagonals involved) and diagonal-based rectangles. this
  // is the same fundamental search, but a different analysis
  // afterwards. we'll never start in the middle (white cell) of
  // a legal diagonal rectangle, so if we start in a fully white
  // cell, we should analyze the result for all white cells of
  // size W x H. i.e. if any diagonals are found, or if the full
  // size is greater than the determined width and height, it is
  // a fail. the diagonal search algorithm is tougher. first
  // calculate the extremes in Y and X, then walk the diagonal
  // for each and expect the correct diagonal on each, and all
  // white (dot OK) in the middle.

  let traveledCells = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((puzzleBoardStates[y][x] < constCellBlack) &&
          (traveledCells.indexOf(y+","+x) == -1)) {
        let legal;
        let shapeCells = shapeSearch(y,x);
        let shapeMinY, shapeMaxY, shapeMinX, shapeMaxX;
        [shapeMinY, shapeMinX, shapeMaxY, shapeMaxX] = getShapeExtremes(shapeCells);
        if ((puzzleBoardStates[y][x] == constCellWhite) || (puzzleBoardStates[y][x] == constCellDot)) {
          // the algorithm here is easy: if number of cells equals the
          // W*H product, and all are pure white, then good.
          let shapeW = shapeMaxX-shapeMinX+1;
          let shapeH = shapeMaxY-shapeMinY+1;
          // set to illegal off that bat if not of right area
          legal = (shapeW*shapeH)==shapeCells.length;
          // if still legal, make sure all are pure white
          if (legal) {
            for (let c of shapeCells) {
              let cyx = c.split(",");
              let cy = parseInt(cyx[0]);
              let cx = parseInt(cyx[1]);
              if ((puzzleBoardStates[cy][cx] != constCellWhite) &&
                  (puzzleBoardStates[cy][cx] != constCellDot)) {
                legal = false;
                break;
              }
            }
          }
        } else {
          // the algorithm here is tougher, but not too bad.
          // trust the shape gatherer. walk through each cell
          // in the returned shape. if there is no cell in the
          // shape to the N and E, for instance, then the shape
          // should be of type diagonalNE. same for each of the
          // four diagonal directions. if there is another cell
          // in all four directions, then it should be white.
          legal = true;
          for (let c of shapeCells) {
            let cyx = c.split(",");
            let cy = parseInt(cyx[0]);
            let cx = parseInt(cyx[1]);
            let nExists = (shapeCells.indexOf((cy-1)+","+ cx   )!=-1);
            let sExists = (shapeCells.indexOf((cy+1)+","+ cx   )!=-1);
            let eExists = (shapeCells.indexOf( cy   +","+(cx+1))!=-1);
            let wExists = (shapeCells.indexOf( cy   +","+(cx-1))!=-1);
            let tested = false;
            if (!nExists && !eExists) {
              if (puzzleBoardStates[cy][cx] != constCellDiagonalNE) {
                legal = false;
                break;
              }
              tested = true;
            }
            if (!nExists && !wExists) {
              if (puzzleBoardStates[cy][cx] != constCellDiagonalNW) {
                legal = false;
                break;
              }
              tested = true;
            }
            if (!sExists && !eExists) {
              if (puzzleBoardStates[cy][cx] != constCellDiagonalSE) {
                legal = false;
                break;
              }
              tested = true;
            }
            if (!sExists && !wExists) {
              if (puzzleBoardStates[cy][cx] != constCellDiagonalSW) {
                legal = false;
                break;
              }
              tested = true;
            }
            if (nExists && sExists && wExists && eExists) {
              if ((puzzleBoardStates[cy][cx] != constCellWhite) &&
                  (puzzleBoardStates[cy][cx] != constCellDot)) {
                legal = false;
                break;
              }
              tested = true;
            }
            // if it was never tested, it is an off case,
            // since all diagonal rectangle cells should either
            // have all four neighbors, or are on a diagonal edge
            // where they have just two.
            if (!tested) {
              legal = false;
            }
          }
        }
        traveledCells.push.apply(traveledCells, shapeCells);
        if (legal) {
          if (playState.assistState == 2) {
            for (let c of shapeCells) {
              let cyx = c.split(",");
              let cy = parseInt(cyx[0]);
              let cx = parseInt(cyx[1]);
              globalBoardColors[cy][cx] = completeRectColor;
            }
          }
        } else {
          playState.errorCount++;
        }
      }
    }
  }

  updateDynTextFields();
  if ((playState.errorCount==0) && (incompleteDigits==0)) {
    canvasSuccess(isDemo,gameName,puzzleChoice);
  } else {
    canvasIncomplete();
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    addMove(lastMove[2],lastMove[0],lastMove[1],true);
    updateBoardStatus();
    drawBoard();
  }
}

function updateDemoRegion(demoNum) {
  updateDemoFunction(demoNum,function () {
    // start by reseting all non-black cells to cleared
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if (puzzleBoardStates[y][x] < constCellBlack) {
          puzzleBoardStates[y][x] = constCellWhite;
          globalCircleStates[y][x] = constCircleNone;
          globalLineStates[y][x] = constPathNone;
        }
      }
    }
  }, function (steps) {
    let s0 = (steps[0] == '.') ? constCellDot : (constCellDiagonalNE + parseInt(steps[0]) - 1);
    addMove(s0,parseInt(steps[1],36),parseInt(steps[2],36));
  });
}
