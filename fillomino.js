const emptyCellColor = "white";         // not-filled
const fillCellColor  = "#000040";       // filled, slightly dark blue to contrast with black walls
const incorrectRiverColor = "#802020";  // dark reddish
const incorrectPoolColor = "#202080";   // dark bluish

const stdFontColor = "black";
const offFontColor = "white";
const errorFontColor = "red";
const correctFontColor = "green";

const constMoveEraseCell =  50;
const constMoveEraseWall =  51;
const constMoveAddWall =    52;
const constMoveToggleWall = 53;

let clicking = false;
let dragging = false;
let shifting = false;
let errorCount = 0;
let incompleteCount = 0;
let assistState = 0;
let curClickType = CLICK_UNKNOWN;
let curClickIsWall = false;
let curClickNumber = constMoveEraseCell;
let curShiftNumber = constMoveEraseCell;
let debugMode = false;

// which keys are handled, letters and numbers handled algorithmically afterwards
let handledKeys =
  [ KEY_BS, KEY_SP, KEY_CR, KEY_ESC, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleRoomList, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;

  // add digits and letters to handled key list
  for (let key=KEY_1;key<=KEY_9;key++) {
    handledKeys.push(key);
  }
  for (let key=ALT_1;key<=ALT_9;key++) {
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
    if (evnt.which == KEY_SHIFT) {
      shifting = true;
      curShiftNumber = globalBoardValues[globalCursorY][globalCursorX];
    } else if (handledKeys.find(element => element == evnt.which)) {
      handleKey(evnt.which);
    }
  });

  $(document).keyup(function(evnt) {
    if (evnt.which == KEY_SHIFT) {
      shifting = false;
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
    } else {
      etext = "there are no errors nor incomplete numbers";
    }
  } else {
    if (errorCount || incompleteCount) {
      etext = "there are " + errorCount + " errors and " +
                        incompleteCount + " incomplete numbers";
    } else {
      etext = "there are no errors nor incomplete numbers";
    }
  }
  updateDynamicHtmlEntries(etext,assistState);
}

function addHistory(movetype,y,x,prevvalue) {
  moveHistory.push([movetype,y,x,prevvalue]);
}

function addMove(y,x,moveType) {
  if (moveType==constMoveEraseWall) {
    if (globalWallStates[y][x] & constWallUserEdge) {
      addHistory(moveType,y,x,globalWallStates[y][x]);
      globalWallStates[y][x] &= ~constWallUserEdge;
    }
  } else if (moveType==constMoveAddWall) {
    if ((globalWallStates[y][x] & constWallUserEdge) == 0) {
      addHistory(moveType,y,x,globalWallStates[y][x]);
      globalWallStates[y][x] |= constWallUserEdge;
    }
  } else if (moveType==constMoveToggleWall) {
    addHistory(moveType,y,x,globalWallStates[y][x]);
    globalWallStates[y][x] ^= constWallUserEdge;
  } else {
    // don't change a static value
    if (globalInitBoardValues[y][x] != "") {
      return;
    }
    if (moveType==constMoveEraseCell) {
      addHistory(moveType,y,x,globalBoardValues[y][x]);
      globalBoardValues[y][x] = "";
    } else {
      addHistory(moveType,y,x,globalBoardValues[y][x]);
      globalBoardValues[y][x] = moveType;
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
    if (keynum >= KEY_1 && keynum <= KEY_9) {
      addMove(globalCursorY,globalCursorX,keynum-KEY_0);
    } else if (keynum >= ALT_1 && keynum <= ALT_9) {
      addMove(globalCursorY,globalCursorX,keynum-ALT_0);
    } else if (keynum >= KEY_A && keynum <= KEY_Z) {
      addMove(globalCursorY,globalCursorX,keynum-KEY_A+10);
    } else {
      switch (keynum) {
        case KEY_ESC:
          console.log(globalBoardValues);
          console.log(globalWallStates);
          debugMode = true;
          break;
        case KEY_UP:
          if (globalCursorOn) {
            if (globalCursorY) {
              globalCursorY--;
              if (shifting) {
                addMove(globalCursorY,globalCursorX,curShiftNumber);
              }
            }
          // we can only move the wall cursor up if we're already on a vert wall
          // or corner
          } else if ((globalWallCursorX%2)==0) {
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
          if (globalCursorOn) {
            if (globalCursorY < (globalPuzzleH-1)) {
              globalCursorY++;
              if (shifting) {
                addMove(globalCursorY,globalCursorX,curShiftNumber);
              }
            }
          // we can only move the wall cursor down if we're already on a vert wall
          // or corner
          } else if ((globalWallCursorX%2)==0) {
            if (globalWallCursorY<=(2*globalPuzzleH)) {
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
          if (globalCursorOn) {
            if (globalCursorX) {
              globalCursorX--;
              if (shifting) {
                addMove(globalCursorY,globalCursorX,curShiftNumber);
              }
            }
          // we can only move the wall cursor left if we're already on a horz wall
          // or corner
          } else if ((globalWallCursorY%2)==0) {
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
          if (globalCursorOn) {
            if (globalCursorX < (globalPuzzleW-1)) {
              globalCursorX++;
              if (shifting) {
                addMove(globalCursorY,globalCursorX,curShiftNumber);
              }
            }
          // we can only move the wall cursor right if we're already on a horz wall
          // or corner
          } else if ((globalWallCursorY%2)==0) {
            if (globalWallCursorX<=(2*globalPuzzleW)) {
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
          if (globalWallCursorOn) {
            if ((globalWallStates[globalWallCursorY][globalWallCursorX] & constWallUserEdge)==0) {
              addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
            } else {
              addMove(globalWallCursorY,globalWallCursorX,constMoveEraseWall);
            }
          }
          break;
        case KEY_BS:
          if (globalCursorOn) {
            addMove(globalCursorY,globalCursorX,constMoveEraseCell);
          } else {
            addMove(globalWallCursorY,globalWallCursorX,constMoveEraseWall);
          }
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
  let wxh = size.split("x");
  let numParams = puzzleSplit[1];
  let hexParams = puzzleSplit[2];
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
  puzzleBoardStates =     initYXFromValue(0);
  globalInitWallStates  = initWallStates(constWallLight);
  globalWallStates =      initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  globalBoardTextColors = initYXFromValue(stdFontColor); // all text is black
  globalLineColors =      initYXFromValue("black"); // default line is black
  globalCircleColors =    initYXFromValue("black");
  globalTextBold =        initYXFromValue(false);

  // bold the cells with fixed digits
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (globalBoardValues[y][x] != "") {
        globalTextBold[y][x]    = true;
      }
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

  if (!dragging) {
    curClickType = clickType(evnt);
    curClickIsWall = isEdge;
    if ((globalBoardValues[yCell][xCell] == "") || isEdge || (curClickType != CLICK_LEFT)) {
      curClickNumber = constMoveEraseCell;
    } else {
      curClickNumber = globalBoardValues[yCell][xCell];;
    }
  }

  // ignoring middle click
  if (curClickType == CLICK_MIDDLE) {
    return;
  }
  // dragging wall, but no move yet
  if (dragging && curClickIsWall && (yEdge == globalWallCursorY) && (xEdge == globalWallCursorX)) {
    return;
  }
  // dragging wall, but currently fell off wall
  if (dragging && curClickIsWall && !isEdge) {
    return;
  }
  // dragging cell, but no move yet 
  if (dragging && !curClickIsWall && (yCell == globalCursorY) && (xCell == globalCursorX)) {
    return;
  }
  // dragging cell, but on a wall or corner
  if (dragging && !curClickIsWall && (isEdge || isCorner)) {
    return;
  }
  
  if (isEdge || isCorner) {
    globalWallCursorY = yEdge;
    globalWallCursorX = xEdge;
    globalWallCursorOn = true;
    globalCursorOn = false;
  } else {
    globalCursorY = yCell;
    globalCursorX = xCell;
    globalWallCursorOn = false;
    globalCursorOn = true;
  }

  // left click on edge toggles the edge
  if (!dragging && isEdge && (curClickType==CLICK_LEFT)) {
    addMove(yEdge,xEdge,constMoveToggleWall);
  // right drag or non-drag on edge clears the edge
  } else if (isEdge && curClickIsWall && (curClickType==CLICK_RIGHT)) {
    addMove(yEdge,xEdge,constMoveEraseWall);
  // left drag on edge adds an edge
  } else if (dragging && isEdge && curClickIsWall && (curClickType==CLICK_LEFT)) {
    addMove(yEdge,xEdge,constMoveAddWall);
  // right drag on non-edge clears the cells
  } else if (dragging && !isEdge && !curClickIsWall && (curClickType==CLICK_RIGHT)) {
    addMove(yCell,xCell,constMoveEraseCell);
  // left drag propagates the current number
  } else if (dragging && !isEdge && !curClickIsWall && (curClickType==CLICK_LEFT)) {
    addMove(yCell,xCell,curClickNumber);
  }
  updateBoardStatus();
  drawBoard();
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) rooms with a digit that are larger than digit value
  //  2) rooms with a digit and no room to grow that are smaller than digit value
  errorCount = 0;

  // also count how many numbers haven't been completed yet
  incompleteCount = 0;

  // start by reseting all cell colors to "standard",
  // and all wall borders should remove the SolveEdge
  // before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalBoardColors[y][x] = emptyCellColor;
      globalBoardTextColors[y][x] = stdFontColor;
    }
  }
  for (let y=0;y<globalPuzzleH*2+1;y++) {
    for (let x=0;x<globalPuzzleW*2+1;x++) {
      globalWallStates[y][x] &= ~constWallSolveEdge;
    }
  }

  // if in assist mode 1 or higher, color the cells by
  // the number
  if (assistState >= 1) {
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if (globalBoardValues[y][x]) {
          globalBoardColors[y][x] = numberColor[globalBoardValues[y][x]];
        }
      }
    }
  }

  // now go through all of the cells with digits. get their room
  // of like-numbered neighboring cells. If it is larger than
  // that number it is an error. if it is smaller and there
  // is no more room to grow, it is in error. else if they
  // are unequal it is still in progress.
  let allDigitCells = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let cellValue = globalBoardValues[y][x];
      // look for a numerical value
      if (cellValue != "") {
        // skip if already in the allDigitCell list, since it is covered already
        if (allDigitCells.indexOf(y+","+x) == -1) {
          let roomArray, hasGrowth;
          [roomArray,hasGrowth] = findDigitRoom(globalBoardValues,y,x,cellValue);
          if (roomArray.length > cellValue) {
            errorCount++;
            // if in assist state 2 mark with error font
            if (assistState == 2) {
              for (let cell of roomArray) {
                let yx = cell.split(",");
                globalBoardTextColors[yx[0]][yx[1]] = errorFontColor;
              }
            }
          } else if ((roomArray.length < cellValue) && !hasGrowth) {
            errorCount++;
            // if in assist state 2 mark with error font
            if (assistState == 2) {
              for (let cell of roomArray) {
                let yx = cell.split(",");
                globalBoardTextColors[yx[0]][yx[1]] = errorFontColor;
              }
            }
          } else if (roomArray.length != cellValue) {
            incompleteCount++;
          } else {
            // if in assist state >= 1, draw boundaries around completed rooms
            if (assistState >= 1) {
              for (let cell of roomArray) {
                let yx = cell.split(",");
                let iy = yx[0];
                let ix = yx[1];
                // check all 4 edges for membership in room array
                let yxn = (parseInt(iy)-1) + "," + (ix);
                let yxs = (parseInt(iy)+1) + "," + (ix);
                let yxw = (iy)   + "," + (parseInt(ix)-1);
                let yxe = (iy)   + "," + (parseInt(ix)+1);
                let yxnWall = (roomArray.indexOf(yxn) == -1);
                let yxsWall = (roomArray.indexOf(yxs) == -1);
                let yxwWall = (roomArray.indexOf(yxw) == -1);
                let yxeWall = (roomArray.indexOf(yxe) == -1);
                if (yxnWall) { globalWallStates[2*iy  ][2*ix+1] |= constWallSolveEdge; }
                if (yxsWall) { globalWallStates[2*iy+2][2*ix+1] |= constWallSolveEdge; }
                if (yxwWall) { globalWallStates[2*iy+1][2*ix  ] |= constWallSolveEdge; }
                if (yxeWall) { globalWallStates[2*iy+1][2*ix+2] |= constWallSolveEdge; }
              }
            }
          }
        allDigitCells.push.apply(allDigitCells, roomArray);
        }
      }
    }
  }

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
    if (lastMove[0] <= constMoveEraseCell) {
      globalBoardValues[lastMove[1]][lastMove[2]] = lastMove[3];
    } else {
      globalWallStates[lastMove[1]][lastMove[2]] = lastMove[3];
    }
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
    // start by reseting all non-number cells to indeterminate
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if (globalBoardValues[y][x] == "") {
          puzzleBoardStates[y][x] = STATE_INDET;
        }
      }
    }
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      let dsteps = dmoves[step];
      for (let i=0;i<dsteps.length;i++) {
        let steps = dsteps[i].split("");
        let s0 = (steps[0] == 'W') ? STATE_WHITE : STATE_BLACK;
        addMove(s0,steps[1],steps[2]);
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}
