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

const CELL_WHITE =  1;
const CELL_BLACK =  2;
const CELL_FIXED =  3;
const PATH_CLEAR =  4;
const PATH_DOT   =  5;
const PATH_N     =  6;
const PATH_S     =  7;
const PATH_E     =  8;
const PATH_W     =  9;
const PATH_EW    = 10;
const PATH_NS    = 11;
const PATH_NE    = 12;
const PATH_SE    = 13;
const PATH_SW    = 14;
const PATH_NW    = 15;

// which keys are handled
let handledKeys =
  [ KEY_BS, KEY_CR, KEY_ESC, KEY_SP, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_DOT,
    KEY_1, ALT_1, KEY_0, ALT_0, KEY_DASH, KEY_VERT, KEY_L, KEY_I, KEY_J, KEY_7, KEY_F ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleRoomList, puzzleBoardStates;

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

function mergeLines(line1,line2) {
  if (line1==0 || line1=='.') {
    return line2;
  } else if (line1==line2) {
    return line1;
  } else {
    // often the merges are incompatible, just need to return
    // the new one
    if (((line1=='-') && (line2=='N' || line2=='S')) ||
        ((line1=='|') && (line2=='W' || line2=='E')) ||
        ((line1=='F') && (line2=='N' || line2=='W')) ||
        ((line1=='L') && (line2=='S' || line2=='W')) ||
        ((line1=='J') && (line2=='S' || line2=='E')) ||
        ((line1=='7') && (line2=='N' || line2=='E'))) {
      return line2;
    }
    // often the merges are identical, just return the old one
    if (((line1=='-') && (line2=='W' || line2=='E')) ||
        ((line1=='|') && (line2=='N' || line2=='S')) ||
        ((line1=='F') && (line2=='S' || line2=='E')) ||
        ((line1=='L') && (line2=='N' || line2=='E')) ||
        ((line1=='J') && (line2=='N' || line2=='W')) ||
        ((line1=='7') && (line2=='S' || line2=='W'))) {
      return line1;
    }
    // these are actual merges
    if ((line1=='W' && line2=='E') ||
        (line1=='E' && line2=='W')) {
      return '-';
    }
    if ((line1=='N' && line2=='S') ||
        (line1=='S' && line2=='N')) {
      return '|';
    }
    if ((line1=='N' && line2=='W') ||
        (line1=='W' && line2=='N')) {
      return 'J';
    }
    if ((line1=='S' && line2=='E') ||
        (line1=='E' && line2=='S')) {
      return 'F';
    }
    if ((line1=='N' && line2=='E') ||
        (line1=='E' && line2=='N')) {
      return 'L';
    }
    if ((line1=='S' && line2=='W') ||
        (line1=='W' && line2=='S')) {
      return '7';
    }
    return line1;
  }
}

function unmergeLines(line1,line2) {
  if (line1==0) {
    return 0;
  } else if (line1==line2) {
    return 0;
  } else {
    if (((line1=='-') && (line2=='W')) ||
        ((line1=='F') && (line2=='S')) ||
        ((line1=='L') && (line2=='N'))) {
      return 'E';
    }
    if (((line1=='-') && (line2=='E')) ||
        ((line1=='7') && (line2=='S')) ||
        ((line1=='J') && (line2=='N'))) {
      return 'W';
    }
    if (((line1=='|') && (line2=='N')) ||
        ((line1=='F') && (line2=='E')) ||
        ((line1=='7') && (line2=='W'))) {
      return 'S';
    }
    if (((line1=='|') && (line2=='S')) ||
        ((line1=='L') && (line2=='E')) ||
        ((line1=='J') && (line2=='W'))) {
      return 'N';
    }
    // everything else is incompatible, return 0
    return 0;
  }
}

function preClearNeighbors(y,x,state) {
  switch (state) {
    case '-':
      globalLineStates[y][x-1] = unmergeLines(globalLineStates[y][x-1],'E');
      globalLineStates[y][x+1] = unmergeLines(globalLineStates[y][x+1],'W');
      break;
    case '|':
      globalLineStates[y-1][x] = unmergeLines(globalLineStates[y-1][x],'S');
      globalLineStates[y+1][x] = unmergeLines(globalLineStates[y+1][x],'N');
      break;
    case 'F':
      globalLineStates[y][x+1] = unmergeLines(globalLineStates[y][x+1],'W');
      globalLineStates[y+1][x] = unmergeLines(globalLineStates[y+1][x],'N');
      break;
    case 'L':
      globalLineStates[y][x+1] = unmergeLines(globalLineStates[y][x+1],'W');
      globalLineStates[y-1][x] = unmergeLines(globalLineStates[y-1][x],'S');
      break;
    case 'J':
      globalLineStates[y][x-1] = unmergeLines(globalLineStates[y][x-1],'E');
      globalLineStates[y-1][x] = unmergeLines(globalLineStates[y-1][x],'S');
      break;
    case '7':
      globalLineStates[y][x-1] = unmergeLines(globalLineStates[y][x-1],'E');
      globalLineStates[y+1][x] = unmergeLines(globalLineStates[y+1][x],'N');
      break;
    case 'W':
      globalLineStates[y][x-1] = unmergeLines(globalLineStates[y][x-1],'E');
      break;
    case 'E':
      globalLineStates[y][x+1] = unmergeLines(globalLineStates[y][x+1],'W');
      break;
    case 'N':
      globalLineStates[y-1][x] = unmergeLines(globalLineStates[y-1][x],'S');
      break;
    case 'S':
      globalLineStates[y+1][x] = unmergeLines(globalLineStates[y+1][x],'N');
      break;
  }
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

function addMove(moveType,y,x) {
  // don't try and change a fixed cell
  if (puzzleBoardStates[y][x] == CELL_FIXED) {
    return;
  }
  if (moveType <= CELL_FIXED) {
    addHistory(y,x,puzzleBoardStates[y][x],moveType);
    puzzleBoardStates[y][x] = moveType;
    globalBoardColors[y][x] =
      (moveType == CELL_WHITE) ? emptyCellColor :
      (moveType == CELL_BLACK) ? fillCellColor  :
                                 digitCellColor;
    return;
  }
  // the rest are path changes, make sure they're legal
  // dont' try and add paths that move into a fixed cell or edge or black cell
  if (((y==0) || (puzzleBoardStates[y-1][x]!=CELL_WHITE)) &&
      ((moveType==PATH_N) || (moveType==PATH_NS) || (moveType==PATH_NW) || (moveType==PATH_NE))) {
    return; // illegal north moves
  }
  if (((y==(globalPuzzleH-1)) || (puzzleBoardStates[y+1][x]!=CELL_WHITE)) &&
      ((moveType==PATH_S) || (moveType==PATH_NS) || (moveType==PATH_SW) || (moveType==PATH_SE))) {
    return; // illegal south moves
  }
  if (((x==0) || (puzzleBoardStates[y][x-1]!=CELL_WHITE)) &&
      ((moveType==PATH_W) || (moveType==PATH_EW) || (moveType==PATH_NW) || (moveType==PATH_SW))) {
    return; // illegal west moves
  }
  if (((x==(globalPuzzleW-1)) || (puzzleBoardStates[y][x+1]!=CELL_WHITE)) &&
      ((moveType==PATH_E) || (moveType==PATH_EW) || (moveType==PATH_NE) || (moveType==PATH_SE))) {
    return; // illegal east moves
  }

  addHistory(y,x,globalLineStates[y][x],moveType);
  if (moveType==PATH_N || moveType==PATH_E || moveType==PATH_W || moveType==PATH_S) {
    // for "dragging/shifting" adds, we might need to pre-clear the existing
    // paths on both sides of the move if they are conflicting

    // the following need clearing for this cell
    if ((moveType==PATH_N && contains(globalLineStates[y][x],["7","F","-"])) ||
        (moveType==PATH_S && contains(globalLineStates[y][x],["J","L","-"])) ||
        (moveType==PATH_W && contains(globalLineStates[y][x],["F","L","|"])) ||
        (moveType==PATH_E && contains(globalLineStates[y][x],["7","J","|"]))) {
      preClearNeighbors(y,x,globalLineStates[y][x]);
    }

    // and the following need clearing for the precursor cell
    if (moveType==PATH_N && contains(globalLineStates[y-1][x],["J","L","-"])) {
      preClearNeighbors(y-1,x,globalLineStates[y-1][x]);
    } else if (moveType==PATH_S && contains(globalLineStates[y+1][x],["7","F","-"])) {
      preClearNeighbors(y+1,x,globalLineStates[y+1][x]);
    } else if (moveType==PATH_W && contains(globalLineStates[y][x-1],["7","J","|"])) {
      preClearNeighbors(y,x-1,globalLineStates[y][x-1]);
    } else if (moveType==PATH_E && contains(globalLineStates[y][x+1],["F","L","|"])) {
      preClearNeighbors(y,x+1,globalLineStates[y][x+1]);
    }
  } else {
    // for the others, we always need to clear any existing state ("unmerge")
    // and its neighboring effects
    preClearNeighbors(y,x,globalLineStates[y][x]);
  }

  // now merge in the new half-segments in the neighbors
  switch (moveType) {
    case PATH_CLEAR:
      globalLineStates[y][x] = 0;
      break;
    case PATH_DOT:
      globalLineStates[y][x] = '.';
      break;
    case PATH_N:
      globalLineStates[y  ][x] = mergeLines(globalLineStates[y  ][x],'N');
      globalLineStates[y-1][x] = mergeLines(globalLineStates[y-1][x],'S');
      break
    case PATH_S:
      globalLineStates[y  ][x] = mergeLines(globalLineStates[y  ][x],'S');
      globalLineStates[y+1][x] = mergeLines(globalLineStates[y+1][x],'N');
      break
    case PATH_W:
      globalLineStates[y][x  ] = mergeLines(globalLineStates[y][x  ],'W');
      globalLineStates[y][x-1] = mergeLines(globalLineStates[y][x-1],'E');
      break
    case PATH_E:
      globalLineStates[y][x  ] = mergeLines(globalLineStates[y][x  ],'E');
      globalLineStates[y][x+1] = mergeLines(globalLineStates[y][x+1],'W');
      break
    case PATH_EW:
      globalLineStates[y][x] = '-';
      globalLineStates[y][x-1] = mergeLines(globalLineStates[y][x-1],'E');
      globalLineStates[y][x+1] = mergeLines(globalLineStates[y][x+1],'W');
      break;
    case PATH_NS:
      globalLineStates[y][x] = '|';
      globalLineStates[y-1][x] = mergeLines(globalLineStates[y-1][x],'S');
      globalLineStates[y+1][x] = mergeLines(globalLineStates[y+1][x],'N');
      break;
    case PATH_NE:
      globalLineStates[y][x] = 'L';
      globalLineStates[y-1][x] = mergeLines(globalLineStates[y-1][x],'S');
      globalLineStates[y][x+1] = mergeLines(globalLineStates[y][x+1],'W');
      break;
    case PATH_SE:
      globalLineStates[y][x] = 'F';
      globalLineStates[y+1][x] = mergeLines(globalLineStates[y+1][x],'N');
      globalLineStates[y][x+1] = mergeLines(globalLineStates[y][x+1],'W');
      break;
    case PATH_SW:
      globalLineStates[y][x] = '7';
      globalLineStates[y+1][x] = mergeLines(globalLineStates[y+1][x],'N');
      globalLineStates[y][x-1] = mergeLines(globalLineStates[y][x-1],'E');
      break;
    case PATH_NW:
      globalLineStates[y][x] = 'J';
      globalLineStates[y-1][x] = mergeLines(globalLineStates[y-1][x],'S');
      globalLineStates[y][x-1] = mergeLines(globalLineStates[y][x-1],'E');
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
          addMove(CELL_WHITE,globalCursorY,globalCursorX);
          addMove(PATH_DOT,globalCursorY,globalCursorX);
        }
        break;
      case KEY_DASH:
        addMove(PATH_EW,globalCursorY,globalCursorX);
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

  globalInitBoardValues = initBoardValuesFromParams(numParams,true);
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  globalCircleStates =    initYXFromValue(0);     // no circles, lines needed in this puzzle
  globalLineStates   =    initLineValuesFromParams(numParams,true);
  globalBoardColors =     initYXFromValue(emptyCellColor);
  puzzleBoardStates =     initYXFromValue(CELL_WHITE);
  globalInitWallStates  = initWallStates(constWallLight);
  globalWallStates =      initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  globalBoardTextColors = initYXFromValue(stdFontColor); // all text is black
  globalBoardLineColors = initYXFromValue("black"); // default line is black

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

  // if dragging, begin to make a path from previous cursor
  if (dragging && curClickType==CLICK_LEFT) {
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
      globalBoardLineColors[y][x] = "black";
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
          (globalLineStates[y][x] != '.') &&
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
          globalBoardLineColors[y][x] = "red";
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
    puzzleBoardStates[lastMove[0]][lastMove[1]] = lastMove[2];
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
  // for brevity in the demo steps below, use B and W for black and white
  if (demoNum==1) {
    demotext = [
      "<p>In this demo we will walk through the steps of solving this puzzle. " +
        "Press the 'next' button to walk through the solving steps, or the " +
        "'back' button to return to the previous step.</p>" +
        "<p>At the beginning of a solve, there are no errors, but there are " +
        "many indeterminate cell which we need to turn white or black to " +
        "solve the puzzle. For our first time through we can turn on Assist " +
        "Mode 2 to see any errors that we might generate in the process of " +
        "the solve.</p>",
      "In Nurikabe, the easiest 'freebies' are the '1' digits, which must be " +
        "surrounded by all black cells in order to keep them contained into a " +
        "room of size 1.",
      "The next observation is that all numbered cells must be kept away from " +
        "other ones to avoid violating rule 3, so we can isolate them if they " +
        "are too close by setting their neighbor cells to black.",
      "Now we can see that some directions are already determinable. The '2' " +
        "in the NW corner must move downward, the '5' in the SW corner must " +
        "move to the left and then up, and the '2' next to it must move up. We " +
        "can begin to set their squares to white in those directions.",
      "For the two '2' rooms that have been created, we can set their borders " +
        "by setting the boundary squares to black. But sure to not assume that " +
        "you need to set the diagonal boundary squares.",
      "It is now clear how to complete the '5' room in the lower left.",
      "Now two new observations can be made. The first is that the black square " +
        "in the left column is isolated, as is the one in the bottom row. They " +
        "must be connected to the others, and the only way to do so is to set " +
        "their neighbor to black. Secondly, the single isolated indeterminate " +
        "square in the middle can only be set to black, else setting it to " +
        "white would isolate it as a '1' room with no digit, which violates " +
        "rule 2.",
      "Now we have two potential 'pool violations' brewing, below the '3' and " + 
        "above the incomplete '2'. Setting a 4th black square to create a 2x2 " +
        "grid of black squares would violate rule 5, and thus they must be set " +
        "to white.",
      "For the unsolved '2', this completes its room, and its neighbors can be " +
        "set to black. For the cell below the '3', it is now clear that it can " +
        "only be satisfied from above; all other digits are not long enough to " +
        "'make it' to that white square.",
      "In the upper row we have another pool forming, and it must be avoided " +
        "with a white cell, which can only be reached by the '4' to its right.",
      "Now the path for the '4', the final remaining unsolved number is clear.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      [],
      ["B23","B14","B25","B34"],
      ["B01","B51","B62","B53"],
      ["W10","W60","W50","W40","W42"],
      ["B20","B11","B41","B32","B43"],
      ["W30","B31"],
      ["B21","B63","B33"],
      ["W22","W44"],
      ["B45","B55","B64","W12","B03","B13"],
      ["W04","W05","W06","B15","B26"],
      ["W36","W46","W56","B66","B65"]];
  } else {
    demotext = [
      "<p>In this demo we will walk more quickly through the steps of solving " +
        "this puzzle. It is recommended to go through demo 1 first. Press the " +
        "'next' button to walk through the solving steps, or the 'back' button " +
        "to return to the previous step. You can also use the undo button to move " +
        "backwards individual steps, or continue playing forward if you wish.</p>" +
        "<p>The first thing to do is to turn on the assist mode to let us know " +
        "which rooms still need completion. Let's start with the '1' solves and " +
        "the number separation like in the first demo.</p>",
      "We can extend the direction of the '6' in the NW corner, complete the '3' " +
        "in the SW corner, and begin working on the middle bottom '3' and the '4' " +
        "in the SE corner. Meanwhile we can extend the black squares where they " +
        "would otherwise be stranded from connecting with others.",
      "The bottom row '3' is now completeable, as is the SE '4'. Their completions " +
        "and the previous ones strand more black 'rivers' that must be extended " +
        "to connect with others.",
      "The forcing downwards of the '6' and '3' rooms continues to force the " +
        "black river between them to grow downwards as well, until it is at risk " +
        "of being cut off completely. Meanwhile we can grow the '4' in the SW " +
        "corner upwards.",
      "Now the need for that left-side river to connect to the others forces it " +
        "to flow to the right, forcing a turn in the '3' and '4' numbers that " +
        "are coming together.",
      "Now the river to the left of the '2' must connect, so the '2' is forced " +
        "to the right.",
      "Now there are two inner squares at risk of being 'black pools' and must " +
        "be set to white. Also, the black square next to the six must extend " +
        "south one to avoid being stranded.",
      "Finally it should be clear how to complete the six without stranding the " +
        "black square on the right column. In this way you've completed the " +
        "puzzle by attacking those regions that are solveable and saving the " +
        "rest for last.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      ["B02","B11","B54","B45","B56","B65","B61","B72","B76"],
      ["W00","W10","W20","W70","W60","B50","W74","W67","W57","B03","B73","B66"],
      ["W64","B63","W47","B37","B46","B13","B21","B51","B53"],
      ["W30","W22","B31","W40","B41","W52","W42"],
      ["B32","B33","W23","B24","W43","B44","B34"],
      ["B14","W05","B15","B06"],
      ["W25","W35","B16"],
      ["W17","W27","W26","B36"]];
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
        if (globalBoardValues[y][x] == "") {
          puzzleBoardStates[y][x] = CELL_FIXED;
        }
      }
    }
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      let demosteps = demomoves[step];
      for (let i=0;i<demosteps.length;i++) {
        let steps = demosteps[i].split("");
        let s0 = (steps[0] == 'W') ? CELL_WHITE : CELL_BLACK;
        addMove(s0,steps[1],steps[2]);
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
