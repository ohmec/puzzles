const emptyCellColor = "white";         // not-filled

const stdFontColor = "black";
const errorFontColor = "red";
const correctFontColor = "green";

const MOVE_TOGGLE_N   = 1;
const MOVE_TOGGLE_W   = 2;
const MOVE_TOGGLE_S   = 3;
const MOVE_TOGGLE_E   = 4;
const MOVE_UNTOGGLE_N = 5;
const MOVE_UNTOGGLE_W = 6;
const MOVE_UNTOGGLE_S = 7;
const MOVE_UNTOGGLE_E = 8;
const MOVE_TOGGLE_BRIDGE = 9;
const MOVE_ERASE_BRIDGE = 10;

const STATE_BLANK  = 0b000000000;
const STATE_CIRCLE = 0b100000000;
const STATE_NORTH1 = 0b000000001;
const STATE_NORTH2 = 0b000000010;
const STATE_WEST1  = 0b000000100;
const STATE_WEST2  = 0b000001000;
const STATE_SOUTH1 = 0b000010000;
const STATE_SOUTH2 = 0b000100000;
const STATE_EAST1  = 0b001000000;
const STATE_EAST2  = 0b010000000;

let clicking = false;
let dragging = false;
let bridgeBuilt = false;
let shifting = false;
let errorCount = 0;
let incompleteDigits = 0;
let disjointedPaths = true;
let assistState = 0;
let debugMode = false;
let curClickType = CLICK_UNKNOWN;

// which keys are handled
let handledKeys = [ KEY_CR, KEY_ESC, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_N, KEY_S, KEY_E, KEY_W ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;

  // any key anywhere as long as canvas is in focus
  $(document).keydown(function(evnt) {
    $("#resetButton").blur();
    $("#undoButton").blur();
    $("#assistButton").blur();
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
    bridgeBuilt = false;
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
    assistState = (assistState+1)%4;
    updateBoardStatus();
    drawBoard(true);
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
    if (errorCount && incompleteDigits && disjointedPaths) {
      etext = "there are errors and incomplete numbers and more than one bridge path";
    } else if (incompleteDigits && disjointedPaths) {
      etext = "there are incomplete numbers and more than one bridge path";
    } else if (errorCount && incompleteDigits) {
      etext = "there are errors and incomplete numbers";
    } else if (errorCount && disjointedPaths) {
      etext = "there are errors and more than one bridge path";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteDigits) {
      etext = "there are incomplete numbers";
    } else if (disjointedPaths) {
      etext = "there is more than one bridge path";
    } else {
      etext = "the puzzle is complete!!";
    }
  } else {
    if ((errorCount || incompleteDigits) && disjointedPaths) {
      etext = "there are " + errorCount  + " errors and " +
                        incompleteDigits + " incomplete numbers and more than one bridge path";
    } else if (errorCount || incompleteDigits) {
      etext = "there are " + errorCount  + " errors and " +
                        incompleteDigits + " incomplete numbers";
    } else if (disjointedPaths) {
      etext = "there is more than one bridge path";
    } else {
      etext = "the puzzle is complete!!";
    }
  }
  updateDynamicHtmlEntries(etext,assistState);
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
  let isMoveType = (moveType <= MOVE_UNTOGGLE_E) ? true : false;
  let isToggleType = (moveType <= MOVE_TOGGLE_E) ? true : false;
  let moveDirN = (moveType==MOVE_TOGGLE_N) || (moveType==MOVE_UNTOGGLE_N);
  let moveDirW = (moveType==MOVE_TOGGLE_W) || (moveType==MOVE_UNTOGGLE_W);
  let moveDirS = (moveType==MOVE_TOGGLE_S) || (moveType==MOVE_UNTOGGLE_S);
  let moveDirE = (moveType==MOVE_TOGGLE_E) || (moveType==MOVE_UNTOGGLE_E);
  if (isMoveType) {
    // make sure it is on a circle, else ignore
    if ((puzzleBoardStates[y][x] & STATE_CIRCLE) != STATE_CIRCLE) {
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
      } else if ((puzzleBoardStates[iy][ix] & STATE_CIRCLE) != 0) {
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
    globalLineStates[y][x]              |= PATH_LINE;
    globalLineStates[targetY][targetX]  |= PATH_LINE;

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
        globalLineStates[iy][ix] |= PATH_LINE;
        ix += xincr;
        iy += yincr;
      }
    }
    if (!noHistory) {
      addHistory(y,x,moveType);
    }
    updateBoardStatus();
    drawBoard(true);
    return;
  }

  // now what is left is the clicking on a bridge to either
  // toggle it or erase it

  // make sure this is a non circle type, those can't be toggled
  // this way nor erased this way
  if ((puzzleBoardStates[y][x] & STATE_CIRCLE) == STATE_CIRCLE) {
    return;
  }
  // make sure there is actually a bridge here already, ele
  // nothing to do
  if ((globalLineStates[y][x] & PATH_LINE) != PATH_LINE) {
    return;
  }
  if ((globalLineStates[y][x] & 0b11111111) == 0) {
    return;
  }

  let isNS = false;
  let isWE = false;
  let isSingle = false;
  if (globalLineStates[y][x] == (PATH_N | PATH_S)) {
    isNS = true;
    isSingle = true;
  } else if (globalLineStates[y][x] == (PATH_2N | PATH_2S)) {
    isNS = true;
  } else if (globalLineStates[y][x] == (PATH_W  | PATH_E)) {
    isWE = true;
    isSingle = true;
  } else if (globalLineStates[y][x] == (PATH_2W | PATH_2E)) {
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
    isNS ? ((moveType == MOVE_TOGGLE_BRIDGE) ? MOVE_TOGGLE_S :
            (isSingle ? MOVE_UNTOGGLE_S : MOVE_TOGGLE_S)) :
           ((moveType == MOVE_TOGGLE_BRIDGE) ? MOVE_TOGGLE_E :
            (isSingle ? MOVE_UNTOGGLE_E : MOVE_TOGGLE_E));
  while (!done) {
    if ((puzzleBoardStates[iy][ix] & STATE_CIRCLE) == STATE_CIRCLE) {
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
        console.log(puzzleBoardStates);
        console.log(globalBoardValues);
        console.log(globalLineStates);
        debugMode = true;
        break;
      case KEY_UP:
        if (globalCursorY) {
          if (shifting) {
            addMove(MOVE_TOGGLE_N,globalCursorY,globalCursorX);
          } else {
            globalCursorY--;
          }
        }
        break;
      case KEY_DOWN:
        if (globalCursorY < (globalPuzzleH-1)) {
          if (shifting) {
            addMove(MOVE_TOGGLE_S,globalCursorY,globalCursorX);
          } else {
            globalCursorY++;
          }
        }
        break;
      case KEY_LEFT:
        if (globalCursorX) {
          if (shifting) {
            addMove(MOVE_TOGGLE_W,globalCursorY,globalCursorX);
          } else {
            globalCursorX--;
          }
        }
        break;
      case KEY_RIGHT:
        if (globalCursorX < (globalPuzzleW-1)) {
          if (shifting) {
            addMove(MOVE_TOGGLE_E,globalCursorY,globalCursorX);
          } else {
            globalCursorX++;
          }
        }
        break;
      // toggle bridges in that direction
      case KEY_N:
        addMove(MOVE_TOGGLE_N,globalCursorY,globalCursorX);
        break;
      case KEY_S:
        addMove(MOVE_TOGGLE_S,globalCursorY,globalCursorX);
        break;
      case KEY_E:
        addMove(MOVE_TOGGLE_E,globalCursorY,globalCursorX);
        break;
      case KEY_W:
        addMove(MOVE_TOGGLE_W,globalCursorY,globalCursorX);
        break;
      }
    updateBoardStatus();
    drawBoard(true);
  }
}

function initStructures(puzzle) {
  $("#canvasDiv").css("border-color", "black");
  moveHistory = new Array();
  // get the size and the digits out of the puzzle entry
  let puzzleSplit = puzzle.split(":");
  let size = puzzleSplit[0];
  let numParams = puzzleSplit[1];

  basicInitStructures(size,emptyCellColor,constWallNone,stdFontColor);

  globalInitBoardValues = initBoardValuesFromParams(numParams);
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  globalLineStates   =    initLineValuesFromParams(numParams,true);
  puzzleBoardStates =     initYXFromValue(STATE_BLANK);

  let numParamsExp = expandNumParams(numParams);
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (numParamsExp[y*globalPuzzleW+x].search(/[1-8]/) != -1) {
        globalCircleStates[y][x] = CIRCLE_WHITE;
        puzzleBoardStates[y][x] =  STATE_CIRCLE;
      }
    }
  }
  // look for puzzle 0's solved paths and add those as moves without history
  // by convention these are always EW (_ or =) just to the E of the source,
  // or NS (| or #) just S of the source
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (numParamsExp[y*globalPuzzleW+x] == '_') {
        addMove(MOVE_TOGGLE_E,y,x-1,true);
      }
      if (numParamsExp[y*globalPuzzleW+x] == '=') {
        addMove(MOVE_TOGGLE_E,y,x-1,true);
        addMove(MOVE_TOGGLE_E,y,x-1,true);
      }
      if (numParamsExp[y*globalPuzzleW+x] == '|') {
        addMove(MOVE_TOGGLE_S,y-1,x,true);
      }
      if (numParamsExp[y*globalPuzzleW+x] == '#') {
        addMove(MOVE_TOGGLE_S,y-1,x,true);
        addMove(MOVE_TOGGLE_S,y-1,x,true);
      }
    }
  }

  updateBoardStatus();
  drawBoard(true);
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
  if (dragging && (yCell == globalCursorY) && (xCell == globalCursorX)) {
    return;
  }
  // dragging, but the bridge was already built
  if (dragging && bridgeBuilt) {
    return;
  }
  // skip dragging with anything but left click
  if (dragging && curClickType!=CLICK_LEFT) {
    return;
  }

  // if dragging, toggle the bridge to the given direction, then turn off dragging
  if (dragging) {
    if (yCell==(globalCursorY+1)) { // moving S
      addMove(MOVE_TOGGLE_S,globalCursorY,globalCursorX);
    }
    if (yCell==(globalCursorY-1)) { // moving N
      addMove(MOVE_TOGGLE_N,globalCursorY,globalCursorX);
    }
    if (xCell==(globalCursorX+1)) { // moving E
      addMove(MOVE_TOGGLE_E,globalCursorY,globalCursorX);
    }
    if (xCell==(globalCursorX-1)) { // moving W
      addMove(MOVE_TOGGLE_W,globalCursorY,globalCursorX);
    }
    bridgeBuilt = true;
  } else {
    globalCursorY = yCell;
    globalCursorX = xCell;

    // left can be used to convert an existing bridge to a double bridge,
    // but if no bridge then just move the cursor.
    // right can be used to delete an existing bridge.
    if ((globalLineStates[yCell][xCell] & 0b11111111) != 0) {
      if (curClickType == CLICK_LEFT) {
        addMove(MOVE_TOGGLE_BRIDGE,yCell,xCell);
      } else if (curClickType == CLICK_RIGHT) {
        addMove(MOVE_ERASE_BRIDGE,yCell,xCell);
      }
    }
  }
  updateBoardStatus();
  drawBoard(true);
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) number cells with more paths out of it than the digit
  errorCount = 0;

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
      if ((puzzleBoardStates[y][x] & STATE_CIRCLE) != 0) {
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
          errorCount++;
          if (assistState >= 2) {
            globalBoardTextColors[y][x] = errorFontColor;
          }
        } else if (bridgeCount == circleValue) {
          if (assistState >= 2) {
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
      if (((puzzleBoardStates[y][x] & STATE_CIRCLE) != 0) &&
          ((globalLineStates[y][x]  & PATH_LINE)  == PATH_LINE) &&
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
  if (disjointedPaths && assistState==3) {
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
  if ((errorCount==0) && (incompleteDigits==0) && (disjointedPaths==false)) {
    $("#canvasDiv").css("border-color", constColorSuccess);
  } else {
    $("#canvasDiv").css("border-color", "black");
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    // convert from toggle to untoggle
    if (lastMove[2] < MOVE_UNTOGGLE_N) {
      addMove(lastMove[2]+4,lastMove[0],lastMove[1],true);
    } else {
      addMove(lastMove[2]-4,lastMove[0],lastMove[1],true);
    }
    updateBoardStatus();
    drawBoard(true);
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
    if (demoStepNum==1) {
      assistState = 2;
    } else if (demoStepNum==0) {
      assistState = 0;
    }
    updateHtmlText('demotext', dtext[demoStepNum]);
    // start by reseting all non-number cells to indeterminate
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        if ((puzzleBoardStates[y][x] & STATE_CIRCLE) == STATE_CIRCLE) {
          puzzleBoardStates[y][x] = STATE_CIRCLE;
        }
        globalLineStates[y][x] = PATH_NONE;
      }
    }
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      for (let dsteps of dmoves[step]) {
        let steps = dsteps.split("");
        let s0 =
          (steps[0] == 'N') ? MOVE_TOGGLE_N :
          (steps[0] == 'W') ? MOVE_TOGGLE_W :
          (steps[0] == 'S') ? MOVE_TOGGLE_S : MOVE_TOGGLE_E;
        addMove(s0,parseInt(steps[1]),parseInt(steps[2]));
      }
    }
    updateBoardStatus();
    drawBoard(true);
  }
}
