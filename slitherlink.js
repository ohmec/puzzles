const emptyCellColor   = "white";         // not-filled
const stdFontColor     = "black";
const errorFontColor   = "red";
const correctFontColor = "#20c020";
const grayFillColor    = "#e0e0e0";
const correctFillColor = "#e0ffe0";
const errorFillColor   = "#ffe0e0";
const correctWallColor = "#20ff20";
const errorWallColor   = "#ff2020";

const constMoveNone =       0;
const constMoveEraseWall =  1;
const constMoveAddWall =    2;
const constMoveXWall =      3;
const constMoveShadeCell =  4;
const constMoveClearCell =  5;

let clicking = false;
let dragging = false;
let shifting = false;
let ctrling = false;
let errorCount = 0;
let incompleteCount = 0;
let incompleteLoop = true;
let assistState = 0;
let curClickType = CLICK_UNKNOWN;
let curClickEdge = false;
let curShiftMove = constMoveNone;

// which keys are handled
let handledKeys =
  [ KEY_BS, KEY_CR, KEY_SP, KEY_X, KEY_0, KEY_1, ALT_0, ALT_1,
    KEY_ESC, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = false;
  globalWallCursorOn = false;
  globalBorderMargin = 8;

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
      curShiftMove = puzzleBoardStates[globalCursorY][globalCursorX] ?
        constMoveShadeCell : constMoveClearCell;
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
    drawBoard(false,true);
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
    } else if (incompleteLoop) {
      etext = "the loop is not complete";
    } else {
      etext = "the puzzle is complete!!";
    }
  } else {
    if (errorCount || incompleteCount) {
      etext = "there are " + errorCount + " errors and " +
                        incompleteCount + " incomplete numbers";
    } else if (incompleteLoop) {
      etext = "the loop is not complete";
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
  // ignore a wall move if on a corner (not edge)
  if ((moveType <= constMoveXWall) && ((y%2) == (x%2))) {
    return;
  }
  // only add to history if it actually changes the value
  switch (moveType) {
    case constMoveEraseWall:
      if ((globalWallStates[y][x] & (constWallUserEdge | constWallX)) != 0) {
        addHistory(moveType,y,x,globalWallStates[y][x]);
        globalWallStates[y][x] &= ~constWallUserEdge;
        globalWallStates[y][x] &= ~constWallX;
      }
      break;
    case constMoveAddWall:
      if ((globalWallStates[y][x] & (constWallUserEdge | constWallX)) != constWallUserEdge) {
        addHistory(moveType,y,x,globalWallStates[y][x]);
        globalWallStates[y][x] |= constWallUserEdge;
        globalWallStates[y][x] &= ~constWallX;
      }
      break;
    case constMoveXWall:
      if ((globalWallStates[y][x] & (constWallUserEdge | constWallX)) != constWallX) {
        addHistory(moveType,y,x,globalWallStates[y][x]);
        globalWallStates[y][x] &= ~constWallUserEdge;
        globalWallStates[y][x] |= constWallX;
      }
      break;
    case constMoveShadeCell:
      if (!puzzleBoardStates[y][x]) {
        addHistory(moveType,y,x,puzzleBoardStates[y][x]);
        puzzleBoardStates[y][x] = true;
      }
      break;
    case constMoveClearCell:
      if (puzzleBoardStates[y][x]) {
        addHistory(moveType,y,x,puzzleBoardStates[y][x]);
        puzzleBoardStates[y][x] = false;
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
      console.log(globalBoardValues);
      console.log(globalWallStates);
      console.log(moveHistory);
    // none of these keys make any sense unless on a wall or in a cell
    } else if (globalWallCursorOn || globalCursorOn) {
      switch (keynum) {
        case KEY_UP:
          // we can only move the wall cursor up if we're already on a vert wall
          // or corner
          if (globalWallCursorOn && ((globalWallCursorX%2)==0) && globalWallCursorY) {
            globalWallCursorY--;
            if (shifting && ((globalWallCursorX%2) || (globalWallCursorY%2))) {
              addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
            }
            // if shifting on a corner move up two (to the next corner), else one
            if (shifting && (globalWallCursorY%2)) {
              globalWallCursorY--;
            }
          } else if (globalCursorOn && globalCursorY) {
            globalCursorY--;
            if (shifting) {
              addMove(globalCursorY,globalCursorX,curShiftMove);
            }
          }
          break;
        case KEY_DOWN:
          // we can only move the wall cursor down if we're already on a vert wall
          // or corner
          if (globalWallCursorOn && ((globalWallCursorX%2)==0) && (globalWallCursorY<=(2*globalPuzzleH))) {
            globalWallCursorY++;
            if (shifting && ((globalWallCursorX%2) || (globalWallCursorY%2))) {
              addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
            }
            // if shifting on a corner move down two (to the next corner), else one
            if (shifting && (globalWallCursorY%2)) {
              globalWallCursorY++;
            }
          } else if (globalCursorOn && (globalCursorY<globalPuzzleH)) {
            globalCursorY++;
            if (shifting) {
              addMove(globalCursorY,globalCursorX,curShiftMove);
            }
          }
          break;
        case KEY_LEFT:
          // we can only move the wall cursor left if we're already on a horz wall
          // or corner
          if (globalWallCursorOn && ((globalWallCursorY%2)==0) && globalWallCursorX) {
            globalWallCursorX--;
            if (shifting && ((globalWallCursorX%2) || (globalWallCursorY%2))) {
              addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
            }
            // if shifting on a corner move left two (to the next corner), else one
            if (shifting && (globalWallCursorX%2)) {
              globalWallCursorX--;
            }
          } else if (globalCursorOn && (globalCursorX>0)) {
            globalCursorX--;
            if (shifting) {
              addMove(globalCursorY,globalCursorX,curShiftMove);
            }
          }
          break;
        case KEY_RIGHT:
          // we can only move the wall cursor right if we're already on a horz wall
          // or corner
          if (globalWallCursorOn && ((globalWallCursorY%2)==0) && (globalWallCursorX<=(2*globalPuzzleW))) {
            globalWallCursorX++;
            if (shifting && ((globalWallCursorX%2) || (globalWallCursorY%2))) {
              addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
            }
            // if shifting on a corner move right two (to the next corner), else one
            if (shifting && (globalWallCursorX%2)) {
              globalWallCursorX++;
            }
          } else if (globalCursorOn && (globalCursorX<globalPuzzleW)) {
            globalCursorX++;
            if (shifting) {
              addMove(globalCursorY,globalCursorX,curShiftMove);
            }
          }
          break;
        // if on wall, toggle wall value
        case KEY_SP:
          if (globalWallCursorOn) {
            if (globalWallStates[globalWallCursorY][globalWallCursorX] & constWallX) {
              addMove(globalWallCursorY,globalWallCursorX,constMoveEraseWall);
            } else if (wallHasUserEdge(globalWallCursorY,globalWallCursorX)) {
              addMove(globalWallCursorY,globalWallCursorX,constMoveXWall);
            } else {
              addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
            }
          } else if (globalCursorOn) {
            if (puzzleBoardStates[y][x]) {
              addMove(globalCursorY,globalCursorX,constMoveClearCell);
            } else {
              addMove(globalCursorY,globalCursorX,constMoveShadeCell);
            }
          }
          break;
        // if on wall, clear wall, else clear cell
        case KEY_0:
        case ALT_0:
        case KEY_BS:
          if (globalWallCursorOn) {
            addMove(globalWallCursorY,globalWallCursorX,constMoveEraseWall);
          } else {
            addMove(globalCursorY,globalCursorX,constMoveClearCell);
          }
          break;
        // if on wall, set wall, else shade cell
        case KEY_1:
        case ALT_1:
          if (globalWallCursorOn) {
            addMove(globalWallCursorY,globalWallCursorX,constMoveAddWall);
          } else {
            addMove(globalCursorY,globalCursorX,constMoveShadeCell);
          }
          break;
        // if on wall, set wall to X
        case KEY_X:
          if (globalWallCursorOn) {
            addMove(globalWallCursorY,globalWallCursorX,constMoveXWall);
          }
      }
    }
    updateBoardStatus();
    drawBoard(false,true);
  }
}

function initStructures(puzzle) {
  $("#canvasDiv").css("border-color", "black");
  moveHistory = new Array();
  // get the size and the digits out of the puzzle entry
  let puzzleSplit = puzzle.split(":");
  let size = puzzleSplit[0];
  let numParams = puzzleSplit[1];
  let rwallParams = puzzleSplit[2];
  let cwallParams = puzzleSplit[3];

  basicInitStructures(size,emptyCellColor,constWallNone,constWallNone,stdFontColor);

  // used to keep track of user graying of cells
  puzzleBoardStates = initYXFromValue(false);
  globalBoardValues = initBoardValuesFromParams(numParams);
  globalTextBold =    initYXFromValue(false);
  if (puzzleSplit.length > 2) { // solution
    globalWallStates = initWallStatesFromHexes(rwallParams, cwallParams, constWallUserEdge, constWallNone, false);
  }

  updateBoardStatus();
  drawBoard(false,true);
}

function removeDot(strval) {
  return strval.replace(/\./gi, "");
}

function handleClick(evnt) {
  $("#userPuzzleField").blur();
  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  // set click type
  if (!dragging) {
    curClickType = clickType(evnt);
    curClickEdge = (isEdge | isCorner);
  }

  // dragging clicks only work on same type
  if (dragging && curClickEdge && !isEdge) {
    return;
  }
  if (dragging && !curClickEdge && (isEdge || isCorner)) {
    return;
  }
  // dragging wall, but no move yet
  if (dragging && curClickEdge && (yEdge == globalWallCursorY) && (xEdge == globalWallCursorX)) {
    return;
  }
  // dragging cell, but no move yet
  if (dragging && !curClickEdge && (yCell == globalCursorY) && (xCell == globalCursorX)) {
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
    globalCursorOn = true;
    globalWallCursorOn = false;
  }

  // left click or drag on edge sets the edge
  if (isEdge && (curClickType==CLICK_LEFT)) {
    addMove(yEdge,xEdge,constMoveAddWall);
  // right click or drag on edge clears the edge
  } else if (isEdge && (curClickType==CLICK_RIGHT)) {
    addMove(yEdge,xEdge,constMoveEraseWall);
  // middle drag or click on edge sets to X
  } else if (isEdge && (curClickType==CLICK_MIDDLE)) {
    addMove(yEdge,xEdge,constMoveXWall);
  } else if (!isEdge && !isCorner) {
    // left-click on cell shades color
    if (curClickType==CLICK_LEFT) {
      addMove(yCell,xCell,constMoveShadeCell);
    } else if (curClickType==CLICK_RIGHT) {
      addMove(yCell,xCell,constMoveClearCell);
    }
  }
  updateBoardStatus();
  drawBoard(false,true);
}

// look for errors
function updateBoardStatus() {
  // error checks
  //  1) nodes with more than 2 segments coming out
  //  2) digits with more than n segments around them
  errorCount = 0;

  // also count how many numbers haven't been completed yet
  incompleteCount = 0;
  // and finally set this to true if there is more than one
  // line path
  incompleteLoop = false;

  // start by reseting all cell colors to the "standard",
  // for their state (gray for 'true' and white for 'false')
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalBoardColors[y][x] = puzzleBoardStates[y][x] ? grayFillColor : emptyCellColor;
      globalBoardTextColors[y][x] = stdFontColor;
    }
  }
  // and all wall colors to default
  for (let y=0;y<=globalPuzzleH*2;y++) {
    for (let x=0;x<=globalPuzzleW*2;x++) {
      globalWallColors[y][x] = constLineColor;
    }
  }

  // now go through each node and look for more than two
  // segments coming out. color them red if in assistState>=2
  for (let y=0;y<=globalPuzzleH*2;y+=2) {
    for (let x=0;x<=globalPuzzleW*2;x+=2) {
      let ntrue = (y!=0) &&               wallHasUserEdge(y-1,x);
      let strue = (y!=globalPuzzleH*2) && wallHasUserEdge(y+1,x);
      let wtrue = (x!=0) &&               wallHasUserEdge(y,x-1);
      let etrue = (x!=globalPuzzleW*2) && wallHasUserEdge(y,x+1);
      let segcount = 0;
      if (ntrue) segcount++;
      if (strue) segcount++;
      if (wtrue) segcount++;
      if (etrue) segcount++;
      if (segcount > 2) {
        errorCount++;
        if (assistState == 2) {
          if (ntrue) globalWallColors[y-1][x] = errorWallColor;
          if (strue) globalWallColors[y+1][x] = errorWallColor;
          if (wtrue) globalWallColors[y][x-1] = errorWallColor;
          if (etrue) globalWallColors[y][x+1] = errorWallColor;
        }
      }
    }
  }

  // now go through each of the digits, and check how many borders are set
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (globalBoardValues[y][x] || (globalBoardValues[y][x]=="0")) {
        let ntrue = wallHasUserEdge(2*y  ,2*x+1);
        let strue = wallHasUserEdge(2*y+2,2*x+1);
        let wtrue = wallHasUserEdge(2*y+1,2*x  );
        let etrue = wallHasUserEdge(2*y+1,2*x+2);
        let segcount = 0;
        if (ntrue) segcount++;
        if (strue) segcount++;
        if (wtrue) segcount++;
        if (etrue) segcount++;
        if (segcount > parseInt(globalBoardValues[y][x])) {
          errorCount++;
          if (assistState==2) {
            globalBoardTextColors[y][x] = errorFontColor;
          }
        } else if (segcount < parseInt(globalBoardValues[y][x])) {
          incompleteCount++;
        } else if (assistState==2) {
          globalBoardTextColors[y][x] = correctFontColor;
        }
      }
    }
  }

  // now let's see if we have a complete loop. In addition, we might have more than
  // one. The test is: if more than one loop: error. If one loop plus other non-loop
  // walls: error. If no loops: incomplete.
  // in addition, in assistState >= 2 if one loop and no other non-loop segments,
  // then paint green. if more than one loop, paint red.
  let hasLoop = false;
  let allSegments = new Array();
  let allCovered = new Array();
  let allLoops = new Array();
  for (let y=0;y<=globalPuzzleH*2;y+=2) {
    for (let x=0;x<=globalPuzzleW*2;x+=2) {
      if (allCovered.indexOf(y+","+x) == -1) {
        let vertices, isLoop;
        [vertices, isLoop] = travelWallLoop(y,x);
        if (isLoop) hasLoop = true;
        if (vertices.length > 1) {
          allSegments.push(vertices);
          allCovered.push.apply(allCovered,vertices);
          allLoops.push(isLoop);
        }
      }
    }
  }
  if (hasLoop && allSegments.length > 1) {
    errorCount++;
    // color any false loop red
    if (assistState==2) {
      // the easiest algorithm for this is to keep track left-to-right how many
      // walls have been seen. if odd, then we're inside a wall, color green.
      // we have to take one loop at a time and ignore other segments
      for (let i=0;i<allLoops.length;i++) {
        if (allLoops[i]) {  // this one is a loop
          let loopVertices = allSegments[i];
          for (let y=0;y<globalPuzzleH;y++) {
            let inside = false;
            for (let x=0;x<globalPuzzleW;x++) {
              let nvertIndex = loopVertices.indexOf((y*2  )+","+(x*2));
              let svertIndex = loopVertices.indexOf((y*2+2)+","+(x*2));
              // the north and south vertices not only need to be
              // in the list, but need to be next to each other in
              // order to be considered a wall
              if ((nvertIndex != -1) &&
                  (svertIndex != -1) &&
                  (((nvertIndex - svertIndex) == 1) ||
                   ((svertIndex - nvertIndex) == 1) ||
                   ((nvertIndex==0) && (svertIndex==(loopVertices.length-2))) ||
                   ((svertIndex==0) && (nvertIndex==(loopVertices.length-2))))) {
                inside = !inside;
              }
              if (inside) {
                globalBoardColors[y][x] = errorFillColor;
              }
            }
          }
        }
      }
    }
  // color the correct loop green
  } else if (hasLoop && allSegments.length==1 && (assistState==2) && !errorCount && !incompleteCount) {
    // the easiest algorithm for this is to keep track left-to-right how many
    // walls have been seen. if odd, then we're inside a wall, color green
    for (let y=0;y<globalPuzzleH;y++) {
      let inside = false;
      for (let x=0;x<globalPuzzleW;x++) {
        if (wallHasUserEdge(y*2+1,x*2)) {
          inside = !inside;
        }
        if (inside) {
          globalBoardColors[y][x] = correctFillColor;
        }
      }
    }
  } else if (!hasLoop) {
    incompleteLoop = true;
  }

  updateDynTextFields();
  if ((errorCount == 0) && (incompleteCount == 0) && !incompleteLoop) {
    canvasSuccess();
  } else {
    canvasIncomplete();
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    if (lastMove[0] <= constMoveXWall) {
      globalWallStates[lastMove[1]][lastMove[2]] = lastMove[3];
    } else {
      puzzleBoardStates[lastMove[1]][lastMove[2]] = lastMove[3];
    }
    updateBoardStatus();
    drawBoard(false,true);
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
    // start by reseting all walls to empty, and all colors to empty
    for (let y=0;y<=globalPuzzleH*2;y++) {
      for (let x=0;x<=globalPuzzleW*2;x++) {
        globalWallStates[y][x] &= ~constWallUserEdge;
        globalWallStates[y][x] &= ~constWallX;
      }
    }
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        globalBoardColors[y][x] = emptyCellColor;
      }
    }
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      for (let dsteps of dmoves[step]) {
        let steps = dsteps.split("");
        switch (steps[0]) {
          case '1': addMove(  parseInt(steps[1],36),    parseInt(steps[2],36),  constMoveShadeCell); break;
          // walls
          case 'N': addMove(2*parseInt(steps[1],36),  2*parseInt(steps[2],36)+1,constMoveAddWall); break;
          case 'S': addMove(2*parseInt(steps[1],36)+2,2*parseInt(steps[2],36)+1,constMoveAddWall); break;
          case 'E': addMove(2*parseInt(steps[1],36)+1,2*parseInt(steps[2],36)+2,constMoveAddWall); break;
          case 'W': addMove(2*parseInt(steps[1],36)+1,2*parseInt(steps[2],36),  constMoveAddWall); break;
          // Xs
          case 'n': addMove(2*parseInt(steps[1],36),  2*parseInt(steps[2],36)+1,constMoveXWall); break;
          case 's': addMove(2*parseInt(steps[1],36)+2,2*parseInt(steps[2],36)+1,constMoveXWall); break;
          case 'e': addMove(2*parseInt(steps[1],36)+1,2*parseInt(steps[2],36)+2,constMoveXWall); break;
          case 'w': addMove(2*parseInt(steps[1],36)+1,2*parseInt(steps[2],36),  constMoveXWall); break;
        }
      }
    }
    updateBoardStatus();
    drawBoard(false,true);
  }
}
