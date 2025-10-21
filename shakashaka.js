const offFontColor = "white";
const errorFontColor = "red";
const correctFontColor = "#a0ffa0";     // bright green
const completeRectColor = "#d8ffff";    // light teal
const gameName = 'shakashaka';

let clicking = false;
let ctrling = false;
let errorCount = 0;
let incompleteDigits = 0;
let assistState = 0;
let curClickType = CLICK_UNKNOWN;
let isDemo = false;

const CELL_WHITE =       0;
const CELL_DIAGONAL_NE = 1;
const CELL_DIAGONAL_SE = 2;
const CELL_DIAGONAL_SW = 3;
const CELL_DIAGONAL_NW = 4;
const CELL_DOT =         9;
const CELL_BLACK =       10;
const CELL_BLACK_0 =     20;
const CELL_BLACK_1 =     21;
const CELL_BLACK_2 =     22;
const CELL_BLACK_3 =     23;
const CELL_BLACK_4 =     24;

// which keys are handled; 1-4 added below
let handledKeys =
  [ KEY_BS, KEY_CR, KEY_ESC, KEY_SP, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_DOT ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;
  globalCircleRadius = 0.3; // slightly smaller circle for light bulbs
  initRibbons(gameName);

  // add digits to handled key list
  for (let key=KEY_0;key<=KEY_4;key++) {
    handledKeys.push(key);
  }
  for (let key=ALT_0;key<=ALT_4;key++) {
    handledKeys.push(key);
  }

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
    if (errorCount && incompleteDigits) {
      etext = "there are errors and incomplete digits";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteDigits) {
      etext = "there are incomplete rectangles";
    } else {
      etext = "the puzzle is complete!";
    }
  } else {
    if (errorCount || incompleteDigits) {
      etext = "there are " + errorCount  + " errors and " +
                        incompleteDigits + " incomplete digits";
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
  if (puzzleBoardStates[y][x] >= CELL_BLACK) {
    return;
  }
  if (!noHistory) {
    addHistory(y,x,puzzleBoardStates[y][x]);
  }
  puzzleBoardStates[y][x] = moveType;
  if ((moveType >= CELL_DIAGONAL_NE) && (moveType != CELL_DOT)) {
    globalCircleStates[y][x] = CIRCLE_TRI_NE + moveType - CELL_DIAGONAL_NE;
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
        console.log(globalCircleStates);
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
      case KEY_SP: // toggle through white -> NE -> SE -> SW -> NW -> white
        if ((puzzleBoardStates[globalCursorY][globalCursorX] == CELL_WHITE) ||
            (puzzleBoardStates[globalCursorY][globalCursorX] == CELL_DOT)) {
          addMove(CELL_DIAGONAL_NE,globalCursorY,globalCursorX);
        } else if (puzzleBoardStates[globalCursorY][globalCursorX] == CELL_DIAGONAL_NW) {
          addMove(CELL_WHITE,globalCursorY,globalCursorX);
        } else {
          addMove(puzzleBoardStates[globalCursorY][globalCursorX]+1,globalCursorY,globalCursorX);
        }
        break;
      case KEY_0:
      case ALT_0:
      case KEY_BS:
        addMove(CELL_WHITE,globalCursorY,globalCursorX);
        break;
      case KEY_1:
      case ALT_1:
        addMove(CELL_DIAGONAL_NE,globalCursorY,globalCursorX);
        break;
      case KEY_2:
      case ALT_2:
        addMove(CELL_DIAGONAL_SE,globalCursorY,globalCursorX);
        break;
      case KEY_3:
      case ALT_3:
        addMove(CELL_DIAGONAL_SW,globalCursorY,globalCursorX);
        break;
      case KEY_4:
      case ALT_4:
        addMove(CELL_DIAGONAL_NW,globalCursorY,globalCursorX);
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
  // reset to non-demo
  isDemo = false;

  basicInitStructures(size,"white",constWallLight,constWallBorder,offFontColor);
  puzzleBoardStates = initYXFromValue(CELL_WHITE);

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
        puzzleBoardStates[y][x] = CELL_BLACK;
        globalBoardColors[y][x] = "black";
      } else if (numParamsExt[ptr].search(/[01234]/) != -1) {
        puzzleBoardStates[y][x] = CELL_BLACK_0 + parseInt(numParamsExt[ptr]);
        globalBoardValues[y][x] = parseInt(numParamsExt[ptr]);
        globalBoardColors[y][x] = "black";
      } else if (numParamsExt[ptr].search(/[ABCD]/) != -1) {
        globalBoardValues[y][x] = "";
        globalBoardColors[y][x] = "white";
        puzzleBoardStates[y][x] = CELL_DIAGONAL_NE + parseInt(numParamsExt[ptr],16) - 10;
        globalCircleStates[y][x] = CIRCLE_TRI_NE + parseInt(numParamsExt[ptr],16) - 10;
        globalCircleColors[y][x] = "black";
      } else if (numParamsExt[ptr] != '-') {
        throw "ERROR: what is this in descriptor: " + numParamsExt[ptr];
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

  // left toggles between triangle shapes
  if (curClickType == CLICK_LEFT) {
    if (puzzleBoardStates[globalCursorY][globalCursorX] == CELL_WHITE) {
      addMove(CELL_DIAGONAL_NE,globalCursorY,globalCursorX);
    } else if (puzzleBoardStates[globalCursorY][globalCursorX] == CELL_DOT) {
      addMove(CELL_DIAGONAL_NE,globalCursorY,globalCursorX);
    } else if (puzzleBoardStates[globalCursorY][globalCursorX] == CELL_DIAGONAL_NW) {
      addMove(CELL_WHITE,globalCursorY,globalCursorX);
    } else {
      addMove(puzzleBoardStates[globalCursorY][globalCursorX]+1,globalCursorY,globalCursorX);
    }
  }
  // right toggles between dot and no dot
  if (curClickType == CLICK_RIGHT) {
    if (puzzleBoardStates[globalCursorY][globalCursorX] == CELL_DOT) {
      addMove(CELL_WHITE,globalCursorY,globalCursorX);
    } else {
      addMove(CELL_DOT,globalCursorY,globalCursorX);
    }
  }
  updateBoardStatus();
  drawBoard();
}

// return true if the north way is open
function nOpen (y,x) {
  let pbs = puzzleBoardStates[y][x];
  switch (pbs) {
    case CELL_WHITE:
    case CELL_DOT:
    case CELL_DIAGONAL_SW:
    case CELL_DIAGONAL_SE:
      return true;
    }
  return false;
}

// return true if the south way is open
function sOpen (y,x) {
  let pbs = puzzleBoardStates[y][x];
  switch (pbs) {
    case CELL_WHITE:
    case CELL_DOT:
    case CELL_DIAGONAL_NW:
    case CELL_DIAGONAL_NE:
      return true;
    }
  return false;
}

// return true if the east way is open
function eOpen (y,x) {
  let pbs = puzzleBoardStates[y][x];
  switch (pbs) {
    case CELL_WHITE:
    case CELL_DOT:
    case CELL_DIAGONAL_NW:
    case CELL_DIAGONAL_SW:
      return true;
    }
  return false;
}

// return true if the west way is open
function wOpen (y,x) {
  let pbs = puzzleBoardStates[y][x];
  switch (pbs) {
    case CELL_WHITE:
    case CELL_DOT:
    case CELL_DIAGONAL_NE:
    case CELL_DIAGONAL_SE:
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
  errorCount = 0;

  // also count how many cells haven't been illuminated yet
  // and how many digits are incomplete
  incompleteDigits = 0;

  // start by reseting all cell and font colors to "standard"
  // before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalBoardTextColors[y][x] = offFontColor;
      if (puzzleBoardStates[y][x] < CELL_BLACK) {
        globalBoardColors[y][x] = "white";
      }
    }
  }

  // go through all of the cells with digits. count the number
  // of diagonals adjacent. if greater than the number, they are
  // in error, else just indeterminate
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] > CELL_BLACK) {
        let cellValue = globalBoardValues[y][x];
        let diagCount = 0;
        if ((y<(globalPuzzleH-1)) &&
            (puzzleBoardStates[y+1][x] >= CELL_DIAGONAL_NE) &&
            (puzzleBoardStates[y+1][x] <= CELL_DIAGONAL_NW)) {
          diagCount++;
        }
        if ((y>0)                 &&
            (puzzleBoardStates[y-1][x] >= CELL_DIAGONAL_NE) &&
            (puzzleBoardStates[y-1][x] <= CELL_DIAGONAL_NW)) {
          diagCount++;
        }
        if ((x<(globalPuzzleW-1)) &&
            (puzzleBoardStates[y][x+1] >= CELL_DIAGONAL_NE) &&
            (puzzleBoardStates[y][x+1] <= CELL_DIAGONAL_NW)) {
          diagCount++;
        }
        if ((x>0)                 &&
            (puzzleBoardStates[y][x-1] >= CELL_DIAGONAL_NE) &&
            (puzzleBoardStates[y][x-1] <= CELL_DIAGONAL_NW)) {
          diagCount++;
        }
        if (diagCount==cellValue) {
          if (assistState==2) {
            globalBoardTextColors[y][x] = correctFontColor;
          }
        } else if (diagCount>cellValue) {
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
      if ((puzzleBoardStates[y][x] < CELL_BLACK) &&
          (traveledCells.indexOf(y+","+x) == -1)) {
        let legal;
        let shapeCells = shapeSearch(y,x);
        let shapeMinY, shapeMaxY, shapeMinX, shapeMaxX;
        [shapeMinY, shapeMinX, shapeMaxY, shapeMaxX] = getShapeExtremes(shapeCells);
        if ((puzzleBoardStates[y][x] == CELL_WHITE) || (puzzleBoardStates[y][x] == CELL_DOT)) {
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
              if ((puzzleBoardStates[cy][cx] != CELL_WHITE) &&
                  (puzzleBoardStates[cy][cx] != CELL_DOT)) {
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
              if (puzzleBoardStates[cy][cx] != CELL_DIAGONAL_NE) {
                legal = false;
                break;
              }
              tested = true;
            }
            if (!nExists && !wExists) {
              if (puzzleBoardStates[cy][cx] != CELL_DIAGONAL_NW) {
                legal = false;
                break;
              }
              tested = true;
            }
            if (!sExists && !eExists) {
              if (puzzleBoardStates[cy][cx] != CELL_DIAGONAL_SE) {
                legal = false;
                break;
              }
              tested = true;
            }
            if (!sExists && !wExists) {
              if (puzzleBoardStates[cy][cx] != CELL_DIAGONAL_SW) {
                legal = false;
                break;
              }
              tested = true;
            }
            if (nExists && sExists && wExists && eExists) {
              if ((puzzleBoardStates[cy][cx] != CELL_WHITE) &&
                  (puzzleBoardStates[cy][cx] != CELL_DOT)) {
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
          if (assistState == 2) {
            for (let c of shapeCells) {
              let cyx = c.split(",");
              let cy = parseInt(cyx[0]);
              let cx = parseInt(cyx[1]);
              globalBoardColors[cy][cx] = completeRectColor;
            }
          }
        } else {
          errorCount++;
        }
      }
    }
  }

  updateDynTextFields();
  if ((errorCount==0) && (incompleteDigits==0)) {
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

function resetBoard() {
  $("#resetButton").blur();
  $("#clearButton").blur();
  $("#assistButton").blur();
  initStructures(puzzle);
}

function updateDemoRegion(demoNum) {
  updateDemoFunction(demoNum,function () {
    // start by reseting all non-black cells to cleared
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if (puzzleBoardStates[y][x] < CELL_BLACK) {
          puzzleBoardStates[y][x] = CELL_WHITE;
          globalCircleStates[y][x] = CIRCLE_NONE;
          globalLineStates[y][x] = PATH_NONE;
        }
      }
    }
  }, function (steps) {
    let s0 = (steps[0] == '.') ? CELL_DOT : (CELL_DIAGONAL_NE + parseInt(steps[0]) - 1);
    addMove(s0,parseInt(steps[1],36),parseInt(steps[2],36));
  });
}
