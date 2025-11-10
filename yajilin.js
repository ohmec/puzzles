const gameName = 'yajilin';

const digitCellColor = "#e0e0e0";       // gray cell color for digits
const errorCellColor = "#802020";       // dark reddish

let incompleteDigits = 0;
let incompleteCells = 0;
let incompleteLoop = true;
let curClickType = constClickUnknown;

const constCellWhite = 1;
const constCellBlack = 2;
const constCellFixed = 3;

// which keys are handled
const handledKeys = [ constKeyBackspace, constKeyCR, constKeyEsc,
  constKeySpace, constKeyLeft, constKeyUp, constKeyRight, constKeyDown,
  constKeyDot, constKey1, constKeyAlt1, constKey0, constKeyAlt0,
  constKeyDash, constKeyVert, constKeyL, constKeyI, constKeyJ,
  constKey7, constKeyF ];

let moveHistory, puzzleBoardStates;

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
    if (playState.errorCount && incompleteDigits && incompleteCells) {
      etext = "there are errors and incomplete numbers and white cells that don't have a path";
    } else if (incompleteDigits && incompleteCells) {
      etext = "there are incomplete numbers and white cells that don't have a path";
    } else if (playState.errorCount && incompleteDigits) {
      etext = "there are errors and incomplete numbers";
    } else if (playState.errorCount && incompleteCells) {
      etext = "there are errors and white cells that don't have a path";
    } else if (playState.errorCount) {
      etext = "there are errors";
    } else if (incompleteDigits) {
      etext = "there are incomplete numbers";
    } else if (incompleteCells) {
      etext = "there are cells that don't have a path still";
    } else if (incompleteLoop) {
      etext = "the loop isn't complete yet";
    } else {
      etext = "there are no errors nor incomplete numbers";
    }
  } else {
    if (playState.errorCount || incompleteDigits || incompleteCells) {
      etext = "there are " + playState.errorCount  + " errors and " +
                        incompleteDigits + " incomplete numbers and " +
                        incompleteCells  + " incomplete cells";
    } else if (incompleteLoop) {
      etext = "the loop isn't complete yet";
    } else {
      etext = "there are no errors nor incomplete numbers";
    }
  }
  updateDynamicHtmlEntries(etext,playState.assistState);
}

function addHistory(y,x,prevvalue,movetype) {
  moveHistory.push([y,x,prevvalue,movetype]);
}

function addMove(moveType,y,x,noHistory=false) {
  // don't try and change a fixed cell
  if (puzzleBoardStates[y][x] == constCellFixed) {
    return;
  }
  if (moveType <= constCellFixed) {
    if (!noHistory) {
      addHistory(y,x,puzzleBoardStates[y][x],moveType);
    }
    puzzleBoardStates[y][x] = moveType;
    globalBoardColors[y][x] = (moveType == constCellWhite) ? emptyCellColor : fillCellColorDB;
    // if putting down a black cell, kill all path segments
    // in this cell, and into and out of this cell
    if (moveType == constCellBlack) {
      globalLineStates[y][x] = constPathNone;
      if (y) {
        globalLineStates[y-1][x] = unmergePathLines(globalLineStates[y-1][x],constPathS);
      }
      if (y<(globalPuzzleH-1)) {
        globalLineStates[y+1][x] = unmergePathLines(globalLineStates[y+1][x],constPathN);
      }
      if (x) {
        globalLineStates[y][x-1] = unmergePathLines(globalLineStates[y][x-1],constPathE);
      }
      if (x<(globalPuzzleW-1)) {
        globalLineStates[y][x+1] = unmergePathLines(globalLineStates[y][x+1],constPathW);
      }
    }
    return;
  }
  // a dot on a black cell clears it and adds the dot
  if ((puzzleBoardStates[y][x] == constCellBlack) && (moveType == constPathDot)) {
    puzzleBoardStates[y][x] = constCellWhite;
    globalLineStates[y][x] = constPathDot;
    return;
  }
  // the rest are path changes, make sure they're legal
  // don't try and add paths that move into a black or fixed cell or edge or black cell
  if (puzzleBoardStates[y][x] == constCellBlack) {
    return;
  }
  if ((((y==0)                 || (puzzleBoardStates[y-1][x]!=constCellWhite)) && ((moveType & constPathN) == constPathN)) ||
      (((y==(globalPuzzleH-1)) || (puzzleBoardStates[y+1][x]!=constCellWhite)) && ((moveType & constPathS) == constPathS)) ||
      (((x==0)                 || (puzzleBoardStates[y][x-1]!=constCellWhite)) && ((moveType & constPathW) == constPathW)) ||
      (((x==(globalPuzzleW-1)) || (puzzleBoardStates[y][x+1]!=constCellWhite)) && ((moveType & constPathE) == constPathE))) {
    return;
  }

  if (!noHistory) {
    addHistory(y,x,globalLineStates[y][x],moveType);
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
        console.log(puzzleBoardStates);
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
      case constKeySpace: // toggle through states
        if (puzzleBoardStates[globalCursorY][globalCursorX] == constCellBlack) {
          addMove(constCellWhite,globalCursorY,globalCursorX);
        } else {
          addMove(constCellBlack,globalCursorY,globalCursorX);
        }
        break;
      case constKeyDot:
        if (puzzleBoardStates[globalCursorY][globalCursorX] != constCellFixed) {
          addMove(constPathDot,globalCursorY,globalCursorX);
        }
        break;
      case constKey0:
      case constKeyAlt0:      addMove(constCellWhite,globalCursorY,globalCursorX); break;
      case constKey1:
      case constKeyAlt1:      addMove(constCellBlack,globalCursorY,globalCursorX); break;
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
  // reset to non-demo
  isDemo = false;

  basicInitStructures(size,emptyCellColor,constWallLight,constWallStandard,stdFontColor);

  globalBoardValues =  initBoardValuesFromParams(numParams,true);
  globalLineStates   = initLineValuesFromParams(numParams,true);
  puzzleBoardStates =  initYXFromValue(constCellWhite);

  // override board states and colors for the initial digits, set to gray
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (globalBoardValues[y][x] != "") {
        puzzleBoardStates[y][x] = constCellFixed;
        globalBoardColors[y][x] = digitCellColor;
      }
    }
  }

  // override state if given (* for black) for example completed puzzle
  // needs to do annoying skip for arrows
  if ((numParams.search(/F/)!=-1) && (numParams.search(/|/)!=-1) &&
      (numParams.search(/J/)!=-1) && (numParams.search(/_/)!=-1) &&
      (numParams.search(/7/)!=-1) && (numParams.search(/L/)!=-1)) {
    let numParamsExt = numParams.replace(/([0-9])v/g, "$1%");
    numParamsExt = expandNumParams(numParamsExt).split("");
    let scoot = 0;
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        let ptr = y*globalPuzzleW+x+scoot;
        let param = numParams[ptr];
        if (param.search(/[0-6]/) != -1) {
          scoot++;
        } else if (numParamsExt[ptr] == '*') {
          puzzleBoardStates[y][x] = constCellBlack;
        }
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

  // left is only used for drag, right sets to black, middle sets to white
  // ignore if already the same state, or if a numbered tile which
  // can't be changed
  if (globalBoardValues[yCell][xCell] == "") {
    if ((curClickType == constClickRight)  && puzzleBoardStates[yCell][xCell] != constCellBlack) {
      addMove(constCellBlack,yCell,xCell);
    }
    if ((curClickType == constClickMiddle) && puzzleBoardStates[yCell][xCell] != constCellWhite) {
      addMove(constCellWhite,yCell,xCell);
    }
  }
  updateBoardStatus();
  drawBoard();
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) number cells with more black squares than accounted for
  //  2) two black cells that touch
  //  3) a continuous loop while there are other loop segments
  playState.errorCount = 0;

  // also count how many numbers haven't been completed yet, how
  // many white cells don't have a path, and if there is a complete loop
  incompleteDigits = 0;
  incompleteCells = 0;
  incompleteLoop = true;

  // start by reseting all cell, line and font colors to "standard"
  // before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalLineColors[y][x] = "black";
      if (puzzleBoardStates[y][x] == constCellBlack) {
        globalBoardColors[y][x] = fillCellColorDB;
        globalBoardTextColors[y][x] = offFontColor;
      } else if (puzzleBoardStates[y][x] == constCellWhite) {
        globalBoardColors[y][x] = emptyCellColor;
        globalBoardTextColors[y][x] = stdFontColor;
      } else {
        globalBoardColors[y][x] = digitCellColor;
        globalBoardTextColors[y][x] = stdFontColor;
      }
    }
  }

  // rule 1: go through all of the cells with digits. count the number
  // of black cells in their direction. if greater than the number,
  // they are in error, else just indeterminate
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      let cellValue = globalBoardValues[y][x];
      if (cellValue) {
        let count, dir;
        let found = 0;
        [count,dir] = cellValue.split("");
        switch (dir) {
          case "^":
            for (let iy=y-1;iy>=0;iy--) {
              if (puzzleBoardStates[iy][x]==constCellBlack) {
                found++;
              }
            }
            break;
          case "v":
            for (let iy=y+1;iy<globalPuzzleH;iy++) {
              if (puzzleBoardStates[iy][x]==constCellBlack) {
                found++;
              }
            }
            break;
          case "<":
            for (let ix=x-1;ix>=0;ix--) {
              if (puzzleBoardStates[y][ix]==constCellBlack) {
                found++;
              }
            }
            break;
          case ">":
            for (let ix=x+1;ix<globalPuzzleW;ix++) {
              if (puzzleBoardStates[y][ix]==constCellBlack) {
                found++;
              }
            }
            break;
        }
        if (count==found) {
          if (playState.assistState==2) {
            globalBoardTextColors[y][x] = correctFontColor;
          }
        } else if (found>count) {
          playState.errorCount++;
          if (playState.assistState==2) {
            globalBoardTextColors[y][x] = errorFontColor;
          }
        } else {
          incompleteDigits++;
        }
      }
    }
  }

  // rule 3: check for touching black squares
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((y!=(globalPuzzleH-1)) &&
          (puzzleBoardStates[y  ][x] == constCellBlack) &&
          (puzzleBoardStates[y+1][x] == constCellBlack)) {
      playState.errorCount++;
      globalBoardColors[y  ][x] = errorCellColor;
      globalBoardColors[y+1][x] = errorCellColor;
      }
      if ((x!=(globalPuzzleW-1)) &&
          (puzzleBoardStates[y][x  ] == constCellBlack) &&
          (puzzleBoardStates[y][x+1] == constCellBlack)) {
      playState.errorCount++;
      globalBoardColors[y  ][x+1] = errorCellColor;
      globalBoardColors[y+1][x+1] = errorCellColor;
      }
    }
  }

  // rule 4a: check for white squares without a path
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((puzzleBoardStates[y][x]==constCellWhite) && !globalLineStates[y][x]) {
        incompleteCells++;
      }
    }
  }

  // rule 4b: check all of the path segments. find out how many are loops,
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
      if (puzzleBoardStates[y][x]==constCellWhite &&
          globalLineStates[y][x] &&
          (globalLineStates[y][x] != constPathDot) &&
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
        for (let l of loop) {
          let y,x;
          [y,x] = l.split(",");
          globalLineColors[y][x] = "red";
        }
      }
    }
  }
  if ((loops.length==1) && (nonloops.length==0)) {
    incompleteLoop = false;
  }

  updateDynTextFields();
  if ((playState.errorCount==0) && (incompleteDigits==0) && (incompleteCells==0) && (incompleteLoop==false)) {
    canvasSuccess(isDemo,gameName,puzzleChoice);
  } else {
    canvasIncomplete();
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    if (lastMove[3] <= constCellFixed) {
      addMove(lastMove[2],lastMove[0],lastMove[1],true);
    } else if (lastMove[2] == 0) {
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
        if (globalBoardValues[y][x] == "") {
          puzzleBoardStates[y][x] = constCellWhite;
          globalLineStates[y][x] = constPathNone;
        } else {
          puzzleBoardStates[y][x] = constCellFixed;
        }
      }
    }
  }, function (steps) {
    let s0 = (steps[0] == '1') ? constCellBlack : convertPathCharToCode(steps[0]);
    addMove(s0,parseInt(steps[1]),parseInt(steps[2]));
  });
}
