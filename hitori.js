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

let emptyCellColor = "white";         // default
let fillCellColor = "black";          // default
let incorrectFillColor = "#802020";   // dark reddish
let duplicateStateColor = "#FFC0C0";  // light reddish
let incorrectRiverColor = "#C0C040";  // light brown
let lineColor = "black";
let stdFont, boldFont;
let numberFont = "Courier, sans-serif";
let clicking = false;
let dragging = false;
let errorCount = 0;
let showErrorState = 0;

let KEY_BS     = 0x08;
let KEY_CR     = 0x0d;
let KEY_ESC    = 0x1b;
let KEY_SP     = 0x20;
let KEY_LEFT   = 0x25;
let KEY_UP     = 0x26;
let KEY_RIGHT  = 0x27;
let KEY_DOWN   = 0x28;
let KEY_PERIOD = 0xbe;

let puzzle, lastVert, lastHorz, undoProgress, boardStates, demoStepNum;

// update HTML data
function updateHTML(spanName, value, isbutton=false) {
  let spanHandle = document.querySelector('#' + spanName);
  if (isbutton) {
    spanHandle.value = value;
  } else {
    spanHandle.innerHTML = value;
  }
}

function puzzleInit() {
  // any key anywhere as long as canvas is in focus
  $(document).keydown(function(evnt) {
    $("#saveButton").blur();
    $("#loadButton").blur();
    $("#clearButton").blur();
    $("#showButton").blur();
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
    lastVert = "";
    lastHorz = "";
    return false;
  });
  
  $("#tab1").show();
  $("#demotab").hide();

  // a click on display button; currently fails on Invalid Array
  // if the field in front of it doesn't work
  // Length in displayPuzzle (height?)
  $("#displayButton").click(function() {
    $("#userSolvePuzzle").val("");
    let pval = $("#userPuzzle").val();
    if (pval.search(/D /) != -1) {
      $("#demotab").show();
      let pvalSplit = pval.split(" ");
      pval = pvalSplit[1];
      if (pval < demoPuzzles.length) {
        puzzleChoice = pval;
        puzzle = removeDot(demoPuzzles[pval]);
        demoStepNum = 0;
        updateDemoRegion(pval);
      }
    } else if (pval.search(/:/) == -1) {
      $("#demotab").hide();
      if (pval < cannedPuzzles.length) {
        puzzleChoice = pval;
        updateHTML('puzzledescr', cannedPuzzles[pval]);
        puzzle = removeDot(cannedPuzzles[pval]);
      }
    } else {
      $("#demotab").hide();
      puzzle = removeDot(pval);
      updateHTML('puzzledescr', puzzle);
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
    lastVert = "";
    lastHorz = "";
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

  // click on show errors, converts to show how many errors remain
  $("#showErrorButton").click(function() {
    showErrorState = (showErrorState+1)%3;
    updateBoardStatus();
    drawBoard();
  });

  // unknown at this point, but contextmenu is within jquery.js
  // I added the ; which seems to not have changed anything so
  // I don't think it is related to what follows
  $("#puzzleCanvas").bind("contextmenu", function(evnt) { evnt.preventDefault(); });

  canvas = document.getElementById('puzzleCanvas');  
  globalContext = canvas.getContext('2d');

  if(cannedPuzzles[puzzleChoice]) {
    puzzle = removeDot(cannedPuzzles[puzzleChoice]);
  } else {
    puzzle = removeDot(cannedPuzzles[0]);
  }

  initStructures(puzzle);

  updateHTML('puzzlecount1', puzzleCount-1);
  updateHTML('puzzlecount2', puzzleCount-1);
  updateHTML('descr1',       cannedPuzzles[1]);
  updateHTML('demolist1', '[' + demoPuzzles.join(", ") + ']');
  updateHTML('demolist2', '[' + demoPuzzles.join(", ") + ']');
  updateHTML('democount', demoPuzzles.length);
}

function updateTextFields() {
  let errorTextHandle = document.querySelector('#errortext');
  if (showErrorState == 0) { 
    if (errorCount) {
      updateHTML('errortext', "there are errors");
    } else {
      updateHTML('errortext', "there are no errors");
    }
  } else {
    updateHTML('errortext', "there are " + errorCount + " errors");
  }
  updateHTML('puzzledescr', "puzzle descriptor:<br/>" + puzzle);
  updateHTML('showErrorButton', 'Toggle Error Mode (' + showErrorState + ')', true);
}

function handleKey(evnt) {
  let keynum = evnt.which;

  // look for CR within puzzle display field
  const focusedElement = document.activeElement;
  if (focusedElement && focusedElement.id == "userPuzzle" && keynum == KEY_CR) {
    let pval = $("#userPuzzle").val();
    if (pval.search(/:/) == -1) {
      if (pval < cannedPuzzles.length) {
        puzzleChoice = pval;
        puzzle = removeDot(cannedPuzzles[pval]);
        updateHTML('puzzledescr', puzzle);
        let mylist = [1,2];
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
      puzzle = removeDot(pval);
      updateHTML('puzzledescr', puzzle);
    }

    initStructures(puzzle);
    return;
  }

  // refresh with "ESC"
  if (keynum == KEY_ESC) {
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
  } else if (keynum == KEY_PERIOD) {
    number = ".";
  } else {
    return;
  }
}

function initStructures(puzzle) {
  console.log("within initStructures with Hitori puzzle " + puzzle);
  $("#canvasDiv").css("border-color", "black");
  undoProgress = new Array();
  lastVert = "";
  lastHorz = "";
  // get the size and the digits out of the puzzle entry
  let puzzleSplit = puzzle.split(":");
  let size = puzzleSplit[0];
  let wxh = size.split("x");
  let numParams = puzzleSplit[1];
  let auxParams1 = puzzleSplit[2];
  let auxParams2 = puzzleSplit[3];
  globalPuzzleW = parseInt(wxh[0]);
  globalPuzzleH = parseInt(wxh[1]);
  setGridSize(globalPuzzleW);
  stdFont  = (globalGridSize*0.5)+"pt "+numberFont;
  boldFont = "bold "+stdFont;
  canvas.height = globalPuzzleH*globalGridSize;
  canvas.width  = globalPuzzleW*globalGridSize;

  globalCircleStates = initYXFromValue(0);
  globalLineStates   = initYXFromValue(0);

  globalInitBoardValues = initBoardValuesFromParams(numParams);
  globalBoardValues = initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  boardStates = initYXFromValue(false); // states are true/false for "black"
  // look for pre-black ones (denoted with *)
  let numParamsExp = expandNumParams(numParams);
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (numParamsExp[y*globalPuzzleW+x] == '*') {
        boardStates[y][x] = true;
      }
    }
  }
  globalBoardColors = initYXFromValue(emptyCellColor);
  globalInitWallStates  = initWallStates(constWallLight);
  globalWallStates = initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  updateBoardStatus();
  drawBoard();

  updateTextFields();
}

function removeDot(strval) {
  return strval.replace(/\./gi, "");
}

function drawCursor(x,y) {
  if (x && y) {
    let drawY = Math.floor((x-1)*globalGridSize);
    let drawX = Math.floor((y-1)*globalGridSize);
    globalContext.beginPath();
    globalContext.moveTo(drawX,drawY);
    globalContext.lineTo(drawX+globalGridSize*0.2,drawY+globalGridSize*0.2);
    globalContext.moveTo(drawX+globalGridSize,drawY);
    globalContext.lineTo(drawX+globalGridSize*0.8,drawY+globalGridSize*0.2);
    globalContext.moveTo(drawX+globalGridSize,drawY+globalGridSize);
    globalContext.lineTo(drawX+globalGridSize*0.8,drawY+globalGridSize*0.8);
    globalContext.moveTo(drawX,drawY+globalGridSize);
    globalContext.lineTo(drawX+globalGridSize*0.2,drawY+globalGridSize*0.8);
    globalContext.lineWidth = 1;
    globalContext.stroke();
  }
}

function findPosition(evnt, canvas) {
  let canvasElement = document.getElementById(canvas);
  let x = evnt.pageX-$(canvasElement).offset().left-parseInt($(canvasElement).css("border-left-width"));
  let y = evnt.pageY-$(canvasElement).offset().top-parseInt($(canvasElement).css("border-top-width"));
  return x+","+y;
}

function handleClick(evnt) {
  let tileColor;
  $("#userPuzzleField").blur();
  let coords = findPosition(evnt, "puzzleCanvas");
  coords = coords.split(",");
  let yCell, xCell, isEdge, yEdge, xEdge;
  [ yCell, xCell, isEdge, yEdge, xEdge ] = getClickCellInfo(coords);
  console.log(yCell + "," + xCell + "," + isEdge + "," + yEdge + "," + xEdge);
  
  lastVert = yCell;
  lastHorz = xCell;

  // hitori, toggle state. color will be handled in updateBoard
  boardStates[yCell][xCell] = boardStates[yCell][xCell] ? false : true;

  // update status
  updateBoardStatus();

  // re-draw the board
  drawBoard();
}

function updateBoardStatus() {
  // set all cells to black or white before figuring out error conditions
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalBoardColors[y][x] = boardStates[y][x] ?  fillCellColor : emptyCellColor;
    }
  }

  // figure out how many illegal rows and columns there are,
  // determined by the repeated values found. don't count the
  // same cell twice
  errorCount = 0;
  for (let y=0;y<globalPuzzleH;y++) {
    let count = new Array(globalPuzzleW);
    for (let c=0;c<=globalPuzzleW;c++) {
      count[c] = 0;
    }
    for (let x=0;x<globalPuzzleW;x++) {
      if (!boardStates[y][x]) {
        count[globalBoardValues[y][x]]++;
      }
    }
    for (let c=0;c<=globalPuzzleW;c++) {
      if (count[c] > 1) {
        errorCount += (count[c]-1);
        // if in showErrorState==2 then color these light red
        if (showErrorState==2) {
          for (let x=0;x<globalPuzzleW;x++) {
            if (!boardStates[y][x] && globalBoardValues[y][x]==c) {
              globalBoardColors[y][x] = duplicateStateColor;
            }
          }
        }
      }
    }
  }
  for (let x=0;x<globalPuzzleW;x++) {
    let count = new Array(globalPuzzleH);
    for (let c=0;c<=globalPuzzleH;c++) {
      count[c] = 0;
    }
    for (let y=0;y<globalPuzzleH;y++) {
      if (!boardStates[y][x]) {
        count[globalBoardValues[y][x]]++;
      }
    }
    for (let c=0;c<=globalPuzzleH;c++) {
      if (count[c] > 1) {
        errorCount += (count[c]-1);
        // if in showErrorState==2 then color these light red
        if (showErrorState==2) {
          for (let y=0;y<globalPuzzleH;y++) {
            if (!boardStates[y][x] && globalBoardValues[y][x]==c) {
              globalBoardColors[y][x] = duplicateStateColor;
            }
          }
        }
      }
    }
  }

  // now count adjacent black cells, only counting
  // one error per "clump"
  let filledCells = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (boardStates[y][x] && (filledCells.indexOf(y+","+x) == -1)) {
        let visitedCells = travelRiver(boardStates,y,x,true);
        if (visitedCells.length != 1) {
          errorCount++;
          // color them if in showErrorState==2
          if (showErrorState==2) {
            for (let i=0;i<visitedCells.length;i++) {
              let curCell = visitedCells[i].split(",");
              let iy = curCell[0];
              let ix = curCell[1];
              globalBoardColors[iy][ix] = incorrectFillColor;
            }
          }
        }
        filledCells.push.apply(filledCells, visitedCells);
      }
    }
  }

  // next count an error for any number of white "streams" greater than 1
  let whiteCells = new Array();
  let riverCount = 0;
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (!boardStates[y][x] && (whiteCells.indexOf(y+","+x) == -1)) {
        let visitedCells = travelRiver(boardStates,y,x,false);
        if (riverCount) {
          errorCount++;
          // if in showErrorState==2 then color these second river
          // cells differently
          if (showErrorState==2) {
            for (let i=0;i<visitedCells.length;i++) {
              let curCell = visitedCells[i].split(",");
              let iy = curCell[0];
              let ix = curCell[1];
              globalBoardColors[iy][ix] = incorrectRiverColor;
            }
          }
        }
        whiteCells.push.apply(whiteCells, visitedCells);
        riverCount++;
      }
    }
  }

  updateTextFields();
  if (errorCount == 0) {
    $("#canvasDiv").css("border-color", constColorSuccess);
  } else {
    $("#canvasDiv").css("border-color", "black");
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
  if ((horzCell < 1) || (horzCell > globalPuzzleW) || (vertCell < 1) || (vertCell > globalPuzzleH)) { 
    return;
  }

  lastVert = vertCell;
  lastHorz = horzCell;
}

function undo() {
  if (undoProgress.length > 0) {
    let undoState = undoProgress[undoProgress.length-1];
    let data = undoState.split("_");
    let coords = data[0].split("-");
    let undoVertCell = coords[0]*1;
    let undoHorCell = coords[1]*1;

    let undoColor = emptyCellColor;
    if (lastVert == undoVertCell && lastHorz == undoHorCell) {
      undoColor = numberModeColor;
    }

    undoProgress.pop();
  }
}

function clear() {
  $("#clearButton").blur();
  $("#showButton").blur();
  initStructures(puzzle);
}

function updateDemoRegion(demoNum) {
  if (demoNum==1) {
    switch (demoStepNum) {
      case 0:
        updateHTML('demotext',
          "<p>In this demo we will walk through the steps of solving this puzzle. " +
          "Press the 'next' button to walk through the solving steps, or the " +
          "'back' button to return to the previous step.</p>" +
          "<p>The first thing to do is to search out 'illegal' combinations of " +
          "digits in a row or column. This can be done with Error Mode 2 (if " +
          "enabled) or by hand. Once these are identified, you must figure out " +
          "which of the 2 or more digits must be 'disabled'.</p>");
        break;
      case 1:
        updateHTML('demotext',
          "Easy ones to knock out are triplets in a row. The middle one of the '3' " +
          "digits in the second row must remain since there can not be two black " +
          "cells adjacent.");
        boardStates = initYXFromValue(false);
        showErrorState = 2;
        updateBoardStatus();
        drawBoard();
        break;
      case 2:
        updateHTML('demotext',
          "Now that these are disabled, it is clear which of the '1' digits are to " +
          "remain in the upper left, in order to avoid adjacent black cells.");
        boardStates = initYXWithValues(false,true,["1,1","1,3"]);
        updateBoardStatus();
        drawBoard();
        break;
      case 3:
        updateHTML('demotext',
          "Now we can invoke the 'river rule' and notice that the '4' digit in the " +
          "top row must not be disabled, else it would 'strand' the 1 to its left. " +
          "Similarly, among the four '2' digits in the bottom left, only one arrangement " +
          "keeps the bottom left '2' from being stranded.");
        boardStates = initYXWithValues(false,true,["1,1","1,3","0,0"]);
        updateBoardStatus();
        drawBoard();
        break;
      case 4:
        updateHTML('demotext',
          "Similarly we can choose the correct arrangement of the '6' digits in the " +
          "bottom row to avoid stranding the digits to the left. Ditto the '5' digits " +
          "in the leftmost column.");
        boardStates = initYXWithValues(false,true,["1,1","1,3","0,0","4,2","5,1","6,0"]);
        updateBoardStatus();
        drawBoard();
        break;
      case 5:
        updateHTML('demotext',
          "Again we must choose the '4' in the second-to-rightmost column that doesn't " +
          "strand the 6 on the bottom row");
        boardStates = initYXWithValues(false,true,
          ["1,1","1,3","0,0","4,2","5,1","6,0","5,4","6,3","3,0"]);
        updateBoardStatus();
        drawBoard();
        break;
      case 6:
        updateHTML('demotext',
          "Now looking at the '7' digits in contention, we can't disable the one in the " +
          "middle of the rightmost column, else the southeast corner is stranded. " +
          "The other two must be disabled.");
        boardStates = initYXWithValues(false,true,
          ["1,1","1,3","0,0","4,2","5,1","6,0","5,4","6,3","3,0","4,5"]);
        updateBoardStatus();
        drawBoard();
        break;
      case 7:
        updateHTML('demotext',
          "The final step is to recognize that disabling the '6' in third leftmost " +
          "column would strand the west side. Once the other is disabled, it is clear " +
          "what to do with the '5' digits, and the puzzle is solved.");
        boardStates = initYXWithValues(false,true,
          ["1,1","1,3","0,0","4,2","5,1","6,0","5,4","6,3","3,0","4,5","3,3","6,6"]);
        updateBoardStatus();
        drawBoard();
        break;
      default:
        updateHTML('demotext',"Congratulations! The puzzle is solved!");
        boardStates = initYXWithValues(false,true,
          ["1,1","1,3","0,0","4,2","5,1","6,0","5,4","6,3","3,0","4,5","3,3","6,6","2,6","1,5"]);
        updateBoardStatus();
        drawBoard();
        demoStepNum = 8; // max out at 8
        break;
    }
  }
  if (demoNum==2) {
    switch (demoStepNum) {
      case 0:
        updateHTML('demotext',
          "<p>In this demo we will walk more quickly through the steps of solving " +
          "this tougher puzzle. It is recommended to go through demo 1 first. " +
          "Press the 'next' button to walk through the solving steps, or the " +
          "'back' button to return to the previous step.</p>" +
          "<p>The first thing to do is to search out 'illegal' combinations of " +
          "digits in a row or column. This can be done with Error Mode 2 (if " +
          "enabled) or by hand. Once these are identified, you must figure out " +
          "which of the duplicate digits must be 'disabled'.</p>");
        break;
      case 1:
        updateHTML('demotext',
          "A new scenario is shown on the first row, where four '4' digits are " +
          "located. Since two are adjacent, they can't both be invalid, so one " +
          "must stay, and the two leftmost are thus invalid. Afterwards we can " +
          "handle the adjacent digits in the usual manner to avoid adjacent " +
          "black cells.");
        boardStates = initYXFromValue(false);
        showErrorState = 2;
        updateBoardStatus();
        drawBoard();
        break;
      case 2:
        updateHTML('demotext',
          "In the fourth column we see a triple of '4' digits, so we can disable " +
          "two of them, and then handle the digits that are adjacent to them in " +
          "the typical manner.");
        boardStates = initYXWithValues(false,true,["0,0","0,2","2,0","0,7"]);
        updateBoardStatus();
        drawBoard();
        break;
      case 3:
        updateHTML('demotext',
          "Now we see three tiles that are blocking 'white streams' from flowing " +
          "so they must be allowed to be valid. Disable their numeric counterparts " +
          "in that row or column.");
        boardStates = initYXWithValues(false,true,
          ["0,0","0,2","2,0","0,7","1,3","3,3","3,1","3,1","4,2","5,3","6,2","6,4","6,6"]);
        updateBoardStatus();
        drawBoard();
        break;
      case 4:
        updateHTML('demotext',
          "The remaining quad of '1' digits are now easy to complete the puzzle.");
        boardStates = initYXWithValues(false,true,
          ["0,0","0,2","2,0","0,7","1,3","3,3","3,1","3,1","4,2","5,3","6,2","6,4","6,6",
           "0,5","2,7","6,0","5,5"]);
        updateBoardStatus();
        drawBoard();
        break;
      case 5:
        updateHTML('demotext',"Congratulations! The puzzle is solved!");
        boardStates = initYXWithValues(false,true,
          ["0,0","0,2","2,0","0,7","1,3","3,3","3,1","3,1","4,2","5,3","6,2","6,4","6,6",
           "0,5","2,7","6,0","5,5","3,5","4,6"]);
        updateBoardStatus();
        drawBoard();
        break;
    }
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
