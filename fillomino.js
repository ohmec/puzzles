let numberColor = [
  // 0 unused     1          2          3          4          5          6           7          8        9        
  "black",   "salmon", "dodgerblue", "fuchsia", "wheat", "lightgreen", "aqua",    "plum", "goldenrod", "deeppink",
  //  A-10       B-11       C-12       D-13       E-14       F-15       G-16        H-17       I-18     J-19
  "#009000", "#b00000", "#b000ff",   "#ffb000", "#b0b000", "#b0b0b0", "#b0b0ff", "#ffb0b0", "#ffff80", "lime",
  //  K-20       L-21       M-22       N-23       O-24       P-25       Q-26        R-27       S-28     T-29
  "#009000", "#b00000", "#b000ff",   "#ffb000", "#b0b000", "#b0b0b0", "#b0b0ff", "#ffb0b0", "#ffff80", "lime",
  //  U-30       V-31       W-32       X-33       Y-34       Z-35
  "#009000", "#b00000", "#b000ff",   "#ffb000", "#b0b000", "#b0b0b0",
];

let cellColor = "white";        // default
let incorrectColor = "#C03C39"; // reddish
let lineColor = "black";
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

let constWallNone      = 0b000000;
let constWallBorder    = 0b000001;
let constWallStartEdge = 0b000010;
let constWallEnterEdge = 0b000100;
let constWallClickEdge = 0b001000;
let constWallGangEdge  = 0b010000;

let KEY_BS    = 0x08;
let KEY_SHIFT = 0x10;
let KEY_ESC   = 0x1b;
let KEY_SP    = 0x20;
let KEY_LEFT  = 0x25;
let KEY_UP    = 0x26;
let KEY_RIGHT = 0x27;
let KEY_DOWN  = 0x28;
let KEY_0     = 0x30;
let KEY_1     = 0x31;
let KEY_9     = 0x39;
let KEY_A     = 0x41;
let KEY_Z     = 0x5a;
let KEY_a     = 0x61;
let KEY_z     = 0x7a;

let puzzle, solveState, context, puzzleW, puzzleH, lastVert, lastHorz;
let puzzleState, wallState, undoProgress, numberGroups;

function puzzleInit() {
  // any key anywhere as long as canvas is in focus
  $(document).keydown(function(evnt) {
    $("#saveButton").blur();
    $("#loadButton").blur();
    $("#clearButton").blur();
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
    $("#userSolvePuzzle").val("");
    let pval = $("#userPuzzle").val();
    if (pval.search(/:/) == -1) {
      puzzle = removeDot(cannedPuzzles[pval]);
    } else {
      puzzle = removeDot(pval);
    }
    initStructures(puzzle);
    calculateGroups();
    refreshPuzzle();
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

  initStructures(puzzle);
  calculateGroups();
  refreshPuzzle();

  let spanHandle = document.querySelector('#puzzlecount1');
  spanHandle.textContent = puzzleCount-1;
  spanHandle = document.querySelector('#puzzlecount2');
  spanHandle.textContent = puzzleCount-1;
}

function handleKey(evnt) {
  let keynum = evnt.which;
  // refresh with "ESC"
  if (keynum == KEY_ESC) {
    refreshPuzzle();
    return;
  }
  if (keynum >= KEY_LEFT && keynum <= KEY_DOWN) {
    handleArrowKey(keynum);
    return;
  }
  if (keynum >= KEY_1 && keynum <= KEY_9) {
    number = (keynum-KEY_0).toString();
  } else if (keynum >= KEY_a && keynum <= KEY_z) {
    number = (keynum-KEY_a+1).toString();
  } else if (keynum >= KEY_A && keynum <= KEY_Z) {
    number = String.fromCharCode(keynum);
  } else if (keynum == KEY_BS || keynum == KEY_SP) {
    number = "";
  } else {
    return;
  }
  handleNumberDrawing(number, lastVert, lastHorz);
  drawCursor(lastVert, lastHorz);
}

function initStructures(puzzle) {
  $("#canvasDiv").css("border-color", "black");
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
  lineWidthThin = gridSize*0.02;
  lineWidthFat  = gridSize*0.04;
  stdFont  = (gridSize*0.5)+"pt "+numberFont;
  boldFont = "bold "+stdFont;
  canvas.height = puzzleH*gridSize;
  canvas.width  = puzzleW*gridSize;

  // set up arrays for solveState, puzzleState, and wallState
  solveState = new Array(puzzleH);
  for (let i=1;i<=puzzleH;i++) {
    solveState[i] = new Array(puzzleW);
  }
  puzzleState = new Array(puzzleH);
  for (let i=1;i<=puzzleH;i++) {
    puzzleState[i] = new Array(puzzleW);
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
    }
  }

  let wallH = puzzleH*2+1;
  let wallW = puzzleW*2+1;
  wallState = new Array(wallH);
  for (let i=0;i<wallH;i++) {
    wallState[i] = new Array(wallW);
  }

  // initialize wall state as either border, or none for now.
  // later these will be supplemented with corrections based
  // upon cell content
  for (let x=0;x<wallH;x++) {
    for (let y=0;y<wallW;y++) {
      if (x==0 || x==(wallH-1) || y==0 || y==(wallW-1)) {
        wallState[x][y] = constWallBorder;
      } else {
        wallState[x][y] = constWallNone;
      }
    }
  }

  for (x=1;x<=puzzleH;x++) {
    for (y=1;y<=puzzleW;y++) {
      let number = solveState[x][y];
      if(number != '-') {
        // handles adjacent numbers
        // check neighbor above
        if (x!=1 && solveState[x-1][y]!="-" && solveState[x-1][y]!=number) {
          wallState[2*x-2][2*y-1] |= constWallStartEdge;
        }
        // check neighbor to the left
        if (y!=1 && solveState[x][y-1]!="-" && solveState[x][y-1]!=number) {
          wallState[2*x-1][2*y-2] |= constWallStartEdge;
        }
        // check neighbor below
        if (x!=puzzleH && solveState[x+1][y]!="-" && solveState[x+1][y]!=number) {
          wallState[2*x][2*y-1] |= constWallStartEdge;
        }
        // check neighbor to the right
        if (y!=puzzleW && solveState[x][y+1]!="-" && solveState[x][y+1]!=number) {
          wallState[2*x-1][2*y] |= constWallStartEdge;
        }
      }
    }
  }
}

function removeDot(strval) {
  return strval.replace(/\./gi, "");
}

function drawGiven(number, x, y) {
  let drawY = Math.floor((x-1)*gridSize);
  let drawX = Math.floor((y-1)*gridSize);
  if (invalidNumbers.indexOf(x+"-"+y) == -1) {
    context.fillStyle = inputColor;
  } else {
    context.fillStyle = incorrectColor;
  }
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

function drawCursor(x,y) {
  let drawY = Math.floor((x-1)*gridSize);
  let drawX = Math.floor((y-1)*gridSize);
  context.fillStyle = lineColor;
  context.beginPath();
  context.moveTo(drawX,drawY);
  context.lineTo(drawX+gridSize*0.2,drawY+gridSize*0.2);
  context.moveTo(drawX+gridSize,drawY);
  context.lineTo(drawX+gridSize*0.8,drawY+gridSize*0.2);
  context.moveTo(drawX+gridSize,drawY+gridSize);
  context.lineTo(drawX+gridSize*0.8,drawY+gridSize*0.8);
  context.moveTo(drawX,drawY+gridSize);
  context.lineTo(drawX+gridSize*0.2,drawY+gridSize*0.8);
  context.lineWidth = lineWidthFat;
  context.stroke();
}

function refreshPuzzle() {
  let drawX = 0;
  let drawY = 0;
  let number, tileColor;
  for (x=1;x<=puzzleH;x++) {
    for (y=1;y<=puzzleW;y++) {
      number = "-";
      if (solveState[x][y] == "-") {
        blankTile(x,y);
      } else if (puzzleState[x][y] != "-") {
        number = convertToNum(solveState[x][y]);
        tileColor = numberColor[number];
        drawColor(tileColor, x, y);
        drawGiven(number, x, y);
      } else if (solveState[x][y] != "-") {
        number = convertToNum(solveState[x][y]);
        tileColor = numberColor[number];
        drawColor(tileColor, x, y);
        drawNumber(number, x, y);
      }
      drawX += gridSize;
    }
    drawX = 0;
    drawY += gridSize;
  }
  // draw cursor if it exists
  if (lastVert && lastHorz) {
    drawCursor(lastVert, lastHorz);
  }
}

function calculateGroups() {
  numberGroups = new Array();
  let allVisitedCells = new Array();
  for (let x2=1;x2<=puzzleH;x2++) {
    for (let y2=1;y2<=puzzleW;y2++) {
      if (solveState[x2][y2] != "-" &&
          allVisitedCells.indexOf(x2+"-"+y2) == -1) {
        let groupNumber = solveState[x2][y2];
        let visitedCells = travelCells(x2, y2, groupNumber);
        allVisitedCells.push.apply(allVisitedCells, visitedCells);
        let group = new Array();
        group.push(groupNumber);
        group.push.apply(group, visitedCells);
        numberGroups.push(group);
      }
    }
  }
  calculateFinishedGroups();
  removeUnfinishedLines();
  drawFinishedLines();
}

function convertToNum(numstr) {
  if (isNaN(numstr) == false) {
    return numstr;
  }
  if (numstr.search(/[A-Z1-9]/) != -1) {
    return parseInt(numstr, 36);
  }
  return "-";
}

function calculateFinishedGroups() {
  solvedNumbers = new Array();
  unsolvedNumbers = new Array();
  for (let i=0;i<numberGroups.length;i++) {
    let group = numberGroups[i];
    let number = convertToNum(group[0]);
    if (group.length-1 >= number) {
      for (let j=1;j<group.length;j++) {
        solvedNumbers.push(group[j]);
      }
    } else {
      for (let j=1;j<group.length;j++) {
        unsolvedNumbers.push(group[j]);
      }
    }
  }
}

function removeUnfinishedLines() {
  for (let i=0;i<unsolvedNumbers.length;i++) {
    let temp = unsolvedNumbers[i].split("-");
    let x = temp[0]*1;
    let y = temp[1]*1;
    let lineX = 2*x-1;
    let lineY = 2*y-1;
    let drawY = Math.floor((x-1)*gridSize);
    let drawX = Math.floor((y-1)*gridSize);
    context.fillStyle = lineColor;
    context.fillRect(drawX, drawY, gridSize, gridSize);
    context.fillStyle = cellColor;
    let number = solveState[x][y];

    if (x!=1 && number!="-" && solveState[x-1][y] == "-") {
      wallState[2*x-2][2*y-1] &= ~constWallGangEdge;
    }
    if (y!=1 && number!="-" && solveState[x][y-1] == "-") {
      wallState[2*x-1][2*y-2] &= ~constWallGangEdge;
    }
    if (x!=puzzleH && number!="-" && solveState[x+1][y] == "-") {
      wallState[2*x][2*y-1] &= ~constWallGangEdge;
    }
    if (y!=puzzleW && number!="-" && solveState[x][y+1] == "-") {
      wallState[2*x-1][2*y] &= ~constWallGangEdge;
    }
    redrawCell(x,   y);
    redrawCell(x+1, y);
    redrawCell(x-1, y);
    redrawCell(x,   y+1);
    redrawCell(x,   y-1);
  }
}

function drawFinishedLines() {
  for (let i=0;i<solvedNumbers.length;i++) {
    let temp = solvedNumbers[i].split("-");
    let x = temp[0]*1;
    let y = temp[1]*1;
    let drawY = Math.floor((x-1)*gridSize);
    let drawX = Math.floor((y-1)*gridSize);
    context.fillStyle = lineColor;
    context.fillRect(drawX, drawY, gridSize, gridSize);
    context.fillStyle = cellColor;
    let number = solveState[x][y];

    if (x!=1 && number!="-" && solveState[x-1][y]!=number) {
      wallState[2*x-2][2*y-1] |= constWallGangEdge;
    }
    if (y!=1 && number!="-" && solveState[x][y-1]!=number) {
      wallState[2*x-1][2*y-2] |= constWallGangEdge;
    }
    if (x!=puzzleH && number!="-" && solveState[x+1][y]!=number) {
      wallState[2*x][2*y-1] |= constWallGangEdge;
    }
    if (y!=puzzleW && number!="-" && solveState[x][y+1]!=number) {
      wallState[2*x-1][2*y] |= constWallGangEdge;
    }
    redrawCell(x,  y);
    redrawCell(x+1,y);
    redrawCell(x-1,y);
    redrawCell(x,  y+1);
    redrawCell(x,  y-1);
  }
}

function modifyGroup(x, y, inputNumber, oldNumber) {
  if ((puzzleState[x][y] == "-") &&
      (inputNumber!=oldNumber) &&
      (inputNumber == "-" || (isNaN(inputNumber) == false) || !inputNumber.search(/[A-Z0-9]/))) {
    for (let i=numberGroups.length-1;i>-1;i--) {
      // look for (x,y) or its NSEW neighbors in numberGroups[i].
      // if found, add (splice) into that number group
      let group = numberGroups[i];
      if ((group.indexOf( x   +"-"+ y)   !=-1) ||
          (group.indexOf((x+1)+"-"+ y)   !=-1) ||
          (group.indexOf((x-1)+"-"+ y)   !=-1) ||
          (group.indexOf( x   +"-"+(y+1))!=-1) ||
          (group.indexOf( x   +"-"+(y-1))!=-1)) {
        numberGroups.splice(i, 1);
      }
    }
    let allVisitedCells = new Array();
    for (let x2=1;x2<=puzzleH;x2++) {
      for (let y2=1;y2<=puzzleW;y2++) {
        let cell = x2+"-"+y2;
        if ((solveState[x2][y2]!="-") &&
            (allVisitedCells.indexOf(x2+"-"+y2) == -1) &&
            ((cell == ((x+1)+"-"+ y   )) ||
             (cell == ((x-1)+"-"+ y   )) ||
             (cell == ( x   +"-"+(y+1))) ||
             (cell == ( x   +"-"+(y-1))) ||
             (cell == ( x   +"-"+ y   )))) {
          let groupNumber = solveState[x2][y2];
          let visitedCells = travelCells(x2, y2, groupNumber);
          allVisitedCells.push.apply(allVisitedCells, visitedCells);
          let group = new Array();
          group.push(groupNumber);
          group.push.apply(group, visitedCells);
          numberGroups.push(group);
        }
      }
    }
    calculateFinishedGroups();
    removeUnfinishedLines();
    drawFinishedLines();
  }
}

function travelCells(xCoord, yCoord, number) {
  let visitedCells = new Array();
  let x = xCoord;
  let y = yCoord;
  let continueTraveling = true;
  while(continueTraveling == true) {
    if (visitedCells.indexOf(x+"-"+y) == -1) {
      visitedCells.push(x+"-"+y);
    }
    x = x*1;
    y = y*1;
    let nxp1y = "-";
    if (x!=puzzleH) {
      nxp1y = convertToNum(solveState[parseInt(x)+1][y]);
    }
    let nxm1y = "-";
    if (x!=1) {
      nxm1y = convertToNum(solveState[parseInt(x)-1][y]);
    }
    let nxyp1 = "-";
    if (y!=puzzleW) {
      nxyp1 = convertToNum(solveState[x][parseInt(y)+1]);
    }
    let nxym1 = "-";
    if (y!=1) {
      nxym1 = convertToNum(solveState[x][parseInt(y)-1]);
    }
    if (x!=puzzleH && nxp1y == number && visitedCells.indexOf((x+1)+"-"+y) == -1) {
      x++;
    } else if (x!=1 && nxm1y == number && visitedCells.indexOf((x-1)+"-"+y) == -1) {
      x--;
    } else if (y!=puzzleW && nxyp1 == number && visitedCells.indexOf(x+"-"+(y+1)) == -1) {
      y++;
    } else if (y!=1 && nxym1 == number && visitedCells.indexOf(x+"-"+(y-1)) == -1 ) {
      y--;
    } else {
      let index = visitedCells.indexOf(x+"-"+y);
      if (index != 0) {
        let lastCell = visitedCells[index-1].split("-");
        x = lastCell[0];
        y = lastCell[1];
      } else {
        continueTraveling = false;
      }
    }
  }
  return visitedCells;
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
  let vertCell = (Math.floor(yCoord/gridSize)+1);
  let horzCell = (Math.floor(xCoord/gridSize)+1);
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
  let tileColor;
  $("#userPuzzleField").blur();
  let coords = findPosition(evnt, "puzzleCanvas");
  coords = coords.split("-");
  let xCoord = coords[0];
  let yCoord = coords[1];
  let vertCell = Math.floor(yCoord/gridSize)+1;
  let horzCell = Math.floor(xCoord/gridSize)+1;
  let horzDistFromEdgeL = Math.abs((horzCell-1)*gridSize - xCoord);
  let horzDistFromEdgeR = Math.abs((horzCell  )*gridSize - xCoord);
  let vertDistFromEdgeU = Math.abs((vertCell-1)*gridSize - yCoord);
  let vertDistFromEdgeD = Math.abs((vertCell  )*gridSize - yCoord);
  if (solveState[vertCell][horzCell] != "-") {
    let number = convertToNum(solveState[vertCell][horzCell]);
    tileColor = numberColor[number];
  }
  if (!dragging) {
    if (horzDistFromEdgeL < 2*lineWidthFat) {
      if (vertDistFromEdgeU < 2*lineWidthFat) {
        return;
      }
      if (vertDistFromEdgeD < 2*lineWidthFat) {
        return;
      }
      let wallX = 2*horzCell-2;
      let wallY = 2*vertCell-1;
      wallState[wallY][wallX] ^= constWallClickEdge;
      refreshPuzzle();
      return;
    }
    if (horzDistFromEdgeR < 2*lineWidthFat) {
      if (vertDistFromEdgeU < 2*lineWidthFat) {
        return;
      }
      if (vertDistFromEdgeD < 2*lineWidthFat) {
        return;
      }
      let wallX = 2*horzCell;
      let wallY = 2*vertCell-1;
      wallState[wallY][wallX] ^= constWallClickEdge;
      refreshPuzzle();
      return;
    }
    if (vertDistFromEdgeU < 2*lineWidthFat) {
      if (horzDistFromEdgeL < 2*lineWidthFat) {
        return;
      }
      if (horzDistFromEdgeR < 2*lineWidthFat) {
        return;
      }
      let wallX = 2*horzCell-1;
      let wallY = 2*vertCell-2;
      wallState[wallY][wallX] ^= constWallClickEdge;
      refreshPuzzle();
      return;
    }
    if (vertDistFromEdgeD < 2*lineWidthFat) {
      if (horzDistFromEdgeL < 2*lineWidthFat) {
        return;
      }
      if (horzDistFromEdgeR < 2*lineWidthFat) {
        return;
      }
      let wallX = 2*horzCell-1;
      let wallY = 2*vertCell;
      wallState[wallY][wallX] ^= constWallClickEdge;
      refreshPuzzle();
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
  let drawY = Math.floor((vertCell-1)*gridSize);
  let drawX = Math.floor((horzCell-1)*gridSize);
  
  if (dragging == true && puzzleState[vertCell][horzCell] == "-") {
    handleNumberDrawing(activeNumber, vertCell, horzCell);
  }

  //draw color and then redraw the state of the cell
  if (puzzleState[vertCell][horzCell] == "-") {
    if (solveState[vertCell][horzCell] != "-") {
      drawColor(tileColor, vertCell, horzCell);  
      drawNumber(solveState[vertCell][horzCell], vertCell, horzCell);
    } else {
      drawColor(cellColor, vertCell, horzCell);  
    }
  } else {
    drawColor(tileColor, vertCell, horzCell);
    drawGiven(solveState[vertCell][horzCell], vertCell, horzCell);
  }
  //clear the color of the last cell, and redraw the state

  if (lastHorz!="") {
    if (lastVert!=vertCell || lastHorz!=horzCell) {
      if (solveState[lastVert][lastHorz] == "-") {
        drawColor(cellColor, lastVert, lastHorz);
      } else if (isNaN(solveState[lastVert][lastHorz]) == false) {
        drawColor(cellColor, lastVert, lastHorz);
        if (puzzleState[lastVert][lastHorz].indexOf(")") == -1) {
          drawNumber(solveState[lastVert][lastHorz], lastVert, lastHorz);
        } else {
          drawGiven(solveState[lastVert][lastHorz], lastVert, lastHorz);
        }
      }
    }
  }
  lastVert = vertCell;
  lastHorz = horzCell;
  drawCursor(lastVert,lastHorz);
}


function handleNumberDrawing(number, lastVert, lastHorz) {
  if (lastVert) {
    let oldNumber = convertToNum(solveState[lastVert][lastHorz]);
    if (lastHorz && (puzzleState[lastVert][lastHorz].indexOf("(") == -1)) {
      // record data for undo
      if (solveState[lastVert][lastHorz] == "-") {
        if (number != "" && number != "none" && number != "none2" && number != "-") {
          undoProgress.push(lastVert+"-"+lastHorz+"_"+"none");
        }
      } else {
        if (number != solveState[lastVert][lastHorz]) {
          undoProgress.push(lastVert+"-"+lastHorz+"_" +
                            "number_"+solveState[lastVert][lastHorz]);
        }
      }
      
      // draw inputted number, allow for A-Z
      if (isNaN(number) == false) {
        solveState[lastVert][lastHorz] = number;
      } else {
        if (!number.search(/[A-Z0-9]/)) {
          solveState[lastVert][lastHorz] = convertToNum(number);
          if (number == "") {
            solveState[lastVert][lastHorz] = "-";
          }
        } else {
          solveState[lastVert][lastHorz] = "-";
        }
      }
      modifyGroup(lastVert, lastHorz, number, oldNumber);
      calculateLines(lastVert, lastHorz, number);
      redrawCell(lastVert,   lastHorz);
      redrawCell(lastVert+1, lastHorz);
      redrawCell(lastVert-1, lastHorz);
      redrawCell(lastVert,   lastHorz+1);
      redrawCell(lastVert,   lastHorz-1);
    }
    
    validateInput(lastVert, lastHorz);
    validateSolution();
  }
}

function calculateLines(vertCell, horzCell, number) {
  let x = vertCell;
  let y = horzCell;
  let lineX = 2*vertCell-1;
  let lineY = 2*horzCell-1;
  let numval = "-";
  if ((isNaN(number) == false) || number.search(/[A-Z1-9]/) != -1) {
    numval = convertToNum(number);
  }
  if (numval != "-" && numval != "") {
    if (x != 1 && solveState[x-1][y] != "-" && (solveState[x-1][y] != numval)) {
      wallState[lineX-1][lineY] |= constWallGangEdge;
    }
    if (y != 1 && solveState[x][y-1] != "-" && (solveState[x][y-1] != numval)) {
      wallState[lineX][lineY-1] |= constWallGangEdge;
    }
    if (x != puzzleH && solveState[x+1][y] != "-" && (solveState[x+1][y] != numval)) {
      wallState[lineX+1][lineY] |= constWallGangEdge;
    }
    if (y != puzzleW && solveState[x][y+1] != "-" && (solveState[x][y+1] != numval)) {
      wallState[lineX][lineY+1] |= constWallGangEdge;
    }
    if (x != 1 && (solveState[x-1][y] == numval)) {
      wallState[lineX-1][lineY] &= ~constWallGangEdge;
    }
    if (y != 1 && (solveState[x][y-1] == numval)) {
      wallState[lineX][lineY-1] &= ~constWallGangEdge;
    }
    if (x != puzzleH && (solveState[x+1][y] == numval)) {
      wallState[lineX+1][lineY] &= ~constWallGangEdge;
    }
    if (y != puzzleW && (solveState[x][y+1] == numval)) {
      wallState[lineX][lineY+1] &= ~constWallGangEdge;
    }
  } else {
    if (solvedNumbers.indexOf((x-1)+"-"+y) == -1) {
      wallState[lineX-1][lineY] &= ~constWallGangEdge;
    }
    if (solvedNumbers.indexOf((x+1)+"-"+y) == -1) {
      wallState[lineX+1][lineY] &= ~constWallGangEdge;
    }
    if (solvedNumbers.indexOf(x+"-"+(y-1)) == -1) {
      wallState[lineX][lineY-1] &= ~constWallGangEdge;
    }
    if (solvedNumbers.indexOf(x+"-"+(y+1)) == -1) {
      wallState[lineX][lineY+1] &= ~constWallGangEdge;
    }
  }
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

  let tileColor;
  if (solveState[vertCell][horzCell] != "-") {
    let number = convertToNum(solveState[vertCell][horzCell]);
    tileColor = numberColor[number];
  }

  let drawY = Math.floor((vertCell-1)*gridSize);
  let drawX = Math.floor((horzCell-1)*gridSize);
  
  if (vertCell > 0 && horzCell > 0 && vertCell < puzzleH+1 && horzCell < puzzleW+1) {
    if (puzzleState[vertCell][horzCell] == "-") {
      if (solveState[vertCell][horzCell] != "-") {
        drawColor(tileColor, vertCell, horzCell);  
        drawNumber(solveState[vertCell][horzCell], vertCell, horzCell);
      } else {
        drawColor(cellColor, vertCell, horzCell);  
      }
    } else {
      drawColor(tileColor, vertCell, horzCell, 1);
      drawGiven(solveState[vertCell][horzCell], vertCell, horzCell);
    }
    if (lastHorz != "") {
      if (lastVert != vertCell || lastHorz != horzCell) {
        drawY = Math.floor((lastVert-1)*gridSize);
        drawX = Math.floor((lastHorz -1)*gridSize);
        if (solveState[lastVert][lastHorz] == "-") {
          drawColor(cellColor, lastVert, lastHorz);
        }else if (isNaN(solveState[lastVert][lastHorz]) == false) {
          drawColor(cellColor, lastVert, lastHorz);
          if (puzzleState[lastVert][lastHorz].indexOf(")") == -1) {
            drawNumber(solveState[lastVert][lastHorz], lastVert, lastHorz);
          } else {
            drawGiven(solveState[lastVert][lastHorz], lastVert, lastHorz);
          }
        }
      }
    }
    lastVert = vertCell;
    lastHorz = horzCell;
  }
  drawCursor(lastVert, lastHorz);
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
  let drawY = Math.floor((x-1)*gridSize);
  let drawX = Math.floor((y-1)*gridSize);
  let number = convertToNum(solveState[x][y]);
  context.fillStyle = lineColor;
  context.fillRect(drawX, drawY, gridSize, gridSize);
  context.fillStyle = color;
  if (number && !override) {
    context.fillStyle = numberColor[number];
  }
  // inner rectangle as a function of the borders
  let innerRect = getInnerRect(x,y);
  context.fillRect(innerRect[0], innerRect[1], innerRect[2], innerRect[3]);
}

function getInnerRect(x, y) {
  let drawY = Math.floor((x-1)*gridSize);
  let drawX = Math.floor((y-1)*gridSize);
  let edgeX = drawX+lineWidthThin;
  let edgeY = drawY+lineWidthThin;
  let edgeW = gridSize-2*lineWidthThin;
  let edgeH = gridSize-2*lineWidthThin;
  // check upper Wall
  if(wallState[2*x-2][2*y-1] != constWallNone) {
    edgeY += lineWidthThin;
    edgeH -= lineWidthThin;
  }
  // check left Wall
  if(wallState[2*x-1][2*y-2] != constWallNone) {
    edgeX += lineWidthThin;
    edgeW -= lineWidthThin;
  }
  // check lower Wall
  if(wallState[2*x][2*y-1] != constWallNone) {
    edgeH -= lineWidthThin;
  }
  if(wallState[2*x-1][2*y] != constWallNone) {
    edgeW -= lineWidthThin;
  }
  let returnArray = new Array();
  returnArray.push(edgeX);
  returnArray.push(edgeY);
  returnArray.push(edgeW);
  returnArray.push(edgeH);
  return returnArray;
}

function blankTile(x, y) {
  let drawY = Math.floor((x-1)*gridSize);
  let drawX = Math.floor((y-1)*gridSize);
  // outer black rectangle
  context.fillStyle = lineColor;
  context.fillRect(drawX, drawY, gridSize, gridSize);
  // inner white rectangle as a function of the borders
  let innerRect = getInnerRect(x,y);
  context.fillStyle = cellColor;
  context.fillRect(innerRect[0], innerRect[1], innerRect[2], innerRect[3]);
}

function drawNumber(number, x, y) {
  let drawY = Math.floor((x-1)*gridSize);
  let drawX = Math.floor((y-1)*gridSize);
  context.font = stdFont;

  if (invalidNumbers.indexOf(x+"-"+y) == -1) {
    context.fillStyle = inputColor;
  } else {
    context.fillStyle = incorrectColor;
  }
  
  if (number == "-") {
    number = "";
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

    modifyGroup(undoVertCell, undoHorCell, number, oldNumber);
    validateInput(undoVertCell, undoHorCell);
    calculateLines(undoVertCell, undoHorCell, number);
    redrawCell(undoVertCell+1, undoHorCell);
    redrawCell(undoVertCell-1, undoHorCell);
    redrawCell(undoVertCell, undoHorCell+1);
    redrawCell(undoVertCell, undoHorCell-1);
    redrawCell(undoVertCell, undoHorCell);
    
        //validateSolution();
    undoProgress.pop();
    validateSolution();
  }
}

function validateInput(vertCell, horzCell) {
  let checkCells = new Array();
  checkCells.push(vertCell+"-"+horzCell);
  if (vertCell!=puzzleH) {
    checkCells.push((vertCell+1)+"-"+horzCell);
  }
  if (vertCell!=1) {
    checkCells.push((vertCell-1)+"-"+horzCell);
  }
  if (horzCell!=puzzleW) {
    checkCells.push(vertCell+"-"+(horzCell+1));
  }
  if (horzCell!=1) {
    checkCells.push(vertCell+"-"+(horzCell-1));
  }
  for (let i = 0; i < checkCells.length; i++) {
    let cell = checkCells[i];
    let temp = cell.split("-");
    let checkX = temp[0]*1;
    let checkY = temp[1]*1;
    let number = convertToNum(solveState[checkX][checkY]);
    if (isNaN(number) == false) {
      for (let k=0;k<numberGroups.length;k++) {
        let group = numberGroups[k];
        if (group.indexOf(cell)!=-1) {
          if (group.length > (parseInt(number)+1)) {
            for (let j = 1; j < group.length; j++) {
              if (invalidNumbers.indexOf(group[j]) == -1) {
                invalidNumbers.push(group[j]);
              }
              let temp = group[j].split("-");
              let redrawX = temp[0]*1;
              let redrawY = temp[1]*1;
              redrawCell(redrawX, redrawY);
            }
          } else {
            for (let j = 1; j < group.length; j++) {
              let index = invalidNumbers.indexOf(group[j]);
              if (index!=-1) {
                invalidNumbers.splice(index, 1);
                let temp = group[j].split("-");
                let redrawX = temp[0]*1;
                let redrawY = temp[1]*1;
                redrawCell(redrawX, redrawY);
              }
            }
            let foundEmpty = false;

            for (let j = 1; j < group.length; j++) {
              if (foundEmpty == false) {
                let cell = group[j];
                let temp = cell.split("-");
                let emptyX = temp[0]*1;
                let emptyY = temp[1]*1;
                if (emptyX!=puzzleH && solveState[emptyX+1][emptyY] == "-") {
                  foundEmpty = true;
                }else if (emptyX!=1 && solveState[emptyX-1][emptyY] == "-") {
                  foundEmpty = true;
                }else if (emptyY!=puzzleW && solveState[emptyX][emptyY+1] == "-") {
                  foundEmpty = true;
                }else if (emptyY!=1 && solveState[emptyX][emptyY-1] == "-") {
                  foundEmpty = true;
                }
              }
            }
            if (foundEmpty == false && group.length!=(parseInt(number)+1)) {
              for (let j = 1; j < group.length; j++) {
                if (invalidNumbers.indexOf(group[j]) == -1) {
                  invalidNumbers.push(group[j]);
                }
                let temp = group[j].split("-");
                let redrawX = temp[0]*1;
                let redrawY = temp[1]*1;
                redrawCell(redrawX, redrawY);
              }
            }
          }
        }
      }
    }
  }
}

function validateSolution() {
  let isSolved = true;
  let foundEmpty = false;
  if (invalidNumbers.length == 0) {
    while(foundEmpty == false) {
      for (x=1;x<=puzzleH;x++) {
        for (y=1;y<=puzzleW;y++) {
          if (solveState[x][y] == "-" || solveState[x][y] == "") {
            isSolved = false;
            foundEmpty = true;
          }
        }
      }
      foundEmpty = true;
    }
  } else {
    isSolved = false
  }
  if (isSolved == true) {
    $("#canvasDiv").css("border-color", "#1BE032");
  } else {
    $("#canvasDiv").css("border-color", "black");
  }
}

function clear() {
  $("#clearButton").blur();
  initStructures(puzzle);
  calculateGroups();
  refreshPuzzle();
}
