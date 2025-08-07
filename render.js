const CLICK_LEFT    = 0;
const CLICK_MIDDLE  = 1;
const CLICK_RIGHT   = 2;
const CLICK_UNKNOWN = 9;

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
const KEY_7     = 0x37;
const KEY_9     = 0x39;
const ALT_0     = 0x60; // these are the number pad versions
const ALT_1     = 0x61;
const ALT_9     = 0x69;
const KEY_A     = 0x41;
const KEY_F     = 0x46;
const KEY_I     = 0x49;
const KEY_J     = 0x4a;
const KEY_L     = 0x4c;
const KEY_Z     = 0x5a;
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

const PUZZLE_DOUBLECHOCO = 1;
const PUZZLE_NURIKABE = 2;
const PUZZLE_MASYU = 3;
const PUZZLE_FILLOMINO = 4;
const PUZZLE_HEYAWAKE = 5;
const PUZZLE_YAJILIN = 6;
const PUZZLE_SLITHERLINK = 7;
const PUZZLE_CHOCOBANANA = 8;
const PUZZLE_AKARI = 9;
const PUZZLE_HASHIWOKAKERO = 10;
const PUZZLE_HITORI = 11;
const PUZZLE_RIPPLEEFFECT = 12;
const PUZZLE_SHIKAKU = 13;
const PUZZLE_LITS = 14;

let puzzleName = [ "undefined", "Double Choco", "Nurikabe",
  "Masyu", "Fillomino", "Heyawake", "Yajilin", "Slitherlink", "Choco Banana",
  "Akari", "Hashiwokakero", "Hitori", "Ripple Effect", "Shikaku", "LITS"];

const constWallNone      = 0b000000000;
const constWallLight     = 0b000000001;
const constWallStandard  = 0b000000010;
const constWallDash      = 0b000000100;
const constWallBorder    = 0b000001000;
const constWallStartEdge = 0b000010000;
const constWallEnterEdge = 0b000100000;
const constWallClickEdge = 0b001000000;
const constWallGangEdge  = 0b010000000;

const constHoriz = true;
const constVert  = false;

const constColorLightGray = "#c0c0c0";
const constColorMedGray   = "#a0a0a0";
const constColorSuccess   = "#1be032";
const constColorCursor    = "#ff80ff";

const EMPTYCELL = -1;

let globalFontSize = 0.5;
let globalGridSize = 45;
let globalPuzzleH = 10;
let globalPuzzleW = 10;
let globalCircleRadius = 0.4;
let globalCursorOn = false;
let globalCursorY = 0;
let globalCursorX = 0;

let globalContext, globalInitBoardValues, globalInitWallStates;
let globalBoardValues, globalBoardColors, globalBoardTextColors;
let globalWallStates, globalLineStates, globalBoardLineColors;
let globalCircleStates;

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
  if(puzzleW > 20) {
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

function initBobFromValue(value) {
  let yxArray = new Array(globalPuzzleH);
  for (let y=0;y<globalPuzzleH;y++) {
    yxArray[y] = new Array(globalPuzzleW);
    for (let x=0;x<globalPuzzleW;x++) {
      yxArray[y][x] = 63;
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

function initYXWithValues(defvalue,avalue,array) {
  let yxArray = new Array(globalPuzzleH);
  for (let y=0;y<globalPuzzleH;y++) {
    yxArray[y] = new Array(globalPuzzleW);
    for (let x=0;x<globalPuzzleW;x++) {
      yxArray[y][x] = defvalue;
    }
  }
  for (let m=0;m<array.length;m++) {
    let curCell = array[m].split(",");
    let iy = curCell[0];
    let ix = curCell[1];
    yxArray[iy][ix] = avalue;
  }
  return yxArray;
}

function initBoardValuesFromParams(numParamText,hasDir=false,charForNum=false) {
  // first figure out if this is a completed path type, in
  // which case it will have [FJ7L|_] to indicate path segments.
  // if so, then we need to treat the FJL7|_ characters as line
  // and ignore in board values
  let isFullPathType = false;
  if ((numParamText.search(/F/) != -1) && (numParamText.search(/|/) != -1) &&
      (numParamText.search(/J/) != -1) && (numParamText.search(/_/) != -1) &&
      (numParamText.search(/7/) != -1) && (numParamText.search(/L/) != -1)) {
    isFullPathType = true;
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
        numParams[i] = parseInt(numParams[i],36) - 10;
      }
      if (val.search(/[K-T]/) != -1) {
        numParams[i] = parseInt(numParams[i],36) - 20;
      }
    }
  }
  if (!hasDir && (numParams.length != (globalPuzzleH*globalPuzzleW))) {
    console.log("ERROR in puzzle descriptor nums, got length " + numParams.length +
                " expected " + (globalPuzzleH*globalPuzzleW));
    return;
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
          (param == '_') ? "" :
          (isFullPathType && (param.search(/[FJL7\|]/)!=-1)) ? "" :
            parseInt(param,36);
      }
    }
  }
  if (hasDir && (numParams.length != (globalPuzzleH*globalPuzzleW+scoot))) {
    console.log("ERROR in puzzle descriptor nums, got length " + numParams.length +
                " expected " + (globalPuzzleH*globalPuzzleW+scoot));
    return;
  }
  return boardValues;
}

function initLineValuesFromParams(numParamText,hasDir=false) {
  // first figure out if this is even a completed type, in
  // which case it will have |s and _s to indicate path segments.
  // if not, then there are no line values. if so, then we need
  // to treat the FJL7|_ characters as line segments
  let lineValues;
  if ((numParamText.search(/F/)!=-1) && (numParamText.search(/|/)!=-1) &&
      (numParamText.search(/J/)!=-1) && (numParamText.search(/_/)!=-1) &&
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
            (param == '*') ? "" :
            (param == '_') ? "-" : param;
        }
      }
    }
    if (hasDir && (numParams.length != (globalPuzzleH*globalPuzzleW+scoot))) {
      console.log("ERROR in puzzle descriptor nums, got length " + numParams.length +
                  " expected " + (globalPuzzleH*globalPuzzleW+scoot));
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
          console.log("ERROR: cell " + y + "," + x + " extends beyond puzzle board");
          inError = 1;
        }
        if (x>=globalPuzzleW) {
          console.log("ERROR: cell " + y + "," + x + " extends beyond puzzle board");
          inError = 1;
        }
        totalCount++;
        if (cellCounts[y][x] != 0) {
          console.log("ERROR: cell " + y + "," + x + " is used by two box descriptors");
          inError = 1;
        }
        cellCounts[y][x]++;
      }
    }
  }
  if (totalCount != (globalPuzzleH*globalPuzzleW)) {
    console.log("ERROR: box descriptors only cover " + totalCount + " of the required " + (globalPuzzleH*globalPuzzleW) + " cells");
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
        (numParams[y*globalPuzzleW+x] == '-') ? "white" : "black";
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

function initWallStatesFromBoxes(boxParams,defState) {
  let boxParamArray = boxParams.replace(/\./gi, "").split("");
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
        wallStates[y][x] = defState;
      }
    }
  }
  for (let b=0;b<boxParamArray.length;b+=5) {
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
    console.log("ERROR in puzzle descriptor row walls, got length " + hexParamArrayRows.length +
                " expected " + expLenH);
    return;
  }
  if (expLenW != hexParamArrayCols.length) {
    console.log("ERROR in puzzle descriptor col walls, got length " + hexParamArrayCols.length +
                " expected " + expLenW);
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

function drawBoard(lineFirst = false, textColor = "black", drawDots = false) {
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      drawTile(x,y,
               globalBoardColors[y][x],
               globalBoardValues[y][x],
               globalCircleStates[y][x],
               globalLineStates[y][x],
               lineFirst,
               globalBoardTextColors[y][x],
               globalBoardLineColors[y][x]);
    }
  }
  // draw horizontal walls
  for (let y=2;y<=2*globalPuzzleH;y+=2) {
    for (let x=1;x<=2*globalPuzzleW;x+=2) {
      drawWall(constHoriz,x,y,globalWallStates[y][x]);
    }
  }
  for (let y=1;y<=2*globalPuzzleH;y+=2) {
    for (let x=2;x<=2*globalPuzzleW;x+=2) {
      drawWall(constVert,x,y,globalWallStates[y][x]);
    }
  }
  if (globalCursorOn) {
    drawCursor();
  }
  if (drawDots) {
    for (let y=0;y<=globalPuzzleH;y++) {
      for (let x=0;x<=globalPuzzleW;x++) {
        drawDot(x,y);
      }
    }
  }
}

function drawTile(x,y,color,value,circle,line,lineFirst,textColor,lineColor) {
  let drawX = Math.floor(x*globalGridSize);
  let drawY = Math.floor(y*globalGridSize);
  globalContext.fillStyle = color;
  globalContext.fillRect(drawX,drawY,globalGridSize,globalGridSize);
  if (lineFirst) {
    drawLine(x,y,line,lineColor);
  }
  // draw circle next if it exists
  if (circle) {
    globalContext.lineWidth = 2.5;
    globalContext.strokeStyle = "black";
    globalContext.fillStyle = (circle==2) ? "black" : "white";
    globalContext.beginPath();
    globalContext.arc(drawX+globalGridSize/2,
                drawY+globalGridSize/2,
                globalCircleRadius*globalGridSize,0,2*Math.PI);
    globalContext.stroke();
    globalContext.fill();
  }
  // now text of value
  let vstr = "";
  globalContext.textAlign = "center";
  globalContext.fillStyle = textColor;
  globalContext.font = "bold " + (globalGridSize*globalFontSize) + "pt " + "Courier, sans-serif";
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
    drawLine(x,y,line,lineColor);
  }
}

function drawCursor() {
  let drawX = Math.floor(globalCursorX*globalGridSize)+1;
  let drawY = Math.floor(globalCursorY*globalGridSize)+1;
  globalContext.lineWidth = 4;
  globalContext.strokeStyle = constColorCursor;
  globalContext.strokeRect(drawX,drawY,globalGridSize-2,globalGridSize-2);
}

function drawWall(horv,x,y,wallState) {
  let drawX1 = (horv == constHoriz) ? (x-1)*globalGridSize*0.5 : x*globalGridSize*0.5;
  let drawX2 = (horv == constHoriz) ? (x+1)*globalGridSize*0.5 : x*globalGridSize*0.5;
  let drawY1 = (horv == constVert)  ? (y-1)*globalGridSize*0.5 : y*globalGridSize*0.5;
  let drawY2 = (horv == constVert)  ? (y+1)*globalGridSize*0.5 : y*globalGridSize*0.5;
  globalContext.strokeStyle = "black";
  if (wallState != constWallNone) {
    if (wallState == constWallDash) {
      globalContext.setLineDash([2,2]);
      globalContext.lineWidth = 1;
    } else {
      if (wallState == constWallBorder) {
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
  // reset
  globalContext.lineWidth = 1;
  globalContext.setLineDash([]);
}

function drawCircle(x,y,state,radius) {
  let drawX = Math.floor((x+0.5)*globalGridSize);
  let drawY = Math.floor((y+0.5)*globalGridSize);
  if (state) {
    globalContext.lineWidth = 1.5;
    globalContext.fillStyle = "black";
    globalContext.beginPath();
    globalContext.arc(drawX,drawY,radius*globalGridSize,0,2*Math.PI);
    if (state == 1) {
      globalContext.stroke();
    } else {
      globalContext.fill();
    }
  }
}

function drawDot(x,y) {
  let drawX = Math.floor(x*globalGridSize);
  let drawY = Math.floor(y*globalGridSize);
  globalContext.lineWidth = 1;
  globalContext.fillStyle = "black";
  globalContext.beginPath();
  globalContext.arc(drawX,drawY,0.05*globalGridSize,0,2*Math.PI);
  globalContext.fill();
}

function drawLine(x,y,state,color) {
  let segments = 0;
  let count = 1;
  if (state && state.search(/2/) != -1) {
    count = 2;
    state = state.replace(/2/, "");
  }
  let drawX1, drawX2, drawX3, drawX4, drawY1, drawY2, drawY3, drawY4;
  globalContext.strokeStyle = color;
  for (let i=0;i<count;i++) {
    let offset = (count==1) ? 0 : (i==0) ? (-0.075*globalGridSize) : (0.075*globalGridSize);
    switch (state) {
      case "|":
        segments = 1;
        drawX1 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY1 = Math.floor((y    )*globalGridSize);
        drawX2 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY2 = Math.floor((y+1.0)*globalGridSize);
        break;
      case "N":
        segments = 1;
        drawX1 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY1 = Math.floor((y    )*globalGridSize);
        drawX2 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY2 = Math.floor((y+0.5)*globalGridSize);
        break;
      case "S":
        segments = 1;
        drawX1 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY1 = Math.floor((y+0.5)*globalGridSize);
        drawX2 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY2 = Math.floor((y+1.0)*globalGridSize);
        break;
      case "-":
      case "_":
        segments = 1;
        drawX1 = Math.floor((x    )*globalGridSize);
        drawY1 = Math.floor((y+0.5)*globalGridSize)+offset;
        drawX2 = Math.floor((x+1.0)*globalGridSize);
        drawY2 = Math.floor((y+0.5)*globalGridSize)+offset;
        break;
      case "E":
        segments = 1;
        drawX1 = Math.floor((x+0.5)*globalGridSize);
        drawY1 = Math.floor((y+0.5)*globalGridSize)+offset;
        drawX2 = Math.floor((x+1.0)*globalGridSize);
        drawY2 = Math.floor((y+0.5)*globalGridSize)+offset;
        break;
      case "W":
        segments = 1;
        drawX1 = Math.floor((x    )*globalGridSize);
        drawY1 = Math.floor((y+0.5)*globalGridSize)+offset;
        drawX2 = Math.floor((x+0.5)*globalGridSize);
        drawY2 = Math.floor((y+0.5)*globalGridSize)+offset;
        break;
      case 7:
      case "7":
        segments = 2;
        drawX1 = Math.floor((x    )*globalGridSize);
        drawY1 = Math.floor((y+0.5)*globalGridSize)+offset;
        drawX2 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY2 = Math.floor((y+0.5)*globalGridSize)+offset;
        drawX3 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY3 = Math.floor((y+1.0)*globalGridSize);
        break;
      case "F":
        segments = 2;
        drawX1 = Math.floor((x+1.0)*globalGridSize);
        drawY1 = Math.floor((y+0.5)*globalGridSize)+offset;
        drawX2 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY2 = Math.floor((y+0.5)*globalGridSize)+offset;
        drawX3 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY3 = Math.floor((y+1.0)*globalGridSize);
        break;
      case "L":
        segments = 2;
        drawX1 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY1 = Math.floor((y    )*globalGridSize);
        drawX2 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY2 = Math.floor((y+0.5)*globalGridSize)+offset;
        drawX3 = Math.floor((x+1.0)*globalGridSize);
        drawY3 = Math.floor((y+0.5)*globalGridSize)+offset;
        break;
      case "J":
        segments = 2;
        drawX1 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY1 = Math.floor((y    )*globalGridSize);
        drawX2 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY2 = Math.floor((y+0.5)*globalGridSize)+offset;
        drawX3 = Math.floor((x    )*globalGridSize);
        drawY3 = Math.floor((y+0.5)*globalGridSize)+offset;
        break;
      case "+":
        segments = 3;
        drawX1 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY1 = Math.floor((y    )*globalGridSize);
        drawX2 = Math.floor((x+0.5)*globalGridSize)+offset;
        drawY2 = Math.floor((y+1.0)*globalGridSize);
        drawX3 = Math.floor((x    )*globalGridSize);
        drawY3 = Math.floor((y+0.5)*globalGridSize)+offset;
        drawX4 = Math.floor((x+1.0)*globalGridSize);
        drawY4 = Math.floor((y+0.5)*globalGridSize)+offset;
        break;
    }
    if (segments) {
      globalContext.lineWidth = 1.5;
      globalContext.beginPath();
      globalContext.moveTo(drawX1,drawY1);
      globalContext.lineTo(drawX2,drawY2);
      if (segments == 1) {
        globalContext.stroke();
      } else if (segments == 2) {
        globalContext.lineTo(drawX3,drawY3);
        globalContext.stroke();
      } else {
        globalContext.stroke();
        globalContext.beginPath();
        globalContext.moveTo(drawX3,drawY3);
        globalContext.lineTo(drawX4,drawY4);
        globalContext.stroke();
      }
    }
  }
  // special case for "line dot"
  if (state == ".") {
    let drawX = Math.floor((x+0.5)*globalGridSize);
    let drawY = Math.floor((y+0.5)*globalGridSize);
    globalContext.lineWidth = 1;
    globalContext.fillStyle = "black";
    globalContext.beginPath();
    globalContext.arc(drawX,drawY,0.05*globalGridSize,0,2*Math.PI);
    globalContext.fill();
  }
}

// convert click coordinates to tile and edge click info

function getClickCellInfo(coords) {
  let xCoord = coords[0];
  let yCoord = coords[1];
  let vertCell = Math.floor(yCoord/globalGridSize);
  let horzCell = Math.floor(xCoord/globalGridSize);
  let horzDistFromEdgeL = Math.abs((horzCell  )*globalGridSize - xCoord);
  let horzDistFromEdgeR = Math.abs((horzCell+1)*globalGridSize - xCoord);
  let vertDistFromEdgeU = Math.abs((vertCell  )*globalGridSize - yCoord);
  let vertDistFromEdgeD = Math.abs((vertCell+1)*globalGridSize - yCoord);
  if (horzDistFromEdgeL < (globalGridSize*0.1)) {
    return [ vertCell, horzCell, true, 2*vertCell+1, 2*horzCell ];
  } else if (horzDistFromEdgeR < (globalGridSize*0.1)) {
    return [ vertCell, horzCell, true, 2*vertCell+1, 2*horzCell+2 ];
  } else if (vertDistFromEdgeU < (globalGridSize*0.1)) {
    return [ vertCell, horzCell, true, 2*vertCell+0, 2*horzCell+1 ];
  } else if (vertDistFromEdgeD < (globalGridSize*0.1)) {
    return [ vertCell, horzCell, true, 2*vertCell+2, 2*horzCell+1 ];
  } else {
    return [ vertCell, horzCell, false, vertCell*2+1, horzCell*2+1 ];
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

function advanceLine(y,x,state,dir,clockwise) {
  let inerror = false;
  let alive = true;
  switch (state) {
    case '.':
      alive = false;
      break;
    case '-':
      if ((clockwise && dir==0) || dir=='W')
        { x++; dir = 'W'; }
      else if ((!clockwise && dir==0) || dir=='E')
        { x--; dir = 'E'; }
      else
        { inerror = true; }
      break;
    case '|':
      if ((clockwise && dir==0) || dir=='N')
        { y++; dir = 'N'; }
      else if ((!clockwise && dir==0) || dir=='S')
        { y--; dir = 'S'; }
      else
        { inerror = true; }
      break;
    case 'N':
      if (dir!=0 && dir!='N')
        { inerror = true; }
      alive = false;
      break;
    case 'S':
      if (dir!=0 && dir!='S')
        { inerror = true; }
      alive = false;
      break;
    case 'E':
      if (dir!=0 && dir!='E')
        { inerror = true; }
      alive = false;
      break;
    case 'W':
      if (dir!=0 && dir!='W')
        { inerror = true; }
      alive = false;
      break;
    case 'F':
      if ((clockwise && dir==0) || dir=='S')
        { x++; dir = 'W'; }
      else if ((!clockwise && dir==0) || dir=='E')
        { y++; dir = 'N'; }
      else
        { inerror = true; }
      break;
    case 'J':
      if ((clockwise && dir==0) || dir=='N')
        { x--; dir = 'E'; }
      else if ((!clockwise && dir==0) || dir=='W')
        { y--; dir = 'S'; }
      else
        { inerror = true; }
      break;
    case 'L':
      if ((clockwise && dir==0) || dir=='N')
        { x++; dir = 'W'; }
      else if ((!clockwise && dir==0) || dir=='E')
        { y--; dir = 'S'; }
      else
        { inerror = true; }
      break;
    case '7':
      if ((clockwise && dir==0) || dir=='S')
        { x--; dir = 'E'; }
      else if ((!clockwise && dir==0) || dir=='W')
        { y++; dir = 'N'; }
      else
        { inerror = true; }
      break;
    default:
      ended = true;
      break;
    }
  if (inerror) {
    console.log("FATAL: makes no sense, coming from " + y + "," + x + " with dir " + dir + " and found " + state);
  }
  return [alive,y,x,dir];
}

function travelLineLoop(arrayYX,y,x) {
  let lineCells = new Array();
  let tryindex = 0;
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

function roomIsRectangle(roomSquares) {
  let xmin = 999;
  let ymin = 999;
  let xmax = 0;
  let ymax = 0;
  for (let i=0;i<roomSquares.length;i++) {
    let square = roomSquares[i].split(",");
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
