const emptyCellColor = "white";       // not-filled
const errorCircleColor = "red";
const correctCircleColor = "green";

const stdFontColor = "black";

let clicking = false;
let dragging = false;
let shifting = false;
let errorCount = 0;
let incompleteCircles = 0;
let incompleteLoop = true;
let assistState = 0;
let curClickType = CLICK_UNKNOWN;
let debugMode = false;

// which keys are handled
let handledKeys =
  [ KEY_BS, KEY_CR, KEY_ESC, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN,
    KEY_DASH, KEY_VERT, KEY_L, KEY_I, KEY_J, KEY_7, KEY_F ];

let initPuzzle, puzzle, moveHistory, demoStepNum;

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
    if (errorCount && incompleteCircles) {
      etext = "there are errors and incomplete circles";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteCircles) {
      etext = "there are incomplete circles";
    } else if (incompleteLoop) {
      etext = "the loop isn't complete yet";
    } else {
      etext = "there are no errors nor incomplete circles";
    }
  } else {
    if (errorCount || incompleteCircles) {
      etext = "there are " + errorCount  + " errors and " +
                      incompleteCircles  + " incomplete circles";
    } else if (incompleteLoop) {
      etext = "the loop isn't complete yet";
    } else {
      etext = "there are no errors nor incomplete circles";
    }
  }
  updateDynamicHtmlEntries(etext,assistState);
}

function addHistory(y,x,prevvalue) {
  moveHistory.push([y,x,prevvalue]);
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
  //  make sure path changes are legal
  if (((y==0)                 && ((moveType & PATH_N) == PATH_N)) ||
      ((y==(globalPuzzleH-1)) && ((moveType & PATH_S) == PATH_S)) ||
      ((x==0)                 && ((moveType & PATH_W) == PATH_W)) ||
      ((x==(globalPuzzleW-1)) && ((moveType & PATH_E) == PATH_E))) {
    return; // illegal east moves
  }

  if (!noHistory) {
    addHistory(y,x,globalLineStates[y][x]);
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
      case KEY_BS:  // clear any line status
        addMove(PATH_CLEAR,globalCursorY,globalCursorX);
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
  let pathParams = puzzleSplit[2];
  globalPuzzleW = parseInt(wxh[0]);
  globalPuzzleH = parseInt(wxh[1]);
  setGridSize(globalPuzzleW);
  canvas.height = globalPuzzleH*globalGridSize;
  canvas.width  = globalPuzzleW*globalGridSize;

  globalInitBoardValues = initYXFromValue("");
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  globalLineStates   =    initLineValuesFromParams(pathParams);
  globalBoardColors =     initYXFromValue(emptyCellColor);
  globalInitWallStates  = initWallStates(constWallDash);
  globalWallStates =      initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  globalBoardTextColors = initYXFromValue(stdFontColor); // no text
  globalLineColors =      initYXFromValue("black"); // default line is black
  globalCircleStates =    initYXFromValue(CIRCLE_NONE);
  globalCircleColors =    initYXFromValue("black");

  let numParamsExp = expandNumParams(numParams);
  if (numParamsExp.length != (globalPuzzleH*globalPuzzleW)) {
    throw "ERROR in puzzle descriptor nums, got length " + numParamsExp.length +
          " expected " + (globalPuzzleH*globalPuzzleW);
  }
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (numParamsExp[y*globalPuzzleW+x] != '-')  {
        globalCircleStates[y][x] = numParamsExp[y*globalPuzzleW+x];
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
  let yCell, xCell, isEdge, yEdge, xEdge;
  [ yCell, xCell, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

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
  updateBoardStatus();
  drawBoard();
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) white circles that have a change of direction
  //  2) white circles that don't have a bend just next to them
  //  3) black circles that don't have a change of direction
  //  4) black circles that don't have a straight segment on both adjoining cells
  errorCount = 0;

  // also count how many numbers haven't been completed yet, how
  // many white cells don't have a path, and if there is a complete loop
  incompleteDigits = 0;
  incompleteCircles = 0;
  incompleteLoop = true;

  // start by reseting all line and circle colors to "standard"
  // before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalLineColors[y][x] = "black";
      globalCircleColors[y][x] = "black";
    }
  }

  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let localError = false;
      let localComplete = false;

      // rule 1: check that white circles have a line straight
      // through, and that it turns in one direction before
      // or after. only consider a turn inside the circle an
      // error, or a straight line in both directions beyond
      // one square an error; consider a partial or no line to be incomplete
      if (globalCircleStates[y][x] == CIRCLE_WHITE) {
        switch (globalLineStates[y][x]) {
          // potentially complete, potentially errorneous
          case PATH_NS:
            // errors:
            //   a) if no space for a line segment above or below
            if ((y==0) || (y==(globalPuzzleH-1))) {
              localError = true;
            //   b) if lines above and below that both continue straight
            } else if ((globalLineStates[y-1][x] == PATH_NS) &&
                       (globalLineStates[y+1][x] == PATH_NS)) {
              localError = true;
            // correct:
            //   c) a turn above or below
            } else if (pathHasTurn(globalLineStates[y-1][x]) ||
                       pathHasTurn(globalLineStates[y+1][x])) {
              localComplete = true;
            } // else incomplete
            break;
          case PATH_WE:
            // errors:
            //   a) if no space for a line segment left or right
            if ((x==0) || (x==(globalPuzzleW-1))) {
              localError = true;
            //   b) if lines left and right that both continue straight
            } else if ((globalLineStates[y][x-1] == PATH_WE) &&
                       (globalLineStates[y][x+1] == PATH_WE)) {
              localError = true;
            // correct:
            //   c) a turn above or below
            } else if (pathHasTurn(globalLineStates[y][x-1]) ||
                       pathHasTurn(globalLineStates[y][x+1])) {
              localComplete = true;
            } // else incomplete
            break;
          // errorneous
          case PATH_NW:
          case PATH_NE:
          case PATH_SW:
          case PATH_SE:
            localError = true;
            break;
          // rest incomplete
        }

      // rule 2: check that black circles have a turn through
      // them and continue straight on both sides for two.
      // only consider a straight line as an error;
      // consider a partial turn or no turn to be incomplete
      } else if (globalCircleStates[y][x] == CIRCLE_BLACK) {
        switch (globalLineStates[y][x]) {
          // potentially complete, potentially errorneous
          case PATH_NW:
            // errors:
            //   a) if no space for two line segments above or beside
            if ((y<=1) || (x<=1)) {
              localError = true;
            //   b) if lines above or beside that turn
            } else if (pathHasTurn(globalLineStates[y-1][x]) ||
                       pathHasTurn(globalLineStates[y][x-1])) {
              localError = true;
            // correct:
            //   c) straight above and beside
            } else if ((globalLineStates[y-1][x] == PATH_NS) &&
                       (globalLineStates[y][x-1] == PATH_WE)) {
              localComplete = true;
            } // else incomplete
            break;
          case PATH_NE:
            // errors:
            //   a) if no space for two line segments above or beside
            if ((y<=1) || (x>=(globalPuzzleW-2))) {
              localError = true;
            //   b) if lines above or beside that turn
            } else if (pathHasTurn(globalLineStates[y-1][x]) ||
                       pathHasTurn(globalLineStates[y][x+1])) {
              localError = true;
            // correct:
            //   c) straight above and beside
            } else if ((globalLineStates[y-1][x] == PATH_NS) &&
                       (globalLineStates[y][x+1] == PATH_WE)) {
              localComplete = true;
            } // else incomplete
            break;
          case PATH_SW:
            // errors:
            //   a) if no space for two line segments below or beside
            if ((y>=(globalPuzzleH-2)) || (x<=1)) {
              localError = true;
            //   b) if lines below or beside that turn
            } else if (pathHasTurn(globalLineStates[y+1][x]) ||
                       pathHasTurn(globalLineStates[y][x-1])) {
              localError = true;
            // correct:
            //   c) straight below and beside
            } else if ((globalLineStates[y+1][x] == PATH_NS) &&
                       (globalLineStates[y][x-1] == PATH_WE)) {
              localComplete = true;
            } // else incomplete
            break;
          case PATH_SE:
            // errors:
            //   a) if no space for two line segments below or beside
            if ((y>=(globalPuzzleH-2)) || (x>=(globalPuzzleW-2))) {
              localError = true;
            //   b) if lines below or beside that turn
            } else if (pathHasTurn(globalLineStates[y+1][x]) ||
                       pathHasTurn(globalLineStates[y][x+1])) {
              localError = true;
            // correct:
            //   c) straight below and beside
            } else if ((globalLineStates[y+1][x] == PATH_NS) &&
                       (globalLineStates[y][x+1] == PATH_WE)) {
              localComplete = true;
            } // else incomplete
            break;
          // errorneous
          case PATH_NS:
          case PATH_WE:
            localError = true;
            break;
          // rest incomplete
        }
      }
      if (localError) {
        errorCount++;
        if (assistState==2) {
          globalCircleColors[y][x] = errorCircleColor;
        }
      } else if (localComplete) {
        if (assistState==2) {
          globalCircleColors[y][x] = correctCircleColor;
        }
      } else if (globalCircleStates[y][x] != CIRCLE_NONE) {
        incompleteCircles++;
      }
    }
  }

  // check all of the path segments. find out how many are loops,
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
      if ( globalLineStates[y][x] &&
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
  if ((errorCount==0) && (incompleteDigits==0) && (incompleteCircles==0) && (incompleteLoop==false)) {
    $("#canvasDiv").css("border-color", constColorSuccess);
  } else {
    $("#canvasDiv").css("border-color", "black");
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    if (lastMove[2] == PATH_NONE) {
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
        globalLineStates[y][x] = PATH_NONE;
      }
    }
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      let dsteps = dmoves[step];
      for (let i=0;i<dsteps.length;i++) {
        let steps = dsteps[i].split("");
        let s0 = convertPathCharToCode(steps[0]);
        addMove(s0,parseInt(steps[1]),parseInt(steps[2]));
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}

function solveInitialPaths() {
  // look for black circles within one cell of the edge, turn path inward
  for (let y=0;y<globalPuzzleH;y++) {
    if (globalCircleStates[y][0] == CIRCLE_BLACK) {
      addMove(PATH_WE,y,1);
    }
    if (globalCircleStates[y][1] == CIRCLE_BLACK) {
      addMove(PATH_WE,y,2);
    }
    if (globalCircleStates[y][globalPuzzleW-1] == CIRCLE_BLACK) {
      addMove(PATH_WE,y,globalPuzzleW-2);
    }
    if (globalCircleStates[y][globalPuzzleW-2] == CIRCLE_BLACK) {
      addMove(PATH_WE,y,globalPuzzleW-3);
    }
  }
  for (let x=0;x<globalPuzzleW;x++) {
    if (globalCircleStates[0][x] == CIRCLE_BLACK) {
      addMove(PATH_NS,1,x);
    }
    if (globalCircleStates[1][x] == CIRCLE_BLACK) {
      addMove(PATH_NS,2,x);
    }
    if (globalCircleStates[globalPuzzleH-1][x] == CIRCLE_BLACK) {
      addMove(PATH_NS,globalPuzzleH-2,x);
    }
    if (globalCircleStates[globalPuzzleH-2][x] == CIRCLE_BLACK) {
      addMove(PATH_NS,globalPuzzleH-3,x);
    }
  }
  // look for white circles on the edge, force path parallel to edge
  for (let y=0;y<globalPuzzleH;y++) {
    if (globalCircleStates[y][0] == CIRCLE_WHITE) {
      addMove(PATH_NS,y,0);
    }
    if (globalCircleStates[y][globalPuzzleW-1] == CIRCLE_WHITE) {
      addMove(PATH_NS,y,globalPuzzleW-1);
    }
  }
  for (let x=0;x<globalPuzzleW;x++) {
    if (globalCircleStates[0][x] == CIRCLE_WHITE) {
      addMove(PATH_WE,0,x);
    }
    if (globalCircleStates[globalPuzzleH-1][x] == CIRCLE_WHITE) {
      addMove(PATH_WE,globalPuzzleH-1,x);
    }
  }
  updateBoardStatus();
  drawBoard();
}

function solveWhiteCircles() {
  // look for black circles within one cell of the edge, turn path inward
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((globalCircleStates[y][x] == CIRCLE_WHITE) &&
          (globalLineStates[y][x] == PATH_NS) &&
          !pathHasTurn(globalLineStates[y-1][x]) &&
          !pathHasTurn(globalLineStates[y+1][x])) {
        // this cell needs to be solved, and one side is already set,
        // the other one has to turn. check if only one side is available
        if (globalLineStates[y-1][x] == PATH_NS) {
          if (x==0) {
            addMove(PATH_NE,y+1,x);
          } else if (x==(globalPuzzleW-1)) {
            addMove(PATH_NW,y+1,x);
          }
        }
        if (globalLineStates[y+1][x] == PATH_NS) {
          if (x==0) {
            addMove(PATH_SE,y-1,x);
          } else if (x==(globalPuzzleW-1)) {
            addMove(PATH_SW,y-1,x);
          }
        }
      }
      if ((globalCircleStates[y][x] == CIRCLE_WHITE) &&
          (globalLineStates[y][x] == PATH_WE) &&
          !pathHasTurn(globalLineStates[y][x-1]) &&
          !pathHasTurn(globalLineStates[y][x+1])) {
        if (globalLineStates[y][x-1] == PATH_WE) {
          if (y==0) {
            addMove(PATH_SW,y,x+1);
          } else if (y==(globalPuzzleH-1)) {
            addMove(PATH_NW,y,x+1);
          }
        }
        if (globalLineStates[y][x+1] == PATH_WE) {
          if (y==0) {
            addMove(PATH_SE,y,x-1);
          } else if (y==(globalPuzzleH-1)) {
            addMove(PATH_NE,y,x-1);
          }
        }
      }
      // now look for partial segments in white, need to move them forward
      if ((globalCircleStates[y][x] == CIRCLE_WHITE) &&
          ((globalLineStates[y][x] == PATH_W) || 
           (globalLineStates[y][x] == PATH_E))) {
        addMove(PATH_WE,y,x);
      }
      if ((globalCircleStates[y][x] == CIRCLE_WHITE) &&
          ((globalLineStates[y][x] == PATH_N) || 
           (globalLineStates[y][x] == PATH_S))) {
        addMove(PATH_NS,y,x);
      }
    }
  }
  updateBoardStatus();
  drawBoard();
}
