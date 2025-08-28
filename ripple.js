
let emptyCellColor = "white";         // default
let fillCellColor = "black";          // default
let completeFillColor = "#e0ffe0";    // light green
let errorFontColor = "red";
let clicking = false;
let dragging = false;
let errorCount = 0;
let incompleteCount = 0;
let assistState = 0;

const MOVE_CLEAR  = 1;
const MOVE_SET    = 2;

// the digits and letters are added below
let handledKeys = [ KEY_BS, KEY_CR, KEY_SP, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN ];

let initPuzzle, puzzle, moveHistory;
let boardStates, demoStepNum, puzzleRoomList, largestPolyo;

function puzzleInit() {
  globalCursorOn = true;

  // add digits and letters to handled key list
  for (let key=KEY_1;key<=KEY_9;key++) {
    handledKeys.push(key);
  }
  for (let key=ALT_1;key<=ALT_9;key++) {
    handledKeys.push(key);
  }
  for (let key=KEY_a;key<=KEY_z;key++) {
    handledKeys.push(key);
  }
  for (let key=KEY_A;key<=KEY_Z;key++) {
    handledKeys.push(key);
  }

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
    if (errorCount && incompleteCount) {
      etext = "there are errors and incomplete rooms";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteCount) {
      etext = "there are incomplete rooms";
    } else {
      etext = "there are no errors nor incomplete rooms";
    }
  } else {
    etext = "there are " + errorCount + " errors and " +
                      incompleteCount + " incomplete rooms";
  }
  updateDynamicHtmlEntries(etext,assistState);
}

function addHistory(y,x,prevvalue,newvalue) {
  moveHistory.push([y,x,prevvalue,newvalue]);
}

function addMove(y,x,value) {
  addHistory(y,x,globalBoardValues[y][x],value);
  globalBoardValues[y][x] = value;
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
        if (globalCursorY) {
          globalCursorY--;
        }
        break;
      case KEY_DOWN:
        if (globalCursorY < (globalPuzzleH-1)) {
          globalCursorY++;
        }
        break;
      case KEY_LEFT:
        if (globalCursorX) {
          globalCursorX--;
        }
        break;
      case KEY_RIGHT:
        if (globalCursorX < (globalPuzzleW-1)) {
          globalCursorX++;
        }
        break;
      case KEY_BS:
      case KEY_SP: // clear the board contents unless default
        // don't delete those that are pre-set
        if (globalInitBoardValues[globalCursorY][globalCursorX] == '') {
          addMove(globalCursorY,globalCursorX,'');
        }
        break;
      default:    // here we handle all digit keys including A-Z
        // don't overwrite those that are pre-set
        let setValue = 0;
        if (globalInitBoardValues[globalCursorY][globalCursorX] == '') {
          if (keynum >= KEY_1 && keynum <= KEY_9) {
            setValue = keynum-KEY_0;
          } else if (keynum >= ALT_1 && keynum <= ALT_9) {
            setValue = keynum-ALT_0;
          } else if(keynum >= KEY_a && keynum <= KEY_z) {
            setValue = keynum-KEY_a+10;
          } else {
            setValue = keynum-KEY_A+10;
          }
        }
        if (setValue && setValue <= largestPolyo) {
          addMove(globalCursorY,globalCursorX,setValue);
        }
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
  let rwallParams = puzzleSplit[2];
  let cwallParams = puzzleSplit[3];
  globalPuzzleW = parseInt(wxh[0]);
  globalPuzzleH = parseInt(wxh[1]);
  setGridSize(globalPuzzleW);
  canvas.height = globalPuzzleH*globalGridSize;
  canvas.width  = globalPuzzleW*globalGridSize;

  globalInitBoardValues = initBoardValuesFromParams(numParams);
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  globalCircleStates =    initYXFromValue(0);     // no circles, lines needed in this puzzle
  globalLineStates   =    initYXFromValue(0);
  globalBoardColors =     initYXFromValue(emptyCellColor);
  globalBoardTextColors = initYXFromValue(fillCellColor); // all text is black
  globalLineColors =      initYXFromValue("black"); // default line is black
  globalCircleColors =    initYXFromValue("black");
  globalTextBold =        initYXFromValue(true);

  // initialize the wall states based upon the given parameters
  globalInitWallStates  = initWallStatesFromHexes(rwallParams, cwallParams, constWallLight);
  globalWallStates = initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);

  // find all the rooms
  puzzleRoomList = findRooms();
  largestPolyo = 0;
  for (let i=0;i<puzzleRoomList.length;i++) {
    if (puzzleRoomList[i].length > largestPolyo) {
      largestPolyo = puzzleRoomList[i].length;
    }
  }
  updateBoardStatus();
  drawBoard();
}

function removeDot(strval) {
  return strval.replace(/\./gi, "");
}

function handleClick(evnt) {
  $("#userPuzzleField").blur();
  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");
  
  globalCursorY = yCell;
  globalCursorX = xCell;
  drawBoard();
}

// look for errors and incompletions
function updateBoardStatus() {
  // accounting the errors:
  //  1) duplicates of a digit in a room
  //  2) too large of a value in a room
  //  3) two digits too close to each other
  // also count the incompletes, which are rooms
  // that don't have all of the digits filled correctly
  let errorCells = new Array();
  let incompleteRooms = new Array();
  incompleteCount = 0;

  for (let p=0;p<puzzleRoomList.length;p++) {
    let room = puzzleRoomList[p];
    let vcounts = new Array();
    for (let i=1;i<=room.length;i++) {
      vcounts[i] = 0;
    }
    for (let r of room) {
      let pcell = r.split(",");
      let py = pcell[0];
      let px = pcell[1];
      let pv = globalBoardValues[py][px];
      if (pv > room.length && (errorCells.indexOf(pcell) == -1)) {
        errorCells.push(room[i]);
      }
      vcounts[pv]++;
    }
    for (let c=1;c<=room.length;c++) {
      // if more than one, mark all in the room with that number in error
      if (vcounts[c] > 1) {
        for (let r of room) {
          let pcell = r.split(",");
          let py = pcell[0];
          let px = pcell[1];
          let pv = globalBoardValues[py][px];
          if ((pv == c) && (errorCells.indexOf(pcell) == -1)) {
            errorCells.push(r);
          }
        }
      // if zero, then this is an incomplete room
      } else if (vcounts[c] == 0) {
        if (incompleteRooms.indexOf(p) == -1) {
          incompleteRooms.push(p);
        }
      }
    }
  }

  // now check the ripple effect. only need to go in the positive
  // direction so as to not double count
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (globalBoardValues[y][x]) {
        // count forward in both directions and look for duplicates
        for (let i=1;i<=globalBoardValues[y][x];i++) {
          let xi = x+i;
          let yi = y+i;
          let cellyx  = y +","+x;
          let cellyxi = y +","+xi;
          let cellyix = yi+","+x;
          if ((xi < globalPuzzleW) &&
              (globalBoardValues[y][xi] == globalBoardValues[y][x])) {
            if (errorCells.indexOf(cellyx) == -1) {
              errorCells.push(cellyx);
            }
            if (errorCells.indexOf(cellyxi) == -1) {
              errorCells.push(cellyxi);
            }
          }
          if ((yi < globalPuzzleH) &&
              (globalBoardValues[yi][x] == globalBoardValues[y][x])) {
            if (errorCells.indexOf(cellyx) == -1) {
              errorCells.push(cellyx);
            }
            if (errorCells.indexOf(cellyix) == -1) {
              errorCells.push(cellyix);
            }
          }
        }
      }
    }
  }

  // in assistState 2, color completed rooms light green,
  // and error cells with red font
  for (let p=0;p<puzzleRoomList.length;p++) {
    let room = puzzleRoomList[p];
    for (let i=0;i<room.length;i++) {
      let pcell = room[i].split(",");
      let py = pcell[0];
      let px = pcell[1];
      if ((assistState == 2) && (incompleteRooms.indexOf(p) == -1)) {
        globalBoardColors[py][px] = completeFillColor;
      } else {
        globalBoardColors[py][px] = emptyCellColor;
      }
      if ((assistState == 2) && (errorCells.indexOf(room[i]) != -1)) {
        globalBoardTextColors[py][px] = errorFontColor;
      } else {
        globalBoardTextColors[py][px] = fillCellColor;
      }
    }
  }

  errorCount = errorCells.length;
  incompleteCount = incompleteRooms.length;
  updateDynTextFields();
  if ((errorCount == 0) && (incompleteCount == 0)) {
    $("#canvasDiv").css("border-color", constColorSuccess);
  } else {
    $("#canvasDiv").css("border-color", "black");
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    globalBoardValues[lastMove[0]][lastMove[1]] = lastMove[2];
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
  let dtext  = (demoNum==1) ?  demoText[0] :  demoText[1];
  let dmoves = (demoNum==1) ? demoMoves[0] : demoMoves[1];
  if (demoStepNum < dtext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHtmlText('demotext', dtext[demoStepNum]);
    globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      for (let dsteps of dmoves[step]) {
        let steps = dsteps.split(",");
        addMove(steps[0],steps[1],steps[2]);
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}
