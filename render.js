const constClickLeft    = 0;
const constClickMiddle  = 1;
const constClickRight   = 2;
const constClickUnknown = 9;

const constCircleNone   = 0;
const constCircleWhite  = 1;
const constCircleBlack  = 2;
const constCircleDot    = 3;
const constCircleMoon   = 4;
const constCircleTriNE = 5;
const constCircleTriSE = 6;
const constCircleTriSW = 7;
const constCircleTriNW = 8;

// the paths can be complicated for hashiwokakero, so
// allow for that but keep the others simplified. This
// encoding uses the following binary notation
// [9:8] = 00 no path
// [9:8] = 01 line segment(s)
// [9:8] = 10 special (eg dot)
// then give two bits per direction to allow for single
// and double lines, i.e. single north is 0b00000001
// and double north is 0b00000010

const constPathNone    = 0b0000000000;
const constPathLine    = 0b0100000000;
const constPathSpecial = 0b1000000000;
const constPathDot     = constPathSpecial | 0b01;
const constPathClear   = constPathSpecial | 0b10;
// these are the standard single-line versions
const constPathN       = constPathLine | 0b00000001;
const constPathW       = constPathLine | 0b00000100;
const constPathS       = constPathLine | 0b00010000;
const constPathE       = constPathLine | 0b01000000;
const constPathNW      = constPathN | constPathW;
const constPathNE      = constPathN | constPathE;
const constPathSW      = constPathS | constPathW;
const constPathSE      = constPathS | constPathE;
const constPathNS      = constPathN | constPathS;
const constPathWE      = constPathW | constPathE;
// doubleline version
const constPath2N      = constPathLine | 0b00000010;
const constPath2W      = constPathLine | 0b00001000;
const constPath2S      = constPathLine | 0b00100000;
const constPath2E      = constPathLine | 0b10000000;
const constPathAll     = 0b11111111;

const constKeyBackspace = 0x08;
const constKeyCR        = 0x0d;
const constKeyShift     = 0x10;
const constKeyEsc       = 0x1b;
const constKeySpace     = 0x20;
const constKeyLeft      = 0x25;
const constKeyUp        = 0x26;
const constKeyRight     = 0x27;
const constKeyDown      = 0x28;
const constKey0         = 0x30;
const constKey1         = 0x31;
const constKey2         = 0x32;
const constKey3         = 0x33;
const constKey4         = 0x34;
const constKey7         = 0x37;
const constKey9         = 0x39;
const constKeyAlt0      = 0x60; // these are the number pad versions
const constKeyAlt1      = 0x61;
const constKeyAlt2      = 0x62;
const constKeyAlt3      = 0x63;
const constKeyAlt4      = 0x64;
const constKeyAlt9      = 0x69;
const constKeyA         = 0x41;
const constKeyE         = 0x45;
const constKeyF         = 0x46;
const constKeyI         = 0x49;
const constKeyJ         = 0x4a;
const constKeyL         = 0x4c;
const constKeyN         = 0x4e;
const constKeyS         = 0x53;
const constKeyW         = 0x57;
const constKeyX         = 0x58;
const constKeyZ         = 0x5a;
const constKeyCtrlL     = 0x5b;
const constKeyCtrlR     = 0x5d;
const constKeyAlc       = 0x61;
const constKeyZlc       = 0x7a;
const constKeyDash      = 0xbd;
const constKeyDot       = 0xbe;
const constKeyVert      = 0xdc;

const numberColor = [
  // 0 unused     1          2          3          4          5          6           7          8        9
  "black",   "salmon", "dodgerblue", "fuchsia", "wheat", "lightgreen", "aqua",    "plum", "goldenrod", "deeppink",
  //  A-10       B-11       C-12       D-13       E-14       F-15       G-16        H-17       I-18     J-19
  "#009000", "#b00000", "#b000ff",   "#ffb000", "#b0b000", "#b0b0b0", "#b0b0ff", "#ffb0b0", "#ffff80", "lime",
  //  K-20       L-21       M-22       N-23       O-24       P-25       Q-26        R-27       S-28     T-29
  "#009000", "#b00000", "#b000ff",   "#ffb000", "#b0b000", "#b0b0b0", "#b0b0ff", "#ffb0b0", "#ffff80", "lime",
  //  U-30       V-31       W-32       X-33       Y-34       Z-35
  "#009000", "#b00000", "#b000ff",   "#ffb000", "#b0b000", "#b0b0b0",
];

const stdFontColor       = "black";
const offFontColor       = "white";
const errorFontColor     = "red";
const correctFontColor   = "green";
const correctFontColorBr = "#a0ffa0";     // bright green
const correctFontColorDr = "#20c020";     // darker green
const emptyCellColor     = "white";       // not-filled
const litCellColor       = "#ffffd0";     // yellow lit hallway color
const indetCellColor     = "#e0e0e0";     // indeterminant color (default)
const fillCellColor      = "black";
const fillCellColorDB    = "#000060";     // filled, slightly dark blue
const fillCellColorBlue  = "#6060b0";     // filled, more dark blue to contrast with black walls
const errorCircleColor   = "red";
const correctCircleColor = "green";

const constWallNone      = 0b000000000;
const constWallLight     = 0b000000001;
const constWallStandard  = 0b000000010;
const constWallDash      = 0b000000100;
const constWallBorder    = 0b000001000;
const constWallUserEdge  = 0b000010000;
const constWallSolveEdge = 0b000100000;
const constWallDot       = 0b001000000;
const constWallX         = 0b010000000;

const constRibbonColorWhite = "white";
const constRibbonColorRed   = "#ffc0c0";
const constRibbonColorBlue  = "#c0c0ff";
const constRibbonColorGold  = "#ffffc0";

const constHoriz = true;
const constVert  = false;

const constColorMedGray   = "#a0a0a0";
const constColorSuccess   = "#1be032";
const constColorCursor    = "#ff80ff";
const constLineColor      = "black";

const constEmptyCell = -1;

const elemStruct = {
  resetButton: null, assistButton: null, clearButton: null, undoButton: null,
  displayButton: null, nextDemoButton: null, prevDemoButton: null, tab1: null,
  demotab: null, canvas: null, canvasDiv: null, puzzleCanvas: null, userPuzzle: null
};

const playState = {
  clicking: false, dragging: false, shifting: false, ctrling: false,
  shiftState: 0, shiftNumber: 0, clickNumber: 0, pinCellY: 0, pinCellX: 0,
  assistState: 0, bridgeBuilt: false, errorCount: 0
};

let initPuzzle, puzzle;
let isDemo = false;
let demoStepNum = 0;

let globalFontSize = 0.5;
let globalGridSize = 45;
let globalPuzzleH = 10;
let globalPuzzleW = 10;
let globalCircleRadius = 0.4;
let globalCursorOn = false;
let globalCursorY = 0;
let globalCursorX = 0;
let globalWallCursorOn = false;
let globalWallCursorY = 0;
let globalWallCursorX = 0;
let globalTextOutline = false;
let globalBorderMargin = 4;
let globalLineFirst = false;
let globalDrawDots = false;

let globalContext, globalWallStates, globalBoardValues, globalBoardColors;
let globalBoardTextColors, globalBoardTextOppColors, globalWallColors;
let globalLineStates, globalLineColors, globalDotColors, globalCircleStates;
let globalCircleColors, globalTextBold;

function initElements () {
  elemStruct.assistButton =   document.getElementById('assistButton');
  elemStruct.canvas =         document.getElementById('puzzleCanvas');
  elemStruct.canvasDiv =      document.getElementById('canvasDiv');
  elemStruct.clearButton =    document.getElementById('clearButton');
  elemStruct.demotab =        document.getElementById('demotab');
  elemStruct.displayButton =  document.getElementById('displayButton');
  elemStruct.nextDemoButton = document.getElementById('nextDemoButton');
  elemStruct.prevDemoButton = document.getElementById('prevDemoButton');
  elemStruct.puzzleCanvas =   document.getElementById('puzzleCanvas');
  elemStruct.resetButton =    document.getElementById('resetButton');
  elemStruct.tab1 =           document.getElementById('tab1');
  elemStruct.undoButton =     document.getElementById('undoButton');
  elemStruct.userPuzzle =     document.getElementById('userPuzzle');

  elemStruct.tab1.style.display = 'block';
  elemStruct.puzzleCanvas.addEventListener('contextmenu', function(evnt) { evnt.preventDefault(); });
  canvas = document.getElementById('puzzleCanvas');
  globalContext = canvas.getContext('2d');
}

function moveGlobalCursor(keydir) {
  switch (keynum) {
    case constKeyUp:    if (globalCursorY)                     globalCursorY--; break;
    case constKeyDown:  if (globalCursorY < (globalPuzzleH-1)) globalCursorY++; break;
    case constKeyLeft:  if (globalCursorX)                     globalCursorX--; break;
    case constKeyRight: if (globalCursorX < (globalPuzzleW-1)) globalCursorX++; break;
  }
}

function listenKeys(keyList,handleFunc,shiftFunc=null,unshiftFunc=null) {
  // any key anywhere as long as canvas is in focus
  document.addEventListener('keydown', function(evnt) {
    elemStruct.resetButton.blur();
    elemStruct.clearButton.blur();
    elemStruct.undoButton.blur();
    elemStruct.assistButton.blur();
    if (evnt.which === constKeySpace && !evnt.target.matches("input")) {
      evnt.preventDefault();
    }
    if (evnt.which >= constKeyLeft && evnt.which <= constKeyDown && !evnt.target.matches("input, textarea")) {
      evnt.preventDefault();
    }
    if (evnt.which == constKeyShift) {
      playState.shifting = true;
      playState.pinCellY = globalCursorY;
      playState.pinCellX = globalCursorX;
      if (shiftFunc) {
        shiftFunc();
      }
    } else if ((evnt.which == constKeyCtrlL) || (evnt.which == constKeyCtrlR)) {
      playState.ctrling = true;
    } else if (!playState.ctrling && keyList.find(element => element == evnt.which)) {
      handleFunc(evnt.which);
    }
  });

  document.addEventListener('keyup', function(evnt) {
    if (evnt.which == constKeyShift) {
      playState.shifting = false;
      if (unshiftFunc) {
        unshiftFunc();
      }
    } else if ((evnt.which == constKeyCtrlL) || (evnt.which == constKeyCtrlR)) {
      playState.ctrling = false;
    }
  });
}

function listenClick(handleClick,initStructures,undoMove,mouseupFunc=null) {
  // a click (except right-click i.e. ctrl-click) on tabs.
  // hide old, show new
  document.querySelectorAll("#tabs li").forEach(function(tab) {
    tab.addEventListener('click', function(e) {
      e.preventDefault(); // replaces "return false"

      // Remove 'active' class from all tabs
      document.querySelectorAll("#tabs li").forEach(function(t) {
        t.classList.remove('active');
      });

      // Add 'active' class to clicked tab
      this.classList.add('active');

      // Hide all tab content
      document.querySelectorAll(".tab_content").forEach(function(content) {
        content.style.display = 'none';
      });

      // Show the target tab content
      const targetHref = this.querySelector("a").getAttribute("href");
      document.querySelector(targetHref).style.display = 'block';

      playState.clicking = false;
    });
  });

  elemStruct.displayButton.addEventListener('click', function() {
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
      puzzle = removeDot(pval);
      puzzleChoice = 0;
      updateHtmlDescr(initPuzzle);
    }
    initStructures(puzzle);
  });

  elemStruct.nextDemoButton.addEventListener('click', function() {
    isDemo = true;
    demoStepNum++;
    updateDemoRegion(puzzleChoice);
  });

  elemStruct.prevDemoButton.addEventListener('click', function() {
    if (demoStepNum) {
      demoStepNum--;
    }
    updateDemoRegion(puzzleChoice);
  });

  // click (down) within puzzle number entry, remove clicking
  // effect on canvas
  elemStruct.userPuzzle.addEventListener('mousedown', function(evnt) {
    playState.clicking = false;
  });

  // click (down) within puzzle frame
  elemStruct.puzzleCanvas.addEventListener('mousedown', function(evnt) {
    playState.clicking = true;
    playState.bridgeBuilt = false;
    elemStruct.puzzleCanvas.style.borderColor = "black";
    handleClick(evnt);
  });

  // moving mouse within puzzle area (clicking is true if already moused down => dragging)
  elemStruct.puzzleCanvas.addEventListener('mousemove', function(evnt) {
    if (playState.clicking == false) return;
    evnt.preventDefault();
    playState.dragging = true;
    handleClick(evnt);
  });

  // releasing mouse within puzzle or not within puzzle
  document.addEventListener('mouseup', function() {
    if (mouseupFunc && playState.dragging && (curClickType==constClickLeft)) {
      mouseupFunc();
    }
    playState.clicking = false;
    playState.dragging = false;
  });

  // undo click, remove the last move
  elemStruct.undoButton.addEventListener('click', function() {
    elemStruct.canvasDiv.style.borderColor = "black";
    undoMove();
  });

  // click on reset, brings up confirmation, then resets puzzle
  elemStruct.resetButton.addEventListener('click', function() {
    elemStruct.canvasDiv.style.borderColor = "black";
    let resetDialog = confirm("Reset puzzle?");
    if (resetDialog == true) {
      elemStruct.resetButton.blur();
      elemStruct.clearButton.blur();
      elemStruct.assistButton.blur();
      initStructures(puzzle);
    }
  });

  // click on clear ribbons, brings up confirmation, then resets puzzle
  elemStruct.clearButton.addEventListener('click', function() {
    let resetDialog = confirm("Clear Ribbons Shelf?");
    if (resetDialog == true) {
      try {
        localStorage.setItem("OPSaved" + gameName,'');
      } catch (e) {
        console.warn("couldn't save to localStorage: " + e);
      }
      const ribbonBar = document.getElementById("ribbonbar");
      ribbonBar.innerHTML = '';
      elemStruct.clearButton.style.display = 'none';
    }
  });

  // click on show errors, converts to show how many errors remain
  elemStruct.assistButton.addEventListener('click', function() {
    playState.assistState = (playState.assistState+1)%3;
    updateBoardStatus();
    drawBoard();
  });
}

function basicInitStructures(size,cellColor,wallState,borderState,textColor) {
  let wxh = size.split("x");
  globalPuzzleW = parseInt(wxh[0]);
  globalPuzzleH = parseInt(wxh[1]);
  setGridSize(globalPuzzleW);
  canvas.height = globalPuzzleH*globalGridSize+2*globalBorderMargin;
  canvas.width  = globalPuzzleW*globalGridSize+2*globalBorderMargin;
  globalBoardValues =        initYXFromValue("");
  globalLineStates   =       initYXFromValue(constPathNone);
  globalBoardColors =        initYXFromValue(cellColor);
  globalWallStates =         initWallStates(wallState,borderState);
  globalWallColors =         initYX2FromValue(constLineColor);
  globalBoardTextColors =    initYXFromValue(textColor);
  globalBoardTextOppColors = initYXFromValue("white");
  globalLineColors =         initYXFromValue(constLineColor);
  globalCircleStates =       initYXFromValue(constCircleNone);
  globalCircleColors =       initYXFromValue(constLineColor);
  globalDotColors =          initYX2FromValue(constLineColor);
  globalTextBold =           initYXFromValue(true);
}

function removeDot(strval) {
  return strval.replace(/\./gi, "");
}

function expandNumParams(numStr) {
  for (let cv=10;cv<36;cv++) {
    // replace lowercase values to that many dashes (-)
    // eventually replace uppercase values with the hex equivalent
    let c = cv.toString(36);
    let cre = new RegExp(c, 'g');
    let dash = '-'.repeat(cv-9);
    numStr = numStr.replace(cre, dash);
  }
  return numStr;
}

function setGridSize(puzzleW) {
  if(puzzleW > 30) {
    globalGridSize = 35;
  } else if(puzzleW > 20) {
    globalGridSize = 40;
  } else if(puzzleW <= 10) {
    globalGridSize = 50;
  } else {
    globalGridSize = 45;
  }
}

function initYXFromArray(ymax,xmax,array) {
  let yxArray = new Array(ymax);
  for (let y=0;y<ymax;y++) {
    yxArray[y] = new Array(xmax);
    for (let x=0;x<xmax;x++) {
      yxArray[y][x] = array[y][x];
    }
  }
  return yxArray;
}

function initYXFromValue(value) {
  let yxArray = new Array(globalPuzzleH);
  for (let y=0;y<globalPuzzleH;y++) {
    yxArray[y] = new Array(globalPuzzleW);
    for (let x=0;x<globalPuzzleW;x++) {
      yxArray[y][x] = value;
    }
  }
  return yxArray;
}

function initYX2FromValue(value) {
  let yxArray = new Array(globalPuzzleH*2+1);
  for (let y=0;y<=2*globalPuzzleH;y++) {
    yxArray[y] = new Array(globalPuzzleW*2+1);
    for (let x=0;x<=2*globalPuzzleW;x++) {
      yxArray[y][x] = value;
    }
  }
  return yxArray;
}

function initBoardValuesFromParams(numParamText,hasDir=false,charForNum=false) {
  // first figure out if this is a completed path type (eg. Masyu), in
  // which case it will have [FJ7L|_] to indicate path segments.
  // if so, then we need to treat the FJL7|_ characters as line
  // and ignore in board values
  let isFullPathType = false;
  if ((numParamText.search(/F/) != -1) && (numParamText.search(/|/) != -1) &&
      (numParamText.search(/J/) != -1) && (numParamText.search(/_/) != -1) &&
      (numParamText.search(/7/) != -1) && (numParamText.search(/L/) != -1)) {
    isFullPathType = true;
  }
  // similar for tree path type (eg. Hashi)
  let isTreePathType = false;
  if ((numParamText.search(/#/) != -1) && (numParamText.search(/=/) != -1) &&
      (numParamText.search(/|/) != -1) && (numParamText.search(/_/) != -1)) {
    isTreePathType = true;
  }
  // special case for hasDir; 1v (2v 3v etc) indicates a south
  // arrow so we need to convert those to another character
  // before expandNumParams
  if (hasDir) {
    numParamText = numParamText.replace(/([0-9])v/g, "$1%");
  }
  let numParams = expandNumParams(numParamText).split("");
  if (charForNum) {
    for (let i=0;i<numParams.length;i++) {
      let val = numParams[i];
      if (val.search(/[A-J]/) != -1) {
        numParams[i] = parseInt(val,36) - 10;
      }
      if (val.search(/[K-T]/) != -1) {
        numParams[i] = parseInt(val,36) - 20;
      }
    }
  }
  if (!hasDir && (numParams.length != (globalPuzzleH*globalPuzzleW))) {
    throw "ERROR in puzzle descriptor nums, got length " + numParams.length +
          " expected " + (globalPuzzleH*globalPuzzleW);
  }
  let boardValues = new Array(globalPuzzleH);
  let scoot = 0;  // only used for hasDir
  for (let y=0;y<globalPuzzleH;y++) {
    boardValues[y] = new Array(globalPuzzleW);
    for (let x=0;x<globalPuzzleW;x++) {
      let ptr = y*globalPuzzleW+x+scoot;
      let param = numParams[ptr];
      if (hasDir &&
          // 7 is saved in fullpath params (example completed
          // puzzles) for path turns
          (( isFullPathType && param.search(/[0-6]/) != -1) ||
           (!isFullPathType && param.search(/[0-9]/) != -1))) {
        let paramDir = numParams[y*globalPuzzleW+x+scoot+1];
        paramDir = paramDir.replace(/\%/,"v");
        scoot++;
        // look for a number always followed by direction
        boardValues[y][x] = param + paramDir;
      } else {
        boardValues[y][x] =
          (param == '-') ? "" :
          (param == '*') ? "" :
          (param == '@') ? "" :
          (param == '_') ? "" :
          (isFullPathType && (param.search(/[FJL7\|]/)!=-1)) ? "" :
          (isTreePathType && (param.search(/[#=\|]/  )!=-1)) ? "" :
            parseInt(param,36);
      }
    }
  }
  if (hasDir && (numParams.length != (globalPuzzleH*globalPuzzleW+scoot))) {
    throw "ERROR in puzzle descriptor nums, got length " + numParams.length +
          " expected " + (globalPuzzleH*globalPuzzleW+scoot);
  }
  return boardValues;
}

function initLineValuesFromParams(numParamText,hasDir=false) {
  // first figure out if this is even a completed type, in
  // which case it will have |s and _s to indicate path segments.
  // if not, then there are no line values. if so, then we need
  // to treat the FJL7|_ characters as line segments
  let lineValues;
  if (numParamText &&
      (numParamText.search(/F/)!=-1) && (numParamText.search(/J/)!=-1) &&
      (numParamText.search(/7/)!=-1) && (numParamText.search(/L/)!=-1)) {
    // special case for hasDir; 1v (2v 3v etc) indicates a south
    // arrow so we need to convert those to another character
    // before expandNumParams
    if (hasDir) {
      numParamText = numParamText.replace(/([0-9])v/g, "$1%");
    }
    let numParams = expandNumParams(numParamText).split("");
    lineValues = new Array(globalPuzzleH);
    let scoot = 0;  // only used for hasDir
    for (let y=0;y<globalPuzzleH;y++) {
      lineValues[y] = new Array(globalPuzzleW);
      for (let x=0;x<globalPuzzleW;x++) {
        let ptr = y*globalPuzzleW+x+scoot;
        let param = numParams[ptr];
        // for filled-in final solutions, only works for digit-arrows
        // up to 6 since 7 is used for path turns
        if (hasDir && param.search(/[0-6]/) != -1) {
          let paramDir = numParams[y*globalPuzzleW+x+scoot+1];
          paramDir = paramDir.replace(/\%/,"v");
          scoot++;
          // look for a number always followed by direction
          lineValues[y][x] = param + paramDir;
        } else {
          lineValues[y][x] =
            (param == '-') ? "" :
            (param == '*') ? "" : convertPathCharToCode(param);
        }
      }
    }
    if (hasDir && (numParams.length != (globalPuzzleH*globalPuzzleW+scoot))) {
      throw "ERROR in puzzle descriptor nums, got length " + numParams.length +
            " expected " + (globalPuzzleH*globalPuzzleW+scoot);
      return;
    }
  } else {
    lineValues = initYXFromValue(0);
  }
  return lineValues;
}

// for heyawake and other box-based puzzles, need 0-9A-Za-z encoding for coordinate locations
function parseBase62(val) {
  let conv;
  if (val.search(/^[a-z]$/) != -1) {
    conv = parseInt(val,36) + 26;
  } else {
    conv = parseInt(val,36);
  }
  return conv;
}

function initBoardValuesFromBoxes(boxParams) {
  let boxParamArray = boxParams.replace(/\./gi, "").split("");

  // for error checking, make sure the descriptor hasn't double
  // counted or missed any squares with the boxes
  let cellCounts = new Array(globalPuzzleH);
  let boardValues = new Array(globalPuzzleH);
  for (let y=0;y<globalPuzzleH;y++) {
    cellCounts[y] = new Array(globalPuzzleW);
    boardValues[y] = new Array(globalPuzzleW);
    for (let x=0;x<globalPuzzleW;x++) {
      cellCounts[y][x] = 0;
      boardValues[y][x] = "";
    }
  }

  let totalCount = 0;
  let inError = 0;
  for (let b=0;b<boxParamArray.length;b+=5) {
    let by = parseBase62(boxParamArray[b+0]);
    let bx = parseBase62(boxParamArray[b+1]);
    let bh = parseBase62(boxParamArray[b+2]);
    let bw = parseBase62(boxParamArray[b+3]);
    let bd = boxParamArray[b+4];
    if (bd != "-") {
      boardValues[by][bx] = bd;
    }
    for (let y=by;y<(by+bh);y++) {
      for (let x=bx;x<(bx+bw);x++) {
        if (y>=globalPuzzleH) {
          throw "ERROR: cell " + y + "," + x + " extends beyond puzzle board";
          inError = 1;
        }
        if (x>=globalPuzzleW) {
          throw "ERROR: cell " + y + "," + x + " extends beyond puzzle board";
          inError = 1;
        }
        totalCount++;
        if (cellCounts[y][x] != 0) {
          throw "ERROR: cell " + y + "," + x + " is used by two box descriptors";
          inError = 1;
        }
        cellCounts[y][x]++;
      }
    }
  }
  if (totalCount != (globalPuzzleH*globalPuzzleW)) {
    throw "ERROR: box descriptors only cover " + totalCount +
          " of the required " + (globalPuzzleH*globalPuzzleW) + " cells";
    inError = 1;
  }
  if (inError) {
    return;
  }
  return boardValues;
}

function initBoardColorsFromParams(numParamText) {
  let numParams = expandNumParams(numParamText);
  let boardColors = new Array(globalPuzzleH);
  for (let y=0;y<globalPuzzleH;y++) {
    boardColors[y] = new Array(globalPuzzleW);
    for (let x=0;x<globalPuzzleW;x++) {
      boardColors[y][x] =
        (numParams[y*globalPuzzleW+x] == '-') ? "white" :
          numberColor[numParams[y*globalPuzzleW+x]];
    }
  }
  return boardColors;
}

function initBoardColorsBlackWhite(numParamText) {
  let numParams = expandNumParams(numParamText);
  let boardColors = new Array(globalPuzzleH);
  for (let y=0;y<globalPuzzleH;y++) {
    boardColors[y] = new Array(globalPuzzleW);
    for (let x=0;x<globalPuzzleW;x++) {
      boardColors[y][x] =
        (numParams[y*globalPuzzleW+x] == '-') ? "white" :
        (numParams[y*globalPuzzleW+x] == '@') ? "white" : "black";
    }
  }
  return boardColors;
}

function initBoolenBoardFromHexes(hexParams) {
  let hexArray = hexParams.split("");
  let binArray = new Array(globalPuzzleH);
  for (let y=0;y<globalPuzzleH;y++) {
    binArray[y] = new Array(globalPuzzleW);
    for (let x=0;x<globalPuzzleW;x++) {
      let hexVal = hexArray[y*Math.ceil(globalPuzzleW/4)+Math.floor(x/4)];
      binArray[y][x] = (parseInt(hexVal,16) & (1<<(3-(x%4)))) ? true : false;
    }
  }
  return binArray;
}

function initBoardColorsFromHexes(shadeParams,setColor) {
  let shadeHexes = shadeParams.split("");
  let boardColors = new Array(globalPuzzleH);
  for (let y=0;y<globalPuzzleH;y++) {
    boardColors[y] = new Array(globalPuzzleW);
    for (let x=0;x<globalPuzzleW;x++) {
      let shadeHex = shadeHexes[y*Math.ceil(globalPuzzleW/4)+Math.floor(x/4)];
      let shadeTrue = (parseInt(shadeHex,16) & (1<<(3-(x%4)))) ? 1 : 0;
      boardColors[y][x] = shadeTrue ? setColor : "white";
    }
  }
  return boardColors;
}

function initWallStates(wallState,borderState) {
  let wallStates  = new Array(globalPuzzleH*2+1);
  // "true" wall states are all dashes at first
  for (let y=0;y<=2*globalPuzzleH;y++) {
    wallStates[y] = new Array(2*globalPuzzleW+1);
    for (let x=0;x<=2*globalPuzzleW;x++) {
      if (y==0 || y==(2*globalPuzzleH) || x==0 || x==(2*globalPuzzleW)) {
        wallStates[y][x] = borderState;
      } else if(y%2 && x%2) {
        wallStates[y][x] = constWallNone;
      } else {
        wallStates[y][x] = wallState;
      }
    }
  }
  return wallStates;
}

function initWallStatesFromBoxes(boxParams,defState,hasNum=true) {
  let boxParamArray = boxParams.replace(/\./gi, "").split("");
  let wallStates  = new Array(globalPuzzleH*2+1);
  // "true" wall states are all defState at first
  for (let y=0;y<=2*globalPuzzleH;y++) {
    wallStates[y] = new Array(2*globalPuzzleW+1);
    for (let x=0;x<2*globalPuzzleW;x++) {
      if (y==0 || y==(2*globalPuzzleH) || x==0 || x==(2*globalPuzzleW)) {
        wallStates[y][x] = constWallBorder;
      } else if(y%2 && x%2) {
        wallStates[y][x] = constWallNone;
      } else {
        wallStates[y][x] = defState;
      }
    }
  }
  // hasNum is true for Heyawake and puzzles that initialize with a
  // number inside them, false for Shikaku and puzzles that don't
  let incr = hasNum ? 5 : 4;
  for (let b=0;b<boxParamArray.length;b+=incr) {
    let by = parseBase62(boxParamArray[b+0]);
    let bx = parseBase62(boxParamArray[b+1]);
    let bh = parseBase62(boxParamArray[b+2]);
    let bw = parseBase62(boxParamArray[b+3]);

    // top wall
    for (let i=0;i<bw;i++) {
      wallStates[by*2][(bx+i)*2+1] = constWallBorder;
    }
    // bottom wall
    for (let i=0;i<bw;i++) {
      wallStates[(by+bh)*2][(bx+i)*2+1] = constWallBorder;
    }
    // west wall
    for (let i=0;i<bh;i++) {
      wallStates[(by+i)*2+1][bx*2] = constWallBorder;
    }
    // east wall
    for (let i=0;i<bh;i++) {
      wallStates[(by+i)*2+1][(bx+bw)*2] = constWallBorder;
    }
  }
  return wallStates;
}

function initWallStatesFromRooms(rooms,defState) {
  let wallStates  = new Array(globalPuzzleH*2+1);
  // "true" wall states are all defState at first
  for (let y=0;y<=2*globalPuzzleH;y++) {
    wallStates[y] = new Array(2*globalPuzzleW+1);
    for (let x=0;x<2*globalPuzzleW;x++) {
      if (y==0 || y==(2*globalPuzzleH) || x==0 || x==(2*globalPuzzleW)) {
        wallStates[y][x] = constWallBorder;
      } else if(y%2 && x%2) {
        wallStates[y][x] = constWallNone;
      } else {
        wallStates[y][x] = defState;
      }
    }
  }
  for (let room of rooms) {
    let by = room[0];
    let bx = room[1];
    let bh = room[2];
    let bw = room[3];

    // top wall
    for (let i=0;i<bw;i++) {
      wallStates[by*2][(bx+i)*2+1] = constWallBorder;
    }
    // bottom wall
    for (let i=0;i<bw;i++) {
      wallStates[(by+bh)*2][(bx+i)*2+1] = constWallBorder;
    }
    // west wall
    for (let i=0;i<bh;i++) {
      wallStates[(by+i)*2+1][bx*2] = constWallBorder;
    }
    // east wall
    for (let i=0;i<bh;i++) {
      wallStates[(by+i)*2+1][(bx+bw)*2] = constWallBorder;
    }
  }
  return wallStates;
}

function initRoomsFromBoxes(boxParams) {
  let boxParamArray = boxParams.replace(/\./gi, "").split("");
  let roomStates  = new Array();
  for (let b=0;b<boxParamArray.length;b+=5) {
    let by = parseBase62(boxParamArray[b+0]);
    let bx = parseBase62(boxParamArray[b+1]);
    let bh = parseBase62(boxParamArray[b+2]);
    let bw = parseBase62(boxParamArray[b+3]);
    let bd = parseBase62(boxParamArray[b+4]);
    let count = (bd == '-') ? constEmptyCell : bd;
    roomStates.push([by,bx,bh,bw,count]);
  }
  return roomStates;
}

function initWallStatesFromHexes(hexParamsRows,hexParamsCols,setState,defState,hasBorder=true) {
  let hexParamArrayRows = hexParamsRows.replace(/\./gi, "").split("");
  let hexParamArrayCols = hexParamsCols.replace(/\./gi, "").split("");
  let wallStates  = new Array(globalPuzzleH*2+1);
  // if it has a solid border, we only need hexes between rows and columns;
  // without we need one extra on both ends
  let add = hasBorder ? 2 : 4;
  let expLenH = Math.floor((globalPuzzleW+add)/4)*globalPuzzleH;
  let expLenW = Math.floor((globalPuzzleH+add)/4)*globalPuzzleW;
  if (expLenH != hexParamArrayRows.length) {
    throw "ERROR in puzzle descriptor row walls, got length " + hexParamArrayRows.length +
          " expected " + expLenH;
    return;
  }
  if (expLenW != hexParamArrayCols.length) {
    throw "ERROR in puzzle descriptor col walls, got length " + hexParamArrayCols.length +
          " expected " + expLenW;
    return;
  }
  // "true" wall states are all dashes at first
  for (let y=0;y<=2*globalPuzzleH;y++) {
    wallStates[y] = new Array(2*globalPuzzleW+1);
    for (let x=0;x<=2*globalPuzzleW;x++) {
      if (hasBorder && (y==0 || y==(2*globalPuzzleH) || x==0 || x==(2*globalPuzzleW))) {
        wallStates[y][x] = constWallBorder;
      } else if(y%2 && x%2) {
        wallStates[y][x] = constWallNone;
      } else {
        wallStates[y][x] = defState;
      }
    }
  }
  // do horizontals first
  let ptr = 0;
  let bit = 0;
  for (let y=1;y<=2*globalPuzzleH;y+=2) {
    if (bit != 0) {
      ptr++;
      bit=0;
    }
    let xs = hasBorder ? 2 : 0;
    let xe = hasBorder ? (2*globalPuzzleW-1) : (2*globalPuzzleW+1);
    for (let x=xs;x<xe;x+=2) {
      let hexval = parseInt(hexParamArrayRows[ptr],16);
      let bitval = (hexval >> (3-bit)) & 1;
      if (bitval) {
        wallStates[y][x] = setState;
      }
      if (bit==3) {
        ptr++;
        bit = 0;
      } else {
        bit++;
      }
    }
  }
  // verticals
  ptr = 0;
  bit = 0;
  for (let x=1;x<2*globalPuzzleW;x+=2) {
    if (bit != 0) {
      ptr++;
      bit=0;
    }
    let ys = hasBorder ? 2 : 0;
    let ye = hasBorder ? (2*globalPuzzleH-1) : (2*globalPuzzleH+1);
    for (let y=ys;y<ye;y+=2) {
      let hexval = parseInt(hexParamArrayCols[ptr],16);
      let bitval = (hexval >> (3-bit)) & 1;
      if (bitval) {
        wallStates[y][x] = setState;
      }
      if (bit==3) {
        ptr++;
        bit = 0;
      } else {
        bit++;
      }
    }
  }
  return wallStates;
}

function drawBoard() {
  // clear the canvas
  globalContext.clearRect(0,0,canvas.width,canvas.height);
  // draw each tile
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      drawTile(y,x,
               globalBoardColors[y][x],
               globalBoardValues[y][x],
               globalTextBold[y][x],
               globalCircleStates[y][x],
               globalCircleColors[y][x],
               globalLineStates[y][x],
               globalLineColors[y][x],
               globalLineFirst,
               globalBoardTextColors[y][x],
               globalBoardTextOppColors[y][x]);
    }
  }
  // draw horizontal walls
  for (let y=0;y<=2*globalPuzzleH;y+=2) {
    for (let x=1;x<=2*globalPuzzleW;x+=2) {
      drawWall(constHoriz,y,x,globalWallStates[y][x],globalWallColors[y][x],globalDotColors[y][x]);
    }
  }
  // draw vertical walls
  for (let y=1;y<=2*globalPuzzleH;y+=2) {
    for (let x=0;x<=2*globalPuzzleW;x+=2) {
      drawWall(constVert,y,x,globalWallStates[y][x],globalWallColors[y][x],globalDotColors[y][x]);
    }
  }
  if (globalCursorOn) {
    drawCursor();
  }
  if (globalWallCursorOn) {
    drawWallCursor();
  }
  if (globalDrawDots) {
    for (let y=0;y<=globalPuzzleH;y++) {
      for (let x=0;x<=globalPuzzleW;x++) {
        drawDot(y,x);
      }
    }
  }
}

function drawTile(y,x,color,value,isbold,circle,circlecolor,line,lineColor,lineFirst,textColor,oppTextColor) {
  let drawX = Math.floor(x*globalGridSize)+globalBorderMargin;
  let drawY = Math.floor(y*globalGridSize)+globalBorderMargin;
  globalContext.fillStyle = color;
  globalContext.fillRect(drawX,drawY,globalGridSize,globalGridSize);
  if (lineFirst) {
    drawLine(y,x,line,lineColor);
  }
  // draw circle next if it exists
  if (circle) {
    // "circle" might be a triangle for Shakashaka
    if (circle >= constCircleTriNE) {
      let cornersY = [drawY,drawY,drawY+globalGridSize,drawY+globalGridSize];
      let cornersX = [drawX,drawX+globalGridSize,drawX+globalGridSize,drawX];
      let drawY1 = cornersY[(circle-constCircleTriNE)%4];
      let drawX1 = cornersX[(circle-constCircleTriNE)%4];
      let drawY2 = cornersY[(circle-constCircleTriNE+1)%4];
      let drawX2 = cornersX[(circle-constCircleTriNE+1)%4];
      let drawY3 = cornersY[(circle-constCircleTriNE+2)%4];
      let drawX3 = cornersX[(circle-constCircleTriNE+2)%4];
      globalContext.fillStyle = circlecolor;
      globalContext.beginPath();
      globalContext.moveTo(drawX1,drawY1);
      globalContext.lineTo(drawX2,drawY2);
      globalContext.lineTo(drawX3,drawY3);
      globalContext.closePath();
      globalContext.fill();
    } else {
      let radius = (circle==constCircleDot) ? globalCircleRadius*globalGridSize*0.35 :
                                          globalCircleRadius*globalGridSize;
      globalContext.lineWidth = 4.0;
      globalContext.strokeStyle = circlecolor;
      globalContext.fillStyle = (circle>=constCircleBlack) ? circlecolor : "white";
      globalContext.beginPath();
      globalContext.arc(drawX+globalGridSize/2,
                        drawY+globalGridSize/2,
                        radius,0,2*Math.PI);
      globalContext.stroke();
      globalContext.fill();
      // if constCircleMoon draw another white one to eclipse the original one
      if (circle==constCircleMoon) {
        globalContext.strokeStyle = "white";
        globalContext.fillStyle = "white";
        globalContext.beginPath();
        globalContext.arc(drawX+globalGridSize*0.42,
                          drawY+globalGridSize*0.42,
                          radius*0.84,0,2*Math.PI);
        globalContext.stroke();
        globalContext.fill();
      }
    }
  }
  // now text of value
  let vstr = "";
  globalContext.textAlign = "center";
  globalContext.fillStyle = textColor;
  globalContext.font = (globalGridSize*globalFontSize) + 'pt Courier, sans-serif';
  if (isbold) {
    globalContext.font = "bold " + globalContext.font;
  }
  if (isNaN(value) == false) {
    vstr = value;
  } else if (value.search(/^[A-Z0-9]$/) != -1) {
    vstr = parseInt(value, 36);
  } else if (isNaN(value)) { // arrows for Yajilin
    let valueArray = value.split("");
    if (valueArray.length == 2) {
      switch (valueArray[1]) {
        case "^":
          vstr = valueArray[0] + '\u2191';
          break;
        case ">":
          vstr = valueArray[0] + '\u2192';
          break;
        case "<":
          vstr = valueArray[0] + '\u2190';
          break;
        case "v":
          vstr = valueArray[0] + '\u2193';
          break;
      }
    }
  }
  if (globalTextOutline) {
    globalContext.strokeStyle = textColor;
    globalContext.lineWidth = 4;
    globalContext.strokeText(vstr, drawX+(globalGridSize*0.5), drawY+(globalGridSize*(0.46+globalFontSize*0.5)));
    globalContext.fillStyle = oppTextColor;
    globalContext.fillText  (vstr, drawX+(globalGridSize*0.5), drawY+(globalGridSize*(0.46+globalFontSize*0.5)));
  } else {
    globalContext.fillText(vstr, drawX+(globalGridSize*0.5), drawY+(globalGridSize*(0.46+globalFontSize*0.5)));
  }


  if (!lineFirst) {
    drawLine(y,x,line,lineColor);
  }
}

function drawCursor() {
  let drawX = Math.floor(globalCursorX*globalGridSize)+globalBorderMargin+1;
  let drawY = Math.floor(globalCursorY*globalGridSize)+globalBorderMargin+1;
  globalContext.lineWidth = 4;
  globalContext.strokeStyle = constColorCursor;
  globalContext.strokeRect(drawX,drawY,globalGridSize-2,globalGridSize-2);
}

function drawWallCursor() {
  let drawX1 = (globalWallCursorX%2) ? ((globalWallCursorX-1)*globalGridSize*0.5+globalBorderMargin) : (globalWallCursorX*globalGridSize*0.5+globalBorderMargin);
  let drawX2 = (globalWallCursorX%2) ? ((globalWallCursorX+1)*globalGridSize*0.5+globalBorderMargin) : (globalWallCursorX*globalGridSize*0.5+globalBorderMargin);
  let drawY1 = (globalWallCursorY%2) ? ((globalWallCursorY-1)*globalGridSize*0.5+globalBorderMargin) : (globalWallCursorY*globalGridSize*0.5+globalBorderMargin);
  let drawY2 = (globalWallCursorY%2) ? ((globalWallCursorY+1)*globalGridSize*0.5+globalBorderMargin) : (globalWallCursorY*globalGridSize*0.5+globalBorderMargin);
  let isDot = ((globalWallCursorX%2) || (globalWallCursorY%2)) ? false : true;
  let isHorz = (globalWallCursorX%2);
  if (isDot) {
    globalContext.lineWidth = 1;
    globalContext.fillStyle = constColorCursor;
    globalContext.beginPath();
    globalContext.arc(drawX1,drawY1,0.1*globalGridSize,0,2*Math.PI);
    globalContext.fill();
  } else {
    globalContext.lineWidth = 4;
    globalContext.strokeStyle = constColorCursor;
    globalContext.fillStyle = "none";
    if (isHorz) {
      globalContext.strokeRect(drawX1,drawY1-4,globalGridSize-2,8);
    } else {
      globalContext.strokeRect(drawX1-4,drawY1,8,globalGridSize-2);
    }
  }
}

function drawWall(horv,y,x,wallState,lineColor,dotColor) {
  let drawXM = x*globalGridSize*0.5+globalBorderMargin;
  let drawYM = y*globalGridSize*0.5+globalBorderMargin;
  let drawX1 = (horv == constHoriz) ? (drawXM-globalGridSize*0.5) : drawXM;
  let drawX2 = (horv == constHoriz) ? (drawXM+globalGridSize*0.5) : drawXM;
  let drawY1 = (horv == constVert)  ? (drawYM-globalGridSize*0.5) : drawYM;
  let drawY2 = (horv == constVert)  ? (drawYM+globalGridSize*0.5) : drawYM;
  globalContext.strokeStyle = lineColor;
  if ((wallState != constWallNone) && (wallState != constWallX)) {
    // check for dashed, but not overridden with "harder" border
    let hardEdge = constWallBorder | constWallUserEdge | constWallSolveEdge;
    if ((wallState & (constWallDash | hardEdge)) == constWallDash) {
      globalContext.setLineDash([2,2]);
      globalContext.lineWidth = 1;
    } else {
      if ((wallState & hardEdge) != 0) {
        globalContext.lineWidth = 3;
      } else if (wallState == constWallLight) {
        globalContext.lineWidth = 0.5;
      } else {
        globalContext.lineWidth = 1;
      }
    }
    globalContext.beginPath();
    globalContext.moveTo(drawX1,drawY1);
    globalContext.lineTo(drawX2,drawY2);
    globalContext.stroke();
  }
  // reset dash
  globalContext.setLineDash([]);
  if (wallState & constWallDot) {
    let radius = globalCircleRadius*globalGridSize*0.35;
    globalContext.lineWidth = 4.0;
    globalContext.strokeStyle = dotColor;
    globalContext.fillStyle = dotColor;
    globalContext.beginPath();
    globalContext.arc(drawXM,drawYM,radius,0,2*Math.PI);
    globalContext.stroke();
    globalContext.fill();
  }
  if (wallState & constWallX) {
    let xw = globalGridSize*0.06;
    globalContext.lineWidth = 2.0;
    globalContext.beginPath();
    globalContext.moveTo(drawXM-xw,drawYM-xw);
    globalContext.lineTo(drawXM+xw,drawYM+xw);
    globalContext.moveTo(drawXM-xw,drawYM+xw);
    globalContext.lineTo(drawXM+xw,drawYM-xw);
    globalContext.stroke();
  }
  // reset lineWidth
  globalContext.lineWidth = 1;
}

function drawDot(y,x) {
  let drawX = Math.floor(x*globalGridSize)+globalBorderMargin;
  let drawY = Math.floor(y*globalGridSize)+globalBorderMargin;
  globalContext.lineWidth = 1;
  globalContext.fillStyle = "black";
  globalContext.beginPath();
  globalContext.arc(drawX,drawY,0.06*globalGridSize,0,2*Math.PI);
  globalContext.fill();
}

function drawLine(y,x,state,color) {
  // special case for "line dot"
  if (state == constPathDot) {
    let drawX = Math.floor((x+0.5)*globalGridSize)+globalBorderMargin;
    let drawY = Math.floor((y+0.5)*globalGridSize)+globalBorderMargin;
    globalContext.strokeStyle = color;
    globalContext.lineWidth = 1;
    globalContext.fillStyle = "black";
    globalContext.beginPath();
    globalContext.arc(drawX,drawY,0.05*globalGridSize,0,2*Math.PI);
    globalContext.fill();
    return;
  }
  if (((state & constPathLine) == constPathLine) &&
      ((state & constPathAll)  != 0)) {
    // now walk through each of the 4 directions to check for one
    // or two line segments
    globalContext.strokeStyle = color;
    globalContext.lineWidth = 1.5;
    for (i=0;i<4;i++) { // in order: N,W,S,E
      let drawX1, drawX2, drawX3, drawX4, drawY1, drawY2, drawY3, drawY4;
      let drawSingle = ((state & (0b01<<(2*i))) != 0) ? true : false;
      let drawDouble = ((state & (0b10<<(2*i))) != 0) ? true : false;
      if (drawSingle || drawDouble) {
        let offset = drawSingle ? 0 : (0.075*globalGridSize);
        let centerX = Math.floor((x+0.5)*globalGridSize)+globalBorderMargin;
        let centerY = Math.floor((y+0.5)*globalGridSize)+globalBorderMargin;
        let halfCell = Math.floor(0.5*globalGridSize);
        switch (i) {
          case 0:         // N
            globalContext.beginPath();
            globalContext.moveTo(centerX-offset,centerY);
            globalContext.lineTo(centerX-offset,centerY-halfCell);
            globalContext.stroke();
            if (drawDouble) {
              globalContext.beginPath();
              globalContext.moveTo(centerX+offset,centerY);
              globalContext.lineTo(centerX+offset,centerY-halfCell);
              globalContext.stroke();
            }
            break;
          case 1:         // W
            globalContext.beginPath();
            globalContext.moveTo(centerX,         centerY-offset);
            globalContext.lineTo(centerX-halfCell,centerY-offset);
            globalContext.stroke();
            if (drawDouble) {
              globalContext.beginPath();
              globalContext.moveTo(centerX,         centerY+offset);
              globalContext.lineTo(centerX-halfCell,centerY+offset);
              globalContext.stroke();
            }
            break;
          case 2:         // S
            globalContext.beginPath();
            globalContext.moveTo(centerX-offset,centerY);
            globalContext.lineTo(centerX-offset,centerY+halfCell);
            globalContext.stroke();
            if (drawDouble) {
              globalContext.beginPath();
              globalContext.moveTo(centerX+offset,centerY);
              globalContext.lineTo(centerX+offset,centerY+halfCell);
              globalContext.stroke();
            }
            break;
          case 3:         // E
            globalContext.beginPath();
            globalContext.moveTo(centerX,         centerY-offset);
            globalContext.lineTo(centerX+halfCell,centerY-offset);
            globalContext.stroke();
            if (drawDouble) {
              globalContext.beginPath();
              globalContext.moveTo(centerX,         centerY+offset);
              globalContext.lineTo(centerX+halfCell,centerY+offset);
              globalContext.stroke();
            }
            break;
        }
      }
    }
  }
}

// convert click coordinates to tile and edge click info
//
// returns [vcell, hcell, isCorner, isEdge, vedge, hedge ]

function getClickCellInfo(evnt, canvas) {
  let rect = elemStruct.canvas.getBoundingClientRect();
  let borderTop  = parseInt(getComputedStyle(elemStruct.canvas).borderTopWidth);
  let borderLeft = parseInt(getComputedStyle(elemStruct.canvas).borderLeftWidth);
  let yCoord = evnt.pageY - rect.top  - window.scrollY - borderTop  - globalBorderMargin;
  let xCoord = evnt.pageX - rect.left - window.scrollX - borderLeft - globalBorderMargin;
  let vertCell = Math.floor(yCoord/globalGridSize);
  let horzCell = Math.floor(xCoord/globalGridSize);
  let horzDistFromEdgeL = Math.abs((horzCell  )*globalGridSize - xCoord);
  let horzDistFromEdgeR = Math.abs((horzCell+1)*globalGridSize - xCoord);
  let vertDistFromEdgeU = Math.abs((vertCell  )*globalGridSize - yCoord);
  let vertDistFromEdgeD = Math.abs((vertCell+1)*globalGridSize - yCoord);
  let isCloseL = (horzDistFromEdgeL < (globalGridSize*0.15));
  let isCloseR = (horzDistFromEdgeR < (globalGridSize*0.15));
  let isCloseU = (vertDistFromEdgeU < (globalGridSize*0.15));
  let isCloseD = (vertDistFromEdgeD < (globalGridSize*0.15));
  if (isCloseU && isCloseL) {
    return [ vertCell, horzCell, true, false, 2*vertCell,   2*horzCell ];
  } else if (isCloseD && isCloseL) {
    return [ vertCell, horzCell, true, false, 2*vertCell+2, 2*horzCell ];
  } else if (isCloseU && isCloseR) {
    return [ vertCell, horzCell, true, false, 2*vertCell,   2*horzCell+2 ];
  } else if (isCloseD && isCloseR) {
    return [ vertCell, horzCell, true, false, 2*vertCell+2, 2*horzCell+2 ];
  } else if (isCloseL) {
    return [ vertCell, horzCell, false, true, 2*vertCell+1, 2*horzCell ];
  } else if (isCloseR) {
    return [ vertCell, horzCell, false, true, 2*vertCell+1, 2*horzCell+2 ];
  } else if (isCloseU) {
    return [ vertCell, horzCell, false, true, 2*vertCell,   2*horzCell+1 ];
  } else if (isCloseD) {
    return [ vertCell, horzCell, false, true, 2*vertCell+2, 2*horzCell+1 ];
  } else {
    return [ vertCell, horzCell, false, false, vertCell*2+1, horzCell*2+1 ];
  }
}

function eqCompare(testValue,isEqual,compValue) {
  if (isEqual && (testValue == compValue)) {
    return true;
  } else if (!isEqual && (testValue != compValue)) {
    return true;
  } else {
    return false;
  }
}

function travelRiver(arrayYX,y,x,isEqual,testValue,checkRoom=false,roomArray=null) {
  let riverCells = new Array();
  let tryindex = 0;
  riverCells.push(y+","+x);
  while (riverCells.length > tryindex) {
    let curCell = riverCells[tryindex].split(",");
    let iy = parseInt(curCell[0]);
    let ix = parseInt(curCell[1]);
    if ((iy != (globalPuzzleH-1)) &&
        (riverCells.indexOf((iy+1)+","+ix) == -1) &&
        eqCompare(arrayYX[iy+1][ix],isEqual,testValue) &&
        (!checkRoom || (roomArray.indexOf((iy+1)+","+ix)!=-1))) {
      riverCells.push((iy+1)+","+ix);
    }
    if ((iy != 0) &&
        (riverCells.indexOf((iy-1)+","+ix) == -1) &&
        eqCompare(arrayYX[iy-1][ix],isEqual,testValue) &&
        (!checkRoom || (roomArray.indexOf((iy-1)+","+ix)!=-1))) {
      riverCells.push((iy-1)+","+ix);
    }
    if ((ix != (globalPuzzleW-1)) &&
        (riverCells.indexOf(iy+","+(ix+1)) == -1) &&
        eqCompare(arrayYX[iy][ix+1],isEqual,testValue) &&
        (!checkRoom || (roomArray.indexOf(iy+","+(ix+1))!=-1))) {
      riverCells.push(iy+","+(ix+1));
    }
    if ((ix != 0) &&
        (riverCells.indexOf(iy+","+(ix-1)) == -1) &&
        eqCompare(arrayYX[iy][ix-1],isEqual,testValue) &&
        (!checkRoom || (roomArray.indexOf(iy+","+(ix-1))!=-1))) {
      riverCells.push(iy+","+(ix-1));
    }
    tryindex++;
  }
  return riverCells;
}

// similar to travelRiver, but looks for numbers, and reports
// back if there are spaces to grow into
function findDigitRoom(arrayYX,y,x,value) {
  let roomCells = new Array();
  let hasBlanks = false;
  let tryindex = 0;
  let debug = (y==14 && x==12) ? true : false;
  roomCells.push(y+","+x);
  while (roomCells.length > tryindex) {
    let curCell = roomCells[tryindex].split(",");
    let iy = parseInt(curCell[0]);
    let ix = parseInt(curCell[1]);
    if ((iy != (globalPuzzleH-1)) && (roomCells.indexOf((iy+1)+","+ix) == -1)) {
      if (arrayYX[iy+1][ix]==value) {
        roomCells.push((iy+1)+","+ix);
      } else if (arrayYX[iy+1][ix]=="") {
        hasBlanks = true;
      }
    }
    if ((iy != 0) && (roomCells.indexOf((iy-1)+","+ix) == -1)) {
      if (arrayYX[iy-1][ix]==value) {
        roomCells.push((iy-1)+","+ix);
      } else if (arrayYX[iy-1][ix]=="") {
        hasBlanks = true;
      }
    }
    if ((ix != (globalPuzzleW-1)) && (roomCells.indexOf(iy+","+(ix+1)) == -1)) {
      if (arrayYX[iy][ix+1]==value) {
        roomCells.push(iy+","+(ix+1));
      } else if (arrayYX[iy][ix+1]=="") {
        hasBlanks = true;
      }
    }
    if ((ix != 0) && (roomCells.indexOf(iy+","+(ix-1)) == -1)) {
      if (arrayYX[iy][ix-1]==value) {
        roomCells.push(iy+","+(ix-1));
      } else if (arrayYX[iy][ix-1]=="") {
        hasBlanks = true;
      }
    }
    tryindex++;
  }
  return [roomCells, hasBlanks];
}

function advanceLine(y,x,state,dir,clockwise) {
  let inerror = false;
  switch (state) {
    case constPathNone:   return [false,y,x,dir];
    case constPathDot:    return [false,y,x,dir];
    case constPathN:      if (dir!=0 && dir!='N') inerror = true; break;
    case constPathS:      if (dir!=0 && dir!='S') inerror = true; break;
    case constPathE:      if (dir!=0 && dir!='E') inerror = true; break;
    case constPathW:      if (dir!=0 && dir!='W') inerror = true; break;
    case constPathWE:
      if (( clockwise && dir==0) || dir=='W') return [true,y,x+1,'W'];
      if ((!clockwise && dir==0) || dir=='E') return [true,y,x-1,'E'];
      inerror = true;
      break;
    case constPathNS:
      if (( clockwise && dir==0) || dir=='N') return [true,y+1,x,'N'];
      if ((!clockwise && dir==0) || dir=='S') return [true,y-1,x,'S'];
      inerror = true;
      break;
    case constPathSE:
      if (( clockwise && dir==0) || dir=='S') return [true,y,x+1,'W'];
      if ((!clockwise && dir==0) || dir=='E') return [true,y+1,x,'N'];
      inerror = true;
      break;
    case constPathNW:
      if (( clockwise && dir==0) || dir=='N') return [true,y,x-1,'E'];
      if ((!clockwise && dir==0) || dir=='W') return [true,y-1,x,'S'];
      inerror = true;
      break;
    case constPathNE:
      if (( clockwise && dir==0) || dir=='N') return [true,y,x+1,'W'];
      if ((!clockwise && dir==0) || dir=='E') return [true,y-1,x,'S'];
      inerror = true;
      break;
    case constPathSW:
      if (( clockwise && dir==0) || dir=='S') return [true,y,x-1,'E'];
      if ((!clockwise && dir==0) || dir=='W') return [true,y+1,x,'N'];
      inerror = true;
      break;
  }
  if (inerror) {
    throw "ERROR: broken path, coming from " + y + "," + x + " with dir " + dir + " and found " + state;
  }
  return [false,y,x,dir];
}

// this routine travels the path and searches for line loops.
// it assumes everything is single-line paths

function travelLineLoop(arrayYX,y,x) {
  let lineCells = new Array();
  let isLoop = false;
  lineCells.push(y+","+x);
  // we really only need to try one direction to find out if it is
  // a loop or not. but if after completion it is not a loop, then
  // prepend in the other direction to get the full list of connected
  // cells
  let alive = true;
  let cy = y;
  let cx = x;
  let dir = 0;
  while (alive) {
    if ((dir!=0) && cy==y && cx==x) {
      isLoop = true;
      alive = false;
    } else {
      [alive,cy,cx,dir] = advanceLine(cy,cx,arrayYX[cy][cx],dir,true);
      if (alive) {
        lineCells.push(cy+","+cx);
      }
    }
  }

  // if not a loop, go backwards from beginning and prepend to path
  if (!isLoop) {
    alive = true;
    cy = y;
    cx = x;
    dir = 0;
    while (alive) {
      [alive,cy,cx,dir] = advanceLine(cy,cx,arrayYX[cy][cx],dir,false);
      if (alive) {
        lineCells.unshift(cy+","+cx);
      }
    }
  }
  return [lineCells,isLoop];
}

function wallHasEdge(y,x) {
  if (y<0) return false;
  if (x<0) return false;
  if (y>(2*globalPuzzleH)) return false;
  if (x>(2*globalPuzzleW)) return false;
  if ((globalWallStates[y][x] & (constWallUserEdge | constWallSolveEdge)) != 0) return true;
  return false;
}

function wallHasX(y,x) {
  // effectively, off board equals X
  if (y<0) return true;
  if (x<0) return true;
  if (y>(2*globalPuzzleH)) return true;
  if (x>(2*globalPuzzleW)) return true;
  if (globalWallStates[y][x] & constWallX) return true;
  return false;
}

function advanceWall (y,x,state,dir,clockwise) {
  // first figure out how many directions have walls. if none, then
  // it is an easy null return
  let ntrue = (y!=0) &&               wallHasEdge(y-1,x);
  let strue = (y!=globalPuzzleH*2) && wallHasEdge(y+1,x);
  let wtrue = (x!=0) &&               wallHasEdge(y,x-1);
  let etrue = (x!=globalPuzzleW*2) && wallHasEdge(y,x+1);

  // ignore segments that are in error
  let segcount = 0;
  if (ntrue) segcount++;
  if (strue) segcount++;
  if (wtrue) segcount++;
  if (etrue) segcount++;
  if (segcount > 2)            return [false,y,x,dir];

  if (clockwise) {
    if (ntrue && (dir != 'N')) return [true,y-2,x,'S'];
    if (etrue && (dir != 'E')) return [true,y,x+2,'W'];
    if (strue && (dir != 'S')) return [true,y+2,x,'N'];
    if (wtrue && (dir != 'W')) return [true,y,x-2,'E'];
  } else {
    if (wtrue && (dir != 'W')) return [true,y,x-2,'E'];
    if (strue && (dir != 'S')) return [true,y+2,x,'N'];
    if (etrue && (dir != 'E')) return [true,y,x+2,'W'];
    if (ntrue && (dir != 'N')) return [true,y-2,x,'S'];
  }
  return [false,y,x,dir];
}

// this routine travels the path and searches for wall loops
// using UserEdge only

function travelWallLoop(y,x) {
  let vertices = new Array();
  let isLoop = false;
  vertices.push(y+","+x);
  // we really only need to try one direction to find out if it is
  // a loop or not. but if after completion it is not a loop, then
  // prepend in the other direction to get the full list of connected
  // vertices

  let alive = true;
  let cy = y;
  let cx = x;
  let dir = 0;
  while (alive) {
    if ((dir!=0) && cy==y && cx==x) {
      isLoop = true;
      alive = false;
    } else {
      [alive,cy,cx,dir] = advanceWall(cy,cx,globalWallStates[cy][cx],dir,true);
      if (alive) {
        vertices.push(cy+","+cx);
      }
    }
  }

  // if not a loop, go backwards from beginning and prepend to path
  if (!isLoop) {
    alive = true;
    cy = y;
    cx = x;
    dir = 0;
    while (alive) {
      [alive,cy,cx,dir] = advanceWall(cy,cx,globalWallStates[cy][cx],dir,false);
      if (alive) {
        vertices.unshift(cy+","+cx);
      }
    }
  }
  return [vertices,isLoop];
}

// this routine travels the path and fans out in all directions.
// it can travel single-line and double-line paths

function travelPathNetwork(arrayYX,y,x) {
  let networkCells = new Array();
  let tryindex = 0;
  networkCells.push(y+","+x);
  while (networkCells.length > tryindex) {
    let curCell = networkCells[tryindex].split(",");
    let iy = parseInt(curCell[0]);
    let ix = parseInt(curCell[1]);
    if ((((globalLineStates[iy][ix] & constPathN)  == constPathN) ||
         ((globalLineStates[iy][ix] & constPath2N) == constPath2N)) &&
        (networkCells.indexOf((iy-1)+","+ix) == -1)) {
      networkCells.push((iy-1)+","+ix);
    }
    if ((((globalLineStates[iy][ix] & constPathW)  == constPathW) ||
         ((globalLineStates[iy][ix] & constPath2W) == constPath2W)) &&
        (networkCells.indexOf(iy+","+(ix-1)) == -1)) {
      networkCells.push(iy+","+(ix-1));
    }
    if ((((globalLineStates[iy][ix] & constPathS)  == constPathS) ||
         ((globalLineStates[iy][ix] & constPath2S) == constPath2S)) &&
        (networkCells.indexOf((iy+1)+","+ix) == -1)) {
      networkCells.push((iy+1)+","+ix);
    }
    if ((((globalLineStates[iy][ix] & constPathE)  == constPathE) ||
         ((globalLineStates[iy][ix] & constPath2E) == constPath2E)) &&
        (networkCells.indexOf(iy+","+(ix+1)) == -1)) {
      networkCells.push(iy+","+(ix+1));
    }
    tryindex++;
  }
  return networkCells;
}

function roomIsRectangle(roomSquares) {
  let xmin = 999;
  let ymin = 999;
  let xmax = 0;
  let ymax = 0;
  for (let sq of roomSquares) {
    let square = sq.split(",");
    ymin = (square[0] < ymin) ? square[0] : ymin;
    xmin = (square[1] < xmin) ? square[1] : xmin;
    ymax = (square[0] > ymax) ? square[0] : ymax;
    xmax = (square[1] > xmax) ? square[1] : xmax;
  }
  let area = (ymax-ymin+1)*(xmax-xmin+1);
  return (area == roomSquares.length) ? 1 : 0;
}

function findRooms() {
  let roomList = new Array();
  let coveredCells = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (coveredCells.indexOf(y+","+x) == -1) {
        let room = travelRoom(y,x);
        roomList.push(room);
        coveredCells.push.apply(coveredCells,room);
      }
    }
  }
  return roomList;
}

function travelRoom(y,x) {
  let room = new Array;
  let tryindex = 0;
  room.push(y+","+x);
  let mask = constWallBorder | constWallUserEdge | constWallSolveEdge;
  while (room.length > tryindex) {
    let curCell = room[tryindex].split(",");
    let iy = parseInt(curCell[0]);
    let ix = parseInt(curCell[1]);
    let wy = iy*2+1;
    let wx = ix*2+1;
    if ((iy != (globalPuzzleH-1)) &&
        (room.indexOf((iy+1)+","+ix) == -1) &&
        ((globalWallStates[wy+1][wx] & mask)==0)) {
      room.push((iy+1)+","+ix);
    }
    if ((iy != 0) &&
        (room.indexOf((iy-1)+","+ix) == -1) &&
        ((globalWallStates[wy-1][wx] & mask)==0)) {
      room.push((iy-1)+","+ix);
    }
    if ((ix != (globalPuzzleW-1)) &&
        (room.indexOf(iy+","+(ix+1)) == -1) &&
        ((globalWallStates[wy][wx+1] & mask)==0)) {
      room.push(iy+","+(ix+1));
    }
    if ((ix != 0) &&
        (room.indexOf(iy+","+(ix-1)) == -1) &&
        ((globalWallStates[wy][wx-1] & mask)==0)) {
      room.push(iy+","+(ix-1));
    }
    tryindex++;
  }
  return room;
}

// update data in .html doc
function updateHtmlText(spanName, value, isbutton=false) {
  let spanHandle = document.querySelector('#' + spanName);
  if (isbutton) {
    spanHandle.value = value;
  } else {
    spanHandle.innerHTML = value;
  }
}

function updateHtmlDescr(pdescr) {
  // these can get long, break into pieces
  if (pdescr) {
    // convert < and > to avoid issues, but we
    // need to put other text placeholder in there
    // to make sure they don't themselves get
    // broken up below
    pdescr = pdescr.replaceAll('<', '@');
    pdescr = pdescr.replaceAll('>', '#');
    let ptext = "puzzle descriptor:<br/>";
    while (pdescr.length > 120) {
      ptext += pdescr.substr(0,120) + "<br/>";
      pdescr = pdescr.substr(120);
    }
    ptext += pdescr;
    ptext = ptext.replaceAll('@', '&lt;');
    ptext = ptext.replaceAll('#', '&gt;');
    updateHtmlText('puzzledescr',  ptext);
  }
}

function updateStaticHtmlEntries(pdescr,edescr,pcnt,dpuzz,dpuzzlen) {
  updateHtmlDescr(pdescr);
  // edescr might have <contents> for some (like Yajilin), convert those to counterparts
  edescr = edescr.replaceAll('<', '&lt;');
  edescr = edescr.replaceAll('>', '&gt;');
  updateHtmlText('descr1',       edescr);
  updateHtmlText('puzzlecount1', pcnt-1);
  updateHtmlText('puzzlecount2', pcnt-1);
  updateHtmlText('demolist1',    dpuzz);
  updateHtmlText('demolist2',    dpuzz);
  updateHtmlText('democount',    dpuzzlen);
}

function updateDynamicHtmlEntries(etext,astate) {
  updateHtmlText('errortext', etext);
  updateHtmlText('assistButton', 'Current Assist Mode (' + astate + ')', true);
}

function canvasSuccess(isdemo,gamename,gamenum) {
  if (!isdemo && gamenum) {
    let gameStorage;
    try {
      gameStorage = localStorage.getItem("OPSaved" + gamename);
    } catch (e) {
      console.warn("couldn't read from localStorage: " + e);
    }
    let gamesWon;
    let isNewRibbon = false;
    if (gameStorage != null) {
      gamesWon = gameStorage.split(",");
      if (gamesWon.indexOf(gamenum.toString()) == -1) {
        isNewRibbon = true;
      }
    } else {
      gamesWon = new Array();
      isNewRibbon = true;
    }
    if (isNewRibbon) {
      gamesWon.push(gamenum.toString());
      const ribbonBar = document.getElementById("ribbonbar");
      ribbonBar.appendChild(returnRibbon(gamenum));
      try {
        localStorage.setItem("OPSaved" + gamename,gamesWon.join(","));
      } catch (e) {
        console.warn("couldn't save to localStorage: " + e);
      }
      elemStruct.clearButton.style.display = 'inline';
    }
  }
  elemStruct.canvasDiv.style.borderColor = constColorSuccess;
  elemStruct.canvasDiv.style.background = constColorSuccess;
}

function canvasIncomplete() {
  elemStruct.canvasDiv.style.borderColor = "black";
  elemStruct.canvasDiv.style.background = "white";
}

function clickType(evnt) {
  if((evnt.button==constClickLeft) && !evnt.altKey) {
    return constClickLeft;
  }
  if(evnt.button==constClickMiddle) {
    return constClickMiddle;
  }
  if((evnt.button==constClickRight) || ((evnt.button==constClickLeft) && evnt.altKey)) {
    return constClickRight;
  }
  return constClickUnknown;
}

function pathHasTurn(line) {
  if (line==constPathNW || line==constPathNE || line==constPathSW || line==constPathSE) {
    return true;
  }
  return false;
}

function mergePathLines(line1,line2) {
  // basic cases
  if (line1==0)             return line2;
  if (line1==constPathDot)  return line2;
  if (line1==line2)         return line1;

  // lookup table of merges
  const chooseLine1 = 99991;
  const chooseLine2 = 99992;
  const constMergeLineTable = {
    // often the merges are incompatible, just need to return the new one (line2)
    [`${constPathWE},${constPathN}`]: chooseLine2,
    [`${constPathWE},${constPathS}`]: chooseLine2,
    [`${constPathNS},${constPathW}`]: chooseLine2,
    [`${constPathNS},${constPathE}`]: chooseLine2,
    [`${constPathSE},${constPathN}`]: chooseLine2,
    [`${constPathSE},${constPathW}`]: chooseLine2,
    [`${constPathNE},${constPathS}`]: chooseLine2,
    [`${constPathNE},${constPathW}`]: chooseLine2,
    [`${constPathNW},${constPathS}`]: chooseLine2,
    [`${constPathNW},${constPathE}`]: chooseLine2,
    [`${constPathSW},${constPathN}`]: chooseLine2,
    [`${constPathSW},${constPathE}`]: chooseLine2,
    // these are actual merges
    [`${constPathW},${constPathE}`]: constPathWE,
    [`${constPathE},${constPathW}`]: constPathWE,
    [`${constPathN},${constPathS}`]: constPathNS,
    [`${constPathS},${constPathN}`]: constPathNS,
    [`${constPathN},${constPathW}`]: constPathNW,
    [`${constPathW},${constPathN}`]: constPathNW,
    [`${constPathS},${constPathE}`]: constPathSE,
    [`${constPathE},${constPathS}`]: constPathSE,
    [`${constPathN},${constPathE}`]: constPathNE,
    [`${constPathE},${constPathN}`]: constPathNE,
    [`${constPathS},${constPathW}`]: constPathSW,
    [`${constPathW},${constPathS}`]: constPathSW
    // default: just return the old one (line1)
  };

  const mergeResult = constMergeLineTable[`${line1},${line2}`] ?? chooseLine1;
  if (mergeResult==chooseLine1) return line1;
  if (mergeResult==chooseLine2) return line2;
  return mergeResult;
}

function unmergePathLines(line1,line2) {
  // basic cases
  if (line1==constPathNone)         return line1;
  if (line1==constPathDot)          return line1;
  if (line1==line2)                 return constPathNone;
  // if there is no intersection, ignore
  if ((line1&line2)==constPathLine) return line1;

  // lookup table of unmerges
  const constUnmergeLineTable = {
    [`${constPathWE},${constPathW}`]: constPathE,
    [`${constPathSE},${constPathS}`]: constPathE,
    [`${constPathNE},${constPathN}`]: constPathE,
    [`${constPathWE},${constPathE}`]: constPathW,
    [`${constPathSW},${constPathS}`]: constPathW,
    [`${constPathNW},${constPathN}`]: constPathW,
    [`${constPathNS},${constPathN}`]: constPathS,
    [`${constPathSE},${constPathE}`]: constPathS,
    [`${constPathSW},${constPathW}`]: constPathS,
    [`${constPathNS},${constPathS}`]: constPathN,
    [`${constPathNE},${constPathE}`]: constPathN,
    [`${constPathNW},${constPathW}`]: constPathN
  };
  // everything not in table is incompatible, return none
  const mergeResult = constUnmergeLineTable[`${line1},${line2}`] ?? constPathNone;

  return mergeResult;
}

function setLine (y,x,dir,val) {
  switch (dir) {
    case 'W': globalLineStates[y  ][x-1] = val; break;
    case 'E': globalLineStates[y  ][x+1] = val; break;
    case 'N': globalLineStates[y-1][x  ] = val; break;
    case 'S': globalLineStates[y+1][x  ] = val; break;
    default:  globalLineStates[y  ][x  ] = val; break;
  }
}

function getLine (y,x,dir) {
  switch (dir) {
    case 'W': return globalLineStates[y  ][x-1];
    case 'E': return globalLineStates[y  ][x+1];
    case 'N': return globalLineStates[y-1][x  ];
    case 'S': return globalLineStates[y+1][x  ];
    default:  return globalLineStates[y  ][x  ];
  }
}

function preClearPathNeighbors(y,x,state) {
  if ((state & constPathW) == constPathW) setLine(y,x,'W',unmergePathLines(getLine(y,x,'W'),constPathE));
  if ((state & constPathE) == constPathE) setLine(y,x,'E',unmergePathLines(getLine(y,x,'E'),constPathW));
  if ((state & constPathN) == constPathN) setLine(y,x,'N',unmergePathLines(getLine(y,x,'N'),constPathS));
  if ((state & constPathS) == constPathS) setLine(y,x,'S',unmergePathLines(getLine(y,x,'S'),constPathN));
}

function contains(state,list) {
  let hit = false;
  for (let lmem of list) {
    if (state==lmem) {
      hit = true;
    }
  }
  return hit;
}

function preclearLinePaths(moveType,y,x) {
  const clearNone = 0;
  const clearSelf = 1;
  const lineSelf = globalLineStates[y][x];

  // for "dragging/shifting" adds, we might need to pre-clear the existing
  // paths on both sides of the move if they are conflicting
  const constClearSelfTable = {
    [`${constPathN},${constPathSW}`]: clearSelf,
    [`${constPathN},${constPathSE}`]: clearSelf,
    [`${constPathN},${constPathWE}`]: clearSelf,
    [`${constPathS},${constPathNW}`]: clearSelf,
    [`${constPathS},${constPathNE}`]: clearSelf,
    [`${constPathS},${constPathWE}`]: clearSelf,
    [`${constPathW},${constPathSE}`]: clearSelf,
    [`${constPathW},${constPathNE}`]: clearSelf,
    [`${constPathW},${constPathNS}`]: clearSelf,
    [`${constPathE},${constPathSW}`]: clearSelf,
    [`${constPathE},${constPathNW}`]: clearSelf,
    [`${constPathE},${constPathNS}`]: clearSelf
  };

  if (moveType==constPathN || moveType==constPathE || moveType==constPathW || moveType==constPathS) {
    const selfCheck = constClearSelfTable[`${moveType},${lineSelf}`] ?? clearNone;
    if (selfCheck==clearSelf) preClearPathNeighbors(y,x,globalLineStates[y][x]);
    // and the following need clearing for the precursor cell
    if (moveType==constPathN && getLine(y,x,'N')==constPathNW) preClearPathNeighbors(y-1,x,getLine(y,x,'N'));
    if (moveType==constPathN && getLine(y,x,'N')==constPathNE) preClearPathNeighbors(y-1,x,getLine(y,x,'N'));
    if (moveType==constPathN && getLine(y,x,'N')==constPathWE) preClearPathNeighbors(y-1,x,getLine(y,x,'N'));
    if (moveType==constPathS && getLine(y,x,'S')==constPathSW) preClearPathNeighbors(y+1,x,getLine(y,x,'S'));
    if (moveType==constPathS && getLine(y,x,'S')==constPathSE) preClearPathNeighbors(y+1,x,getLine(y,x,'S'));
    if (moveType==constPathS && getLine(y,x,'S')==constPathWE) preClearPathNeighbors(y+1,x,getLine(y,x,'S'));
    if (moveType==constPathW && getLine(y,x,'W')==constPathSW) preClearPathNeighbors(y,x-1,getLine(y,x,'W'));
    if (moveType==constPathW && getLine(y,x,'W')==constPathNW) preClearPathNeighbors(y,x-1,getLine(y,x,'W'));
    if (moveType==constPathW && getLine(y,x,'W')==constPathNS) preClearPathNeighbors(y,x-1,getLine(y,x,'W'));
    if (moveType==constPathE && getLine(y,x,'E')==constPathSE) preClearPathNeighbors(y,x+1,getLine(y,x,'E'));
    if (moveType==constPathE && getLine(y,x,'E')==constPathNE) preClearPathNeighbors(y,x+1,getLine(y,x,'E'));
    if (moveType==constPathE && getLine(y,x,'E')==constPathNS) preClearPathNeighbors(y,x+1,getLine(y,x,'E'));
  } else {
    // for the others, we always need to clear any existing state ("unmerge")
    // and its neighboring effects
    preClearPathNeighbors(y,x,lineSelf);
  }
}

function mergeLinePaths (moveType,y,x) {
  // now merge in the new half-segments in the neighbors
  switch (moveType) {
    case constPathClear:
      setLine(y,x,'.',constPathNone);
      break;
    case constPathDot:
      setLine(y,x,'.',constPathDot);
      break;
    case constPathN:
      setLine(y,x,'.',mergePathLines(getLine(y,x,'.'),constPathN));
      setLine(y,x,'N',mergePathLines(getLine(y,x,'N'),constPathS));
      break
    case constPathS:
      setLine(y,x,'.',mergePathLines(getLine(y,x,'.'),constPathS));
      setLine(y,x,'S',mergePathLines(getLine(y,x,'S'),constPathN));
      break
    case constPathW:
      setLine(y,x,'.',mergePathLines(getLine(y,x,'.'),constPathW));
      setLine(y,x,'W',mergePathLines(getLine(y,x,'W'),constPathE));
      break
    case constPathE:
      setLine(y,x,'.',mergePathLines(getLine(y,x,'.'),constPathE));
      setLine(y,x,'E',mergePathLines(getLine(y,x,'E'),constPathW));
      break
    case constPathWE:
      setLine(y,x,'.',constPathWE);
      setLine(y,x,'W',mergePathLines(getLine(y,x,'W'),constPathE));
      setLine(y,x,'E',mergePathLines(getLine(y,x,'E'),constPathW));
      break;
    case constPathNS:
      setLine(y,x,'.',constPathNS);
      setLine(y,x,'N',mergePathLines(getLine(y,x,'N'),constPathS));
      setLine(y,x,'S',mergePathLines(getLine(y,x,'S'),constPathN));
      break;
    case constPathNE:
      setLine(y,x,'.',constPathNE);
      setLine(y,x,'N',mergePathLines(getLine(y,x,'N'),constPathS));
      setLine(y,x,'E',mergePathLines(getLine(y,x,'E'),constPathW));
      break;
    case constPathSE:
      setLine(y,x,'.',constPathSE);
      setLine(y,x,'S',mergePathLines(getLine(y,x,'S'),constPathN));
      setLine(y,x,'E',mergePathLines(getLine(y,x,'E'),constPathW));
      break;
    case constPathSW:
      setLine(y,x,'.',constPathSW);
      setLine(y,x,'S',mergePathLines(getLine(y,x,'S'),constPathN));
      setLine(y,x,'W',mergePathLines(getLine(y,x,'W'),constPathE));
      break;
    case constPathNW:
      setLine(y,x,'.',constPathNW);
      setLine(y,x,'N',mergePathLines(getLine(y,x,'N'),constPathS));
      setLine(y,x,'W',mergePathLines(getLine(y,x,'W'),constPathE));
      break;
  }
}

function convertPathCharToCode (pathChar) {
  switch (pathChar) {
    case '.': return constPathDot;
    case '_': return constPathWE;
    case '-': return constPathWE;
    case '|': return constPathNS;
    case 'N': return constPathN;
    case 'S': return constPathS;
    case 'E': return constPathE;
    case 'W': return constPathW;
    case 'F': return constPathSE;
    case '7': return constPathSW;
    case 'J': return constPathNW;
    case 'L': return constPathNE;
  }
  return constPathNone;
}

// shapeSort sorts first by y coordinate, then x coordinate
function shapeSort (cellArray) {
  let newArray = structuredClone(cellArray);
  newArray.sort((a,b) => ((a[0]==b[0]) ? (a[1]-b[1]) : (a[0]-b[0])));
  return newArray;
}

// take an array of cells that defines its shape, and
// normalize it in two ways: center it to 0,0, and then
// sort its individual members so they are in a consistent
// order
function normalizeShape (cellArray) {
  let miny = 999;
  let minx = 999;
  for (let c of cellArray) {
    if (c[0]<miny) {
      miny = c[0];
    }
    if (c[1]<minx) {
      minx = c[1];
    }
  }
  let newArray = new Array();
  for (let c of cellArray) {
    newArray.push([c[0]-miny,c[1]-minx]);
  }
  return shapeSort(newArray);
}

function rotateShape (cellArray) {
  let newArray = new Array();
  for (let c of cellArray) {
    newArray.push([c[1],-c[0]]);
  }
  return normalizeShape(newArray);
}

function reflectShape (cellArray) {
  let newArray = new Array();
  for (let c of cellArray) {
    newArray.push([c[1],c[0]]);
  }
  return normalizeShape(newArray);
}

// not sure if there is a better way to sort 3d arrays, so
// converting to a str first before string sorting
function shape2str (cellArray) {
  let sstr = "";
  for (let c of cellArray) {
    sstr += c[0].toString(36);
    sstr += c[1].toString(36);
  }
  return sstr;
}

function str2shape (shapestr) {
  let cellArray = new Array();
  let strArray = shapestr.split("");
  for (let i=0;i<strArray.length;i+=2) {
    cellArray.push([parseInt(strArray[i],36),parseInt(strArray[i+1],36)]);
  }
  return cellArray;
}

// take an array of cells that defines its shape, and find its
// "canonical" form, which is first normalized to the 0,0
// axis, and then the reflected and/or rotated version of itself
// that "sorts first", an arbitrary sorting but the same each
// time. This can then be used to compare against another
// canonicalized shape to see if they are the same under some
// form of reflection or rotation
function canonicalizeShape (cellArray) {
  let r0 = normalizeShape(cellArray);
  let r1 = rotateShape(r0);
  let r2 = rotateShape(r1);
  let r3 = rotateShape(r2);
  let f0 = reflectShape(r0);
  let f1 = rotateShape(f0);
  let f2 = rotateShape(f1);
  let f3 = rotateShape(f2);
  let strArray = new Array();
  strArray.push(shape2str(r0));
  strArray.push(shape2str(r1));
  strArray.push(shape2str(r2));
  strArray.push(shape2str(r3));
  strArray.push(shape2str(f0));
  strArray.push(shape2str(f1));
  strArray.push(shape2str(f2));
  strArray.push(shape2str(f3));
  strArray.sort();
  return str2shape(strArray[0]);
}

function compareRooms(room1, room2) {
  // Check if lengths of outer arrays are equal
  if (room1.length !== room2.length) {
    return false;
  }

  // Iterate through outer arrays
  for (let i = 0; i < room1.length; i++) {
    const cell1 = room1[i];
    const cell2 = room2[i];

    // Check if lengths of inner arrays are equal
    if (cell1.length !== cell2.length) {
      return false;
    }

    // Iterate through inner arrays and compare elements
    for (let j = 0; j < cell1.length; j++) {
      if (cell1[j] !== cell2[j]) {
        return false;
      }
    }
  }
  return true;
}

function updateDemoFunction(demoNum,initFunc,stepFunc,postFunc=null) {
  let which = 0;
  for (let i=0;i<demoPuzzles.length;i++) {
    if (demoNum==demoPuzzles[i]) which = i;
  }
  let dtext  =  demoText[which];
  let dmoves = demoMoves[which];
  if (demoStepNum < dtext.length) {
    if (demoStepNum) {
      playState.assistState = 2;
    } else {
      playState.assistState = 0;
    }
    updateHtmlText('demotext', dtext[demoStepNum]);
    initFunc();
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      for (let dstep of dmoves[step]) {
        stepFunc(dstep.split(""));
      }
    }
    if (postFunc) {
      postFunc();
    }
    updateBoardStatus();
    drawBoard();
  }
}

function initRibbons(gamename) {
  let gameStorage;
  try {
    gameStorage = localStorage.getItem("OPSaved" + gamename);
  } catch (e) {
    console.warn("couldn't read from localStorage: " + e);
  }
  if (gameStorage) {
    const ribbonBar = document.getElementById("ribbonbar");
    let gamesWon = gameStorage.split(",");
    if (gamesWon.length) {
      elemStruct.clearButton.style.display = 'inline';
    }
    for (let game of gamesWon) {
      if (game) {
        ribbonBar.appendChild(returnRibbon(game));
      }
    }
  }
}

function returnRibbon (gamenum) {
  // figure out which level this game is by consulting the level array
  let gamelevel;
  for (let i=0;i<puzzleLevels.length;i++) {
    if (gamenum >= puzzleLevels[i]) {
      gamelevel = i+1;
    }
  }
  if (gamelevel==4) {
    gamecolor = constRibbonColorGold;
  } else if (gamelevel==3) {
    gamecolor = constRibbonColorBlue;
  } else if (gamelevel==2) {
    gamecolor = constRibbonColorRed;
  } else {
    gamecolor = constRibbonColorWhite;
  }
  let ribbonElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  ribbonElement.setAttribute('xmlns',   "http://www.w3.org/2000/svg");
  ribbonElement.setAttribute('width',   50);
  ribbonElement.setAttribute('height',  50);
  ribbonElement.setAttribute('viewBox', "0 0 400 400");
  let ribbonInner = '<path d="M 150 230 L 105 390 L 80 330 L  25 360 L 90 215 Z" fill="' + gamecolor +
    '" stroke="black" stroke-width="10" />' +
    '<path d="M 150 230 L 195 390 L 220 330 L 275 360 L 210 215 Z" fill="' + gamecolor +
    '" stroke="black" stroke-width="10" />' +
    '<path d="M 150 250' +
             'C 150 250, 169 269, 181 245 C 181 245, 186 221, 209 231' +
             'C 209 231, 235 235, 231 209 C 231 209, 221 186, 245 181' +
             'C 245 181, 269 169, 250 150 C 250 150, 229 137, 245 119' +
             'C 245 119, 257  96, 231  91 C 231  91, 207  93, 209  69' +
             'C 209  69, 204  43, 181  55 C 181  55, 163  71, 150  50' +
             'C 150  50, 131  31, 119  55 C 119  55, 114  79,  91  69' +
             'C  91  69,  65  65,  69  91 C  69  91,  79 114,  55 119' +
             'C  55 119,  31 131,  50 150 C  50 150,  71 163,  55 181' +
             'C  55 181,  43 204,  69 209 C  69 209,  93 207,  91 231' +
             'C  91 231,  96 257, 119 245 C 119 245, 137 229, 150 250' +
             'Z" fill="' + gamecolor + '" stroke="black" stroke-width="10"/>' +
    '<circle cx="150" cy="150" r="80" fill="none" stroke="black" stroke-width="10" />' +
    '<text text-anchor="middle" font-family="Open Sans" font-size="100px" x="150" y="185">' + gamenum +
    '</text>';
  ribbonElement.innerHTML = ribbonInner;
  return ribbonElement;
}
