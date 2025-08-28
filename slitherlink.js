let cellColor = "white";        // default
let grayColor = "#c0c0c0";
let greenColor = "#c0ffc0";
let correctColor   = "#3CC03C"; // blueish
let incorrectColor = "#C03C3C"; // reddish
let tooFewColor    = "#3C3CC0"; // blueish
let vertexColor = "black";
let openLineColor = "#000080";
let closedLineColor = "#008000";
let illegalLineColor = "#800000";
let inputColor = "black";
let gridSize, lineWidthThin, lineWidthFat, stdFont, boldFont;
let buttonSize = 45;
let numberFont = "Courier, sans-serif";
let invalidNumbers = new Array();
let solvedNumbers = new Array();
let unsolvedNumbers = new Array();
let clicking = false;
let dragging = false;
let activeNumber = "-";

let constWallNone      = 0b000;
let constWallSolveEdge = 0b001;
let constWallClickEdge = 0b010;
let constWallInferEdge = 0b100;

let constNumCorrect = 0;
let constNumTooMany = 1;
let constNumTooFew  = -1;

let constLoopError  = 0b00;
let constLoopOpen   = 0b01;
let constLoopClosed = 0b10;

let KEY_BS    = 0x08;
let KEY_CR    = 0x0d;
let KEY_ESC   = 0x1b;
let KEY_SP    = 0x20;
let KEY_S     = 0x53;
let KEY_LEFT  = 0x25;
let KEY_UP    = 0x26;
let KEY_RIGHT = 0x27;
let KEY_DOWN  = 0x28;

let puzzle, solveState, context, puzzleW, puzzleH, lastVert, lastHorz;
let puzzleState, wallState, grayState, greenState, offState;
let undoProgress, numberGroups, wallPaths;

function puzzleInit() {
  // any key anywhere as long as canvas is in focus
  $(document).keydown(function(evnt) {
    $("#saveButton").blur();
    $("#loadButton").blur();
    $("#clearButton").blur();
    $("#startButton").blur();
    $("#undoButton").blur();
    if (evnt.which === KEY_BS && !$(evnt.target).is("input")) {
      evnt.preventDefault();
    }
    if (evnt.which === KEY_SP && !$(evnt.target).is("input")) {
      evnt.preventDefault();
    }
    if (evnt.which >= KEY_LEFT && evnt.which <= KEY_DOWN && !$(evnt.target).is("input, textarea")) {
      evnt.preventDefault();
    }
    handleKey(evnt);
  });

  // a click (except right-click i.e. ctrl-click) on tabs.
  // hide old, show new
  $("#tabs li").click(function() {      
    $("#tabs li").removeClass('active');    
    $(this).addClass("active");     
    $(".tab_content").hide();
    $($(this).find("a").attr("href")).show();
    clicking = false;
    activeNumber = "-";
    lastVert = "";
    lastHorz = "";
    return false;
  });
  
  $("#tab1").show();

  // a click on display button; currently fails on Invalid Array
  // if the field in front of it doesn't work
  // Length in displayPuzzle (height?)
  $("#displayButton").click(function() {
    let pval = $("#userPuzzle").val();
    if (pval.search(/:/) == -1) {
      puzzle = removeDot(cannedPuzzles[pval]);
    } else {
      puzzle = removeDot(pval);
    }
    calculatePaths();
    initStructures(puzzle);
    validateSolution();
  });

  // click (down) within puzzle number entry, remove clicking
  // effect on canvas
  $("#userPuzzle").mousedown(function(evnt) {
    clicking = false;
    activeNumber = "-";
    lastVert = "";
    lastHorz = "";
  });

  // click (down) within puzzle frame, find out if contains number already
  $("#puzzleCanvas").mousedown(function(evnt) {
    clicking = true;
    activeNumber = getActiveNumber(evnt);
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

  // undo click. does the good job of removing one move at a time.
  $("#undoButton").click(function() {
    $("#canvasDiv").css("border-color", "black");
    undo();
  });

  // click on clear, brings up confirmation, then clears puzzle
  $("#clearButton").click(function() {
    $("#canvasDiv").css("border-color", "black");
    let clearDialog = confirm("Clear puzzle?");
    if (clearDialog == true) {
      clear();
    }
  });

  // click on solve, works through a few obvious moves for now
  $("#startButton").click(function() {
    $("#canvasDiv").css("border-color", "black");
    getStarted();
  });

  // unknown at this point, but contextmenu is within jquery.js
  // I added the ; which seems to not have changed anything so
  // I don't think it is related to what follows
  $("#puzzleCanvas").bind("contextmenu", function(evnt) { evnt.preventDefault(); });

  canvas = document.getElementById('puzzleCanvas');  
  context = canvas.getContext('2d');
 
  if(cannedPuzzles[puzzleChoice]) {
    puzzle = removeDot(cannedPuzzles[puzzleChoice]);
  } else {
    puzzle = removeDot(cannedPuzzles[0]);
  }

  calculatePaths();
  initStructures(puzzle);
  validateSolution();

  let spanHandle = document.querySelector('#puzzlecount1');
  spanHandle.textContent = puzzleCount-1;
  spanHandle = document.querySelector('#puzzlecount2');
  spanHandle.textContent = puzzleCount-1;
}

function handleKey(evnt) {
  let keynum = evnt.which;

  // look for CR within puzzle display field
  const focusedElement = document.activeElement;
  if (focusedElement && focusedElement.id == "userPuzzle" && keynum == KEY_CR) {
    let pval = $("#userPuzzle").val();
    if (pval.search(/:/) == -1) {
      puzzle = removeDot(cannedPuzzles[pval]);
    } else {
      puzzle = removeDot(pval);
    }
    initStructures(puzzle);
    validateSolution();
    return;
  }

  // refresh with "ESC"
  if (keynum == KEY_ESC) {
    continueSolve();
    validateSolution();
    console.log(wallState);
    return;
  }
  if (keynum == KEY_S) {
    getStarted();
    return;
  }
  if (keynum >= KEY_LEFT && keynum <= KEY_DOWN) {
    handleArrowKey(keynum);
    return;
  }
  if (keynum == KEY_BS) {
    number = "-";
  } else if (keynum == KEY_SP) {
    number = " ";
  } else {
    return;
  }
  handleNumberDrawing(number, lastVert, lastHorz);
}

function initStructures(puzzle) {
  $("#canvasDiv").css("border", "none");
  invalidNumbers = new Array();
  undoProgress = new Array();
  lastVert = "";
  lastHorz = "";
  // get the size and the digits out of the puzzle entry
  let puzzleSplit = puzzle.split(":");
  let size = puzzleSplit[0];
  let wxh = size.split("x");
  let puzzData = puzzleSplit[1];
  puzzleW = parseInt(wxh[0]);
  puzzleH = parseInt(wxh[1]);
  if(puzzleW > 20) {
    gridSize = 40;
  } else if(puzzleW <= 10) {
    gridSize = 50;
  } else {
    gridSize = 45;
  }
  lineWidthThin = gridSize*0.05;
  lineWidthFat  = gridSize*0.10;
  stdFont  = (gridSize*0.5)+"pt "+numberFont;
  boldFont = "bold "+stdFont;
  canvas.height = puzzleH*gridSize + 2*lineWidthFat;
  canvas.width  = puzzleW*gridSize + 2*lineWidthFat;

  // set up arrays for solveState, puzzleState, grayState and wallState
  solveState = new Array(puzzleH);
  for (let i=1;i<=puzzleH;i++) {
    solveState[i] = new Array(puzzleW);
  }
  puzzleState = new Array(puzzleH);
  for (let i=1;i<=puzzleH;i++) {
    puzzleState[i] = new Array(puzzleW);
  }

  grayState = new Array(puzzleH);
  for (let i=1;i<=puzzleH;i++) {
    grayState[i] = new Array(puzzleW);
  }

  let formattedPuzzle = puzzleSplit[1];
  formattedPuzzle = formattedPuzzle.replace(/_/gi, "");
  for (let cv=10;cv<36;cv++) {
    // replace lowercase values to that many dashes (-)
    // eventually replace uppercase values with the hex equivalent
    let c = cv.toString(36);
    let cre = new RegExp(c, 'g');
    let dash = '-'.repeat(cv-9);
    formattedPuzzle = formattedPuzzle.replace(cre, dash);
  }

  let puzzData2 = formattedPuzzle.split("");
  let z = 0;
  for (x=1;x<=puzzleH;x++) {
    for (y=1;y<=puzzleW;y++) {
      if (puzzData2[z] == "-") {
        puzzleState[x][y] = "-";
        solveState[x][y] = "-";
      } else {
        puzzleState[x][y] = "("+puzzData2[z]+")";
        solveState[x][y] = convertToNum(puzzData2[z]);
      }
      z++;
      grayState[x][y] = false;
    }
  }

  let wallH = puzzleH*2+1;
  let wallW = puzzleW*2+1;
  wallState = new Array(wallH);
  for (let i=0;i<wallH;i++) {
    wallState[i] = new Array(wallW);
    for (let j=0;j<wallW;j++) {
      // initialize wall state as none
      wallState[i][j] = constWallNone;
    }
  }
  offState = new Array(wallH);
  for (let i=0;i<wallH;i++) {
    offState[i] = new Array(wallW);
    for (let j=0;j<wallW;j++) {
      offState[i][j] = false;
    }
  }

  wallPaths = new Array;
}

function removeDot(strval) {
  return strval.replace(/\./gi, "");
}

function drawGiven(number, x, y) {
  let drawY = Math.floor((x-1)*gridSize) + lineWidthFat;
  let drawX = Math.floor((y-1)*gridSize) + lineWidthFat;
  context.fillStyle = cellColor;
  context.font = boldFont;
  context.textAlign = "center";
  
  // convert A-Z to 10-35
  let numExp = convertToNum(number);
  context.fillText(numExp, drawX+(gridSize*0.5), drawY+(gridSize*0.75));
}

function savePuzzle() {
  let solution = "";
  for (x=1;x<=puzzleH;x++) {
    for (y=1;y<=puzzleW;y++) {
      solution += solveState[x][y];
    }
  }
  localStorage.removeItem("KOSavedFillomino");
  localStorage.removeItem("KOSavedFillominoSolution");
  localStorage.setItem("KOSavedFillomino", puzzle);
  localStorage.setItem("KOSavedFillominoSolution", solution);
}

function refreshPuzzle(ignoreOff = true) {
  // clear the whole canvas
  context.fillStyle = cellColor;
  context.fillRect(0,0,puzzleW*gridSize+2*lineWidthFat,puzzleH*gridSize+2*lineWidthFat);

  // draw blank tiles first, light green if solved, grayed if " "
  for (x=1;x<=puzzleH;x++) {
    for (y=1;y<=puzzleW;y++) {
      if (greenState[x][y]) {
        greenTile(x,y);
      } else if (grayState[x][y]) {
        grayTile(x,y);
      } else {
        blankTile(x,y);
      }
    }
  }
  // then draw vertices
  for (let x=0;x<=puzzleH;x++) {
    for (let y=0;y<=puzzleW;y++) {
      drawVertex(x,y);
    }
  }
  // now draw numbers
  for (let x=1;x<=puzzleH;x++) {
    for (let y=1;y<=puzzleW;y++) {
      if (puzzleState[x][y] != '-') {
        drawNumber(solveState[x][y], x, y);
      }
    }
  }
  // go through each wall loop and color accordingly (green for
  // closed, blue for open, red for in error)
  for (let i=0;i<wallPaths.length;i++) {
    let strokeColor;
    let pathState = wallPaths[i][0];
    if (pathState == constLoopError) {
      strokeColor = illegalLineColor;
    } else if (pathState == constLoopOpen) {
      strokeColor = openLineColor;
    } else {
      strokeColor = closedLineColor;
    }
    context.strokeStyle = strokeColor;
    context.lineWidth = lineWidthThin;
    for (let j=0;j<wallPaths[i][1].length;j++) {
      let xy = wallPaths[i][1][j].split("-");
      let x = xy[0];
      let y = xy[1];
      let drawY0, drawX0, drawY1, drawX1;
      if (x%2) {
        drawY0 = Math.floor(((x-1)/2)*gridSize) + lineWidthFat;
        drawX0 = Math.floor(( y   /2)*gridSize) + lineWidthFat;
        drawY1 = drawY0 + gridSize;
        drawX1 = drawX0;
      } else {
        drawY0 = Math.floor(( x   /2)*gridSize) + lineWidthFat;
        drawX0 = Math.floor(((y-1)/2)*gridSize) + lineWidthFat;
        drawY1 = drawY0;
        drawX1 = drawX0 + gridSize;
      }
      context.beginPath();
      context.moveTo(drawX0,drawY0);
      context.lineTo(drawX1,drawY1);
      context.stroke();
    }
  }
  if (!ignoreOff) {
    // draw little Xs for offState
    let wallH = puzzleH*2+1;
    let wallW = puzzleW*2+1;
    context.strokeStyle = "purple";
    for (let wx=0;wx<wallH;wx++) {
      for (let wy=0;wy<wallW;wy++) {
        if (wx%2 && !(wy%2)) {
          if ((wallState[wx][wy] == constWallNone) && offState[wx][wy]) {
            drawOffX(wx,wy);
          }
        } else if (wy%2 && !(wx%2)) {
          if ((wallState[wx][wy] == constWallNone) && offState[wx][wy]) {
            drawOffX(wx,wy);
          }
        }
      }
    }
  }
}

function drawOffX(x,y) {
  let drawY = Math.floor((x/2)*gridSize) + lineWidthFat;
  let drawX = Math.floor((y/2)*gridSize) + lineWidthFat;
  context.strokeStyle = incorrectColor;
  context.lineWidth = lineWidthThin;
  context.beginPath();
  context.moveTo(drawX-lineWidthFat,drawY-lineWidthFat);
  context.lineTo(drawX+lineWidthFat,drawY+lineWidthFat);
  context.moveTo(drawX-lineWidthFat,drawY+lineWidthFat);
  context.lineTo(drawX+lineWidthFat,drawY-lineWidthFat);
  context.stroke();
}

function convertToNum(numstr) {
  if (isNaN(numstr) == false) {
    return numstr;
  }
  if (numstr.search(/[0-3]/) != -1) {
    return parseInt(numstr, 10);
  }
  return "-";
}

function travelWalls(xStart, yStart) {
  let visitedWalls = new Array();
  let x = xStart;
  let y = yStart;
  let continueTraveling = true;
  let inError = false;
  let isClosed = false;
  let tuple = new Array;
  while (continueTraveling == true) {
    if (visitedWalls.indexOf(x+"-"+y) == -1) {
      visitedWalls.push(x+"-"+y);
    }
    x = x*1;
    y = y*1;
    let NWtrue, NNtrue, NEtrue, EEtrue, SEtrue, SStrue, SWtrue, WWtrue;
    if (x>0 && y>0 && wallState[x-1][y-1] != constWallNone) {
      NWtrue = 1;
    } else {
      NWtrue = 0;
    }
    if (((x%2)==1) && x>1 && wallState[x-2][y] != constWallNone) {
      NNtrue = 1;
    } else {
      NNtrue = 0;
    }
    if (x>0 && y<2*puzzleW && wallState[x-1][y+1] != constWallNone) {
      NEtrue = 1;
    } else {
      NEtrue = 0;
    }
    if (((x%2)==0) && y<(2*puzzleW-1) && wallState[x][y+2] != constWallNone) {
      EEtrue = 1;
    } else {
      EEtrue = 0;
    }
    if (x<2*puzzleH && y<2*puzzleW && wallState[x+1][y+1] != constWallNone) {
      SEtrue = 1;
    } else {
      SEtrue = 0;
    }
    if (((x%2)==1) && x<(2*puzzleH-1) && wallState[x+2][y] != constWallNone) {
      SStrue = 1;
    } else {
      SStrue = 0;
    }
    if (x<2*puzzleH && y>0 && wallState[x+1][y-1] != constWallNone) {
      SWtrue = 1;
    } else {
      SWtrue = 0;
    }
    if (((x%2)==0) && y>1 && wallState[x][y-2] != constWallNone) {
      WWtrue = 1;
    } else {
      WWtrue = 0;
    }
    if ((NWtrue+NNtrue+NEtrue+EEtrue+SEtrue+SStrue+SWtrue+WWtrue)>2) {
      inError = true;
    }
    
    if      (NWtrue && visitedWalls.indexOf((x-1)+"-"+(y-1))==-1) { x--; y--; }
    else if (NNtrue && visitedWalls.indexOf((x-2)+"-"+ y   )==-1) { x-=2; }
    else if (NEtrue && visitedWalls.indexOf((x-1)+"-"+(y+1))==-1) { x--; y++; }
    else if (EEtrue && visitedWalls.indexOf( x   +"-"+(y+2))==-1) { y+=2; }
    else if (SEtrue && visitedWalls.indexOf((x+1)+"-"+(y+1))==-1) { x++; y++; }
    else if (SStrue && visitedWalls.indexOf((x+2)+"-"+ y   )==-1) { x+=2; }
    else if (SWtrue && visitedWalls.indexOf((x+1)+"-"+(y-1))==-1) { x++; y--; }
    else if (WWtrue && visitedWalls.indexOf( x   +"-"+(y-2))==-1) { y-=2; }
    else {
      continueTraveling = false;
      if (visitedWalls.length > 3) {
        // check to see if we would have ended up at beginning, determines
        // closed loop
        if (NWtrue && (x-1)==xStart && (y-1)==yStart) {
          isClosed = true;
        }
        if (NNtrue && (x-2)==xStart &&  y   ==yStart) {
          isClosed = true;
        }
        if (NEtrue && (x-1)==xStart && (y+1)==yStart) {
          isClosed = true;
        }
        if (EEtrue &&  x   ==xStart && (y+2)==yStart) {
          isClosed = true;
        }
        if (SEtrue && (x+1)==xStart && (y+1)==yStart) {
          isClosed = true;
        }
        if (SStrue && (x+2)==xStart &&  y   ==yStart) {
          isClosed = true;
        }
        if (SWtrue && (x+1)==xStart && (y-1)==yStart) {
          isClosed = true;
        }
        if (WWtrue &&  x   ==xStart && (y-2)==yStart) {
          isClosed = true;
        }
      }
    }
  }
  if (inError) {
    tuple.push(constLoopError)
  } else if (isClosed) {
    tuple.push(constLoopClosed)
  } else {
    tuple.push(constLoopOpen)
  }
  visitedWalls.splice(xStart+"-"+yStart, 0);
  tuple.push(visitedWalls);
  return tuple;
}

function findPosition(evnt, canvas) {
  let canvasElement = document.getElementById(canvas);
  let x = evnt.pageX-$(canvasElement).offset().left-parseInt($(canvasElement).css("border-left-width"));
  let y = evnt.pageY-$(canvasElement).offset().top-parseInt($(canvasElement).css("border-top-width"));
  return x+"-"+y;
}

function getActiveNumber(evnt) {
  let coords = findPosition(evnt, "puzzleCanvas");
  coords = coords.split("-");
  let xCoord = coords[0];
  let yCoord = coords[1];
  let vertCell = (Math.floor(yCoord/gridSize)+1) + lineWidthFat;
  let horzCell = (Math.floor(xCoord/gridSize)+1) + lineWidthFat;
  if (vertCell>puzzleH) {
    vertCell = puzzleH;
  }
  if (horzCell>puzzleW) {
    horzCell = puzzleW;
  }
  if (vertCell<1) {
    vertCell = 1;
  }
  if (horzCell < 1) {
    horzCell = 1;
  }
  return solveState[vertCell][horzCell];
}

function handleClick(evnt) {
  $("#userPuzzleField").blur();
  let coords = findPosition(evnt, "puzzleCanvas");
  coords = coords.split("-");
  let xCoord = coords[0] - lineWidthFat;
  let yCoord = coords[1] - lineWidthFat;
  let vertCell = Math.floor(yCoord/gridSize)+1;
  let horzCell = Math.floor(xCoord/gridSize)+1;
  let horzDistFromEdgeL = Math.abs((horzCell-1)*gridSize - xCoord);
  let horzDistFromEdgeR = Math.abs((horzCell  )*gridSize - xCoord);
  let vertDistFromEdgeU = Math.abs((vertCell-1)*gridSize - yCoord);
  let vertDistFromEdgeD = Math.abs((vertCell  )*gridSize - yCoord);
  let foundOne = false;
  if (!dragging) {
    if (horzDistFromEdgeL < 2*lineWidthFat) {
      if (vertDistFromEdgeU < 2*lineWidthFat) {
        return;
      }
      if (vertDistFromEdgeD < 2*lineWidthFat) {
        return;
      }
      foundOne = true;
      rotateWall(2*vertCell-1,2*horzCell-2);
    }
    if (horzDistFromEdgeR < 2*lineWidthFat) {
      if (vertDistFromEdgeU < 2*lineWidthFat) {
        return;
      }
      if (vertDistFromEdgeD < 2*lineWidthFat) {
        return;
      }
      foundOne = true;
      rotateWall(2*vertCell-1,2*horzCell);
    }
    if (vertDistFromEdgeU < 2*lineWidthFat) {
      if (horzDistFromEdgeL < 2*lineWidthFat) {
        return;
      }
      if (horzDistFromEdgeR < 2*lineWidthFat) {
        return;
      }
      foundOne = true;
      rotateWall(2*vertCell-2,2*horzCell-1);
    }
    if (vertDistFromEdgeD < 2*lineWidthFat) {
      if (horzDistFromEdgeL < 2*lineWidthFat) {
        return;
      }
      if (horzDistFromEdgeR < 2*lineWidthFat) {
        return;
      }
      foundOne = true;
      rotateWall(2*vertCell,2*horzCell-1);
    }
    if (foundOne) {
      calculatePaths();
      validateSolution();
      return;
    }
  }

  if (vertCell>puzzleH) {
    vertCell = puzzleH;
  }
  if (horzCell>puzzleW) {
    horzCell = puzzleW;
  }
  if (vertCell<1) {
    vertCell = 1;
  }
  if (horzCell<1) {
    horzCell = 1;
  }

  lastVert = vertCell;
  lastHorz = horzCell;
  validateSolution();
}

function rotateWall(wx,wy) {
  if (wallState[wx][wy] == constWallSolveEdge) {
    return;
  }
  if (wallState[wx][wy] == constWallClickEdge) {
    wallState[wx][wy] = constWallNone;
    offState[wx][wy] = true;
  } else if (offState[wx][wy]) {
    offState[wx][wy] = false;
  } else {
    wallState[wx][wy] = constWallClickEdge;
  }
}

function handleNumberDrawing(number, lastVert, lastHorz) {
  if (lastVert && number == " ") {  // toggle
    let oldNumber = grayState[lastVert][lastHorz];
    if (grayState[lastVert][lastHorz]) {
      grayState[lastVert][lastHorz] = false;
    } else {
      grayState[lastVert][lastHorz] = true;
    }
  }
  validateSolution();
}

function handleArrowKey(direction) {
  let vertCell = lastVert;
  let horzCell = lastHorz;
  switch (direction) {
    case KEY_DOWN:
      vertCell = lastVert+1;
      break;
    case KEY_UP:
      vertCell = lastVert-1;
      break;
    case KEY_LEFT:
      horzCell = lastHorz-1;
      break;
    case KEY_RIGHT:
      horzCell = lastHorz+1;
      break;
  }

  if (vertCell > 0 && horzCell > 0 && vertCell < puzzleH+1 && horzCell < puzzleW+1) {
    lastVert = vertCell;
    lastHorz = horzCell;
  }
  validateSolution();
}

function redrawCell(x, y) {
  if (x!=0 && x!=(puzzleH+1) && y!=0 && y!=(puzzleW +1)) {
    drawColor(cellColor, x, y);
    if (solveState[x][y] != "-") {
      if (puzzleState[x][y].indexOf(")") == -1) {
        drawNumber(convertToNum(solveState[x][y]), x, y);
      } else {
        drawGiven(convertToNum(solveState[x][y]), x, y);
      }
    }
  }
}

function drawColor(color, x, y, override = 0) {
  let drawY = Math.floor((x-1)*gridSize) + lineWidthFat;
  let drawX = Math.floor((y-1)*gridSize) + lineWidthFat;
  let number = convertToNum(solveState[x][y]);
  context.fillStyle = lineColor;
  context.fillRect(drawX, drawY, gridSize, gridSize);
  context.fillStyle = color;
  if (number && !override) {
    context.fillStyle = cellColor;
  }
  // inner rectangle as a function of the borders
  let innerRect = getInnerRect(x,y);
  context.fillRect(innerRect[0], innerRect[1], innerRect[2], innerRect[3]);
}

function getInnerRect(x, y) {
  let drawY = Math.floor((x-1)*gridSize) + lineWidthFat;
  let drawX = Math.floor((y-1)*gridSize) + lineWidthFat;
  let edgeX = drawX;
  let edgeY = drawY;
  let edgeW = gridSize;
  let edgeH = gridSize;
  let returnArray = new Array();
  returnArray.push(edgeX);
  returnArray.push(edgeY);
  returnArray.push(edgeW);
  returnArray.push(edgeH);
  return returnArray;
}

function blankTile(x, y) {
  let drawY = Math.floor((x-1)*gridSize) + lineWidthFat;
  let drawX = Math.floor((y-1)*gridSize) + lineWidthFat;
  context.fillStyle = cellColor;
  context.fillRect(drawX, drawY, gridSize, gridSize);
}

function grayTile(x, y) {
  let drawY = Math.floor((x-1)*gridSize) + lineWidthFat;
  let drawX = Math.floor((y-1)*gridSize) + lineWidthFat;
  context.fillStyle = grayColor;
  context.fillRect(drawX, drawY, gridSize, gridSize);
}

function greenTile(x, y) {
  let drawY = Math.floor((x-1)*gridSize) + lineWidthFat;
  let drawX = Math.floor((y-1)*gridSize) + lineWidthFat;
  context.fillStyle = greenColor;
  context.fillRect(drawX, drawY, gridSize, gridSize);
}

function drawVertex(x, y) {
  let drawY = Math.floor(x*gridSize) + lineWidthFat;
  let drawX = Math.floor(y*gridSize) + lineWidthFat;
  context.fillStyle = vertexColor;
  context.fillRect(drawX-lineWidthThin,drawY-lineWidthThin,lineWidthFat,lineWidthFat);
}

function validateNumber(number, x, y) {
  if (number == "-") {
    return constNumCorrect;
  }
  let wallCount = 0;
  // check N wall
  if (wallState[x*2-2][y*2-1] != constWallNone) {
    wallCount++;
  }
  // check S wall
  if (wallState[x*2  ][y*2-1] != constWallNone) {
    wallCount++;
  }
  // check W wall
  if (wallState[x*2-1][y*2-2] != constWallNone) {
    wallCount++;
  }
  // check E wall
  if (wallState[x*2-1][y*2  ] != constWallNone) {
    wallCount++;
  }

  if (number == wallCount) {
    return constNumCorrect;
  } else if (number > wallCount) {
    return constNumTooFew;
  } else {
    return constNumTooMany;
  }
}

function drawNumber(number, x, y) {
  if (number == "-") {
    return;
  }
  let drawY = Math.floor((x-1)*gridSize) + lineWidthFat;
  let drawX = Math.floor((y-1)*gridSize) + lineWidthFat;
  context.font = stdFont;
  let numVal = validateNumber(number, x, y);
  
  if (numVal == constNumCorrect) {
    context.fillStyle = correctColor;
  } else if (numVal == constNumTooMany) {
    context.fillStyle = incorrectColor;
  } else {
    context.fillStyle = tooFewColor;
  }
  
  context.textAlign = "center";
  context.fillText(number, drawX+(gridSize*0.5), drawY+(gridSize*0.75));
}

function undo() {
  if (undoProgress.length > 0) {
    let undoState = undoProgress[undoProgress.length-1];
    let data = undoState.split("_");
    let coords = data[0].split("-");
    let undoVertCell = coords[0]*1;
    let undoHorCell = coords[1]*1;

    let undoColor = cellColor;
    if (lastVert == undoVertCell && lastHorz == undoHorCell) {
      undoColor = numberModeColor;
    }
    let oldNumber = solveState[undoVertCell][undoHorCell];
    let number = "-";

    if (data[1] == "none") {
      drawColor(undoColor, undoHorCell, undoVertCell);
      drawNumber("", undoHorCell, undoVertCell);
      solveState[undoVertCell][undoHorCell] = "-";
    } else if (data[1] == "number") {
      number = data[2]*1;
      drawColor(undoColor, undoHorCell, undoVertCell);
      drawNumber(number, undoHorCell, undoVertCell);
      solveState[undoVertCell][undoHorCell] = number;
    }

    calculatePaths();
    validateSolution();
    
    undoProgress.pop();
  }
}

function calculatePaths() {
  // find all walls and gather all connected neighbors
  // if they are in error, return error
  wallPaths = new Array;
  // look for incomplete loops, or multiple loops
  let loopStart;
  for (x=0;x<=2*puzzleH;x+=2) {
    for (y=0;y<=2*puzzleW;y+=2) {
      if (x!=0 && wallState[x-1][y] != constWallNone && !foundInPaths(x-1,y)) {
        wallPaths.push(travelWalls(x-1,y));
      }
      if (x!=2*puzzleH && wallState[x+1][y] != constWallNone && !foundInPaths(x+1,y)) {
        wallPaths.push(travelWalls(x+1,y));
      }
      if (y!=0 && wallState[x][y-1] != constWallNone && !foundInPaths(x,y-1)) {
        wallPaths.push(travelWalls(x,y-1));
      }
      if (y!=2*puzzleW && wallState[x][y+1] != constWallNone && !foundInPaths(x,y+1)) {
        wallPaths.push(travelWalls(x,y+1));
      }
    }
  }
}

function foundInPaths(x,y) {
  let found = false;
  for (let i=0;i<wallPaths.length;i++) {
    let members = wallPaths[i][1];
    for (let j=0;j<members.length;j++) {
      if ((x+"-"+y)==(members[j])) {
        found = true;
      }
    }
  }
  return found;
}

function validateSolution() {
  let isSolved = true;
  let foundEmpty = false;
  for (x=1;x<=puzzleH;x++) {
    for (y=1;y<=puzzleW;y++) {
      if (validateNumber(solveState[x][y], x, y) != constNumCorrect) {
        isSolved = false;
      }
    }
  }
  if (wallPaths && wallPaths.length != 1) {
    isSolved = false;
  } else if (wallPaths.length && wallPaths[0][0] != constLoopClosed) {
    isSolved = false;
  }
  if (isSolved == true) {
    shadeInterior();
  } else {
    unshadeInterior();
  }
  refreshPuzzle(isSolved);
}

// assumed to be solved here, so just walk left
// to right for each row and toggle true/false on each
// wall starting with false;
function shadeInterior() {
  greenState = new Array;
  for (let x=1;x<=puzzleH;x++) {
    greenState[x] = new Array;
    let curState = false;
    for (let y=1;y<=puzzleW;y++) {
      if (wallState[2*x-1][2*y-2] != constWallNone) {
        curState = ~curState;
      }
      greenState[x][y] = curState;
    }
  }
}

function unshadeInterior() {
  greenState = new Array;
  for (let x=1;x<=puzzleH;x++) {
    greenState[x] = new Array;
    for (let y=1;y<=puzzleW;y++) {
      greenState[x][y] = false;
    }
  }
}

function clear() {
  $("#clearButton").blur();
  initStructures(puzzle);
  validateSolution();
}

function getStarted() {
  // do a few simple solve moves, starting with just as a relationship of
  // bordering numbers
  solve30();
  solve33();
  solve20b();
  calculatePaths();
  refreshPuzzle();
}

function continueSolve() {
  // some algorithms for ends of wallPaths
  for (let i=0;i<wallPaths.length;i++) {
    // if length is 1, only one segment, handle both ends
    let n = wallPaths[i][1].length-1;
    if (n==0) {
      let wxy = wallPaths[i][1][0].split("-");
      let x = wxy[0];
      let y = wxy[1];
      if (x%2) { // N:S
        solveVertexPoint(x,y,parseInt(x)-1,y,"NW");
        solveVertexPoint(x,y,parseInt(x)-1,y,"NE");
        solveVertexPoint(x,y,parseInt(x)-1,y,"SW");
        solveVertexPoint(x,y,parseInt(x)-1,y,"SE");
        solveVertexPoint(x,y,parseInt(x)+1,y,"NW");
        solveVertexPoint(x,y,parseInt(x)+1,y,"NE");
        solveVertexPoint(x,y,parseInt(x)+1,y,"SW");
        solveVertexPoint(x,y,parseInt(x)+1,y,"SE");
      } else {   // E:W
        solveVertexPoint(x,y,x,parseInt(y)-1,"NW");
        solveVertexPoint(x,y,x,parseInt(y)-1,"NE");
        solveVertexPoint(x,y,x,parseInt(y)-1,"SW");
        solveVertexPoint(x,y,x,parseInt(y)-1,"SE");
        solveVertexPoint(x,y,x,parseInt(y)+1,"NW");
        solveVertexPoint(x,y,x,parseInt(y)+1,"NE");
        solveVertexPoint(x,y,x,parseInt(y)+1,"SW");
        solveVertexPoint(x,y,x,parseInt(y)+1,"SE");
      }
    } else {
      // two ends determined from 0,1 and l-1,l-2
      let m = n-1;
      let w0 = wallPaths[i][1][0];
      let w1 = wallPaths[i][1][1];
      let wn = wallPaths[i][1][n];
      let wm = wallPaths[i][1][m];
      let e01 = findPathEnd(w0,w1);
      let enm = findPathEnd(wn,wm);
      solveVertex(wallPaths[i][1][0],wallPaths[i][1][1],"NW");
      solveVertex(wallPaths[i][1][0],wallPaths[i][1][1],"NE");
      solveVertex(wallPaths[i][1][0],wallPaths[i][1][1],"SW");
      solveVertex(wallPaths[i][1][0],wallPaths[i][1][1],"SE");
      solveVertex(wallPaths[i][1][n],wallPaths[i][1][m],"NW");
      solveVertex(wallPaths[i][1][n],wallPaths[i][1][m],"NE");
      solveVertex(wallPaths[i][1][n],wallPaths[i][1][m],"SW");
      solveVertex(wallPaths[i][1][n],wallPaths[i][1][m],"SE");
    }
  }
  calculatePaths();
  refreshPuzzle();
}

function solveVertex (wa,wb,dir) {
  let axy = wa.split("-");
  let ax = axy[0];
  let ay = axy[1];
  let exy = findPathEnd(wa,wb).split("-");
  let ex = exy[0];
  let ey = exy[1];
  solveVertexPoint(ax,ay,ex,ey,dir);
}

function solveVertexPoint(ax,ay,ex,ey,dir) {
  let cellState = getVertexState(ex,ey,dir);
  if (cellState == "-") {
    return;
  }
  // if we have a "0", we can set the wallState in the opposing direction
  // if it is to our NW, we set either S or E, depending upon where ax,ay lays
  // if it is to our NE, we set either S or W, depending upon where ax,ay lays
  // if it is to our SW, we set either N or E, depending upon where ax,ay lays
  // if it is to our SE, we set either N or W, depending upon where ax,ay lays
  if (cellState == "0") {
    if        (dir == "NW" && (ax%2)) { // NW from a N:S wall, set east
      wallState[ex][parseInt(ey)+1] |= constWallInferEdge;
    } else if (dir == "NW")   {        // NW from a E:W wall, set south
      wallState[parseInt(ex)+1][ey] |= constWallInferEdge;
    } else if (dir == "NE" && (ax%2)) { // NE from a N:S wall, set west
      wallState[ex][parseInt(ey)-1] |= constWallInferEdge;
    } else if (dir == "NE")   {        // NE from a E:W wall, set south
      wallState[parseInt(ex)+1][ey] |= constWallInferEdge;
    } else if (dir == "SW" && (ax%2)) { // SW from a N:S wall, set east
      wallState[ex][parseInt(ey)+1] |= constWallInferEdge;
    } else if (dir == "SW")   {        // SW from a E:W wall, set north
      wallState[parseInt(ex)-1][ey] |= constWallInferEdge;
    } else if (dir == "SE" && (ax%2)) { // SE from a N:S wall, set west
      wallState[ex][parseInt(ey)-1] |= constWallInferEdge;
    } else if (dir == "SE")   {        // SE from a E:W wall, set north
      wallState[parseInt(ex)-1][ey] |= constWallInferEdge;
    }
  }
}

function solve30() {
  for (let x=1;x<=puzzleH;x++) {
    for (let y=1;y<=puzzleW;y++) {
      let cellState = solveState[x][y];
      if (cellState == "3") {
        // first look for neighboring 3:0 pairs
        // check N, S, E, W
        let nState  = getCellState(x,y,"N");
        let sState  = getCellState(x,y,"S");
        let wState  = getCellState(x,y,"W");
        let eState  = getCellState(x,y,"E");

        // if true the set wallState accordingly
        if (nState == "0") {
          setWallState(x,y,"S");
          setWallState(x,y,"W");
          setWallState(x,y,"E");
          setWallState(x,y-1,"N");
          setWallState(x,y+1,"N");
        }
        if (sState == "0") {
          setWallState(x,y,"N");
          setWallState(x,y,"W");
          setWallState(x,y,"E");
          setWallState(x,y-1,"S");
          setWallState(x,y+1,"S");
        }
        if (wState == "0") {
          setWallState(x,y,"N");
          setWallState(x,y,"E");
          setWallState(x,y,"S");
          setWallState(x-1,y,"W");
          setWallState(x+1,y,"W");
        }
        if (eState == "0") {
          setWallState(x,y,"N");
          setWallState(x,y,"W");
          setWallState(x,y,"S");
          setWallState(x-1,y,"E");
          setWallState(x+1,y,"E");
        }

        // next look for diagonal 3:0 pairs
        let nwState = getCellState(x,y,"NW");
        let swState = getCellState(x,y,"SW");
        let neState = getCellState(x,y,"NE");
        let seState = getCellState(x,y,"SE");
        // if true the set wallState accordingly
        if (nwState == "0") {
          setWallState(x,y,"N");
          setWallState(x,y,"W");
        }
        if (swState == "0") {
          setWallState(x,y,"S");
          setWallState(x,y,"W");
        }
        if (neState == "0") {
          setWallState(x,y,"N");
          setWallState(x,y,"E");
        }
        if (seState == "0") {
          setWallState(x,y,"S");
          setWallState(x,y,"E");
        }
      }
    }
  }
}

function solve33() {
  for (let x=1;x<=puzzleH;x++) {
    for (let y=1;y<=puzzleW;y++) {
      // first look for neighboring 3:3 pairs
      // only need to look S and E to not duplicate
      let cellState = solveState[x][y];
      if (cellState == "3") {
        let sState  = getCellState(x,y,"S");
        let eState  = getCellState(x,y,"E");
        // if true the set wallState accordingly
        if (sState == "3") {
          setWallState(x,y,"N");
          setWallState(x,y,"S");
          setWallState(x+1,y,"S");
        }
        if (eState == "3") {
          setWallState(x,y,"W");
          setWallState(x,y,"E");
          setWallState(x,y+1,"E");
        }

        // next look for diagonal 3:3 pairs
        // only need to look SE and SW
        let swState = getCellState(x,y,"SW");
        let seState = getCellState(x,y,"SE");
        // if true the set wallState accordingly, outer edges of the two
        if (swState == "3") {
          setWallState(x,y,"N");
          setWallState(x,y,"E");
          setWallState(x+1,y-1,"S");
          setWallState(x+1,y-1,"W");
        }
        if (seState == "3") {
          setWallState(x,y,"N");
          setWallState(x,y,"W");
          setWallState(x+1,y+1,"S");
          setWallState(x+1,y+1,"E");
        }
      }
    }
  }
}

// 2:0 on the border is solveable like a 3:0
function solve20b() {
  // west and east side
  for (let x=1;x<=puzzleH;x++) {
    for (let iy=0;iy<=1;iy++) {
      let y=iy*(puzzleW-1)+1;
      let cellState = solveState[x][y];
      if (cellState == "2") {
        // look for neighboring 2:0 pairs on N or S
        let nState  = getCellState(x,y,"N");
        let sState  = getCellState(x,y,"S");
        if (nState == "0") {
          if (y==1) { // west wall
            setWallState(x,y,"S");
            setWallState(x,y,"E");
            setWallState(x+1,y,"W");
            setWallState(x,y+1,"N");
          } else {    // east wall
            setWallState(x,y,"S");
            setWallState(x,y,"W");
            setWallState(x+1,y,"E");
            setWallState(x,y-1,"N");
          }
        }
        if (sState == "0") {
          if (y==1) { // west wall
            setWallState(x,y,"N");
            setWallState(x,y,"E");
            setWallState(x-1,y,"W");
            setWallState(x,y+1,"S");
          } else {    // east wall
            setWallState(x,y,"N");
            setWallState(x,y,"W");
            setWallState(x-1,y,"E");
            setWallState(x,y-1,"S");
          }
        }
      }
    }
  }
  // north and south side
  for (let y=1;y<=puzzleW;y++) {
    for (let ix=0;ix<=1;ix++) {
      let x=ix*(puzzleH-1)+1;
      let cellState = solveState[x][y];
      if (cellState == "2") {
        // look for neighboring 2:0 pairs on W or E
        let wState  = getCellState(x,y,"W");
        let eState  = getCellState(x,y,"E");
        if (wState == "0") {
          if (x==1) { // north wall
            setWallState(x,y,"S");
            setWallState(x,y,"E");
            setWallState(x+1,y,"W");
            setWallState(x,y+1,"N");
          } else {    // south wall
            setWallState(x,y,"N");
            setWallState(x,y,"E");
            setWallState(x-1,y,"W");
            setWallState(x,y+1,"S");
          }
        }
        if (eState == "0") {
          if (x==1) { // north wall
            setWallState(x,y,"S");
            setWallState(x,y,"W");
            setWallState(x+1,y,"E");
            setWallState(x,y-1,"N");
          } else {    // south wall
            setWallState(x,y,"N");
            setWallState(x,y,"W");
            setWallState(x-1,y,"E");
            setWallState(x,y-1,"S");
          }
        }
      }
    }
  }
}

function getCellState(x,y,dir) {
  let cx = x;
  let cy = y;
  if (dir == "N" || dir == "NW" || dir == "NE") { cx--; }
  if (dir == "S" || dir == "SW" || dir == "SE") { cx++; }
  if (dir == "W" || dir == "NW" || dir == "SW") { cy--; }
  if (dir == "E" || dir == "NE" || dir == "SE") { cy++; }
  if (cx < 1) { return "-" }
  if (cy < 1) { return "-" }
  if (cx > puzzleH) { return "-" }
  if (cy > puzzleW) { return "-" }
  return solveState[cx][cy];
}

function setWallState(x,y,dir) {
  let wx = 2*x-1;
  let wy = 2*y-1;
  if (x < 1)       { return; }
  if (x > puzzleH) { return; }
  if (y < 1)       { return; }
  if (y > puzzleW) { return; }
  if (dir == "N")  { wallState[wx-1][wy] = constWallSolveEdge; }
  if (dir == "S")  { wallState[wx+1][wy] = constWallSolveEdge; }
  if (dir == "W")  { wallState[wx][wy-1] = constWallSolveEdge; }
  if (dir == "E")  { wallState[wx][wy+1] = constWallSolveEdge; }
}

// return the vertex at the end of the wall given two last wall segments
function findPathEnd(pa,pb) {
  let pxya = pa.split("-");
  let pxyb = pb.split("-");
  let xa = pxya[0];
  let ya = pxya[1];
  let xb = pxyb[0];
  let yb = pxyb[1];
  let ax0, ax1, ay0, ay1, bx0, bx1, by0, by1;
  if (xa%2) { // N:S segment
    ax0 = parseInt(xa)-1; ay0 = ya; ax1 = parseInt(xa)+1; ay1 = ya;
  } else {    // W:E segment
    ax0 = xa; ay0 = parseInt(ya)-1; ax1 = xa; ay1 = parseInt(ya)+1;
  }
  if (xb%2) { // N:S segment
    bx0 = parseInt(xb)-1; by0 = yb; bx1 = parseInt(xb)+1; by1 = yb;
  } else {    // W:E segment
    bx0 = xb; by0 = parseInt(yb)-1; bx1 = xb; by1 = parseInt(yb)+1;
  }
  // there are four endpoints, two of which are common
  // return the vertex from pa that is not the common one
  if (ax0 == bx0 && ay0 == by0) {
    return ax1 + "-" + ay1;
  } else if (ax0 == bx1 && ay0 == by1) {
    return ax1 + "-" + ay1;
  } else if (ax1 == bx0 && ay1 == by0) {
    return ax0 + "-" + ay0;
  } else if (ax1 == bx1 && ay1 == by1) {
    return ax0 + "-" + ay0;
  } else {
    console.log("doesn't make sense");
  }
}

function getVertexState(wx,wy,dir) {
  let cwx = wx;
  let cwy = wy;
  if (dir == "NW" || dir == "NE") { cwx--; }
  if (dir == "SW" || dir == "SE") { cwx++; }
  if (dir == "NW" || dir == "SW") { cwy--; }
  if (dir == "NE" || dir == "SE") { cwy++; }
  let cx = Math.floor((cwx+1)/2);
  let cy = Math.floor((cwy+1)/2);
  if (cx < 1) { return "-" }
  if (cy < 1) { return "-" }
  if (cx > puzzleH) { return "-" }
  if (cy > puzzleW) { return "-" }
  return solveState[cx][cy];
}
