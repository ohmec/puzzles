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
    $("#saveButton").blur();
    $("#loadButton").blur();
    $("#resetButton").blur();
    $("#showButton").blur();
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
    $("#userSolvePuzzle").val("");
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

  // click (down) within puzzle frame, find out if contains number already
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
                      incompleteCircles  + " incomplete cells";
    } else if (incompleteLoop) {
      etext = "the loop isn't complete yet";
    } else {
      etext = "there are no errors nor incomplete circles";
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
  //  make sure path changes are legal
  if (((y==0)                 && ((moveType & PATH_N) == PATH_N)) ||
      ((y==(globalPuzzleH-1)) && ((moveType & PATH_S) == PATH_S)) ||
      ((x==0)                 && ((moveType & PATH_W) == PATH_W)) ||
      ((x==(globalPuzzleW-1)) && ((moveType & PATH_E) == PATH_E))) {
    return; // illegal east moves
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
  let hexParams = puzzleSplit[2];
  globalPuzzleW = parseInt(wxh[0]);
  globalPuzzleH = parseInt(wxh[1]);
  setGridSize(globalPuzzleW);
  canvas.height = globalPuzzleH*globalGridSize;
  canvas.width  = globalPuzzleW*globalGridSize;

  globalInitBoardValues = initYXFromValue("");
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  globalLineStates   =    initLineValuesFromParams(numParams,true);
  globalBoardColors =     initYXFromValue(emptyCellColor);
  globalInitWallStates  = initWallStates(constWallDash);
  globalWallStates =      initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  globalBoardTextColors = initYXFromValue(stdFontColor); // no text
  globalLineColors =      initYXFromValue("black"); // default line is black
  globalCircleStates =    initYXFromValue(CIRCLE_NONE);
  globalCircleColors =    initYXFromValue("black");

  let numParamsExp = expandNumParams(numParams);
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

function findPosition(evnt, canvas) {
  let canvasElement = document.getElementById(canvas);
  let x = evnt.pageX-$(canvasElement).offset().left-parseInt($(canvasElement).css("border-left-width"));
  let y = evnt.pageY-$(canvasElement).offset().top-parseInt( $(canvasElement).css("border-top-width"));
  return x+","+y;
}

function handleClick(evnt) {
  if (!dragging) {
    curClickType = clickType(evnt);
  }
  $("#userPuzzleField").blur();
  let coords = findPosition(evnt, "puzzleCanvas");
  coords = coords.split(",");
  let yCell, xCell, isEdge, yEdge, xEdge;
  [ yCell, xCell, isEdge, yEdge, xEdge ] = getClickCellInfo(coords);

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
      addMove(PATH_S,globalCursorY,globalCursorX);
    }
    if (yCell==(globalCursorY-1)) { // moving N
      addMove(PATH_N,globalCursorY,globalCursorX);
    }
    if (xCell==(globalCursorX+1)) { // moving E
      addMove(PATH_E,globalCursorY,globalCursorX);
    }
    if (xCell==(globalCursorX-1)) { // moving W
      addMove(PATH_W,globalCursorY,globalCursorX);
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
  //  1) number cells with more black squares than accounted for
  //  2) two black cells that touch
  //  3) a continuous loop while there are other loop segments
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
  $("#showButton").blur();
  $("#assistButton").blur();
  initStructures(puzzle);
}

function updateDemoRegion(demoNum) {
  let demotext, demomoves;
  // for brevity in the demo steps below, use a special character for the action
  if (demoNum==1) {
    demotext = [
      "<p>In this demo we will walk through the steps of solving this puzzle. " +
        "Press the 'next' button to walk through the solving steps, or the " +
        "'back' button to return to the previous step.</p>" +
        "<p>At the beginning of a solve, there are no errors, but there are " +
        "many unsolved numbers which we need to satisfy by turning cells black " +
        "in the arrow direction before being able to solve the puzzle. Then we " +
        "must craft a path through all remaining white cells that makes a complete " +
        "loop. For our first time through we can turn on Assist " +
        "Mode 2 to see any errors that we might generate in the process of " +
        "the solve, as well as get an indicator as to when numbers have been " +
        "satisfied.</p>",
      "As shown with the green text, the '0&larr;' cell is already satisfied, " +
        "but we can put dots in the cells to its left to remind ourselves that " +
        "we will need a path through them. Next, we can look for 'freebies', " +
        "that is easy cells to satisfy. Looking at the board, we can see four " +
        "such easy ones. There are three '1' digits that have only one cell " +
        "between them and the wall in the direction of their arrow. Those cells " +
        "must by definition be black. In addition, the '2&uarr;' has three " +
        "cells above it. In order to not violate the rule about adjacent black " +
        "cells, we can determine where the two black cells must lie.",
      "<p>Now the task is to determine where to put the black cells to satisfy " +
        "the three unsolved numbers, and how to create the path loop to go " +
        "through the remaining white cells. Recall there are many cells that " +
        "are not under the 'control' of any arrow cells, so they could be black " +
        "or white as required by the creation of the path.</p><p>Thinking about " +
        "the nature of the loop, we can infer its shape in some corners of the " +
        "board. For instance, in the cells next to black cells near the edge " +
        "of the board, there can not be black cells (in order to avoid the " +
        "adjacency rule violations), so thus they must be white cells with a " +
        "path going through them. Given that they are in a corner, that path " +
        "must by definition be a turn. We can place path segments in those " +
        "corners to begin to visualize the loop required. We can also place " +
        "dot placeholders in other cells next to the existing black squares.</p>",
      "<p>Now let's look at what we can, and at what we can't determine at this " +
         "stage of the solution. It appears tempting to put a path bend just " +
         "below the upper-left '1&uarr;' square, as we did in the other corners " +
         "of the path. But note here that, first off, gray number squares do not " +
         "have a rule of requiring a white square next to them; and secondly, " +
         "there are no number/arrow squares that dictate the rules of this " +
         "particular cell. Thus at this time we must leave it unknown.</p><p>" +
         "Areas we can make progress are those such as the lower left and right " +
         "squares, where an existing path must turn back into the board, and any " +
         "dotted cell (which must contain a path) that is one cell wide, thus " +
         "requiring a straight path. There are two of these in the upper right. " +
         "Similarly the square below the '2&uarr;' must continue inwards.</p>",
      "Looking in the bottom row, we can see two segments which can now progress. " +
         "Given that there can only be one loop, the small segments can not connect " +
         "to themselves, so thus the must move inward until there is room for them " +
         "to connect to another segment. For the segment on the left, there is still " +
         "an unsatisfied '1&larr;' rule, and thus it is clear that it must be just " +
         "to the left of the number in order for there to be room for the segment " +
         "to move upwards. With this in place, and with the right segment also " +
         "forced upwards, the bottom two rows can thus be completed.",
      "Now looking at the dotted square in the upper right region, knowing that it " +
        "must have a path through it, and its above neighbor is completed, it must " +
        "have a bend down and into the center of the board. Once that segment is " +
        "placed, it is clear there is only one square left that can be black on " +
        "that row with the '2&rarr;' in it. It can be set to black and its " +
        "neighboring cells dotted.",
      "Of the two new dotted squares, it is clear that the one below the black " +
        "cell must have a turn. Once that turn is placed, there is only one " +
        "other cell left to satisfy the '1&uarr;' square that remains. Setting " +
        "it to black satisfies all of the numerical squares, and only the final "+
        "connection of the path remains.",
      "Now progress must be made piecemeal on the path segments. In the upper " +
        "row, the path must continue left, while the dotted square below that " +
        "must contain a bend. That completes those rows, and forces the direction " +
        "of its leftmost leg.",
      "Now on the left side, the dotted square must contain a path, so it is " +
        "clear that it must come from above, then turn left to avoid stranding " +
        "the end in the left column. This indicates that the white square above must " +
        "be turned black. Doing so will not violate any of the numerical constraints.",
      "Now the safest way to proceed is to connect path ends where only one choice " +
        "remains, such as the one two to the right of the '2&rarr;' cell. Connecting " +
        "that one leaves only one choice for the one SE of that.",
      "Finally, there is only one solution that creates one contiguous loop, rather " +
        "than two indepedent ones. Connecting the ends completes the path.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      [],
      [".30",".31","100","150","157","106","126"],
      ["F01","L40","F60","705","J47","767",".16",".25",".27"],
      ["-16","|27","L70","J77","-46"],
      ["J62","163","-72","-74","-75","L65"],
      ["725","123",".13",".33"],
      ["F33","114"],
      ["F03","L12","|11"],
      ["J31","120","-41"],
      ["J34","L45"],
      ["742","L53","-54"]];
  } else {
    demotext = [
      "<p>In this demo we will walk more quickly through the steps of solving " +
        "this puzzle. It is recommended to go through demo 1 first. Press the " +
        "'next' button to walk through the solving steps, or the 'back' button " +
        "to return to the previous step. You can also use the undo button to move " +
        "backwards individual steps, or continue playing forward if you wish.</p>" +
        "<p>The first thing to do is to turn on the assist mode to let us know " +
        "which rooms still need completion. Let's start with the '0' squares and " +
        "either put a path segment where definitive, or a dot where not.</p>",
      "Next we can fill the '1' and '2' digit freebies, and begin to place path " +
        "corners where they are deterministic.",
      "These path segments help us satisfy a few other number square requirements, " +
        "and then determine more path segments, such as in the lower left and " +
        "upper right corners.",
      "Looking at the left side, it is unclear at the moment if the square between " +
        "the '1&uarr;' and '0&darr;' squares is black or white since it is under " +
        "no numerical constraints. But looking above it is evident that the incomplete " +
        "path can only connect downwards in a snaking pattern, in order to connect " +
        "both dots.",
      "The incomplete segment in the upper middle must turn downwards on both ends, " +
        "which leaves the remaining white cell in the second row isolated, meaning " +
        "it must be set to black.",
      "The center '1&darr;' square can be satisfied as well, forcing some bends in " +
        "path segments. These path segments allow the final unsolved digit to be " +
        "completed.",
      "A few more line segments have only one option to progress, and there " +
        "is one corner bend that can be definitely added as well in the second " +
        "to bottom row.",
      "The two segment ends in the lower left must join now, and there is only " +
        "is only one way to join them while also connecting the remaining " +
        "dots. This requires that the stranded cell must be set to black.",
      "The remaining dotted square requires a path segment, which forces the " +
        "connectivity with the row below.",
      "Finally, the two remaining path ends must be connected. They can't isolate " +
        "all 5 remaining empty squares, so there is only one solution that doesn't " +
        "require adjoining black squares.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      ["|10","-01","-05","-25","-47",".07",".17",".67",".77",".87",".97","|60",".52",".62",".72",".82",".92"],
      ["130",".31","193","103","123",".22","-13","109","199","702","F04","L20","F50","J92","L94","719","J98"],
      ["181","|80","L90","|82","128","185",".86","|39","|84","-95","707","L17"],
      ["722","F31","|41"],
      ["|34","|36","116"],
      ["164","774","L65",".63","176"],
      ["745","-66","F86","787"],
      ["F52","753","|62","|63","143"],
      ["L77","778"],
      ["|58","|59","L68","J69","179"]];
  }
  if (demoStepNum < demotext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHtmlText('demotext', demotext[demoStepNum]);
    // start by reseting all non-number cells to indeterminate
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        globalLineStates[y][x] = PATH_NONE;
      }
    }
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      let demosteps = demomoves[step];
      for (let i=0;i<demosteps.length;i++) {
        let steps = demosteps[i].split("");
        let s0;
        switch (steps[0]) {
          case '.': s0 = PATH_DOT;   break;
          case '-': s0 = PATH_WE;    break;
          case '|': s0 = PATH_NS;    break;
          case 'F': s0 = PATH_SE;    break;
          case '7': s0 = PATH_SW;    break;
          case 'J': s0 = PATH_NW;    break;
          case 'L': s0 = PATH_NE;    break;
          default:  console.log("what is this: " + steps[0]);
        }
        addMove(s0,parseInt(steps[1]),parseInt(steps[2]));
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}

function fdelay(num) {
  let now = new Date();
  let stop = now.getTime() + num;
  while (true) {
    now = new Date();
    if (now.getTime() > stop) {
      return;
    }
  }
}
