const emptyCellColor     = "white";         // not-filled
const stdFontColor       = "white";
const dragRoomLineColor  = "#c080c0";
const dragRoomCellColor  = "#ffb0ff80";
const correctRoomColor   = "#c0ffc0";
const incorrectRoomColor = "#ffc0c0";

const constMoveAddRoom = 1;
const constMoveDelRoom = 2;

let clicking = false;
let dragging = false;
let shifting = false;
let errorCount = 0;
let incompleteCount = 0;
let assistState = 0;
let curClickType = CLICK_UNKNOWN;
let curPinCellY = 0;
let curPinCellX = 0;
let debugMode = false;

// which keys are handled, letters and numbers handled algorithmically afterwards
let handledKeys =
  [ KEY_BS, KEY_CR, KEY_ESC, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleRoomList;

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
      curPinCellY = globalCursorY;
      curPinCellX = globalCursorX;
    } else if (handledKeys.find(element => element == evnt.which)) {
      handleKey(evnt.which);
    }
  });

  $(document).keyup(function(evnt) {
    if (evnt.which == KEY_SHIFT) {
      shifting = false;
      // if have created a rectangle, convert it to a room
      addRoom(curPinCellY,curPinCellX,globalCursorY,globalCursorX);
      updateBoardStatus();
      drawBoard();
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
    // if have created a rectangle, convert it to a room
    if (dragging && (curClickType==CLICK_LEFT)) {
      addRoom(curPinCellY,curPinCellX,globalCursorY,globalCursorX);
      updateBoardStatus();
      drawBoard();
    }
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
      etext = "the puzzle is complete!!";
    }
  } else {
    if (errorCount || incompleteCount) {
      etext = "there are " + errorCount + " errors and " +
                        incompleteCount + " incomplete numbers";
    } else {
      etext = "the puzzle is complete!!";
    }
  }
  updateDynamicHtmlEntries(etext,assistState);
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
  } else if (focusedElement && focusedElement.id != "userPuzzle") {
    switch (keynum) {
      case KEY_ESC:
        console.log(globalBoardValues);
        console.log(globalWallStates);
        console.log(puzzleRoomList);
        debugMode = true;
        break;
      case KEY_UP:    if (globalCursorY)                        globalCursorY--; break;
      case KEY_DOWN:  if (globalCursorY < (globalPuzzleH-1))    globalCursorY++; break;
      case KEY_LEFT:  if (globalCursorX)                        globalCursorX--; break;
      case KEY_RIGHT: if (globalCursorX < (globalPuzzleW-1))    globalCursorX++; break;
      case KEY_BS:
        deleteRoom(globalCursorY,globalCursorX);
        break;
    }
    updateBoardStatus();
    drawBoard();
    // if shifting, draw this room afterwards as pink rectangle
    if (shifting && (keynum >= KEY_LEFT) && (keynum <= KEY_DOWN)) {
      drawDragRoom(globalCursorY,globalCursorX);
    }
  }
}

function initStructures(puzzle) {
  $("#canvasDiv").css("border-color", "black");
  moveHistory = new Array();
  // get the size and the digits out of the puzzle entry
  let puzzleSplit = puzzle.split(":");
  let size = puzzleSplit[0];
  let numParams = puzzleSplit[1];
  let roomParams = puzzleSplit[2];

  basicInitStructures(size,emptyCellColor,constWallDash,constWallStandard,stdFontColor);

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
        globalCircleStates[y][x] = CIRCLE_BLACK;
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

function removeDot(strval) {
  return strval.replace(/\./gi, "");
}

function handleClick(evnt) {
  globalCursorOn = true;
  $("#userPuzzleField").blur();
  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [ yCell, xCell, isCorner, isEdge, yEdge, xEdge ] = getClickCellInfo(evnt, "puzzleCanvas");

  if (!dragging) {
    curClickType = clickType(evnt);
    curPinCellY = yCell;
    curPinCellX = xCell;
  }

  // ignoring middle click
  if (curClickType == CLICK_MIDDLE) return;
  // dragging room, but no move yet 
  if (dragging && (yCell == globalCursorY) && (xCell == globalCursorX)) return;
  // dragging room, but on a wall or corner
  if (dragging && (isEdge || isCorner)) return;
  // ignore dragging right clicks
  if (dragging && (curClickType == CLICK_RIGHT)) return;
  
  globalCursorY = yCell;
  globalCursorX = xCell;

  // if right-clicking, remove any pre-existing room
  if (curClickType == CLICK_RIGHT) {
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
  errorCount = 0;

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
      if (assistState==2) {
        // color as correct
        for (let iy=room[0];iy<(room[0]+room[2]);iy++) {
          for (let ix=room[1];ix<(room[1]+room[3]);ix++) {
            globalBoardColors[iy][ix] = correctRoomColor;
          }
        }
      }
    } else {
      errorCount++;
      if (assistState==2) {
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
  if ((errorCount == 0) && (incompleteCount == 0)) {
    canvasSuccess();
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

function resetBoard() {
  $("#resetButton").blur();
  $("#assistButton").blur();
  initStructures(puzzle);
}

function drawDragRoom(y,x) {
  let dragRoom = getRoom(y,x,curPinCellY,curPinCellX);
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
  let dtext  = (demoNum==1) ?  demoText[0] :  demoText[1];
  let dmoves = (demoNum==1) ? demoMoves[0] : demoMoves[1];
  if (demoStepNum < dtext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHtmlText('demotext', dtext[demoStepNum]);
    // start by reseting the room list
    puzzleRoomList = new Array();
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      for (let drooms of dmoves[step]) {
        let droom = drooms.split("");
        let action = droom[0];
        let isAdd = (action == 'A');
        let y0 = parseInt(droom[1],36);
        let x0 = parseInt(droom[2],36);
        if (isAdd) {
          let y1 = parseInt(droom[3],36)+y0-1;
          let x1 = parseInt(droom[4],36)+x0-1;
          addRoom(y0,x0,y1,x1);
        } else {
          deleteRoom(y0,x0);
        }
      }
    }
    globalWallStates = initWallStatesFromRooms(puzzleRoomList,constWallDash);
    updateBoardStatus();
    drawBoard();
  }
}
