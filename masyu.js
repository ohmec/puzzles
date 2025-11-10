const gameName = 'masyu';

let incompleteCircles = 0;
let incompleteLoop = true;
let curClickType = constClickUnknown;
let moveHistory;

// which keys are handled
let handledKeys = [ constKeyBackspace, constKeyCR, constKeyEsc,
  constKeyLeft, constKeyUp, constKeyRight, constKeyDown, constKeyDash,
  constKeyVert, constKeyL, constKeyI, constKeyJ, constKey7, constKeyF ];

function puzzleInit() {
  globalCursorOn = true;
  initElements();
  initRibbons(gameName);
  listenKeys(handledKeys,handleKey);
  listenClick(handleClick,initStructures,undoMove);

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
  if (playState.assistState == 0) {
    if (playState.errorCount && incompleteCircles) {
      etext = "there are errors and incomplete circles";
    } else if (playState.errorCount) {
      etext = "there are errors";
    } else if (incompleteCircles) {
      etext = "there are incomplete circles";
    } else if (incompleteLoop) {
      etext = "the loop isn't complete yet";
    } else {
      etext = "the puzzle is solved!";
    }
  } else {
    if (playState.errorCount || incompleteCircles) {
      etext = "there are " + playState.errorCount  + " errors and " +
                      incompleteCircles  + " incomplete circles";
    } else if (incompleteLoop) {
      etext = "the loop isn't complete yet";
    } else {
      etext = "the puzzle is solved!";
    }
  }
  updateDynamicHtmlEntries(etext,playState.assistState);
}

function addHistory(y,x,prevvalue) {
  moveHistory.push([y,x,prevvalue]);
}

function addMove(moveType,y,x,noHistory=false) {
  //  make sure path changes are legal
  if (((y==0)                 && ((moveType & constPathN) == constPathN)) ||
      ((y==(globalPuzzleH-1)) && ((moveType & constPathS) == constPathS)) ||
      ((x==0)                 && ((moveType & constPathW) == constPathW)) ||
      ((x==(globalPuzzleW-1)) && ((moveType & constPathE) == constPathE))) {
    return; // illegal east moves
  }

  if (!noHistory) {
    addHistory(y,x,globalLineStates[y][x]);
  }

  preclearLinePaths(moveType,y,x);
  mergeLinePaths(moveType,y,x);
}

function handleKey(keynum) {
  const focusedElement = document.activeElement;
  // look for CR within puzzle display field
  if ((keynum == constKeyCR) && focusedElement && focusedElement.id == "userPuzzle") {
    let pval = elemStruct.userPuzzle.value;
    if (pval.search(/:/) == -1) {
      if (pval < cannedPuzzles.length) {
        puzzleChoice = pval;
        initPuzzle = cannedPuzzles[pval];
        puzzle = removeDot(initPuzzle);
        updateHtmlDescr(initPuzzle);
        // check to see if this is a demo puzzle
        let search = demoPuzzles.find(element => element == pval);
        if (search !== undefined) {
          elemStruct.demotab.style.display = 'block';
          demoStepNum = 0;
          updateDemoRegion(pval);
        } else {
          elemStruct.demotab.style.display = 'none';
        }
      }
    } else {
      elemStruct.demotab.style.display = 'none';
      initPuzzle = pval;
      puzzle = removeDot(initPuzzle);
      updateHtmlDescr(initPuzzle);
    }
    initStructures(puzzle);
  // else look for keys not in puzzle display field
  } else if (focusedElement && focusedElement.id != "userPuzzle") {
    switch (keynum) {
      case constKeyEsc:
        console.log(globalBoardValues);
        console.log(globalLineStates);
        break;
      case constKeyUp:
        if (globalCursorY) {
          globalCursorY--;
          if (playState.shifting) {
            addMove(constPathS,globalCursorY,globalCursorX);
          }
        }
        break;
      case constKeyDown:
        if (globalCursorY < (globalPuzzleH-1)) {
          globalCursorY++;
          if (playState.shifting) {
            addMove(constPathN,globalCursorY,globalCursorX);
          }
        }
        break;
      case constKeyLeft:
        if (globalCursorX) {
          globalCursorX--;
          if (playState.shifting) {
            addMove(constPathE,globalCursorY,globalCursorX);
          }
        }
        break;
      case constKeyRight:
        if (globalCursorX < (globalPuzzleW-1)) {
          globalCursorX++;
          if (playState.shifting) {
            addMove(constPathW,globalCursorY,globalCursorX);
          }
        }
        break;
      // clear any line status
      case constKeyBackspace: addMove(constPathClear,globalCursorY,globalCursorX); break;
        // add a particular path segment
      case constKeyDash:      addMove(constPathWE,   globalCursorY,globalCursorX); break;
      case constKeyVert:
      case constKeyI:         addMove(constPathNS,   globalCursorY,globalCursorX); break;
      case constKeyF:         addMove(constPathSE,   globalCursorY,globalCursorX); break;
      case constKey7:         addMove(constPathSW,   globalCursorY,globalCursorX); break;
      case constKeyJ:         addMove(constPathNW,   globalCursorY,globalCursorX); break;
      case constKeyL:         addMove(constPathNE,   globalCursorY,globalCursorX); break;
      }
    updateBoardStatus();
    drawBoard();
  }
}

function initStructures(puzzle) {
  elemStruct.canvasDiv.style.borderColor = "black";
  moveHistory = new Array();
  // get the size and the digits out of the puzzle entry
  let puzzleSplit = puzzle.split(":");
  let size = puzzleSplit[0];
  let numParams = puzzleSplit[1];
  let pathParams = puzzleSplit[2];
  // reset to non-demo
  isDemo = false;

  basicInitStructures(size,emptyCellColor,constWallDash,constWallStandard,stdFontColor);
  globalLineStates = initLineValuesFromParams(pathParams);

  let numParamsExp = expandNumParams(numParams);
  if (numParamsExp.length != (globalPuzzleH*globalPuzzleW)) {
    throw "ERROR in puzzle descriptor nums, got length " + numParamsExp.length +
          " expected " + (globalPuzzleH*globalPuzzleW);
  }
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (numParamsExp[y*globalPuzzleW+x] != '-')  {
        globalCircleStates[y][x] = numParamsExp[y*globalPuzzleW+x];
      }
    }
  }

  updateBoardStatus();
  drawBoard();
}

function handleClick(evnt) {
  if (!playState.dragging) {
    curClickType = clickType(evnt);
  }

  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  // dragging, but no move yet
  if (playState.dragging && ((yCell == globalCursorY) && (xCell == globalCursorX))) {
    return;
  }
  // skip dragging with anything but left click
  if (playState.dragging && curClickType!=constClickLeft) {
    return;
  }

  // if dragging, begin to make a path from previous cursor
  if (playState.dragging) {
    if (yCell==(globalCursorY+1)) addMove(constPathN,yCell,xCell); // moving S
    if (yCell==(globalCursorY-1)) addMove(constPathS,yCell,xCell); // moving N
    if (xCell==(globalCursorX+1)) addMove(constPathW,yCell,xCell); // moving E
    if (xCell==(globalCursorX-1)) addMove(constPathE,yCell,xCell); // moving W
  }

  globalCursorY = yCell;
  globalCursorX = xCell;
  updateBoardStatus();
  drawBoard();
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) white circles that have a change of direction
  //  2) white circles that don't have a bend just next to them
  //  3) black circles that don't have a change of direction
  //  4) black circles that don't have a straight segment on both adjoining cells
  playState.errorCount = 0;

  // also count how many circles haven't been completed yet, how
  // many white cells don't have a path, and if there is a complete loop
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

  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let localError = false;
      let localComplete = false;

      // rule 1: check that white circles have a line straight
      // through, and that it turns in one direction before
      // or after. only consider a turn inside the circle an
      // error, or a straight line in both directions beyond
      // one square an error; consider a partial or no line to be incomplete
      if (globalCircleStates[y][x] == constCircleWhite) {
        switch (globalLineStates[y][x]) {
          // potentially complete, potentially errorneous
          case constPathNS:
            // errors:
            //   a) if no space for a line segment above or below
            if ((y==0) || (y==(globalPuzzleH-1))) {
              localError = true;
            //   b) if lines above and below that both continue straight
            } else if ((globalLineStates[y-1][x] == constPathNS) &&
                       (globalLineStates[y+1][x] == constPathNS)) {
              localError = true;
            // correct:
            //   c) a turn above or below
            } else if (pathHasTurn(globalLineStates[y-1][x]) ||
                       pathHasTurn(globalLineStates[y+1][x])) {
              localComplete = true;
            } // else incomplete
            break;
          case constPathWE:
            // errors:
            //   a) if no space for a line segment left or right
            if ((x==0) || (x==(globalPuzzleW-1))) {
              localError = true;
            //   b) if lines left and right that both continue straight
            } else if ((globalLineStates[y][x-1] == constPathWE) &&
                       (globalLineStates[y][x+1] == constPathWE)) {
              localError = true;
            // correct:
            //   c) a turn above or below
            } else if (pathHasTurn(globalLineStates[y][x-1]) ||
                       pathHasTurn(globalLineStates[y][x+1])) {
              localComplete = true;
            } // else incomplete
            break;
          // errorneous
          case constPathNW:
          case constPathNE:
          case constPathSW:
          case constPathSE:
            localError = true;
            break;
          // rest incomplete
        }

      // rule 2: check that black circles have a turn through
      // them and continue straight on both sides for two.
      // only consider a straight line as an error;
      // consider a partial turn or no turn to be incomplete
      } else if (globalCircleStates[y][x] == constCircleBlack) {
        switch (globalLineStates[y][x]) {
          // potentially complete, potentially errorneous
          case constPathNW:
            // errors:
            //   a) if no space for two line segments above or beside
            if ((y<=1) || (x<=1)) {
              localError = true;
            //   b) if lines above or beside that turn
            } else if (pathHasTurn(globalLineStates[y-1][x]) ||
                       pathHasTurn(globalLineStates[y][x-1])) {
              localError = true;
            // correct:
            //   c) straight above and beside
            } else if ((globalLineStates[y-1][x] == constPathNS) &&
                       (globalLineStates[y][x-1] == constPathWE)) {
              localComplete = true;
            } // else incomplete
            break;
          case constPathNE:
            // errors:
            //   a) if no space for two line segments above or beside
            if ((y<=1) || (x>=(globalPuzzleW-2))) {
              localError = true;
            //   b) if lines above or beside that turn
            } else if (pathHasTurn(globalLineStates[y-1][x]) ||
                       pathHasTurn(globalLineStates[y][x+1])) {
              localError = true;
            // correct:
            //   c) straight above and beside
            } else if ((globalLineStates[y-1][x] == constPathNS) &&
                       (globalLineStates[y][x+1] == constPathWE)) {
              localComplete = true;
            } // else incomplete
            break;
          case constPathSW:
            // errors:
            //   a) if no space for two line segments below or beside
            if ((y>=(globalPuzzleH-2)) || (x<=1)) {
              localError = true;
            //   b) if lines below or beside that turn
            } else if (pathHasTurn(globalLineStates[y+1][x]) ||
                       pathHasTurn(globalLineStates[y][x-1])) {
              localError = true;
            // correct:
            //   c) straight below and beside
            } else if ((globalLineStates[y+1][x] == constPathNS) &&
                       (globalLineStates[y][x-1] == constPathWE)) {
              localComplete = true;
            } // else incomplete
            break;
          case constPathSE:
            // errors:
            //   a) if no space for two line segments below or beside
            if ((y>=(globalPuzzleH-2)) || (x>=(globalPuzzleW-2))) {
              localError = true;
            //   b) if lines below or beside that turn
            } else if (pathHasTurn(globalLineStates[y+1][x]) ||
                       pathHasTurn(globalLineStates[y][x+1])) {
              localError = true;
            // correct:
            //   c) straight below and beside
            } else if ((globalLineStates[y+1][x] == constPathNS) &&
                       (globalLineStates[y][x+1] == constPathWE)) {
              localComplete = true;
            } // else incomplete
            break;
          // errorneous
          case constPathNS:
          case constPathWE:
            localError = true;
            break;
          // rest incomplete
        }
      }
      if (localError) {
        playState.errorCount++;
        if (playState.assistState==2) {
          globalCircleColors[y][x] = errorCircleColor;
        }
      } else if (localComplete) {
        if (playState.assistState==2) {
          globalCircleColors[y][x] = correctCircleColor;
        }
      } else if (globalCircleStates[y][x] != constCircleNone) {
        incompleteCircles++;
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
    playState.errorCount += loops.length;
    if (playState.assistState == 2) {
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
  if ((playState.errorCount==0) && (incompleteCircles==0) && (incompleteLoop==false)) {
    canvasSuccess(isDemo,gameName,puzzleChoice);
  } else {
    canvasIncomplete();
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    if (lastMove[2] == constPathNone) {
      addMove(constPathClear,lastMove[0],lastMove[1],true);
    } else {
      addMove(lastMove[2],lastMove[0],lastMove[1],true);
    }
    updateBoardStatus();
    drawBoard();
  }
}

function solveInitialPaths() {
  // look for black circles within one cell of the edge, turn path inward
  for (let y=0;y<globalPuzzleH;y++) {
    if (globalCircleStates[y][0] == constCircleBlack) {
      addMove(constPathWE,y,1);
    }
    if (globalCircleStates[y][1] == constCircleBlack) {
      addMove(constPathWE,y,2);
    }
    if (globalCircleStates[y][globalPuzzleW-1] == constCircleBlack) {
      addMove(constPathWE,y,globalPuzzleW-2);
    }
    if (globalCircleStates[y][globalPuzzleW-2] == constCircleBlack) {
      addMove(constPathWE,y,globalPuzzleW-3);
    }
  }
  for (let x=0;x<globalPuzzleW;x++) {
    if (globalCircleStates[0][x] == constCircleBlack) {
      addMove(constPathNS,1,x);
    }
    if (globalCircleStates[1][x] == constCircleBlack) {
      addMove(constPathNS,2,x);
    }
    if (globalCircleStates[globalPuzzleH-1][x] == constCircleBlack) {
      addMove(constPathNS,globalPuzzleH-2,x);
    }
    if (globalCircleStates[globalPuzzleH-2][x] == constCircleBlack) {
      addMove(constPathNS,globalPuzzleH-3,x);
    }
  }
  // look for white circles on the edge, force path parallel to edge
  for (let y=0;y<globalPuzzleH;y++) {
    if (globalCircleStates[y][0] == constCircleWhite) {
      addMove(constPathNS,y,0);
    }
    if (globalCircleStates[y][globalPuzzleW-1] == constCircleWhite) {
      addMove(constPathNS,y,globalPuzzleW-1);
    }
  }
  for (let x=0;x<globalPuzzleW;x++) {
    if (globalCircleStates[0][x] == constCircleWhite) {
      addMove(constPathWE,0,x);
    }
    if (globalCircleStates[globalPuzzleH-1][x] == constCircleWhite) {
      addMove(constPathWE,globalPuzzleH-1,x);
    }
  }
  updateBoardStatus();
  drawBoard();
}

function solveWhiteCircles() {
  // look for black circles within one cell of the edge, turn path inward
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((globalCircleStates[y][x] == constCircleWhite) &&
          (globalLineStates[y][x] == constPathNS) &&
          !pathHasTurn(globalLineStates[y-1][x]) &&
          !pathHasTurn(globalLineStates[y+1][x])) {
        // this cell needs to be solved, and one side is already set,
        // the other one has to turn. check if only one side is available
        if (globalLineStates[y-1][x] == constPathNS) {
          if (x==0) {
            addMove(constPathNE,y+1,x);
          } else if (x==(globalPuzzleW-1)) {
            addMove(constPathNW,y+1,x);
          }
        }
        if (globalLineStates[y+1][x] == constPathNS) {
          if (x==0) {
            addMove(constPathSE,y-1,x);
          } else if (x==(globalPuzzleW-1)) {
            addMove(constPathSW,y-1,x);
          }
        }
      }
      if ((globalCircleStates[y][x] == constCircleWhite) &&
          (globalLineStates[y][x] == constPathWE) &&
          !pathHasTurn(globalLineStates[y][x-1]) &&
          !pathHasTurn(globalLineStates[y][x+1])) {
        if (globalLineStates[y][x-1] == constPathWE) {
          if (y==0) {
            addMove(constPathSW,y,x+1);
          } else if (y==(globalPuzzleH-1)) {
            addMove(constPathNW,y,x+1);
          }
        }
        if (globalLineStates[y][x+1] == constPathWE) {
          if (y==0) {
            addMove(constPathSE,y,x-1);
          } else if (y==(globalPuzzleH-1)) {
            addMove(constPathNE,y,x-1);
          }
        }
      }
      // now look for partial segments in white, need to move them forward
      if ((globalCircleStates[y][x] == constCircleWhite) &&
          ((globalLineStates[y][x] == constPathW) ||
           (globalLineStates[y][x] == constPathE))) {
        addMove(constPathWE,y,x);
      }
      if ((globalCircleStates[y][x] == constCircleWhite) &&
          ((globalLineStates[y][x] == constPathN) ||
           (globalLineStates[y][x] == constPathS))) {
        addMove(constPathNS,y,x);
      }
    }
  }
  updateBoardStatus();
  drawBoard();
}

function updateDemoRegion(demoNum) {
  updateDemoFunction(demoNum,function () {
    // start by reseting all non-number cells to indeterminate
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        globalLineStates[y][x] = constPathNone;
      }
    }
  }, function (steps) {
    addMove(convertPathCharToCode(steps[0]),parseInt(steps[1]),parseInt(steps[2]));
  });
}
