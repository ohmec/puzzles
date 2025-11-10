const gameName = 'hashiwokakero';

const constMoveToggleN   = 1;
const constMoveToggleW   = 2;
const constMoveToggleS   = 3;
const constMoveToggleE   = 4;
const constMoveUntoggleN = 5;
const constMoveUntoggleW = 6;
const constMoveUntoggleS = 7;
const constMoveUntoggleE = 8;
const constMoveToggleBridge = 9;
const constMoveEraseBridge = 10;

const constStateBlank  = 0b000000000;
const constStateCircle = 0b100000000;
const constStateNorth1 = 0b000000001;
const constStateNorth2 = 0b000000010;
const constStateWest1  = 0b000000100;
const constStateWest2  = 0b000001000;
const constStateSouth1 = 0b000010000;
const constStateSouth2 = 0b000100000;
const constStateEast1  = 0b001000000;
const constStateEast2  = 0b010000000;

let incompleteDigits = 0;
let disjointedPaths = true;
let curClickType = constClickUnknown;

// which keys are handled
let handledKeys = [ constKeyCR, constKeyEsc, constKeyLeft, constKeyUp,
  constKeyRight, constKeyDown, constKeyN, constKeyS, constKeyE, constKeyW ];

let moveHistory, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;
  globalLineFirst = true;   // lines are underneath circles
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
    if (playState.errorCount && incompleteDigits && disjointedPaths) {
      etext = "there are errors and incomplete numbers and more than one bridge path";
    } else if (incompleteDigits && disjointedPaths) {
      etext = "there are incomplete numbers and more than one bridge path";
    } else if (playState.errorCount && incompleteDigits) {
      etext = "there are errors and incomplete numbers";
    } else if (playState.errorCount && disjointedPaths) {
      etext = "there are errors and more than one bridge path";
    } else if (playState.errorCount) {
      etext = "there are errors";
    } else if (incompleteDigits) {
      etext = "there are incomplete numbers";
    } else if (disjointedPaths) {
      etext = "there is more than one bridge path";
    } else {
      etext = "the puzzle is complete!!";
    }
  } else {
    if ((playState.errorCount || incompleteDigits) && disjointedPaths) {
      etext = "there are " + playState.errorCount  + " errors and " +
                        incompleteDigits + " incomplete numbers and more than one bridge path";
    } else if (playState.errorCount || incompleteDigits) {
      etext = "there are " + playState.errorCount  + " errors and " +
                        incompleteDigits + " incomplete numbers";
    } else if (disjointedPaths) {
      etext = "there is more than one bridge path";
    } else {
      etext = "the puzzle is complete!!";
    }
  }
  updateDynamicHtmlEntries(etext,playState.assistState);
}

function addHistory(y,x,movetype) {
  moveHistory.push([y,x,movetype]);
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
  let targetX, targetY;
  let found = false;
  let isMoveType = (moveType <= constMoveUntoggleE) ? true : false;
  let isToggleType = (moveType <= constMoveToggleE) ? true : false;
  let moveDirN = (moveType==constMoveToggleN) || (moveType==constMoveUntoggleN);
  let moveDirW = (moveType==constMoveToggleW) || (moveType==constMoveUntoggleW);
  let moveDirS = (moveType==constMoveToggleS) || (moveType==constMoveUntoggleS);
  let moveDirE = (moveType==constMoveToggleE) || (moveType==constMoveUntoggleE);
  if (isMoveType) {
    // make sure it is on a circle, else ignore
    if ((puzzleBoardStates[y][x] & constStateCircle) != constStateCircle) {
      return;
    }
    // check the legality of any move type
    let done = false;
    let yincr = 0;
    let xincr = 0;
    let opposingPathMask = 0;
    if (moveDirN) {
      yincr = -1;
      oppositePathMask = 0b11001100;
    } else if (moveDirW) {
      xincr = -1;
      oppositePathMask = 0b00110011;
    } else if (moveDirS) {
      yincr = 1;
      oppositePathMask = 0b11001100;
    } else  {
      xincr = 1;
      oppositePathMask = 0b00110011;
    }
    let iy = y+yincr;
    let ix = x+xincr;
    // if we hit a wall or a cell with an perpindicular path segment
    // then we need to stop without success
    while (!done) {
      if ((ix<0) || (iy<0)) {
        done = true;
      } else if ((ix>=globalPuzzleW) || (iy>=globalPuzzleH)) {
        done = true;
      } else if ((puzzleBoardStates[iy][ix] & constStateCircle) != 0) {
        done = true;
        found = true;
        targetX = ix;
        targetY = iy;
      } else if ((globalLineStates[iy][ix] & oppositePathMask) != 0) {
        done = true;
      } else {
        iy+=yincr;
        ix+=xincr;
      }
    }
    if (!found) {
      return;
    }
    // now shift the puzzle state for both this cell and the target one
    let maskShiftSelf   = moveDirN ? 0 : moveDirW ? 2 : moveDirS ? 4 : 6;
    let maskShiftTarget = moveDirN ? 4 : moveDirW ? 6 : moveDirS ? 0 : 2;
    let curStateSelf   = (puzzleBoardStates[y][x]             & (0b11<<maskShiftSelf  )) >> maskShiftSelf;
    let curStateTarget = (puzzleBoardStates[targetY][targetX] & (0b11<<maskShiftTarget)) >> maskShiftTarget;
    if (curStateSelf != curStateTarget) {
      throw("ERROR: expected the bridge status to be the same for " + y + "," + x +
            " and " + targetY + "," + targetX + ", got " + curStateSelf + " vs " + curStateTarget +
            " from " + puzzleBoardStates[y][x] + " and " + puzzleBoardStates[targetY][targetX] +
            " using masks " + maskShiftSelf + " and " + maskShiftTarget);
    }

    // now toggle between no bridge (0b00) to single bridge (0b01) to double bridge (0b10)
    let lineState = 0;
    // clear out previous value
    puzzleBoardStates[y][x]             &= ~(0b11<<maskShiftSelf);
    globalLineStates[y][x]              &= ~(0b11<<maskShiftSelf);
    puzzleBoardStates[targetY][targetX] &= ~(0b11<<maskShiftTarget);
    globalLineStates[targetY][targetX]  &= ~(0b11<<maskShiftTarget);
    // make sure this is designated as a line
    globalLineStates[y][x]              |= constPathLine;
    globalLineStates[targetY][targetX]  |= constPathLine;

    //   toggle goes 00 -> 01 -> 10 -> 00
    // untoggle goes 00 -> 10 -> 01 -> 00
    if (( isToggleType && (curStateSelf == 0b00)) ||
        (!isToggleType && (curStateSelf == 0b10))) {
      lineState = 0b01;
    } else if (( isToggleType && (curStateSelf == 0b01)) ||
               (!isToggleType && (curStateSelf == 0b00))) {
      lineState = 0b10;
    } else {
      lineState = 0b00;
    }
    puzzleBoardStates[y][x]             |= (lineState<<maskShiftSelf);
    globalLineStates[y][x]              |= (lineState<<maskShiftSelf);
    puzzleBoardStates[targetY][targetX] |= (lineState<<maskShiftTarget);
    globalLineStates[targetY][targetX]  |= (lineState<<maskShiftTarget);

    // finally change the line state for all empty cells
    // between here and target to the new value
    done = false;
    iy = y+yincr;
    ix = x+xincr;
    let lineShift = (moveDirN || moveDirS) ? 0 : 2;
    let pathMask = 0b00110011 << lineShift;
    while (!done) {
      if ((ix==targetX) && (iy==targetY)) {
        done = true;
      } else {
        globalLineStates[iy][ix] &= ~pathMask;
        globalLineStates[iy][ix] |= (lineState<<lineShift);
        globalLineStates[iy][ix] |= (lineState<<(lineShift+4));
        globalLineStates[iy][ix] |= constPathLine;
        ix += xincr;
        iy += yincr;
      }
    }
    if (!noHistory) {
      addHistory(y,x,moveType);
    }
    updateBoardStatus();
    drawBoard();
    return;
  }

  // now what is left is the clicking on a bridge to either
  // toggle it or erase it

  // make sure this is a non circle type, those can't be toggled
  // this way nor erased this way
  if ((puzzleBoardStates[y][x] & constStateCircle) == constStateCircle) {
    return;
  }
  // make sure there is actually a bridge here already, ele
  // nothing to do
  if ((globalLineStates[y][x] & constPathLine) != constPathLine) {
    return;
  }
  if ((globalLineStates[y][x] & 0b11111111) == 0) {
    return;
  }

  let isNS = false;
  let isWE = false;
  let isSingle = false;
  if (globalLineStates[y][x] == (constPathN | constPathS)) {
    isNS = true;
    isSingle = true;
  } else if (globalLineStates[y][x] == (constPath2N | constPath2S)) {
    isNS = true;
  } else if (globalLineStates[y][x] == (constPathW  | constPathE)) {
    isWE = true;
    isSingle = true;
  } else if (globalLineStates[y][x] == (constPath2W | constPath2E)) {
    isWE = true;
  } else {
    throw("toggling a bridge of unknown type " + globalLineStates[y][x]);
    return;
  }

  // now go up (if NS) or left (if WE) to the origin of this bridge
  // and recursively add a move to solve that one
  let done = false;
  let yincr = isNS ? -1 : 0;
  let xincr = isWE ? -1 : 0;
  let iy = y+yincr;
  let ix = x+xincr;
  // treat the toggle like a move toggle, and an erase like
  // a move toggle if double (effectively erasing it), or
  // an untoggle if single (also erasing it)
  let thisMoveType =
    isNS ? ((moveType == constMoveToggleBridge) ? constMoveToggleS   :
                 (isSingle ? constMoveUntoggleS : constMoveToggleS)) :
           ((moveType == constMoveToggleBridge) ? constMoveToggleE   :
                 (isSingle ? constMoveUntoggleE : constMoveToggleE));
  while (!done) {
    if ((puzzleBoardStates[iy][ix] & constStateCircle) == constStateCircle) {
      done = true;
      addMove(thisMoveType,iy,ix,noHistory);
    } else {
      iy += yincr;
      ix += xincr;
    }
  }
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
          if (playState.shifting) {
            addMove(constMoveToggleN,globalCursorY,globalCursorX);
          } else {
            globalCursorY--;
          }
        }
        break;
      case constKeyDown:
        if (globalCursorY < (globalPuzzleH-1)) {
          if (playState.shifting) {
            addMove(constMoveToggleS,globalCursorY,globalCursorX);
          } else {
            globalCursorY++;
          }
        }
        break;
      case constKeyLeft:
        if (globalCursorX) {
          if (playState.shifting) {
            addMove(constMoveToggleW,globalCursorY,globalCursorX);
          } else {
            globalCursorX--;
          }
        }
        break;
      case constKeyRight:
        if (globalCursorX < (globalPuzzleW-1)) {
          if (playState.shifting) {
            addMove(constMoveToggleE,globalCursorY,globalCursorX);
          } else {
            globalCursorX++;
          }
        }
        break;
      // toggle bridges in that direction
      case constKeyN: addMove(constMoveToggleN,globalCursorY,globalCursorX); break;
      case constKeyS: addMove(constMoveToggleS,globalCursorY,globalCursorX); break;
      case constKeyE: addMove(constMoveToggleE,globalCursorY,globalCursorX); break;
      case constKeyW: addMove(constMoveToggleW,globalCursorY,globalCursorX); break;
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

  basicInitStructures(size,emptyCellColor,constWallNone,constWallNone,stdFontColor);

  globalBoardValues = initBoardValuesFromParams(numParams);
  globalLineStates  = initLineValuesFromParams(numParams,true);
  puzzleBoardStates = initYXFromValue(constStateBlank);

  let numParamsExp = expandNumParams(numParams);
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (numParamsExp[y*globalPuzzleW+x].search(/[1-8]/) != -1) {
        globalCircleStates[y][x] = constCircleWhite;
        puzzleBoardStates[y][x] =  constStateCircle;
      }
    }
  }
  // look for puzzle 0's solved paths and add those as moves without history
  // by convention these are always EW (_ or =) just to the E of the source,
  // or NS (| or #) just S of the source
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (numParamsExp[y*globalPuzzleW+x] == '_') {
        addMove(constMoveToggleE,y,x-1,true);
      }
      if (numParamsExp[y*globalPuzzleW+x] == '=') {
        addMove(constMoveToggleE,y,x-1,true);
        addMove(constMoveToggleE,y,x-1,true);
      }
      if (numParamsExp[y*globalPuzzleW+x] == '|') {
        addMove(constMoveToggleS,y-1,x,true);
      }
      if (numParamsExp[y*globalPuzzleW+x] == '#') {
        addMove(constMoveToggleS,y-1,x,true);
        addMove(constMoveToggleS,y-1,x,true);
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
  if (playState.dragging && (yCell == globalCursorY) && (xCell == globalCursorX)) {
    return;
  }
  // dragging, but the bridge was already built
  if (playState.dragging && playState.bridgeBuilt) {
    return;
  }
  // skip dragging with anything but left click
  if (playState.dragging && curClickType!=constClickLeft) {
    return;
  }

  // if dragging, toggle the bridge to the given direction, then turn off dragging
  if (playState.dragging) {
    if (yCell==(globalCursorY+1)) { // moving S
      addMove(constMoveToggleS,globalCursorY,globalCursorX);
    }
    if (yCell==(globalCursorY-1)) { // moving N
      addMove(constMoveToggleN,globalCursorY,globalCursorX);
    }
    if (xCell==(globalCursorX+1)) { // moving E
      addMove(constMoveToggleE,globalCursorY,globalCursorX);
    }
    if (xCell==(globalCursorX-1)) { // moving W
      addMove(constMoveToggleW,globalCursorY,globalCursorX);
    }
    playState.bridgeBuilt = true;
  } else {
    globalCursorY = yCell;
    globalCursorX = xCell;

    // left can be used to convert an existing bridge to a double bridge,
    // but if no bridge then just move the cursor.
    // right can be used to delete an existing bridge.
    if ((globalLineStates[yCell][xCell] & 0b11111111) != 0) {
      if (curClickType == constClickLeft) {
        addMove(constMoveToggleBridge,yCell,xCell);
      } else if (curClickType == constClickRight) {
        addMove(constMoveEraseBridge,yCell,xCell);
      }
    }
  }
  updateBoardStatus();
  drawBoard();
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) number cells with more paths out of it than the digit
  playState.errorCount = 0;

  // also count how many numbers haven't been completed yet, and how
  // many different bridge paths there are (any more than one is
  // disjointed)
  incompleteDigits = 0;
  disjointedPaths = false;

  // start by reseting all font colors to "standard"
  // before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalBoardTextColors[y][x] = stdFontColor;
      globalBoardColors[y][x] = emptyCellColor;
    }
  }

  // check the digits vs their number of bridges. if greater
  // than the number, they are in error, else just indeterminate
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((puzzleBoardStates[y][x] & constStateCircle) != 0) {
        let circleValue = globalBoardValues[y][x];
        let bridgeCount = 0;
        for (let i=0;i<4;i++) {
          if ((puzzleBoardStates[y][x] & (1<<(2*i))) != 0) {
            bridgeCount++;
          }
          if ((puzzleBoardStates[y][x] & (1<<(2*i+1))) != 0) {
            bridgeCount+=2;
          }
        }
        if (bridgeCount > circleValue) {
          playState.errorCount++;
          if (playState.assistState >= 2) {
            globalBoardTextColors[y][x] = errorFontColor;
          }
        } else if (bridgeCount == circleValue) {
          if (playState.assistState >= 2) {
            globalBoardTextColors[y][x] = correctFontColor;
          }
        } else {
          incompleteDigits++;
        }
      }
    }
  }

  // check all of the path segments. there should be only one else
  // there are disjointedPaths

  let checkedLineCells = new Array();
  let paths = new Array();
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (((puzzleBoardStates[y][x] & constStateCircle) != 0) &&
          ((globalLineStates[y][x]  & constPathLine)  == constPathLine) &&
          ((globalLineStates[y][x]  & 0b11111111) != 0) &&
          (checkedLineCells.indexOf(y+","+x)==-1)) {
        let pathArray = travelPathNetwork(globalLineStates,y,x);
        checkedLineCells.push.apply(checkedLineCells, pathArray);
        paths.push(pathArray);
      }
    }
  }

  if (paths.length > 1) {
    disjointedPaths = true;
  }

  // for fun in assistState 3 color the different segments so far
  if (disjointedPaths && playState.assistState==3) {
    for (let i=0;i<paths.length;i++) {
      let thisPath = paths[i];
      for (let cc of thisPath) {
        let curCell = cc.split(",");
        let iy = curCell[0];
        let ix = curCell[1];
        globalBoardColors[iy][ix] = numberColor[i+1];
      }
    }
  }

  updateDynTextFields();
  if ((playState.errorCount==0) && (incompleteDigits==0) && (disjointedPaths==false)) {
    canvasSuccess(isDemo,gameName,puzzleChoice);
  } else {
    canvasIncomplete();
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    // convert from toggle to untoggle
    if (lastMove[2] < constMoveUntoggleN) {
      addMove(lastMove[2]+4,lastMove[0],lastMove[1],true);
    } else {
      addMove(lastMove[2]-4,lastMove[0],lastMove[1],true);
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
        if ((puzzleBoardStates[y][x] & constStateCircle) == constStateCircle) {
          puzzleBoardStates[y][x] = constStateCircle;
        }
        globalLineStates[y][x] = constPathNone;
      }
    }
  }, function (steps) {
    let s0 =
        (steps[0] == 'N') ? constMoveToggleN :
        (steps[0] == 'W') ? constMoveToggleW :
        (steps[0] == 'S') ? constMoveToggleS : constMoveToggleE;
    addMove(s0,parseInt(steps[1]),parseInt(steps[2]));
  });
}
