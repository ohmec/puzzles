const emptyCellColor = "white";         // default
const fillCellColor = "black";          // default
const incorrectCellColor = "#802020";   // dark reddish
const duplicateStateColor = "#FFC0C0";  // light reddish
const incorrectRiverColor = "#C0C040";  // light brown

const stdFontColor = "black";
const offFontColor = "white";

let clicking = false;
let dragging = false;
let errorCount = 0;
let assistState = 0;

const MOVE_TOGGLE = 1;
const MOVE_SET    = 2;
const MOVE_RESET  = 3;

const handledKeys = [ KEY_CR, KEY_SP, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_0, KEY_1, ALT_0, ALT_1 ];

let initPuzzle, puzzle, moveHistory, boardStates, demoStepNum;

function puzzleInit() {
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
    if (handledKeys.find(element => element == evnt.which)) {
      handleKey(evnt.which);
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
        updateHtmlDescr(initPuzzle);
        puzzle = removeDot(initPuzzle);
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
  } else {
    initPuzzle = cannedPuzzles[0];
  }

  puzzle = removeDot(initPuzzle);
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
    if (errorCount) {
      etext = "there are errors";
    } else {
      etext = "there are no errors";
    }
  } else {
    etext = "there are " + errorCount + " errors";
  }
  updateDynamicHtmlEntries(etext,assistState);
}

function addHistory(setOrReset,y,x) {
  moveHistory.push([setOrReset,y,x]);
}

function addMove(move,y,x) {
  switch (move) {
    case MOVE_TOGGLE:
      boardStates[y][x] = boardStates[y][x] ? false : true;
      addHistory(boardStates[y][x],y,x);
      break;
    case MOVE_SET:
      boardStates[y][x] = true;
      addHistory(true,y,x);
      break;
    case MOVE_RESET:
      boardStates[y][x] = false;
      addHistory(false,y,x);
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
      case KEY_UP:
        globalCursorOn = true;
        if (globalCursorY) {
          globalCursorY--;
        }
        break;
      case KEY_DOWN:
        globalCursorOn = true;
        if (globalCursorY < (globalPuzzleH-1)) {
          globalCursorY++;
        }
        break;
      case KEY_LEFT:
        globalCursorOn = true;
        if (globalCursorX) {
          globalCursorX--;
        }
        break;
      case KEY_RIGHT:
        globalCursorOn = true;
        if (globalCursorX < (globalPuzzleW-1)) {
          globalCursorX++;
        }
        break;
      case KEY_SP: // toggle on/off under cursor
        globalCursorOn = true;
        addMove(MOVE_TOGGLE,globalCursorY,globalCursorX);
        break;
      case KEY_0: // set off
      case ALT_0:
        globalCursorOn = true;
        addMove(MOVE_RESET,globalCursorY,globalCursorX);
        break;
      case KEY_1: // set on
      case ALT_1:
        globalCursorOn = true;
        addMove(MOVE_SET,globalCursorY,globalCursorX);
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
  globalPuzzleW = parseInt(wxh[0]);
  globalPuzzleH = parseInt(wxh[1]);
  setGridSize(globalPuzzleW);
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
  globalBoardTextColors = initYXFromValue(stdFontColor);
  globalLineColors = initYXFromValue("black"); // default line is black
  globalCircleColors = initYXFromValue("black");
  globalInitWallStates  = initWallStates(constWallLight);
  globalWallStates = initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  updateBoardStatus();
  drawBoard();
  updateDynTextFields();
}

function removeDot(strval) {
  return strval.replace(/\./gi, "");
}

function handleClick(evnt) {
  let tileColor;
  $("#userPuzzleField").blur();
  let yCell, xCell, isEdge, yEdge, xEdge;
  [ yCell, xCell, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");
  
  globalCursorY = yCell;
  globalCursorX = xCell;

  // click toggles state
  addMove(MOVE_TOGGLE,yCell,xCell);

  // update status
  updateBoardStatus();

  // re-draw the board
  drawBoard();
}

function updateBoardStatus() {
  // set all cells to black or white before figuring out error conditions
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalBoardColors[y][x]     = boardStates[y][x] ? fillCellColor : emptyCellColor;
      globalBoardTextColors[y][x] = boardStates[y][x] ?  offFontColor :   stdFontColor;
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
        // if in assistState==2 then color these light red
        if (assistState==2) {
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
        // if in assistState==2 then color these light red
        if (assistState==2) {
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
        let visitedCells = travelRiver(boardStates,y,x,true,true);
        if (visitedCells.length != 1) {
          errorCount++;
          // color them if in assistState==2
          if (assistState==2) {
            for (let i=0;i<visitedCells.length;i++) {
              let curCell = visitedCells[i].split(",");
              let iy = curCell[0];
              let ix = curCell[1];
              globalBoardColors[iy][ix] = incorrectCellColor;
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
        let visitedCells = travelRiver(boardStates,y,x,true,false);
        if (riverCount) {
          errorCount++;
          // if in assistState==2 then color these second river
          // cells differently
          if (assistState==2) {
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

  updateDynTextFields();
  if (errorCount == 0) {
    $("#canvasDiv").css("border-color", constColorSuccess);
  } else {
    $("#canvasDiv").css("border-color", "black");
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    boardStates[lastMove[1]][lastMove[2]] = lastMove[0] ? false : true;
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
  let demotext, demomoves;
  if (demoNum==1) {
    demotext = [
      "<p>In this demo we will walk through the steps of solving this puzzle. " +
        "Press the 'next' button to walk through the solving steps, or the " +
        "'back' button to return to the previous step.</p>" +
        "<p>The first thing to do is to search out 'illegal' combinations of " +
        "digits in a row or column which would violate rule #1. This can be " +
        "done manually, or with Assist Mode 2 (if enabled). Once these are " +
        "identified, you must figure out which of the 2 or more digits must " +
        "be 'disabled' to satisfy the rule.</p>",
      "Easy ones to knock out are triplets in a row, since clearly only the " +
        "middle one can remain in that scenario in order for there not to be " +
        "two black cells adjacent, which would violate rule #2. The middle '3' " +
        "digit in the second row must remain enabled, and the other two must " +
        "be disabled.",
      "Now that these are disabled, it is clear which of the '1' digits are to " +
        "remain in the upper left, in order to avoid rule 2's adjacent black cells.",
      "Now we can invoke rule #3, the 'river rule' and notice that the '4' " +
        "digit in the top row must not be disabled, else it would 'strand' the " +
        "'1' to its left. Similarly, among the four '2' digits in the bottom left, " +
        "only one arrangement keeps the bottom left '2' from being stranded. " +
        "The other digits of the same number in that row or column must thus " +
        "be disabled.",
      "Similarly we can choose the correct arrangement of the '6' digits in the " +
        "bottom two rows to avoid stranding the digits to the left. Ditto the '5' " +
        "digits in the leftmost column.",
      "Again we must choose the '4' in the second-to-rightmost column that doesn't " +
        "strand the 6 on the bottom row.",
      "Now looking at the '7' digits in contention, we can't disable the one in the " +
        "middle of the rightmost column, else the southeast corner is stranded. " +
        "The other two must be disabled.",
      "The final step is to recognize that disabling the '6' in third leftmost " +
        "column would strand the west side. Once the other is disabled, it is clear " +
        "what to do with the '5' digits, and the puzzle is solved.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      [],
      ["1,1","1,3"],
      ["0,0"],
      ["4,2","5,1","6,0"],
      ["5,4","6,3","3,0"],
      ["4,5"],
      ["3,3","6,6"],
      ["2,6","1,5"]];
  } else {
    demotext = [
      "<p>In this demo we will walk more quickly through the steps of solving " +
        "this tougher puzzle. It is recommended to go through demo 1 first. " +
        "Press the 'next' button to walk through the solving steps, or the " +
        "'back' button to return to the previous step.</p>" +
        "<p>The first thing to do is to search out 'illegal' combinations of " +
        "digits in a row or column. This can be done with Assist Mode 2 (if " +
        "enabled) or by hand. Once these are identified, you must figure out " +
        "which of the duplicate digits must be 'disabled'.</p>",
      "A new scenario is shown on the first row, where four '4' digits are " +
        "located. Since two are adjacent, they can't both be invalid, so one " +
        "must stay, and the two leftmost are thus invalid. Afterwards we can " +
        "handle the adjacent digits in the usual manner to avoid violating " +
        "rule #2 about adjacent black cells.",
      "In the fourth column we see a triple of '4' digits, so we can disable " +
        "two of them, and then handle the digits that are adjacent to them in " +
        "the typical manner.",
      "Now we see three tiles that are blocking 'white streams' from flowing " +
        "so they must be allowed to be valid. Disable their numeric counterparts " +
        "in that row or column.",
      "The remaining quad of '1' digits are now easy to complete the puzzle.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      [],
      ["0,0","0,2","2,0","0,7"],
      ["1,3","3,3","3,1","3,1","4,2","5,3","6,2","6,4","6,6"],
      ["0,5","2,7","6,0","5,5"],
      ["3,5","4,6"]];
  }
  if (demoStepNum < demotext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHtmlText('demotext', demotext[demoStepNum]);
    boardStates = initYXFromValue(false);
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      let demosteps = demomoves[step];
      for (let i=0;i<demosteps.length;i++) {
        let curCell = demosteps[i].split(",");
        let iy = curCell[0];
        let ix = curCell[1];
        addMove(MOVE_SET,iy,ix);
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}
