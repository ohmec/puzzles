const gameName = 'midloop';

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
        console.log(globalWallStates);
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
      // add particular path segments
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
      switch (numParamsExp[y*globalPuzzleW+x]) {
        case '*': globalCircleStates[y][x] = constCircleDot; break;
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
  let done;
  // accounting the errors:
  //  1) circles that have turns on both ends, but different lengths
  playState.errorCount = 0;

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

      if (globalCircleStates[y][x] == constCircleDot) {
        switch (globalLineStates[y][x]) {
          // errorneous
          case constPathNW:
          case constPathNE:
          case constPathSW:
          case constPathSE:
            localError = true;
            break;
          // check length on both ends, if not two turns, then just
          // set as incomplete
          case constPathNS:
            let ncomplete = false;
            let nlength = 0;
            let ny = y-1;
            done = false;
            while(!done) {
              if (ny<0) {
                done = true;
              } else if (globalLineStates[ny][x]==constPathNS) {
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
              } else if (globalLineStates[sy][x]==constPathNS) {
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
          case constPathWE:
            let wcomplete = false;
            let wlength = 0;
            let wx = x-1;
            done = false;
            while(!done) {
              if (wx<0) {
                done = true;
              } else if (globalLineStates[y][wx]==constPathWE) {
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
              } else if (globalLineStates[y][ex]==constPathWE) {
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
          case constPathNW:
          case constPathSW:
            localError = true;
            break;
          // immediate turns, look for equivalent one on the other side
          case constPathNE:
          case constPathSE:
            if ((globalLineStates[y][x+1] & constPathNW) == constPathNW) {
              localComplete = true;
            } else if ((globalLineStates[y][x+1] & constPathSW) == constPathSW) {
              localComplete = true;
            } else if ((globalLineStates[y][x+1] & constPathWE) == constPathWE) {
              localError = true;
            }
            break;
          // check length on both ends, if not two turns, then just
          // set as incomplete
          case constPathWE:
            if ((globalLineStates[y][x+1] & constPathNW) == constPathNW) {
              localError = true;
            } else if ((globalLineStates[y][x+1] & constPathSW) == constPathSW) {
              localError = true;
            } else if ((globalLineStates[y][x+1] & constPathWE) == constPathWE) {
              let wcomplete = false;
              let wlength = 0;
              let wx = x-1;
              done = false;
              while(!done) {
                if (wx<0) {
                  done = true;
                } else if (globalLineStates[y][wx]==constPathWE) {
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
                } else if (globalLineStates[y][ex]==constPathWE) {
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
          playState.errorCount++;
          if (playState.assistState==2) {
            globalDotColors[2*y+1][2*x+2] = errorCircleColor;
          }
        } else if (localComplete) {
          if (playState.assistState==2) {
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
          case constPathNW:
          case constPathNE:
            localError = true;
            break;
          // immediate turns, look for equivalent one on the other side
          case constPathSW:
          case constPathSE:
            if ((globalLineStates[y+1][x] & constPathNW) == constPathNW) {
              localComplete = true;
            } else if ((globalLineStates[y+1][x] & constPathNE) == constPathNE) {
              localComplete = true;
            } else if ((globalLineStates[y+1][x] & constPathNS) == constPathNS) {
              localError = true;
            }
            break;
          // check length on both ends, if not two turns, then just
          // set as incomplete
          case constPathNS:
            if ((globalLineStates[y+1][x] & constPathNW) == constPathNW) {
              localError = true;
            } else if ((globalLineStates[y+1][x] & constPathNE) == constPathNE) {
              localError = true;
            } else if ((globalLineStates[y+1][x] & constPathNS) == constPathNS) {
              let ncomplete = false;
              let nlength = 0;
              let ny = y-1;
              done = false;
              while(!done) {
                if (ny<0) {
                  done = true;
                } else if (globalLineStates[ny][x]==constPathNS) {
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
                } else if (globalLineStates[sy][x]==constPathNS) {
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
          playState.errorCount++;
          if (playState.assistState==2) {
            globalDotColors[2*y+2][2*x+1] = errorCircleColor;
          }
        } else if (localComplete) {
          if (playState.assistState==2) {
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
