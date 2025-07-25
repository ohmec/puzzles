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

let PUZZLE_DOUBLECHOCO = 1;
let PUZZLE_NURIKABE = 2;
let PUZZLE_MASYU = 3;
let PUZZLE_FILLOMINO = 4;
let PUZZLE_HEYAWAKE = 5;
let PUZZLE_YAJILIN = 6;
let PUZZLE_SLITHERLINK = 7;
let PUZZLE_CHOCOBANANA = 8;
let PUZZLE_AKARI = 9;
let PUZZLE_HASHIWOKAKERO = 10;
let PUZZLE_HITORI = 11;
let PUZZLE_RIPPLEEFFECT = 12;
let PUZZLE_SHIKAKU = 13;
let PUZZLE_LITS = 14;

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
let globalWallStates, globalLineStates, globalCircleStates;

function expandNumParams(numStr) {
  let expStr = numStr.replace(/_/gi, "");
  for (let cv=10;cv<36;cv++) {
    // replace lowercase values to that many dashes (-)
    // eventually replace uppercase values with the hex equivalent
    let c = cv.toString(36);
    let cre = new RegExp(c, 'g');
    let dash = '-'.repeat(cv-9);
    expStr = expStr.replace(cre, dash);
  }
  return expStr;
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

function initBoardValuesFromParams(numParamText, hasDir=false) {
  // special case for hasDir; 1v (2v 3v etc) indicates a south
  // arrow so we need to convert those to another character
  // before expandNumParams
  if (hasDir) {
    numParamText = numParamText.replace(/([0-9])v/g, "$1*");
  }
  let numParams = expandNumParams(numParamText);
  if (numParams.length != (globalPuzzleH*globalPuzzleW)) {
    console.log("ERROR in puzzle descriptor nums, got length " + numParams.length +
                " expected " + (globalPuzzleH*globalPuzzleW));
    return;
  }
  let boardValues = new Array(globalPuzzleH);
  let scoot = 0;  // only used for hasDir
  for (let y=0;y<globalPuzzleH;y++) {
    boardValues[y] = new Array(globalPuzzleW);
    for (let x=0;x<globalPuzzleW;x++) {
      let param = numParams[y*globalPuzzleW+x+scoot];
      if (hasDir && param != '-') {
        let paramDir = numParams[y*globalPuzzleW+x+scoot+1];
        paramDir = paramDir.replace(/\*/,"v");
        scoot++;
        // look for a number always followed by direction
        boardValues[y][x] = param + paramDir;
      } else {
        boardValues[y][x] = (param == '-') ? "" : (param == '*') ? "" : parseInt(param,36);
      }
    }
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
  for (let b=0;b<boxParamArray.length;b+=4) {
    let by = parseInt(boxParamArray[b+0], 36);
    let bx = parseInt(boxParamArray[b+1], 36);
    let bh = parseInt(boxParamArray[b+2], 36);
    let bw = parseInt(boxParamArray[b+3], 36);
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
      drawTile(x,y,globalBoardColors[y][x],globalBoardValues[y][x],globalCircleStates[y][x],globalLineStates[y][x],lineFirst,globalBoardTextColors[y][x]);
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

function drawTile(x,y,color,value,circle,line,lineFirst,textColor) {
  let drawX = Math.floor(x*globalGridSize);
  let drawY = Math.floor(y*globalGridSize);
  globalContext.fillStyle = color;
  globalContext.fillRect(drawX,drawY,globalGridSize,globalGridSize);
  if (lineFirst) {
    drawLine(x,y,line);
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
  if (value) {
    let vstr = "";
    globalContext.textAlign = "center";
    globalContext.fillStyle = textColor;
    globalContext.font = "bold " + (globalGridSize*globalFontSize) + "pt " + "Courier, sans-serif";
    if (isNaN(value) == false) {
      vstr = value;
    } else if (value.search(/^[A-Z1-9]$/) != -1) {
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
  }
  if (!lineFirst) {
    drawLine(x,y,line);
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

function drawLine(x,y,state) {
  let segments = 0;
  let count = 1;
  if (state && state.search(/2/) != -1) {
    count = 2;
    state = state.replace(/2/, "");
  }
  let drawX1, drawX2, drawX3, drawX4, drawY1, drawY2, drawY3, drawY4;
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
      globalContext.lineWidth = 1;
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

function travelRiver(arrayYX,y,x,trueFalse) {
  let riverCells = new Array();
  let tryindex = 0;
  riverCells.push(y+","+x);
  while (riverCells.length > tryindex) {
    let curCell = riverCells[tryindex].split(",");
    let iy = parseInt(curCell[0]);
    let ix = parseInt(curCell[1]);
    if ((iy != (globalPuzzleH-1)) &&
        (riverCells.indexOf((parseInt(iy)+1)+","+ix) == -1) &&
        (arrayYX[parseInt(iy)+1][ix] == trueFalse)) {
      riverCells.push((parseInt(iy)+1)+","+ix);
    }
    if ((iy != 0) &&
        (riverCells.indexOf((parseInt(iy)-1)+","+ix) == -1) &&
        (arrayYX[parseInt(iy)-1][ix] == trueFalse)) {
      riverCells.push((parseInt(iy)-1)+","+ix);
    }
    if ((ix != (globalPuzzleW-1)) &&
        (riverCells.indexOf(iy+","+(parseInt(ix)+1)) == -1) &&
        (arrayYX[iy][parseInt(ix)+1] == trueFalse)) {
      riverCells.push(iy+","+(parseInt(ix)+1));
    }
    if ((ix != 0) &&
        (riverCells.indexOf(iy+","+(parseInt(ix)-1)) == -1) &&
        (arrayYX[iy][parseInt(ix)-1] == trueFalse)) {
      riverCells.push(iy+","+(parseInt(ix)-1));
    }
    tryindex++;
  }
  return riverCells;
}

function findPolyominos() {
  let polyoList = new Array();
  let coveredCells = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (coveredCells.indexOf(y+","+x) == -1) {
        let polyo = travelPolyo(y,x);
        polyoList.push(polyo);
        coveredCells.push.apply(coveredCells,polyo);
      }
    }
  }
  return polyoList;
}

function travelPolyo(y,x) {
  let polyo = new Array;
  let tryindex = 0;
  polyo.push(y+","+x);
  while (polyo.length > tryindex) {
    let curCell = polyo[tryindex].split(",");
    let iy = parseInt(curCell[0]);
    let ix = parseInt(curCell[1]);
    let wy = iy*2+1;
    let wx = ix*2+1;
    if ((iy != (globalPuzzleH-1)) &&
        (polyo.indexOf((iy+1)+","+ix) == -1) &&
        (globalWallStates[wy+1][wx] != constWallBorder)) {
      polyo.push((iy+1)+","+ix);
    }
    if ((iy != 0) &&
        (polyo.indexOf((iy-1)+","+ix) == -1) &&
        (globalWallStates[wy-1][wx] != constWallBorder)) {
      polyo.push((iy-1)+","+ix);
    }
    if ((ix != (globalPuzzleW-1)) &&
        (polyo.indexOf(iy+","+(ix+1)) == -1) &&
        (globalWallStates[wy][wx+1] != constWallBorder)) {
      polyo.push(iy+","+(ix+1));
    }
    if ((ix != 0) &&
        (polyo.indexOf(iy+","+(ix-1)) == -1) &&
        (globalWallStates[wy][wx-1] != constWallBorder)) {
      polyo.push(iy+","+(ix-1));
    }
    tryindex++;
  }
  return polyo;
}
