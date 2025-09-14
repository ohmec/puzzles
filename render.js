const CLICK_LEFT    = 0;
const CLICK_MIDDLE  = 1;
const CLICK_RIGHT   = 2;
const CLICK_UNKNOWN = 9;

const CIRCLE_NONE  = 0;
const CIRCLE_WHITE = 1;
const CIRCLE_BLACK = 2;
const CIRCLE_DOT   = 3;
const CIRCLE_MOON  = 4;

// the paths can be complicated for hashiwokakero, so
// allow for that but keep the others simplified. This
// encoding uses the following binary notation
// [9:8] = 00 no path
// [9:8] = 01 line segment(s)
// [9:8] = 10 special (eg dot)
// then give two bits per direction to allow for single
// and double lines, i.e. single north is 0b00000001
// and double north is 0b00000010

const PATH_NONE    = 0b0000000000;
const PATH_LINE    = 0b0100000000;
const PATH_SPECIAL = 0b1000000000;
const PATH_DOT     = PATH_SPECIAL | 0b01;
const PATH_CLEAR   = PATH_SPECIAL | 0b10;
// these are the standard single-line versions
const PATH_N       = PATH_LINE | 0b00000001;
const PATH_W       = PATH_LINE | 0b00000100;
const PATH_S       = PATH_LINE | 0b00010000;
const PATH_E       = PATH_LINE | 0b01000000;
const PATH_NW      = PATH_N | PATH_W;
const PATH_NE      = PATH_N | PATH_E;
const PATH_SW      = PATH_S | PATH_W;
const PATH_SE      = PATH_S | PATH_E;
const PATH_NS      = PATH_N | PATH_S;
const PATH_WE      = PATH_W | PATH_E;
// doubleline version
const PATH_2N      = PATH_LINE | 0b00000010;
const PATH_2W      = PATH_LINE | 0b00001000;
const PATH_2S      = PATH_LINE | 0b00100000;
const PATH_2E      = PATH_LINE | 0b10000000;
const PATH_ALL     = 0b11111111;

const KEY_BS    = 0x08;
const KEY_CR    = 0x0d;
const KEY_SHIFT = 0x10;
const KEY_ESC   = 0x1b;
const KEY_SP    = 0x20;
const KEY_LEFT  = 0x25;
const KEY_UP    = 0x26;
const KEY_RIGHT = 0x27;
const KEY_DOWN  = 0x28;
const KEY_0     = 0x30;
const KEY_1     = 0x31;
const KEY_2     = 0x32;
const KEY_7     = 0x37;
const KEY_9     = 0x39;
const ALT_0     = 0x60; // these are the number pad versions
const ALT_1     = 0x61;
const ALT_9     = 0x69;
const KEY_A     = 0x41;
const KEY_E     = 0x45;
const KEY_F     = 0x46;
const KEY_I     = 0x49;
const KEY_J     = 0x4a;
const KEY_L     = 0x4c;
const KEY_N     = 0x4e;
const KEY_S     = 0x53;
const KEY_W     = 0x57;
const KEY_Z     = 0x5a;
const KEY_CTLL  = 0x5b;
const KEY_CTLR  = 0x5d;
const KEY_a     = 0x61;
const KEY_z     = 0x7a;
const KEY_DASH  = 0xbd;
const KEY_DOT   = 0xbe;
const KEY_VERT  = 0xdc;

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

const constWallNone      = 0b000000000;
const constWallLight     = 0b000000001;
const constWallStandard  = 0b000000010;
const constWallDash      = 0b000000100;
const constWallBorder    = 0b000001000;
const constWallUserEdge  = 0b000010000;
const constWallSolveEdge = 0b000100000;
const constWallDot       = 0b001000000;

const constHoriz = true;
const constVert  = false;

const constColorLightGray = "#c0c0c0";
const constColorMedGray   = "#a0a0a0";
const constColorSuccess   = "#1be032";
const constColorCursor    = "#ff80ff";
const constLineColor      = "black";

const EMPTYCELL = -1;

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

let globalContext, globalInitBoardValues, globalInitWallStates;
let globalBoardValues, globalBoardColors, globalBoardTextColors;
let globalWallStates, globalLineStates, globalLineColors, globalDotColors;
let globalCircleStates, globalCircleColors, globalTextBold;

function basicInitStructures(size,cellColor,wallState,textColor) {
  let wxh = size.split("x");
  globalPuzzleW = parseInt(wxh[0]);
  globalPuzzleH = parseInt(wxh[1]);
  setGridSize(globalPuzzleW);
  canvas.height = globalPuzzleH*globalGridSize;
  canvas.width  = globalPuzzleW*globalGridSize;
  globalInitBoardValues = initYXFromValue("");
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  globalLineStates   =    initYXFromValue(PATH_NONE);
  globalBoardColors =     initYXFromValue(cellColor);
  globalInitWallStates  = initWallStates(wallState);
  globalWallStates =      initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  globalBoardTextColors = initYXFromValue(textColor);
  globalLineColors =      initYXFromValue(constLineColor);
  globalCircleStates =    initYXFromValue(CIRCLE_NONE);
  globalCircleColors =    initYXFromValue(constLineColor);
  globalDotColors =       initYX2FromValue(constLineColor);
  globalTextBold =        initYXFromValue(true);
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

function initBoardColorsFromHexes(shadeParams) {
  let shadeHexes = shadeParams.split("");
  let boardColors = new Array(globalPuzzleH);
  for (let y=0;y<globalPuzzleH;y++) {
    boardColors[y] = new Array(globalPuzzleW);
    for (let x=0;x<globalPuzzleW;x++) {
      let shadeHex = shadeHexes[y*Math.ceil(globalPuzzleW/4)+Math.floor(x/4)];
      let shadeTrue = (parseInt(shadeHex,16) & (1<<(3-(x%4)))) ? 1 : 0;
      boardColors[y][x] = shadeTrue ? constColorMedGray : "white";
    }
  }
  return boardColors;
}

function initWallStates(state) {
  let wallStates  = new Array(globalPuzzleH*2+1);
  // "true" wall states are all dashes at first
  for (let y=0;y<=2*globalPuzzleH;y++) {
    wallStates[y] = new Array(2*globalPuzzleW+1);
    for (let x=0;x<2*globalPuzzleW;x++) {
      if (y==0 || y==(2*globalPuzzleH) || x==0 || x==(2*globalPuzzleW)) {
        wallStates[y][x] = constWallBorder;
      } else if(y%2 && x%2) {
        wallStates[y][x] = constWallNone;
      } else {
        wallStates[y][x] = state;
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
    let count = (bd == '-') ? EMPTYCELL : bd;
    roomStates.push([by,bx,bh,bw,count]);
  }
  return roomStates;
}

function initWallStatesFromHexes(hexParamsRows,hexParamsCols,defState) {
  let hexParamArrayRows = hexParamsRows.replace(/\./gi, "").split("");
  let hexParamArrayCols = hexParamsCols.replace(/\./gi, "").split("");
  let wallStates  = new Array(globalPuzzleH*2+1);
  let expLenH = Math.floor((globalPuzzleW+2)/4)*globalPuzzleH;
  let expLenW = Math.floor((globalPuzzleH+2)/4)*globalPuzzleW;
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
  // do horizontals first
  let ptr = 0;
  let bit = 0;
  for (let y=1;y<=2*globalPuzzleH;y+=2) {
    if (bit != 0) {
      ptr++;
      bit=0;
    }
    for (let x=2;x<2*globalPuzzleW;x+=2) {
      let hexval = parseInt(hexParamArrayRows[ptr],16);
      let bitval = (hexval >> (3-bit)) & 1;
      if (bitval) {
        wallStates[y][x] = constWallBorder;
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
    for (let y=2;y<2*globalPuzzleH;y+=2) {
      let hexval = parseInt(hexParamArrayCols[ptr],16);
      let bitval = (hexval >> (3-bit)) & 1;
      if (bitval) {
        wallStates[y][x] = constWallBorder;
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

function drawBoard(lineFirst = false, drawDots = false) {
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
               lineFirst,
               globalBoardTextColors[y][x]);
    }
  }
  // draw horizontal walls
  for (let y=2;y<=2*globalPuzzleH;y+=2) {
    for (let x=1;x<=2*globalPuzzleW;x+=2) {
      drawWall(constHoriz,y,x,globalWallStates[y][x],constLineColor,globalDotColors[y][x]);
    }
  }
  // draw vertical walls
  for (let y=1;y<=2*globalPuzzleH;y+=2) {
    for (let x=2;x<=2*globalPuzzleW;x+=2) {
      drawWall(constVert,y,x,globalWallStates[y][x],constLineColor,globalDotColors[y][x]);
    }
  }
  if (globalCursorOn) {
    drawCursor();
  }
  if (globalWallCursorOn) {
    drawWallCursor();
  }
  if (drawDots) {
    for (let y=0;y<=globalPuzzleH;y++) {
      for (let x=0;x<=globalPuzzleW;x++) {
        drawDot(y,x);
      }
    }
  }
}

function drawTile(y,x,color,value,isbold,circle,circlecolor,line,lineColor,lineFirst,textColor) {
  let drawX = Math.floor(x*globalGridSize);
  let drawY = Math.floor(y*globalGridSize);
  globalContext.fillStyle = color;
  globalContext.fillRect(drawX,drawY,globalGridSize,globalGridSize);
  if (lineFirst) {
    drawLine(y,x,line,lineColor);
  }
  // draw circle next if it exists
  if (circle) {
    let radius = (circle==CIRCLE_DOT) ? globalCircleRadius*globalGridSize*0.35 :
                                        globalCircleRadius*globalGridSize;
    globalContext.lineWidth = 4.0;
    globalContext.strokeStyle = circlecolor;
    globalContext.fillStyle = (circle>=CIRCLE_BLACK) ? circlecolor : "white";
    globalContext.beginPath();
    globalContext.arc(drawX+globalGridSize/2,
                drawY+globalGridSize/2,
                radius,0,2*Math.PI);
    globalContext.stroke();
    globalContext.fill();
    // if CIRCLE_MOON draw another white one to eclipse the original one
    if (circle==CIRCLE_MOON) {
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
  // now text of value
  let vstr = "";
  globalContext.textAlign = "center";
  globalContext.fillStyle = textColor;
  globalContext.font = (globalGridSize*globalFontSize) + "pt " + "Courier, sans-serif";
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
  globalContext.fillText(vstr, drawX+(globalGridSize*0.5), drawY+(globalGridSize*(0.5+globalFontSize*0.5)));

  if (!lineFirst) {
    drawLine(y,x,line,lineColor);
  }
}

function drawCursor() {
  let drawX = Math.floor(globalCursorX*globalGridSize)+1;
  let drawY = Math.floor(globalCursorY*globalGridSize)+1;
  globalContext.lineWidth = 4;
  globalContext.strokeStyle = constColorCursor;
  globalContext.strokeRect(drawX,drawY,globalGridSize-2,globalGridSize-2);
}

function drawWallCursor() {
  let drawX1 = (globalWallCursorX%2) ? ((globalWallCursorX-1)*globalGridSize*0.5) : (globalWallCursorX*globalGridSize*0.5);
  let drawX2 = (globalWallCursorX%2) ? ((globalWallCursorX+1)*globalGridSize*0.5) : (globalWallCursorX*globalGridSize*0.5);
  let drawY1 = (globalWallCursorY%2) ? ((globalWallCursorY-1)*globalGridSize*0.5) : (globalWallCursorY*globalGridSize*0.5);
  let drawY2 = (globalWallCursorY%2) ? ((globalWallCursorY+1)*globalGridSize*0.5) : (globalWallCursorY*globalGridSize*0.5);
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
  let drawXM = x*globalGridSize*0.5;
  let drawYM = y*globalGridSize*0.5;
  let drawX1 = (horv == constHoriz) ? (x-1)*globalGridSize*0.5 : drawXM;
  let drawX2 = (horv == constHoriz) ? (x+1)*globalGridSize*0.5 : drawXM;
  let drawY1 = (horv == constVert)  ? (y-1)*globalGridSize*0.5 : drawYM;
  let drawY2 = (horv == constVert)  ? (y+1)*globalGridSize*0.5 : drawYM;
  globalContext.strokeStyle = lineColor;
  if (wallState != constWallNone) {
    if (wallState & constWallDash) {
      globalContext.setLineDash([2,2]);
      globalContext.lineWidth = 1;
    } else {
      if ((wallState & (constWallBorder | constWallUserEdge | constWallSolveEdge)) != 0) {
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
  // reset lineWidth
  globalContext.lineWidth = 1;
}

function drawDot(y,x) {
  let drawX = Math.floor(x*globalGridSize);
  let drawY = Math.floor(y*globalGridSize);
  globalContext.lineWidth = 1;
  globalContext.fillStyle = "black";
  globalContext.beginPath();
  globalContext.arc(drawX,drawY,0.05*globalGridSize,0,2*Math.PI);
  globalContext.fill();
}

function drawLine(y,x,state,color) {
  // special case for "line dot"
  if (state == PATH_DOT) {
    let drawX = Math.floor((x+0.5)*globalGridSize);
    let drawY = Math.floor((y+0.5)*globalGridSize);
    globalContext.strokeStyle = color;
    globalContext.lineWidth = 1;
    globalContext.fillStyle = "black";
    globalContext.beginPath();
    globalContext.arc(drawX,drawY,0.05*globalGridSize,0,2*Math.PI);
    globalContext.fill();
    return;
  }
  if (((state & PATH_LINE) == PATH_LINE) &&
      ((state & PATH_ALL)  != 0)) {
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
        let centerX = Math.floor((x+0.5)*globalGridSize);
        let centerY = Math.floor((y+0.5)*globalGridSize);
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
  let canvasElement = document.getElementById(canvas);
  let yCoord = evnt.pageY-$(canvasElement).offset().top-parseInt( $(canvasElement).css("border-top-width"));
  let xCoord = evnt.pageX-$(canvasElement).offset().left-parseInt($(canvasElement).css("border-left-width"));
  let vertCell = Math.floor(yCoord/globalGridSize);
  let horzCell = Math.floor(xCoord/globalGridSize);
  let horzDistFromEdgeL = Math.abs((horzCell  )*globalGridSize - xCoord);
  let horzDistFromEdgeR = Math.abs((horzCell+1)*globalGridSize - xCoord);
  let vertDistFromEdgeU = Math.abs((vertCell  )*globalGridSize - yCoord);
  let vertDistFromEdgeD = Math.abs((vertCell+1)*globalGridSize - yCoord);
  let isCloseL = (horzDistFromEdgeL < (globalGridSize*0.1));
  let isCloseR = (horzDistFromEdgeR < (globalGridSize*0.1));
  let isCloseU = (vertDistFromEdgeU < (globalGridSize*0.1));
  let isCloseD = (vertDistFromEdgeD < (globalGridSize*0.1));
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

function travelRiver(arrayYX,y,x,isEqual,testValue) {
  let riverCells = new Array();
  let tryindex = 0;
  riverCells.push(y+","+x);
  while (riverCells.length > tryindex) {
    let curCell = riverCells[tryindex].split(",");
    let iy = parseInt(curCell[0]);
    let ix = parseInt(curCell[1]);
    if ((iy != (globalPuzzleH-1)) &&
        (riverCells.indexOf((iy+1)+","+ix) == -1) &&
        eqCompare(arrayYX[iy+1][ix],isEqual,testValue)) {
      riverCells.push((iy+1)+","+ix);
    }
    if ((iy != 0) &&
        (riverCells.indexOf((iy-1)+","+ix) == -1) &&
        eqCompare(arrayYX[iy-1][ix],isEqual,testValue)) {
      riverCells.push((iy-1)+","+ix);
    }
    if ((ix != (globalPuzzleW-1)) &&
        (riverCells.indexOf(iy+","+(ix+1)) == -1) &&
        eqCompare(arrayYX[iy][ix+1],isEqual,testValue)) {
      riverCells.push(iy+","+(ix+1));
    }
    if ((ix != 0) &&
        (riverCells.indexOf(iy+","+(ix-1)) == -1) &&
        eqCompare(arrayYX[iy][ix-1],isEqual,testValue)) {
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
  let alive = true;
  switch (state) {
    case PATH_NONE:
      alive = false;
      break;
    case PATH_DOT:
      alive = false;
      break;
    case PATH_WE:
      if ((clockwise && dir==0) || dir=='W')
        { x++; dir = 'W'; }
      else if ((!clockwise && dir==0) || dir=='E')
        { x--; dir = 'E'; }
      else
        { inerror = true; alive = false; }
      break;
    case PATH_NS:
      if ((clockwise && dir==0) || dir=='N')
        { y++; dir = 'N'; }
      else if ((!clockwise && dir==0) || dir=='S')
        { y--; dir = 'S'; }
      else
        { inerror = true; alive = false; }
      break;
    case PATH_N:
      if (dir!=0 && dir!='N')
        { inerror = true; }
      alive = false;
      break;
    case PATH_S:
      if (dir!=0 && dir!='S')
        { inerror = true; }
      alive = false;
      break;
    case PATH_E:
      if (dir!=0 && dir!='E')
        { inerror = true; }
      alive = false;
      break;
    case PATH_W:
      if (dir!=0 && dir!='W')
        { inerror = true; }
      alive = false;
      break;
    case PATH_SE:
      if ((clockwise && dir==0) || dir=='S')
        { x++; dir = 'W'; }
      else if ((!clockwise && dir==0) || dir=='E')
        { y++; dir = 'N'; }
      else
        { inerror = true; alive = false; }
      break;
    case PATH_NW:
      if ((clockwise && dir==0) || dir=='N')
        { x--; dir = 'E'; }
      else if ((!clockwise && dir==0) || dir=='W')
        { y--; dir = 'S'; }
      else
        { inerror = true; alive = false; }
      break;
    case PATH_NE:
      if ((clockwise && dir==0) || dir=='N')
        { x++; dir = 'W'; }
      else if ((!clockwise && dir==0) || dir=='E')
        { y--; dir = 'S'; }
      else
        { inerror = true; alive = false; }
      break;
    case PATH_SW:
      if ((clockwise && dir==0) || dir=='S')
        { x--; dir = 'E'; }
      else if ((!clockwise && dir==0) || dir=='W')
        { y++; dir = 'N'; }
      else
        { inerror = true; alive = false; }
      break;
    default:
      alive = false;
      break;
    }
  if (inerror) {
    console.log("ERROR: broken path, coming from " + y + "," + x + " with dir " + dir + " and found " + state);
  }
  return [alive,y,x,dir];
}

// this routine travels the path and searches for loops.
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
    if ((((globalLineStates[iy][ix] & PATH_N)  == PATH_N) ||
         ((globalLineStates[iy][ix] & PATH_2N) == PATH_2N)) &&
        (networkCells.indexOf((iy-1)+","+ix) == -1)) {
      networkCells.push((iy-1)+","+ix);
    }
    if ((((globalLineStates[iy][ix] & PATH_W)  == PATH_W) ||
         ((globalLineStates[iy][ix] & PATH_2W) == PATH_2W)) &&
        (networkCells.indexOf(iy+","+(ix-1)) == -1)) {
      networkCells.push(iy+","+(ix-1));
    }
    if ((((globalLineStates[iy][ix] & PATH_S)  == PATH_S) ||
         ((globalLineStates[iy][ix] & PATH_2S) == PATH_2S)) &&
        (networkCells.indexOf((iy+1)+","+ix) == -1)) {
      networkCells.push((iy+1)+","+ix);
    }
    if ((((globalLineStates[iy][ix] & PATH_E)  == PATH_E) ||
         ((globalLineStates[iy][ix] & PATH_2E) == PATH_2E)) &&
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
  while (room.length > tryindex) {
    let curCell = room[tryindex].split(",");
    let iy = parseInt(curCell[0]);
    let ix = parseInt(curCell[1]);
    let wy = iy*2+1;
    let wx = ix*2+1;
    if ((iy != (globalPuzzleH-1)) &&
        (room.indexOf((iy+1)+","+ix) == -1) &&
        (globalWallStates[wy+1][wx] != constWallBorder)) {
      room.push((iy+1)+","+ix);
    }
    if ((iy != 0) &&
        (room.indexOf((iy-1)+","+ix) == -1) &&
        (globalWallStates[wy-1][wx] != constWallBorder)) {
      room.push((iy-1)+","+ix);
    }
    if ((ix != (globalPuzzleW-1)) &&
        (room.indexOf(iy+","+(ix+1)) == -1) &&
        (globalWallStates[wy][wx+1] != constWallBorder)) {
      room.push(iy+","+(ix+1));
    }
    if ((ix != 0) &&
        (room.indexOf(iy+","+(ix-1)) == -1) &&
        (globalWallStates[wy][wx-1] != constWallBorder)) {
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
    let ptext = "puzzle descriptor:<br/>";
    while (pdescr.length > 120) {
      ptext = ptext + pdescr.substr(0,120) + "<br/>";
      pdescr = pdescr.substr(120);
    }
    ptext = ptext + pdescr;
    updateHtmlText('puzzledescr',  ptext);
  }
}

function updateStaticHtmlEntries(pdescr,edescr,pcnt,dpuzz,dpuzzlen) {
  updateHtmlDescr(pdescr);
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

function clickType(evnt) {
  if((evnt.button==CLICK_LEFT) && !evnt.altKey) {
    return CLICK_LEFT;
  }
  if(evnt.button==CLICK_MIDDLE) {
    return CLICK_MIDDLE;
  }
  if((evnt.button==CLICK_RIGHT) || ((evnt.button==CLICK_LEFT) && evnt.altKey)) {
    return CLICK_RIGHT;
  }
  return CLICK_UNKNOWN;
}

function pathHasTurn(line) {
  if (line==PATH_NW || line==PATH_NE || line==PATH_SW || line==PATH_SE) {
    return true;
  }
  return false;
}

function mergePathLines(line1,line2) {
  if ((line1==0) || (line1==PATH_DOT)) {
    return line2;
  } else if (line1==line2) {
    return line1;
  } else {
    // often the merges are incompatible, just need to return
    // the new one
    if (((line1==PATH_WE) && (line2==PATH_N || line2==PATH_S)) ||
        ((line1==PATH_NS) && (line2==PATH_W || line2==PATH_E)) ||
        ((line1==PATH_SE) && (line2==PATH_N || line2==PATH_W)) ||
        ((line1==PATH_NE) && (line2==PATH_S || line2==PATH_W)) ||
        ((line1==PATH_NW) && (line2==PATH_S || line2==PATH_E)) ||
        ((line1==PATH_SW) && (line2==PATH_N || line2==PATH_E))) {
      return line2;
    }
    // often the merges are identical, just return the old one
    if (((line1==PATH_WE) && (line2==PATH_W || line2==PATH_E)) ||
        ((line1==PATH_NS) && (line2==PATH_N || line2==PATH_S)) ||
        ((line1==PATH_SE) && (line2==PATH_S || line2==PATH_E)) ||
        ((line1==PATH_NE) && (line2==PATH_N || line2==PATH_E)) ||
        ((line1==PATH_NW) && (line2==PATH_N || line2==PATH_W)) ||
        ((line1==PATH_SW) && (line2==PATH_S || line2==PATH_W))) {
      return line1;
    }
    // these are actual merges
    if ((line1==PATH_W && line2==PATH_E) ||
        (line1==PATH_E && line2==PATH_W)) {
      return PATH_WE;
    }
    if ((line1==PATH_N && line2==PATH_S) ||
        (line1==PATH_S && line2==PATH_N)) {
      return PATH_NS;
    }
    if ((line1==PATH_N && line2==PATH_W) ||
        (line1==PATH_W && line2==PATH_N)) {
      return PATH_NW;
    }
    if ((line1==PATH_S && line2==PATH_E) ||
        (line1==PATH_E && line2==PATH_S)) {
      return PATH_SE;
    }
    if ((line1==PATH_N && line2==PATH_E) ||
        (line1==PATH_E && line2==PATH_N)) {
      return PATH_NE;
    }
    if ((line1==PATH_S && line2==PATH_W) ||
        (line1==PATH_W && line2==PATH_S)) {
      return PATH_SW;
    }
    return line1;
  }
}

function unmergePathLines(line1,line2) {
  if (line1==PATH_NONE) {
    return PATH_NONE;
  } else if (line1==PATH_DOT) {
    return PATH_DOT;
  } else if (line1==line2) {
    return PATH_NONE;
  // if there is no intersection, ignore
  } else if ((line1&line2)==PATH_LINE) {
    return line1;
  } else {
    if (((line1==PATH_WE) && (line2==PATH_W)) ||
        ((line1==PATH_SE) && (line2==PATH_S)) ||
        ((line1==PATH_NE) && (line2==PATH_N))) {
      return PATH_E;
    }
    if (((line1==PATH_WE) && (line2==PATH_E)) ||
        ((line1==PATH_SW) && (line2==PATH_S)) ||
        ((line1==PATH_NW) && (line2==PATH_N))) {
      return PATH_W;
    }
    if (((line1==PATH_NS) && (line2==PATH_N)) ||
        ((line1==PATH_SE) && (line2==PATH_E)) ||
        ((line1==PATH_SW) && (line2==PATH_W))) {
      return PATH_S;
    }
    if (((line1==PATH_NS) && (line2==PATH_S)) ||
        ((line1==PATH_NE) && (line2==PATH_E)) ||
        ((line1==PATH_NW) && (line2==PATH_W))) {
      return PATH_N;
    }
    // everything else is incompatible, return 0
    return 0;
  }
}

function preClearPathNeighbors(y,x,state) {
  switch (state) {
    case PATH_WE:
      globalLineStates[y][x-1] = unmergePathLines(globalLineStates[y][x-1],PATH_E);
      globalLineStates[y][x+1] = unmergePathLines(globalLineStates[y][x+1],PATH_W);
      break;
    case PATH_NS:
      globalLineStates[y-1][x] = unmergePathLines(globalLineStates[y-1][x],PATH_S);
      globalLineStates[y+1][x] = unmergePathLines(globalLineStates[y+1][x],PATH_N);
      break;
    case PATH_SE:
      globalLineStates[y][x+1] = unmergePathLines(globalLineStates[y][x+1],PATH_W);
      globalLineStates[y+1][x] = unmergePathLines(globalLineStates[y+1][x],PATH_N);
      break;
    case PATH_NE:
      globalLineStates[y][x+1] = unmergePathLines(globalLineStates[y][x+1],PATH_W);
      globalLineStates[y-1][x] = unmergePathLines(globalLineStates[y-1][x],PATH_S);
      break;
    case PATH_NW:
      globalLineStates[y][x-1] = unmergePathLines(globalLineStates[y][x-1],PATH_E);
      globalLineStates[y-1][x] = unmergePathLines(globalLineStates[y-1][x],PATH_S);
      break;
    case PATH_SW:
      globalLineStates[y][x-1] = unmergePathLines(globalLineStates[y][x-1],PATH_E);
      globalLineStates[y+1][x] = unmergePathLines(globalLineStates[y+1][x],PATH_N);
      break;
    case PATH_W:
      globalLineStates[y][x-1] = unmergePathLines(globalLineStates[y][x-1],PATH_E);
      break;
    case PATH_E:
      globalLineStates[y][x+1] = unmergePathLines(globalLineStates[y][x+1],PATH_W);
      break;
    case PATH_N:
      globalLineStates[y-1][x] = unmergePathLines(globalLineStates[y-1][x],PATH_S);
      break;
    case PATH_S:
      globalLineStates[y+1][x] = unmergePathLines(globalLineStates[y+1][x],PATH_N);
      break;
  }
}

function convertPathCharToCode (pathChar) {
  switch (pathChar) {
    case '.': return PATH_DOT;
    case '_': return PATH_WE;
    case '-': return PATH_WE;
    case '|': return PATH_NS;
    case 'N': return PATH_N;
    case 'S': return PATH_S;
    case 'E': return PATH_E;
    case 'W': return PATH_W;
    case 'F': return PATH_SE;
    case '7': return PATH_SW;
    case 'J': return PATH_NW;
    case 'L': return PATH_NE;
  }
  return PATH_NONE;
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
