const gameName = 'shikaku';

const dragRoomLineColor  = "#c080c0";
const dragRoomCellColor  = "#ffb0ff80";
const correctRoomColor   = "#c0ffc0";
const incorrectRoomColor = "#ffc0c0";

const constMoveAddRoom = 1;
const constMoveDelRoom = 2;

let incompleteCount = 0;
let curClickType = constClickUnknown;

// which keys are handled, letters and numbers handled algorithmically afterwards
let handledKeys = [ constKeyBackspace, constKeyCR, constKeyEsc,
  constKeyLeft, constKeyUp, constKeyRight, constKeyDown ];

let moveHistory, puzzleRoomList;

// if have created a rectangle, convert it to a room
function submitRoom() {
  addRoom(playState.pinCellY,playState.pinCellX,globalCursorY,globalCursorX);
  updateBoardStatus();
  drawBoard();
}

function puzzleInit() {
  globalCursorOn = true;
  initElements();
  initRibbons(gameName);
  listenKeys(handledKeys,handleKey,null,submitRoom);
  listenClick(handleClick,initStructures,undoMove,submitRoom);

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
    if (playState.errorCount && incompleteCount) {
      etext = "there are errors and incomplete numbers";
    } else if (playState.errorCount) {
      etext = "there are errors";
    } else if (incompleteCount) {
      etext = "there are incomplete numbers";
    } else {
      etext = "the puzzle is complete!!";
    }
  } else {
    if (playState.errorCount || incompleteCount) {
      etext = "there are " + playState.errorCount + " errors and " +
                        incompleteCount + " incomplete numbers";
    } else {
      etext = "the puzzle is complete!!";
    }
  }
  updateDynamicHtmlEntries(etext,playState.assistState);
}

function addHistory(movetype,y,x,h,w) {
  moveHistory.push([movetype,y,x,h,w]);
}

function getRoom(y0,x0,y1,x1) {
  let roomMinY = (y0<y1) ? y0 : y1;
  let roomMinX = (x0<x1) ? x0 : x1;
  let roomMaxY = (y0>y1) ? y0 : y1;
  let roomMaxX = (x0>x1) ? x0 : x1;
  return [roomMinY,roomMinX,roomMaxY-roomMinY+1,roomMaxX-roomMinX+1];
}

function deleteRoom(y,x,noHistory=false) {
  for (let r=0;r<puzzleRoomList.length;r++) {
    let room = puzzleRoomList[r];
    if ((y>=room[0]) && (y<(room[0]+room[2])) && (x>=room[1]) && (x<(room[1]+room[3]))) {
      let removed = puzzleRoomList.splice(r,1);
      globalWallStates = initWallStatesFromRooms(puzzleRoomList,constWallDash);
      if (!noHistory) {
        addHistory(constMoveDelRoom,removed[0][0],removed[0][1],removed[0][2],removed[0][3]);
      }
      return removed;
    }
  }
}

function addRoom (y0,x0,y1,x1,noHistory=false) {
  let thisRoom = getRoom(y0,x0,y1,x1);
  let skip = false;
  // don't add a room if 1x1
  if (y0==y1 && x0==x1) {
    skip = true;
  }
  // make sure this room doesn't intersect with any existing room
  for (let room of puzzleRoomList) {
    if (!(((thisRoom[0]+thisRoom[2]-1) < room[0]) ||
          ((thisRoom[1]+thisRoom[3]-1) < room[1]) ||
          ( thisRoom[0] > (room[0]+room[2]-1))    ||
          ( thisRoom[1] > (room[1]+room[3]-1)))) {
      skip = true;
    }
  }

  if (!skip) {
    puzzleRoomList.push(thisRoom);
    globalWallStates = initWallStatesFromRooms(puzzleRoomList,constWallDash);
    if (!noHistory) {
      addHistory(constMoveAddRoom,thisRoom[0],thisRoom[1],thisRoom[2],thisRoom[3]);
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
  } else if (focusedElement && focusedElement.id != "userPuzzle") {
    switch (keynum) {
      case constKeyEsc:
        console.log(globalBoardValues);
        console.log(globalWallStates);
        console.log(puzzleRoomList);
        break;
      case constKeyUp:
      case constKeyDown:
      case constKeyLeft:
      case constKeyRight:
        moveGlobalCursor(keynum);
        break;
      case constKeyBackspace:
        deleteRoom(globalCursorY,globalCursorX);
        break;
    }
    updateBoardStatus();
    drawBoard();
    // if shifting, draw this room afterwards as pink rectangle
    if (playState.shifting && (keynum >= constKeyLeft) && (keynum <= constKeyDown)) {
      drawDragRoom(globalCursorY,globalCursorX);
    }
  }
}

function initStructures(puzzle) {
  elemStruct.canvasDiv.style.borderColor = "black";
  moveHistory = new Array();
  // get the size and the digits out of the puzzle entry
  let puzzleSplit = puzzle.split(":");
  let size = puzzleSplit[0];
  let numParams = puzzleSplit[1];
  let roomParams = puzzleSplit[2];
  // reset to non-demo
  isDemo = false;

  basicInitStructures(size,emptyCellColor,constWallDash,constWallStandard,offFontColor);

  globalBoardValues = initBoardValuesFromParams(numParams);
  puzzleRoomList = new Array();

  if (roomParams) {     // for completed puzzle 0 only
    globalWallStates = initWallStatesFromBoxes(roomParams, constWallDash, false);
  }

  // place black circles where each digit is
  // also count that the total sum == area
  let sum = 0;
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (globalBoardValues[y][x] != "") {
        globalCircleStates[y][x] = constCircleBlack;
        sum += globalBoardValues[y][x];
      }
    }
  }
  let wxh = size.split("x");
  if (sum != wxh[0]*wxh[1]) {
    throw("ERROR: expected total number sum to be " + (wxh[0]*wxh[1]) + " got " + sum);
  }

  updateBoardStatus();
  drawBoard();
}

function handleClick(evnt) {
  globalCursorOn = true;

  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  if (!playState.dragging) {
    curClickType = clickType(evnt);
    playState.pinCellY = yCell;
    playState.pinCellX = xCell;
  }

  // ignoring middle click
  if (curClickType == constClickMiddle) return;
  // dragging room, but no move yet
  if (playState.dragging && (yCell == globalCursorY) && (xCell == globalCursorX)) return;
  // dragging room, but on a wall or corner
  if (playState.dragging && (isEdge || isCorner)) return;
  // ignore dragging right clicks
  if (playState.dragging && (curClickType == constClickRight)) return;

  globalCursorY = yCell;
  globalCursorX = xCell;

  // if right-clicking, remove any pre-existing room
  if (curClickType == constClickRight) {
    deleteRoom(yCell,xCell);
  }

  updateBoardStatus();
  drawBoard();

  // if dragging, draw this room afterwards as pink rectangle
  drawDragRoom(yCell,xCell);
}

// look for errors
function updateBoardStatus() {
  // accounting the errors:
  //  1) rooms with a digit that are larger than digit value
  //  2) rooms with a digit and no room to grow that are smaller than digit value
  playState.errorCount = 0;

  // also count how many numbers haven't been completed yet
  incompleteCount = 0;

  // start by reseting all cell colors to "standard",
  // before evaluating rooms
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      globalBoardColors[y][x] = emptyCellColor;
    }
  }

  // now go through all of the rooms and evaluate for correctness.
  // if assist state 2, color the cells within appropriately.
  let completeCount = 0;
  for (let room of puzzleRoomList) {
    let ncount = 0;
    let numfound = 0;
    let roomsize = room[2]*room[3];
    for (let iy=room[0];iy<(room[0]+room[2]);iy++) {
      for (let ix=room[1];ix<(room[1]+room[3]);ix++) {
        if (globalBoardValues[iy][ix] != "") {
          ncount++;
          numfound = globalBoardValues[iy][ix];
        }
      }
    }
    if (ncount==1 && (roomsize==numfound)) {
      completeCount++;
      if (playState.assistState==2) {
        // color as correct
        for (let iy=room[0];iy<(room[0]+room[2]);iy++) {
          for (let ix=room[1];ix<(room[1]+room[3]);ix++) {
            globalBoardColors[iy][ix] = correctRoomColor;
          }
        }
      }
    } else {
      playState.errorCount++;
      if (playState.assistState==2) {
        // color as incorrect
        for (let iy=room[0];iy<(room[0]+room[2]);iy++) {
          for (let ix=room[1];ix<(room[1]+room[3]);ix++) {
            globalBoardColors[iy][ix] = incorrectRoomColor;
          }
        }
      }
    }
  }
  let totalCount = 0;
  for (let iy=0;iy<globalPuzzleH;iy++) {
    for (let ix=0;ix<globalPuzzleW;ix++) {
      if (globalBoardValues[iy][ix] != "") {
        totalCount++;
      }
    }
  }
  incompleteCount = totalCount-completeCount;

  updateDynTextFields();
  if ((playState.errorCount == 0) && (incompleteCount == 0)) {
    canvasSuccess(isDemo,gameName,puzzleChoice);
  } else {
    canvasIncomplete();
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    if (lastMove[0] == constMoveAddRoom) {
      deleteRoom(lastMove[1],lastMove[2],true);
    } else {
      addRoom(lastMove[1],lastMove[2],lastMove[1]+lastMove[3]-1,lastMove[2]+lastMove[4]-1,true);
    }
    updateBoardStatus();
    drawBoard();
  }
}

function drawDragRoom(y,x) {
  let dragRoom = getRoom(y,x,playState.pinCellY,playState.pinCellX);
  // draw all tiles with dragRoomCell color
  for (let iy=dragRoom[0];iy<(dragRoom[0]+dragRoom[2]);iy++) {
    for (let ix=dragRoom[1];ix<(dragRoom[1]+dragRoom[3]);ix++) {
      drawTile(iy,ix,
               dragRoomCellColor,
               globalBoardValues[iy][ix],
               globalTextBold[iy][ix],
               globalCircleStates[iy][ix],
               globalCircleColors[iy][ix],
               globalLineStates[iy][ix],
               globalLineColors[iy][ix],
               false,
               globalBoardTextColors[iy][ix]);
    }
  }
  // draw horizontal walls
  for (let ix=dragRoom[1]*2+1;ix<(dragRoom[1]+dragRoom[3])*2;ix+=2) {
    let iy = dragRoom[0]*2;
    drawWall(constHoriz,iy,ix,constWallBorder,dragRoomLineColor,constLineColor);
    iy += dragRoom[2]*2;
    drawWall(constHoriz,iy,ix,constWallBorder,dragRoomLineColor,constLineColor);
  }
  // draw vertical walls
  for (let iy=dragRoom[0]*2+1;iy<(dragRoom[0]+dragRoom[2])*2;iy+=2) {
    let ix = dragRoom[1]*2;
    drawWall(constVert,iy,ix,constWallBorder,dragRoomLineColor,constLineColor);
    ix += dragRoom[3]*2;
    drawWall(constVert,iy,ix,constWallBorder,dragRoomLineColor,constLineColor);
  }
}

function updateDemoRegion(demoNum) {
  globalCursorOn = false;
  updateDemoFunction(demoNum,function () {
    // start by reseting the room list
    puzzleRoomList = new Array();
  }, function (steps) {
    let action = steps[0];
    let isAdd = (action == 'A');
    let y0 = parseInt(steps[1],36);
    let x0 = parseInt(steps[2],36);
    if (isAdd) {
      let y1 = parseInt(steps[3],36)+y0-1;
      let x1 = parseInt(steps[4],36)+x0-1;
      addRoom(y0,x0,y1,x1);
    } else {
      deleteRoom(y0,x0);
    }
  }, function () {
    globalWallStates = initWallStatesFromRooms(puzzleRoomList,constWallDash);
  });
}
