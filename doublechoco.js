const emptyCellColor = "white";         // not-filled
const stdFontColor = "black";
const oppFontColor = "white";
const errorFontColor = "red";
const correctFontColor = "green";
const correctWhiteColor = "#e0ffe0";
const correctGrayColor = "#90b090";
const errorWhiteColor = "#ffe0e0";
const errorGrayColor = "#b09090";

const constMoveEraseWall =  1;
const constMoveAddWall =    2;

let clicking = false;
let dragging = false;
let shifting = false;
let ctrling = false;
let errorCount = 0;
let incompleteCount = 0;
let incompleteBoard = true;
let assistState = 0;
let curClickType = CLICK_UNKNOWN;

// which keys are handled
let handledKeys =
  [ KEY_BS, KEY_CR, KEY_SP, KEY_0, KEY_1, ALT_0, ALT_1, KEY_ESC, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = false;
  globalTextOutline = true; // outline style text

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
    if (evnt.which == KEY_SHIFT) {
      shifting = true;
    } else if ((evnt.which == KEY_CTLL) || (evnt.which == KEY_CTLR)) {
      ctrling = true;
    } else if (!ctrling && (handledKeys.find(element => element == evnt.which))) {
      handleKey(evnt.which);
    }
  });

  $(document).keyup(function(evnt) {
    if (evnt.which == KEY_SHIFT) {
      shifting = false;
    } else if ((evnt.which == KEY_CTLL) || (evnt.which == KEY_CTLR)) {
      ctrling = false;
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
      etext = "there are errors and incomplete numbers";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteCount) {
      etext = "there are incomplete numbers";
    } else if (incompleteBoard) {
      etext = "there are pending rooms";
    } else {
      etext = "the puzzle is complete!!";
    }
  } else {
    if (errorCount || incompleteCount) {
      etext = "there are " + errorCount + " errors and " +
                        incompleteCount + " incomplete numbers";
    } else if (incompleteBoard) {
      etext = "there are pending rooms";
    } else {
      etext = "the puzzle is complete!!";
    }
  }
  updateDynamicHtmlEntries(etext,assistState);
}

function addHistory(movetype,y,x,prevvalue) {
  moveHistory.push([movetype,y,x,prevvalue]);
}

function addMove(y,x,moveType) {
  // ignore a move if on a corner (not edge)
  if ((y%2) == (x%2)) {
    return;
  }
  // only add to history if it actually changes the value
  if (moveType==constMoveEraseWall) {
    if (globalWallStates[y][x] & constWallUserEdge) {
      addHistory(moveType,y,x,globalWallStates[y][x]);
      globalWallStates[y][x] &= ~constWallUserEdge;
    }
  } else { // add wall
    if ((globalWallStates[y][x] & constWallUserEdge) == 0) {
      addHistory(moveType,y,x,globalWallStates[y][x]);
      globalWallStates[y][x] |= constWallUserEdge;
    }
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
    if (keynum==KEY_ESC) {
      console.log(globalWallStates);
      console.log(puzzleBoardStates);
      console.log(moveHistory);
    // none of these keys make any sense unless on a wall
    } else if (globalWallCursorOn) {
      switch (keynum) {
        case KEY_UP:
          // we can only move the wall cursor up if we're already on a vert wall
          // or corner
          if ((globalWallCursorX%2)==0) {
            if (globalWallCursorY) {
              globalWallCursorY--;
              if (shifting && ((globalWallCursorX%2) || (globalWallCursorY%2))) {
                addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
              }
              // if shifting on a corner move up two (to the next corner), else one
              if (shifting && (globalWallCursorY%2)) {
                globalWallCursorY--;
              }
            }
          }
          break;
        case KEY_DOWN:
          // we can only move the wall cursor down if we're already on a vert wall
          // or corner
          if ((globalWallCursorX%2)==0) {
            if (globalWallCursorY<(2*globalPuzzleH)) {
              globalWallCursorY++;
              if (shifting && ((globalWallCursorX%2) || (globalWallCursorY%2))) {
                addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
              }
              // if shifting on a corner move down two (to the next corner), else one
              if (shifting && (globalWallCursorY%2)) {
                globalWallCursorY++;
              }
            }
          }
          break;
        case KEY_LEFT:
          // we can only move the wall cursor left if we're already on a horz wall
          // or corner
          if ((globalWallCursorY%2)==0) {
            if (globalWallCursorX) {
              globalWallCursorX--;
              if (shifting && ((globalWallCursorX%2) || (globalWallCursorY%2))) {
                addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
              }
              // if shifting on a corner move left two (to the next corner), else one
              if (shifting && (globalWallCursorX%2)) {
                globalWallCursorX--;
              }
            }
          }
          break;
        case KEY_RIGHT:
          // we can only move the wall cursor right if we're already on a horz wall
          // or corner
          if ((globalWallCursorY%2)==0) {
            if (globalWallCursorX<(2*globalPuzzleW)) {
              globalWallCursorX++;
              if (shifting && ((globalWallCursorX%2) || (globalWallCursorY%2))) {
                addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
              }
              // if shifting on a corner move right two (to the next corner), else one
              if (shifting && (globalWallCursorX%2)) {
                globalWallCursorX++;
              }
            }
          }
          break;
        // if on wall, toggle wall value
        case KEY_SP:
          if ((globalWallStates[globalWallCursorY][globalWallCursorX] & constWallUserEdge)==0) {
            addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
          } else {
            addMove(globalWallCursorY,globalWallCursorX,constMoveEraseWall);
          }
          break;
        // if on wall, clear
        case KEY_0:
        case ALT_0:
        case KEY_BS:
          addMove(globalWallCursorY,globalWallCursorX,constMoveEraseWall);
          break;
        // if on wall, set true
        case KEY_1:
        case ALT_1:
          addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
          break;
      }
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
  let numParams = puzzleSplit[1];
  let grayParams = puzzleSplit[2];
  let rwallParams = puzzleSplit[3];
  let cwallParams = puzzleSplit[4];

  basicInitStructures(size,emptyCellColor,constWallDash,constWallBorder,stdFontColor);

  globalBoardValues = initBoardValuesFromParams(numParams);
  globalBoardColors = initBoardColorsFromHexes(grayParams, constColorMedGray);
  puzzleBoardStates = initBoolenBoardFromHexes(grayParams);
  if (puzzleSplit.length > 3) {
    globalWallStates = initWallStatesFromHexes(rwallParams, cwallParams, constWallLight);
  }

  // check that grayParams is 50/50 as a double check
  let grayArray = grayParams.split("");
  let totalGray = 0;
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let hexVal = grayArray[y*Math.ceil(globalPuzzleW/4)+Math.floor(x/4)];
      totalGray += (parseInt(hexVal,16) & (1<<(3-(x%4)))) ? 1 : 0;
    }
  }
  let wxh = size.split("x");
  let exp = wxh[0]*wxh[1]/2;
  if (totalGray != exp) {
    throw "ERROR in puzzle descriptor expected " + exp + " gray cells, got " + totalGray;
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

  // ignore clicks if not on wall
  if (!isEdge && !isCorner) {
    return;
  }

  // set click type
  if (!dragging) {
    curClickType = clickType(evnt);
  }

  // ignoring middle click
  if (curClickType == CLICK_MIDDLE) {
    return;
  }
  // dragging wall, but no move yet
  if (dragging && (yEdge == globalWallCursorY) && (xEdge == globalWallCursorX)) {
    return;
  }
  // dragging wall, but currently on a corner
  if (dragging && !isEdge) {
    return;
  }
  
  globalWallCursorY = yEdge;
  globalWallCursorX = xEdge;
  globalWallCursorOn = true;

  // left click or drag on edge sets the edge
  if (isEdge && (curClickType==CLICK_LEFT)) {
    addMove(yEdge,xEdge,constMoveAddWall);
  // right drag or click on edge clears the edge
  } else if (isEdge && (curClickType==CLICK_RIGHT)) {
    addMove(yEdge,xEdge,constMoveEraseWall);
  }
  updateBoardStatus();
  drawBoard();
}

function colorRoom(roomInfo, color) {
  for (let cell of roomInfo) {
    let cc = cell.split(",");
    let y = cc[0];
    let x = cc[1];
    globalBoardColors[y][x] = color;
  }
}

function convTo2D(roomInfo) {
  let room2d = new Array();
  for (let cell of roomInfo) {
    let c = cell.split(",");
    room2d.push([parseInt(c[0]),parseInt(c[1])]);
  }
  return room2d;
}

// look for errors
function updateBoardStatus() {
  // first off, ignore rooms that have more than 1 gray or 1 white
  // cluster of cells, those are likely not ready yet for evaluation.
  // for those that are ready, accounting the errors:
  //  1) rooms with different number gray and white cells
  //  2) rooms with a digit that doesn't match the size of the gray/white cells
  //  3) rooms with different shaped gray and white cells (after normalizing)
  errorCount = 0;

  // also count how many numbers haven't been completed yet
  incompleteCount = 0;
  // and finally set this to true if there are rooms that are not
  // yet ready for evaluation
  incompleteBoard = false;

  // start by reseting all cell colors to the "standard",
  // for their state (gray for 'true' and white for 'false')
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalBoardColors[y][x] = puzzleBoardStates[y][x] ? constColorMedGray : emptyCellColor;
      globalBoardTextColors[y][x] = stdFontColor;
    }
  }

  // get all of the rooms
  let currentRooms = findRooms();

  // now go through each room, and do: 
  //   1) do a "gray river/white river" search within each room.
  //     a) if more than one of either in this room, ignore it and set incomplete Board
  //     b) if one of each
  //       1) if of different shape (gray and white), set error
  //       2) if of different size than any number, set error

  let checkedCells = new Array();
  let checkedDigits = new Array();
  for (let room of currentRooms) {
    let whiteSections = new Array();
    let graySections = new Array();
    for (let cell of room) {
      let curCell = cell.split(",");
      let iy = curCell[0];
      let ix = curCell[1];
      if (puzzleBoardStates[iy][ix] && (checkedCells.indexOf(iy+","+ix)==-1)) {
        let grayCells = travelRiver(puzzleBoardStates,iy,ix,true,true,true,room);
        graySections.push(grayCells);
        checkedCells.push.apply(checkedCells, grayCells);
      } else if (!puzzleBoardStates[iy][ix] && (checkedCells.indexOf(iy+","+ix)==-1)) {
        let whiteCells = travelRiver(puzzleBoardStates,iy,ix,true,false,true,room);
        whiteSections.push(whiteCells);
        checkedCells.push.apply(checkedCells, whiteCells);
      }
    }
    if ((graySections.length == 1) && (whiteSections.length == 1)) {
      let grayHalf = graySections[0];
      let whiteHalf = whiteSections[0];
      if (grayHalf.length == whiteHalf.length) {
        let canonicalGray = canonicalizeShape(convTo2D(grayHalf));
        let canonicalWhite = canonicalizeShape(convTo2D(whiteHalf));
        let sameShape = compareRooms(canonicalWhite,canonicalGray);
        if (sameShape) {
          // color green
          if (assistState==2) {
            colorRoom(grayHalf,correctGrayColor);
            colorRoom(whiteHalf,correctWhiteColor);
          }
        } else {
          // color red
          errorCount++;
          if (assistState==2) {
            colorRoom(grayHalf,errorGrayColor);
            colorRoom(whiteHalf,errorWhiteColor);
          }
        }
      } else {
        // color red
        errorCount++;
        if (assistState==2) {
          colorRoom(grayHalf,errorGrayColor);
          colorRoom(whiteHalf,errorWhiteColor);
        }
      }

      // now go through all numbers within the halves and 
      // check against length
      for (let cell of room) {
        let cc = cell.split(",");
        let cy = cc[0];
        let cx = cc[1];
        if (globalBoardValues[cy][cx] != "") {
          if (globalBoardValues[cy][cx] == grayHalf.length) {
            if (assistState==2) {
              globalBoardTextColors[cy][cx] = correctFontColor;
            }
          } else {
            errorCount++;
            if (assistState==2) {
              globalBoardTextColors[cy][cx] = errorFontColor;
            }
          }
          checkedDigits.push(cell);
        }
      }
    // only gray
    } else if (whiteSections.length == 0) {
      errorCount++;
      if (assistState==2) {
        let grayHalf = graySections[0];
        colorRoom(grayHalf,errorGrayColor);
      }
    // only white
    } else if (graySections.length == 0) {
      errorCount++;
      if (assistState==2) {
        let whiteHalf = whiteSections[0];
        colorRoom(whiteHalf,errorWhiteColor);
      }
    } else {
      incompleteBoard = true;
    }
  }

  // finally go through all of the digit numbered cells and see if they
  // have already been checked for correctness. If not, they are incomplete
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (globalBoardValues[y][x] != "") {
        if (checkedDigits.indexOf(y+","+x)==-1) {
          incompleteCount++;
        }
      }
    }
  }

  updateDynTextFields();
  if ((errorCount == 0) && (incompleteCount == 0) && !incompleteBoard) {
    canvasSuccess();
  } else {
    canvasIncomplete();
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    globalWallStates[lastMove[1]][lastMove[2]] = lastMove[3];
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
  globalWallCursorOn = false;
  let dtext  = (demoNum==1) ?  demoText[0] :  demoText[1];
  let dmoves = (demoNum==1) ? demoMoves[0] : demoMoves[1];
  if (demoStepNum < dtext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHtmlText('demotext', dtext[demoStepNum]);
    // start by reseting all walls to empty
    for (let y=0;y<(globalPuzzleH*2+1);y++) {
      for (let x=0;x<(globalPuzzleW*2+1);x++) {
        globalWallStates[y][x] &= ~constWallUserEdge;
      }
    }
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      for (let dsteps of dmoves[step]) {
        let steps = dsteps.split("");
        if (steps[0]=="_") {          // south wall
          addMove(2*parseInt(steps[1],36)+2,2*parseInt(steps[2],36)+1,constMoveAddWall);
        } else {   // east wall
          addMove(2*parseInt(steps[1],36)+1,2*parseInt(steps[2],36)+2,constMoveAddWall);
        }
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}
