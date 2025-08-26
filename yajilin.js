const emptyCellColor = "white";         // not-filled
const digitCellColor = "#e0e0e0";       // gray cell color for digits
const fillCellColor  = "#000040";       // filled, slightly dark blue to contrast with black walls
const errorCellColor = "#802020";       // dark reddish

const stdFontColor = "black";
const offFontColor = "white";
const errorFontColor = "red";
const correctFontColor = "green";

let clicking = false;
let dragging = false;
let shifting = false;
let errorCount = 0;
let incompleteDigits = 0;
let incompleteCells = 0;
let incompleteLoop = true;
let assistState = 0;
let curClickType = CLICK_UNKNOWN;
let debugMode = false;

const CELL_WHITE = 1;
const CELL_BLACK = 2;
const CELL_FIXED = 3;

// which keys are handled
let handledKeys =
  [ KEY_BS, KEY_CR, KEY_ESC, KEY_SP, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_DOT,
    KEY_1, ALT_1, KEY_0, ALT_0, KEY_DASH, KEY_VERT, KEY_L, KEY_I, KEY_J, KEY_7, KEY_F ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;

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
    if (evnt.which == KEY_SHIFT) {
      shifting = true;
    } else if (handledKeys.find(element => element == evnt.which)) {
      handleKey(evnt.which);
    }
  });

  $(document).keyup(function(evnt) {
    if (evnt.which == KEY_SHIFT) {
      shifting = false;
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

  // moving mouse within puzzle area (clicking is true if already moused down => dragging)
  $("#puzzleCanvas").mousemove(function(evnt) {
    if (clicking == false) return;
    evnt.preventDefault();
    dragging = true;
    handleClick(evnt);
  });

  // releasing mouse within puzzle or not within puzzle
  $(document).mouseup(function() {
    clicking = false;
    dragging = false;
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
    if (errorCount && incompleteDigits && incompleteCells) {
      etext = "there are errors and incomplete numbers and white cells that don't have a path";
    } else if (incompleteDigits && incompleteCells) {
      etext = "there are incomplete numbers and white cells that don't have a path";
    } else if (errorCount && incompleteDigits) {
      etext = "there are errors and incomplete numbers";
    } else if (errorCount && incompleteCells) {
      etext = "there are errors and white cells that don't have a path";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteDigits) {
      etext = "there are incomplete numbers";
    } else if (incompleteCells) {
      etext = "there are cells that don't have a path still";
    } else if (incompleteLoop) {
      etext = "the loop isn't complete yet";
    } else {
      etext = "there are no errors nor incomplete numbers";
    }
  } else {
    if (errorCount || incompleteDigits || incompleteCells) {
      etext = "there are " + errorCount  + " errors and " +
                        incompleteDigits + " incomplete numbers and " +
                        incompleteCells  + " incomplete cells";
    } else if (incompleteLoop) {
      etext = "the loop isn't complete yet";
    } else {
      etext = "there are no errors nor incomplete numbers";
    }
  }
  updateDynamicHtmlEntries(etext,assistState);
}

function addHistory(y,x,prevvalue,movetype) {
  moveHistory.push([y,x,prevvalue,movetype]);
}

function contains(state,list) {
  let hit = false;
  for (let i=0;i<list.length;i++) {
    if (state==list[i]) {
      hit = true;
    }
  }
  return hit;
}

function addMove(moveType,y,x,noHistory=false) {
  // don't try and change a fixed cell
  if (puzzleBoardStates[y][x] == CELL_FIXED) {
    return;
  }
  if (moveType <= CELL_FIXED) {
    if (!noHistory) {
      addHistory(y,x,puzzleBoardStates[y][x],moveType);
    }
    puzzleBoardStates[y][x] = moveType;
    globalBoardColors[y][x] = (moveType == CELL_WHITE) ? emptyCellColor : fillCellColor;
    // if putting down a black cell, kill all path segments
    // in this cell, and into and out of this cell
    if (moveType == CELL_BLACK) {
      globalLineStates[y][x] = PATH_NONE;
      if (y) {
        globalLineStates[y-1][x] = unmergePathLines(globalLineStates[y-1][x],PATH_S);
      }
      if (y<(globalPuzzleH-1)) {
        globalLineStates[y+1][x] = unmergePathLines(globalLineStates[y+1][x],PATH_N);
      }
      if (x) {
        globalLineStates[y][x-1] = unmergePathLines(globalLineStates[y][x-1],PATH_E);
      }
      if (x<(globalPuzzleW-1)) {
        globalLineStates[y][x+1] = unmergePathLines(globalLineStates[y][x+1],PATH_W);
      }
    }
    return;
  }
  // the rest are path changes, make sure they're legal
  // don't try and add paths that move into a black or fixed cell or edge or black cell
  if (puzzleBoardStates[y][x] == CELL_BLACK) {
    return;
  }
  if ((((y==0)                 || (puzzleBoardStates[y-1][x]!=CELL_WHITE)) && ((moveType & PATH_N) == PATH_N)) ||
      (((y==(globalPuzzleH-1)) || (puzzleBoardStates[y+1][x]!=CELL_WHITE)) && ((moveType & PATH_S) == PATH_S)) ||
      (((x==0)                 || (puzzleBoardStates[y][x-1]!=CELL_WHITE)) && ((moveType & PATH_W) == PATH_W)) ||
      (((x==(globalPuzzleW-1)) || (puzzleBoardStates[y][x+1]!=CELL_WHITE)) && ((moveType & PATH_E) == PATH_E))) {
    return;
  }

  if (!noHistory) {
    addHistory(y,x,globalLineStates[y][x],moveType);
  }
  if (moveType==PATH_N || moveType==PATH_E || moveType==PATH_W || moveType==PATH_S) {
    // for "dragging/shifting" adds, we might need to pre-clear the existing
    // paths on both sides of the move if they are conflicting
    if ((moveType==PATH_N && contains(globalLineStates[y][x],[PATH_SW,PATH_SE,PATH_WE])) ||
        (moveType==PATH_S && contains(globalLineStates[y][x],[PATH_NW,PATH_NE,PATH_WE])) ||
        (moveType==PATH_W && contains(globalLineStates[y][x],[PATH_SE,PATH_NE,PATH_NS])) ||
        (moveType==PATH_E && contains(globalLineStates[y][x],[PATH_SW,PATH_NW,PATH_NS]))) {
      preClearPathNeighbors(y,x,globalLineStates[y][x]);
    }

    // and the following need clearing for the precursor cell
    if (       moveType==PATH_N && contains(globalLineStates[y-1][x],[PATH_NW,PATH_NE,PATH_WE])) {
      preClearPathNeighbors(y-1,x,globalLineStates[y-1][x]);
    } else if (moveType==PATH_S && contains(globalLineStates[y+1][x],[PATH_SW,PATH_SE,PATH_WE])) {
      preClearPathNeighbors(y+1,x,globalLineStates[y+1][x]);
    } else if (moveType==PATH_W && contains(globalLineStates[y][x-1],[PATH_SW,PATH_NW,PATH_NS])) {
      preClearPathNeighbors(y,x-1,globalLineStates[y][x-1]);
    } else if (moveType==PATH_E && contains(globalLineStates[y][x+1],[PATH_SE,PATH_NE,PATH_NS])) {
      preClearPathNeighbors(y,x+1,globalLineStates[y][x+1]);
    }
  } else {
    // for the others, we always need to clear any existing state ("unmerge")
    // and its neighboring effects
    preClearPathNeighbors(y,x,globalLineStates[y][x]);
  }

  // now merge in the new half-segments in the neighbors
  switch (moveType) {
    case PATH_CLEAR:
      globalLineStates[y][x] = PATH_NONE;
      break;
    case PATH_DOT:
      globalLineStates[y][x] = PATH_DOT;
      break;
    case PATH_N:
      globalLineStates[y  ][x] = mergePathLines(globalLineStates[y  ][x],PATH_N);
      globalLineStates[y-1][x] = mergePathLines(globalLineStates[y-1][x],PATH_S);
      break
    case PATH_S:
      globalLineStates[y  ][x] = mergePathLines(globalLineStates[y  ][x],PATH_S);
      globalLineStates[y+1][x] = mergePathLines(globalLineStates[y+1][x],PATH_N);
      break
    case PATH_W:
      globalLineStates[y][x  ] = mergePathLines(globalLineStates[y][x  ],PATH_W);
      globalLineStates[y][x-1] = mergePathLines(globalLineStates[y][x-1],PATH_E);
      break
    case PATH_E:
      globalLineStates[y][x  ] = mergePathLines(globalLineStates[y][x  ],PATH_E);
      globalLineStates[y][x+1] = mergePathLines(globalLineStates[y][x+1],PATH_W);
      break
    case PATH_WE:
      globalLineStates[y][x] = PATH_WE;
      globalLineStates[y][x-1] = mergePathLines(globalLineStates[y][x-1],PATH_E);
      globalLineStates[y][x+1] = mergePathLines(globalLineStates[y][x+1],PATH_W);
      break;
    case PATH_NS:
      globalLineStates[y][x] = PATH_NS;
      globalLineStates[y-1][x] = mergePathLines(globalLineStates[y-1][x],PATH_S);
      globalLineStates[y+1][x] = mergePathLines(globalLineStates[y+1][x],PATH_N);
      break;
    case PATH_NE:
      globalLineStates[y][x] = PATH_NE;
      globalLineStates[y-1][x] = mergePathLines(globalLineStates[y-1][x],PATH_S);
      globalLineStates[y][x+1] = mergePathLines(globalLineStates[y][x+1],PATH_W);
      break;
    case PATH_SE:
      globalLineStates[y][x] = PATH_SE;
      globalLineStates[y+1][x] = mergePathLines(globalLineStates[y+1][x],PATH_N);
      globalLineStates[y][x+1] = mergePathLines(globalLineStates[y][x+1],PATH_W);
      break;
    case PATH_SW:
      globalLineStates[y][x] = PATH_SW;
      globalLineStates[y+1][x] = mergePathLines(globalLineStates[y+1][x],PATH_N);
      globalLineStates[y][x-1] = mergePathLines(globalLineStates[y][x-1],PATH_E);
      break;
    case PATH_NW:
      globalLineStates[y][x] = PATH_NW;
      globalLineStates[y-1][x] = mergePathLines(globalLineStates[y-1][x],PATH_S);
      globalLineStates[y][x-1] = mergePathLines(globalLineStates[y][x-1],PATH_E);
      break;
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
        console.log(globalLineStates);
        debugMode = true;
        break;
      case KEY_UP:
        if (globalCursorY) {
          globalCursorY--;
          if (shifting) {
            addMove(PATH_S,globalCursorY,globalCursorX);
          }
        }
        break;
      case KEY_DOWN:
        if (globalCursorY < (globalPuzzleH-1)) {
          globalCursorY++;
          if (shifting) {
            addMove(PATH_N,globalCursorY,globalCursorX);
          }
        }
        break;
      case KEY_LEFT:
        if (globalCursorX) {
          globalCursorX--;
          if (shifting) {
            addMove(PATH_E,globalCursorY,globalCursorX);
          }
        }
        break;
      case KEY_RIGHT:
        if (globalCursorX < (globalPuzzleW-1)) {
          globalCursorX++;
          if (shifting) {
            addMove(PATH_W,globalCursorY,globalCursorX);
          }
        }
        break;
      case KEY_SP: // toggle through states
        if (puzzleBoardStates[globalCursorY][globalCursorX] == CELL_BLACK) {
          addMove(CELL_WHITE,globalCursorY,globalCursorX);
        } else {
          addMove(CELL_BLACK,globalCursorY,globalCursorX);
        }
        break;
      case KEY_0:
      case ALT_0:
        addMove(CELL_WHITE,globalCursorY,globalCursorX);
        break;
      case KEY_1:
      case ALT_1:
        addMove(CELL_BLACK,globalCursorY,globalCursorX);
        break;
      case KEY_BS:  // clear any line status
        addMove(PATH_CLEAR,globalCursorY,globalCursorX);
        break;
      case KEY_DOT:
        if (puzzleBoardStates[globalCursorY][globalCursorX] != CELL_FIXED) {
          addMove(PATH_DOT,globalCursorY,globalCursorX);
        }
        break;
      case KEY_DASH:
        addMove(PATH_WE,globalCursorY,globalCursorX);
        break;
      case KEY_VERT:
      case KEY_I:
        addMove(PATH_NS,globalCursorY,globalCursorX);
        break;
      case KEY_F:
        addMove(PATH_SE,globalCursorY,globalCursorX);
        break;
      case KEY_7:
        addMove(PATH_SW,globalCursorY,globalCursorX);
        break;
      case KEY_J:
        addMove(PATH_NW,globalCursorY,globalCursorX);
        break;
      case KEY_L:
        addMove(PATH_NE,globalCursorY,globalCursorX);
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
  let wxh = size.split("x");
  let numParams = puzzleSplit[1];
  globalPuzzleW = parseInt(wxh[0]);
  globalPuzzleH = parseInt(wxh[1]);
  setGridSize(globalPuzzleW);
  canvas.height = globalPuzzleH*globalGridSize;
  canvas.width  = globalPuzzleW*globalGridSize;

  globalInitBoardValues = initBoardValuesFromParams(numParams,true);
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  globalCircleStates =    initYXFromValue(CIRCLE_NONE);     // no circles, lines needed in this puzzle
  globalLineStates   =    initLineValuesFromParams(numParams,true);
  globalBoardColors =     initYXFromValue(emptyCellColor);
  puzzleBoardStates =     initYXFromValue(CELL_WHITE);
  globalInitWallStates  = initWallStates(constWallLight);
  globalWallStates =      initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  globalBoardTextColors = initYXFromValue(stdFontColor); // all text is black
  globalLineColors =      initYXFromValue("black"); // default line is black
  globalCircleColors =    initYXFromValue("black");
  globalTextBold =        initYXFromValue(true);

  // override board states and colors for the initial digits, set to gray
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (globalBoardValues[y][x] != "") {
        puzzleBoardStates[y][x] = CELL_FIXED;
        globalBoardColors[y][x] = digitCellColor;
      }
    }
  }

  // override state if given (* for black) for example completed puzzle
  // needs to do annoying skip for arrows
  if ((numParams.search(/F/)!=-1) && (numParams.search(/|/)!=-1) &&
      (numParams.search(/J/)!=-1) && (numParams.search(/_/)!=-1) &&
      (numParams.search(/7/)!=-1) && (numParams.search(/L/)!=-1)) {
    let numParamsExt = numParams.replace(/([0-9])v/g, "$1%");
    numParamsExt = expandNumParams(numParamsExt).split("");
    let scoot = 0;
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        let ptr = y*globalPuzzleW+x+scoot;
        let param = numParams[ptr];
        if (param.search(/[0-6]/) != -1) {
          scoot++;
        } else if (numParamsExt[ptr] == '*') {
          puzzleBoardStates[y][x] = CELL_BLACK;
        }
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
  if (!dragging) {
    curClickType = clickType(evnt);
  }
  $("#userPuzzleField").blur();
  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  // dragging, but no move yet
  if (dragging && ((yCell == globalCursorY) && (xCell == globalCursorX))) {
    return;
  }
  // skip dragging with anything but left click
  if (dragging && curClickType!=CLICK_LEFT) {
    return;
  }

  // if dragging, begin to make a path from previous cursor
  if (dragging) {
    if (yCell==(globalCursorY+1)) { // moving S
      addMove(PATH_N,yCell,xCell);
    }
    if (yCell==(globalCursorY-1)) { // moving N
      addMove(PATH_S,yCell,xCell);
    }
    if (xCell==(globalCursorX+1)) { // moving E
      addMove(PATH_W,yCell,xCell);
    }
    if (xCell==(globalCursorX-1)) { // moving W
      addMove(PATH_E,yCell,xCell);
    }
  }

  globalCursorY = yCell;
  globalCursorX = xCell;

  // left is only used for drag, right sets to black, middle sets to white
  // ignore if already the same state, or if a numbered tile which
  // can't be changed
  if (globalBoardValues[yCell][xCell] == "") {
    if ((curClickType == CLICK_RIGHT)  && puzzleBoardStates[yCell][xCell] != CELL_BLACK) {
      addMove(CELL_BLACK,yCell,xCell);
    }
    if ((curClickType == CLICK_MIDDLE) && puzzleBoardStates[yCell][xCell] != CELL_WHITE) {
      addMove(CELL_WHITE,yCell,xCell);
    }
  }
  updateBoardStatus();
  drawBoard();
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) number cells with more black squares than accounted for
  //  2) two black cells that touch
  //  3) a continuous loop while there are other loop segments
  errorCount = 0;

  // also count how many numbers haven't been completed yet, how
  // many white cells don't have a path, and if there is a complete loop
  incompleteDigits = 0;
  incompleteCells = 0;
  incompleteLoop = true;

  // start by reseting all cell, line and font colors to "standard"
  // before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalLineColors[y][x] = "black";
      if (puzzleBoardStates[y][x] == CELL_BLACK) {
        globalBoardColors[y][x] = fillCellColor;
        globalBoardTextColors[y][x] = offFontColor;
      } else if (puzzleBoardStates[y][x] == CELL_WHITE) {
        globalBoardColors[y][x] = emptyCellColor;
        globalBoardTextColors[y][x] = stdFontColor;
      } else {
        globalBoardColors[y][x] = digitCellColor;
        globalBoardTextColors[y][x] = stdFontColor;
      }
    }
  }

  // rule 1: go through all of the cells with digits. count the number
  // of black cells in their direction. if greater than the number,
  // they are in error, else just indeterminate
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let cellValue = globalBoardValues[y][x];
      if (cellValue) {
        let count, dir;
        let found = 0;
        [count,dir] = cellValue.split("");
        switch (dir) {
          case "^":
            for (let iy=y-1;iy>=0;iy--) {
              if (puzzleBoardStates[iy][x]==CELL_BLACK) {
                found++;
              }
            }
            break;
          case "v":
            for (let iy=y+1;iy<globalPuzzleH;iy++) {
              if (puzzleBoardStates[iy][x]==CELL_BLACK) {
                found++;
              }
            }
            break;
          case "<":
            for (let ix=x-1;ix>=0;ix--) {
              if (puzzleBoardStates[y][ix]==CELL_BLACK) {
                found++;
              }
            }
            break;
          case ">":
            for (let ix=x+1;ix<globalPuzzleW;ix++) {
              if (puzzleBoardStates[y][ix]==CELL_BLACK) {
                found++;
              }
            }
            break;
        }
        if (count==found) {
          if (assistState==2) {
            globalBoardTextColors[y][x] = correctFontColor;
          }
        } else if (found>count) {
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

  // rule 3: check for touching black squares
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((y!=(globalPuzzleH-1)) &&
          (puzzleBoardStates[y  ][x] == CELL_BLACK) &&
          (puzzleBoardStates[y+1][x] == CELL_BLACK)) {
      errorCount++;
      globalBoardColors[y  ][x] = errorCellColor;
      globalBoardColors[y+1][x] = errorCellColor;
      }
      if ((x!=(globalPuzzleW-1)) &&
          (puzzleBoardStates[y][x  ] == CELL_BLACK) &&
          (puzzleBoardStates[y][x+1] == CELL_BLACK)) {
      errorCount++;
      globalBoardColors[y  ][x+1] = errorCellColor;
      globalBoardColors[y+1][x+1] = errorCellColor;
      }
    }
  }

  // rule 4a: check for white squares without a path
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((puzzleBoardStates[y][x]==CELL_WHITE) && !globalLineStates[y][x]) {
        incompleteCells++;
      }
    }
  }

  // rule 4b: check all of the path segments. find out how many are loops,
  // and how many are non-loops. if there is more than one loop, or if there
  // is one loop with other non-loops, that is an error. draw the loop in
  // red. ignore if there are no loops, they are accounted for in the incomplete
  // loop accounting. incompleteLoop is only false when there is one loop and
  // no partials

  let checkedLineCells = new Array();
  let loops = new Array();
  let nonloops = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x]==CELL_WHITE &&
          globalLineStates[y][x] &&
          (globalLineStates[y][x] != PATH_DOT) &&
          (checkedLineCells.indexOf(y+","+x)==-1)) {
        let lineCellArray, isLoop;
        [lineCellArray,isLoop] = travelLineLoop(globalLineStates,y,x);
        checkedLineCells.push.apply(checkedLineCells, lineCellArray);
        if (isLoop) {
          loops.push(lineCellArray);
        } else {
          nonloops.push(lineCellArray);
        }
      }
    }
  }

  if ((loops.length > 1) || (loops.length==1 && nonloops.length)) {
    errorCount += loops.length;
    if (assistState == 2) {
      for (let l=0;l<loops.length;l++) {
        let loop = loops[l];
        for (let i=0;i<loop.length;i++) {
          let y,x;
          [y,x] = loop[i].split(",");
          globalLineColors[y][x] = "red";
        }
      }
    }
  }
  if ((loops.length==1) && (nonloops.length==0)) {
    incompleteLoop = false;
  }

  updateDynTextFields();
  if ((errorCount==0) && (incompleteDigits==0) && (incompleteCells==0) && (incompleteLoop==false)) {
    $("#canvasDiv").css("border-color", constColorSuccess);
  } else {
    $("#canvasDiv").css("border-color", "black");
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    if (lastMove[3] <= CELL_FIXED) {
      addMove(lastMove[2],lastMove[0],lastMove[1],true);
    } else if (lastMove[2] == 0) {
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
  let dtext  = (demoNum==1) ?  demoText[0] :  demoText[1];
  let dmoves = (demoNum==1) ? demoMoves[0] : demoMoves[1];
  if (demoStepNum < dtext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHtmlText('demotext', dtext[demoStepNum]);
    // start by reseting all non-number cells to indeterminate
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if (globalBoardValues[y][x] == "") {
          puzzleBoardStates[y][x] = CELL_WHITE;
          globalLineStates[y][x] = PATH_NONE;
        } else {
          puzzleBoardStates[y][x] = CELL_FIXED;
        }
      }
    }
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      let dsteps = dmoves[step];
      for (let i=0;i<dsteps.length;i++) {
        let steps = dsteps[i].split("");
        let s0 = (steps[0] == '1') ? CELL_BLACK : convertPathCharToCode(steps[0]);
        addMove(s0,parseInt(steps[1]),parseInt(steps[2]));
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}
