const emptyCellColor = "white";       // not-filled
const errorCircleColor = "red";
const correctCircleColor = "green";
const stdFontColor = "black";

let clicking = false;
let dragging = false;
let shifting = false;
let errorCount = 0;
let incompleteCircles = 0;
let incompleteLoop = true;
let assistState = 0;
let curClickType = CLICK_UNKNOWN;

// which keys are handled
let handledKeys =
  [ KEY_BS, KEY_CR, KEY_ESC, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN,
    KEY_DASH, KEY_VERT, KEY_L, KEY_I, KEY_J, KEY_7, KEY_F ];

let initPuzzle, puzzle, moveHistory, demoStepNum;

function puzzleInit() {
  globalCursorOn = true;

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
    if (errorCount && incompleteCircles) {
      etext = "there are errors and incomplete circles";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteCircles) {
      etext = "there are incomplete circles";
    } else if (incompleteLoop) {
      etext = "the loop isn't complete yet";
    } else {
      etext = "the puzzle is solved!";
    }
  } else {
    if (errorCount || incompleteCircles) {
      etext = "there are " + errorCount  + " errors and " +
                      incompleteCircles  + " incomplete circles";
    } else if (incompleteLoop) {
      etext = "the loop isn't complete yet";
    } else {
      etext = "the puzzle is solved!";
    }
  }
  updateDynamicHtmlEntries(etext,assistState);
}

function addHistory(y,x,prevvalue) {
  moveHistory.push([y,x,prevvalue]);
}

function contains(state,list) {
  let hit = false;
  for (let lmem of list) {
    if (state==lmem) {
      hit = true;
    }
  }
  return hit;
}

function addMove(moveType,y,x,noHistory=false) {
  //  make sure path changes are legal
  if (((y==0)                 && ((moveType & PATH_N) == PATH_N)) ||
      ((y==(globalPuzzleH-1)) && ((moveType & PATH_S) == PATH_S)) ||
      ((x==0)                 && ((moveType & PATH_W) == PATH_W)) ||
      ((x==(globalPuzzleW-1)) && ((moveType & PATH_E) == PATH_E))) {
    return; // illegal east moves
  }

  if (!noHistory) {
    addHistory(y,x,globalLineStates[y][x]);
  }
  if (moveType==PATH_N || moveType==PATH_E || moveType==PATH_W || moveType==PATH_S) {
    // for "dragging/shifting" adds, we might need to pre-clear the existing
    // paths on both sides of the move if they are conflicting
    if ((moveType==PATH_N && contains(globalLineStates[y][x],[PATH_SW,PATH_SE,PATH_WE])) ||
        (moveType==PATH_S && contains(globalLineStates[y][x],[PATH_NW,PATH_NE,PATH_WE])) ||
        (moveType==PATH_W && contains(globalLineStates[y][x],[PATH_SE,PATH_NE,PATH_NS])) ||
        (moveType==PATH_E && contains(globalLineStates[y][x],[PATH_SW,PATH_NW,PATH_NS]))) {
      preClearPathNeighbors(y,x,globalLineStates[y][x]);
    }

    // and the following need clearing for the precursor cell
    if (       moveType==PATH_N && contains(globalLineStates[y-1][x],[PATH_NW,PATH_NE,PATH_WE])) {
      preClearPathNeighbors(y-1,x,globalLineStates[y-1][x]);
    } else if (moveType==PATH_S && contains(globalLineStates[y+1][x],[PATH_SW,PATH_SE,PATH_WE])) {
      preClearPathNeighbors(y+1,x,globalLineStates[y+1][x]);
    } else if (moveType==PATH_W && contains(globalLineStates[y][x-1],[PATH_SW,PATH_NW,PATH_NS])) {
      preClearPathNeighbors(y,x-1,globalLineStates[y][x-1]);
    } else if (moveType==PATH_E && contains(globalLineStates[y][x+1],[PATH_SE,PATH_NE,PATH_NS])) {
      preClearPathNeighbors(y,x+1,globalLineStates[y][x+1]);
    }
  } else {
    // for the others, we always need to clear any existing state ("unmerge")
    // and its neighboring effects
    preClearPathNeighbors(y,x,globalLineStates[y][x]);
  }

  // now merge in the new half-segments in the neighbors
  switch (moveType) {
    case PATH_CLEAR:
      globalLineStates[y][x] = PATH_NONE;
      break;
    case PATH_N:
      globalLineStates[y  ][x] = mergePathLines(globalLineStates[y  ][x],PATH_N);
      globalLineStates[y-1][x] = mergePathLines(globalLineStates[y-1][x],PATH_S);
      break
    case PATH_S:
      globalLineStates[y  ][x] = mergePathLines(globalLineStates[y  ][x],PATH_S);
      globalLineStates[y+1][x] = mergePathLines(globalLineStates[y+1][x],PATH_N);
      break
    case PATH_W:
      globalLineStates[y][x  ] = mergePathLines(globalLineStates[y][x  ],PATH_W);
      globalLineStates[y][x-1] = mergePathLines(globalLineStates[y][x-1],PATH_E);
      break
    case PATH_E:
      globalLineStates[y][x  ] = mergePathLines(globalLineStates[y][x  ],PATH_E);
      globalLineStates[y][x+1] = mergePathLines(globalLineStates[y][x+1],PATH_W);
      break
    case PATH_WE:
      globalLineStates[y][x] = PATH_WE;
      globalLineStates[y][x-1] = mergePathLines(globalLineStates[y][x-1],PATH_E);
      globalLineStates[y][x+1] = mergePathLines(globalLineStates[y][x+1],PATH_W);
      break;
    case PATH_NS:
      globalLineStates[y][x] = PATH_NS;
      globalLineStates[y-1][x] = mergePathLines(globalLineStates[y-1][x],PATH_S);
      globalLineStates[y+1][x] = mergePathLines(globalLineStates[y+1][x],PATH_N);
      break;
    case PATH_NE:
      globalLineStates[y][x] = PATH_NE;
      globalLineStates[y-1][x] = mergePathLines(globalLineStates[y-1][x],PATH_S);
      globalLineStates[y][x+1] = mergePathLines(globalLineStates[y][x+1],PATH_W);
      break;
    case PATH_SE:
      globalLineStates[y][x] = PATH_SE;
      globalLineStates[y+1][x] = mergePathLines(globalLineStates[y+1][x],PATH_N);
      globalLineStates[y][x+1] = mergePathLines(globalLineStates[y][x+1],PATH_W);
      break;
    case PATH_SW:
      globalLineStates[y][x] = PATH_SW;
      globalLineStates[y+1][x] = mergePathLines(globalLineStates[y+1][x],PATH_N);
      globalLineStates[y][x-1] = mergePathLines(globalLineStates[y][x-1],PATH_E);
      break;
    case PATH_NW:
      globalLineStates[y][x] = PATH_NW;
      globalLineStates[y-1][x] = mergePathLines(globalLineStates[y-1][x],PATH_S);
      globalLineStates[y][x-1] = mergePathLines(globalLineStates[y][x-1],PATH_E);
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
      case KEY_ESC:
        console.log(globalBoardValues);
        console.log(globalLineStates);
        console.log(globalWallStates);
        break;
      case KEY_UP:
        if (globalCursorY) {
          globalCursorY--;
          if (shifting) {
            addMove(PATH_S,globalCursorY,globalCursorX);
          }
        }
        break;
      case KEY_DOWN:
        if (globalCursorY < (globalPuzzleH-1)) {
          globalCursorY++;
          if (shifting) {
            addMove(PATH_N,globalCursorY,globalCursorX);
          }
        }
        break;
      case KEY_LEFT:
        if (globalCursorX) {
          globalCursorX--;
          if (shifting) {
            addMove(PATH_E,globalCursorY,globalCursorX);
          }
        }
        break;
      case KEY_RIGHT:
        if (globalCursorX < (globalPuzzleW-1)) {
          globalCursorX++;
          if (shifting) {
            addMove(PATH_W,globalCursorY,globalCursorX);
          }
        }
        break;
      case KEY_BS:  // clear any line status
        addMove(PATH_CLEAR,globalCursorY,globalCursorX);
        break;
      case KEY_DASH:
        addMove(PATH_WE,globalCursorY,globalCursorX);
        break;
      case KEY_VERT:
      case KEY_I:
        addMove(PATH_NS,globalCursorY,globalCursorX);
        break;
      case KEY_F:
        addMove(PATH_SE,globalCursorY,globalCursorX);
        break;
      case KEY_7:
        addMove(PATH_SW,globalCursorY,globalCursorX);
        break;
      case KEY_J:
        addMove(PATH_NW,globalCursorY,globalCursorX);
        break;
      case KEY_L:
        addMove(PATH_NE,globalCursorY,globalCursorX);
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
  let numParams = puzzleSplit[1];
  let pathParams = puzzleSplit[2];

  basicInitStructures(size,emptyCellColor,constWallDash,stdFontColor);
  globalLineStates = initLineValuesFromParams(pathParams);

  let numParamsExp = expandNumParams(numParams);
  if (numParamsExp.length != (globalPuzzleH*globalPuzzleW)) {
    throw "ERROR in puzzle descriptor nums, got length " + numParamsExp.length +
          " expected " + (globalPuzzleH*globalPuzzleW);
  }
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      switch (numParamsExp[y*globalPuzzleW+x]) {
        case '*': globalCircleStates[y][x] = CIRCLE_DOT; break;
        case 'V': globalWallStates[2*y+2][2*x+1] |= constWallDot; break;
        case '^': globalWallStates[2*y  ][2*x+1] |= constWallDot; break;
        case '<': globalWallStates[2*y+1][2*x  ] |= constWallDot; break;
        case '>': globalWallStates[2*y+1][2*x+2] |= constWallDot; break;
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
  if (!dragging) {
    curClickType = clickType(evnt);
  }
  $("#userPuzzleField").blur();
  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  // dragging, but no move yet
  if (dragging && ((yCell == globalCursorY) && (xCell == globalCursorX))) {
    return;
  }
  // skip dragging with anything but left click
  if (dragging && curClickType!=CLICK_LEFT) {
    return;
  }

  // if dragging, begin to make a path from previous cursor
  if (dragging) {
    if (yCell==(globalCursorY+1)) { // moving S
      addMove(PATH_N,yCell,xCell);
    }
    if (yCell==(globalCursorY-1)) { // moving N
      addMove(PATH_S,yCell,xCell);
    }
    if (xCell==(globalCursorX+1)) { // moving E
      addMove(PATH_W,yCell,xCell);
    }
    if (xCell==(globalCursorX-1)) { // moving W
      addMove(PATH_E,yCell,xCell);
    }
  }

  globalCursorY = yCell;
  globalCursorX = xCell;
  updateBoardStatus();
  drawBoard();
}

// look for errors
function updateBoardStatus() {
  let done;
  // accounting the errors:
  //  1) circles that have turns on both ends, but different lengths
  errorCount = 0;

  // also count how many circles haven't been completed yet,
  // and if there is a complete loop
  incompleteCircles = 0;
  incompleteLoop = true;

  // start by reseting all line and circle colors to "standard"
  // before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalLineColors[y][x] = "black";
      globalCircleColors[y][x] = "black";
    }
  }
  for (let y=0;y<=globalPuzzleH*2;y++) {
    for (let x=0;x<=globalPuzzleW*2;x++) {
      globalDotColors[y][x] = "black";
    }
  }

  // first check mid-cell circles
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let localError = false;
      let localComplete = false;

      if (globalCircleStates[y][x] == CIRCLE_DOT) {
        switch (globalLineStates[y][x]) {
          // errorneous
          case PATH_NW:
          case PATH_NE:
          case PATH_SW:
          case PATH_SE:
            localError = true;
            break;
          // check length on both ends, if not two turns, then just
          // set as incomplete
          case PATH_NS:
            let ncomplete = false;
            let nlength = 0;
            let ny = y-1;
            done = false;
            while(!done) {
              if (ny<0) {
                done = true;
              } else if (globalLineStates[ny][x]==PATH_NS) {
                ny--; nlength++;
              } else if (pathHasTurn(globalLineStates[ny][x])) {
                ncomplete = true; done = true;
              } else {
                done = true;
              }
            }
            let scomplete = false;
            let slength = 0;
            let sy = y+1;
            done = false;
            while(!done) {
              if (sy<0) {
                done = true;
              } else if (globalLineStates[sy][x]==PATH_NS) {
                sy++; slength++;
              } else if (pathHasTurn(globalLineStates[sy][x])) {
                scomplete = true; done = true;
              } else {
                done = true;
              }
            }
            if (!ncomplete || !scomplete) {
              localComplete = false;
            } else if (nlength == slength) {
              localComplete = true;
            } else {
              localError = true;
            }
            break;
          case PATH_WE:
            let wcomplete = false;
            let wlength = 0;
            let wx = x-1;
            done = false;
            while(!done) {
              if (wx<0) {
                done = true;
              } else if (globalLineStates[y][wx]==PATH_WE) {
                wx--; wlength++;
              } else if (pathHasTurn(globalLineStates[y][wx])) {
                wcomplete = true; done = true;
              } else {
                done = true;
              }
            }
            let ecomplete = false;
            let elength = 0;
            let ex = x+1;
            done = false;
            while(!done) {
              if (ex<0) {
                done = true;
              } else if (globalLineStates[y][ex]==PATH_WE) {
                ex++; elength++;
              } else if (pathHasTurn(globalLineStates[y][ex])) {
                ecomplete = true; done = true;
              } else {
                done = true;
              }
            }
            if (!wcomplete || !ecomplete) {
              localComplete = false;
            } else if (wlength == elength) {
              localComplete = true;
            } else {
              localError = true;
            }
            break;
          // rest incomplete
        }
      }
      if (localError) {
        errorCount++;
        if (assistState==2) {
          globalCircleColors[y][x] = errorCircleColor;
        }
      } else if (localComplete) {
        if (assistState==2) {
          globalCircleColors[y][x] = correctCircleColor;
        }
      } else if (globalCircleStates[y][x] != CIRCLE_NONE) {
        incompleteCircles++;
      }
    }
  }

  // now check mid-wall circles; just iterate through cells
  // and check S and E wall dots to avoid duplication
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let localError = false;
      let localComplete = false;
      // check a dot on the east wall
      if (globalWallStates[2*y+1][2*x+2] & constWallDot) {
        switch (globalLineStates[y][x]) {
          // erronous turns
          case PATH_NW:
          case PATH_SW:
            localError = true;
            break;
          // immediate turns, look for equivalent one on the other side
          case PATH_NE:
          case PATH_SE:
            if ((globalLineStates[y][x+1] & PATH_NW) == PATH_NW) {
              localComplete = true;
            } else if ((globalLineStates[y][x+1] & PATH_SW) == PATH_SW) {
              localComplete = true;
            } else if ((globalLineStates[y][x+1] & PATH_WE) == PATH_WE) {
              localError = true;
            }
            break;
          // check length on both ends, if not two turns, then just
          // set as incomplete
          case PATH_WE:
            if ((globalLineStates[y][x+1] & PATH_NW) == PATH_NW) {
              localError = true;
            } else if ((globalLineStates[y][x+1] & PATH_SW) == PATH_SW) {
              localError = true;
            } else if ((globalLineStates[y][x+1] & PATH_WE) == PATH_WE) {
              let wcomplete = false;
              let wlength = 0;
              let wx = x-1;
              done = false;
              while(!done) {
                if (wx<0) {
                  done = true;
                } else if (globalLineStates[y][wx]==PATH_WE) {
                  wx--; wlength++;
                } else if (pathHasTurn(globalLineStates[y][wx])) {
                  wcomplete = true; done = true;
                } else {
                  done = true;
                }
              }
              let ecomplete = false;
              let elength = 0;
              let ex = x+2;
              done = false;
              while(!done) {
                if (ex<0) {
                  done = true;
                } else if (globalLineStates[y][ex]==PATH_WE) {
                  ex++; elength++;
                } else if (pathHasTurn(globalLineStates[y][ex])) {
                  ecomplete = true; done = true;
                } else {
                  done = true;
                }
              }
              if (!wcomplete || !ecomplete) {
                localComplete = false;
              } else if (wlength == elength) {
                localComplete = true;
              } else {
                localError = true;
              }
            }
            break;
          // rest incomplete
        }
        if (localError) {
          errorCount++;
          if (assistState==2) {
            globalDotColors[2*y+1][2*x+2] = errorCircleColor;
          }
        } else if (localComplete) {
          if (assistState==2) {
            globalDotColors[2*y+1][2*x+2] = correctCircleColor;
          }
        } else {
          incompleteCircles++;
        }
      }
      // check south
      localError = false;
      localComplete = false;
      if (globalWallStates[2*y+2][2*x+1] & constWallDot) {
        switch (globalLineStates[y][x]) {
          // errorneous
          case PATH_NW:
          case PATH_NE:
            localError = true;
            break;
          // immediate turns, look for equivalent one on the other side
          case PATH_SW:
          case PATH_SE:
            if ((globalLineStates[y+1][x] & PATH_NW) == PATH_NW) {
              localComplete = true;
            } else if ((globalLineStates[y+1][x] & PATH_NE) == PATH_NE) {
              localComplete = true;
            } else if ((globalLineStates[y+1][x] & PATH_NS) == PATH_NS) {
              localError = true;
            }
            break;
          // check length on both ends, if not two turns, then just
          // set as incomplete
          case PATH_NS:
            if ((globalLineStates[y+1][x] & PATH_NW) == PATH_NW) {
              localError = true;
            } else if ((globalLineStates[y+1][x] & PATH_NE) == PATH_NE) {
              localError = true;
            } else if ((globalLineStates[y+1][x] & PATH_NS) == PATH_NS) {
              let ncomplete = false;
              let nlength = 0;
              let ny = y-1;
              done = false;
              while(!done) {
                if (ny<0) {
                  done = true;
                } else if (globalLineStates[ny][x]==PATH_NS) {
                  ny--; nlength++;
                } else if (pathHasTurn(globalLineStates[ny][x])) {
                  ncomplete = true; done = true;
                } else {
                  done = true;
                }
              }
              let scomplete = false;
              let slength = 0;
              let sy = y+2;
              done = false;
              while(!done) {
                if (sy<0) {
                  done = true;
                } else if (globalLineStates[sy][x]==PATH_NS) {
                  sy++; slength++;
                } else if (pathHasTurn(globalLineStates[sy][x])) {
                  scomplete = true; done = true;
                } else {
                  done = true;
                }
              }
              if (!ncomplete || !scomplete) {
                localComplete = false;
              } else if (nlength == slength) {
                localComplete = true;
              } else {
                localError = true;
              }
            }
            break;
          // rest incomplete
        }
        if (localError) {
          errorCount++;
          if (assistState==2) {
            globalDotColors[2*y+2][2*x+1] = errorCircleColor;
          }
        } else if (localComplete) {
          if (assistState==2) {
            globalDotColors[2*y+2][2*x+1] = correctCircleColor;
          }
        } else {
          incompleteCircles++;
        }
      }
    }
  }

  // check all of the path segments. find out how many are loops,
  // and how many are non-loops. if there is more than one loop, or if there
  // is one loop with other non-loops, that is an error. draw the loop in
  // red. ignore if there are no loops, they are accounted for in the incomplete
  // loop accounting. incompleteLoop is only false when there is one loop and
  // no partials

  let checkedLineCells = new Array();
  let loops = new Array();
  let nonloops = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ( globalLineStates[y][x] &&
          (checkedLineCells.indexOf(y+","+x)==-1)) {
        let lineCellArray, isLoop;
        [lineCellArray,isLoop] = travelLineLoop(globalLineStates,y,x);
        checkedLineCells.push.apply(checkedLineCells, lineCellArray);
        if (isLoop) {
          loops.push(lineCellArray);
        } else {
          nonloops.push(lineCellArray);
        }
      }
    }
  }

  if ((loops.length > 1) || (loops.length==1 && nonloops.length)) {
    errorCount += loops.length;
    if (assistState == 2) {
      for (let loop of loops) {
        for (let lmem of loop) {
          let y,x;
          [y,x] = lmem.split(",");
          globalLineColors[y][x] = "red";
        }
      }
    }
  }
  if ((loops.length==1) && (nonloops.length==0)) {
    incompleteLoop = false;
  }

  updateDynTextFields();
  if ((errorCount==0) && (incompleteCircles==0) && (incompleteLoop==false)) {
    $("#canvasDiv").css("border-color", constColorSuccess);
  } else {
    $("#canvasDiv").css("border-color", "black");
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    if (lastMove[2] == PATH_NONE) {
      addMove(PATH_CLEAR,lastMove[0],lastMove[1],true);
    } else {
      addMove(lastMove[2],lastMove[0],lastMove[1],true);
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
  let dtext  = (demoNum==1) ?  demoText[0] : (demoNum==2) ?  demoText[1] :  demoText[2];
  let dmoves = (demoNum==1) ? demoMoves[0] : (demoNum==2) ? demoMoves[1] : demoMoves[2];
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
        globalLineStates[y][x] = PATH_NONE;
      }
    }
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      for (let dsteps of dmoves[step]) {
        let steps = dsteps.split("");
        let s0 = convertPathCharToCode(steps[0]);
        addMove(s0,parseInt(steps[1]),parseInt(steps[2]));
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}
