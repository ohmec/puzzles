const emptyCellColor = "white";         // not-filled
const indetCellColor = "#e0e0e0";       // indeterminant color (default)
const fillCellColor = "#000040";        // filled, slightly dark blue to contrast with black walls
const incorrectCellColor = "#802020";   // dark reddish
const tooLongSpanColor = "#FFC0C0";     // light reddish
const incorrectRiverColor = "#FFE0A0";  // light brown

const stdFontColor = "black";
const offFontColor = "white";
const errorFontColor = "red";
const correctFontColor = "green";

let clicking = false;
let dragging = false;
let errorCount = 0;
let incompleteCount = 0;
let assistState = 0;

const STATE_WHITE = 1;
const STATE_BLACK = 2;
const STATE_INDET = 3;

// which keys are handled
let handledKeys = [ KEY_BS, KEY_CR, KEY_SP, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_0, KEY_1, ALT_0, ALT_1 ];

let initPuzzle, puzzle, moveHistory, demoStepNum, puzzleRoomList, puzzleBoardStates;

function puzzleInit() {
  globalCursorOn = true;

  // any key anywhere as long as canvas is in focus
  $(document).keydown(function(evnt) {
    $("#saveButton").blur();
    $("#loadButton").blur();
    $("#resetButton").blur();
    $("#showButton").blur();
    $("#undoButton").blur();
    $("#assistButton").blur();
    if (evnt.which === KEY_SP && !$(evnt.target).is("input")) {
      evnt.preventDefault();
    }
    if (evnt.which >= KEY_LEFT && evnt.which <= KEY_DOWN && !$(evnt.target).is("input, textarea")) {
      evnt.preventDefault();
    }
    if (handledKeys.find(element => element == evnt.which)) {
      handleKey(evnt.which);
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
    $("#userSolvePuzzle").val("");
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

  // click (down) within puzzle frame, find out if contains number already
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
      etext = "there are errors and incomplete rooms";
    } else if (errorCount) {
      etext = "there are errors";
    } else if (incompleteCount) {
      etext = "there are incomplete rooms";
    } else {
      etext = "there are no errors nor incomplete rooms";
    }
  } else {
    etext = "there are " + errorCount + " errors and " +
                      incompleteCount + " incomplete rooms";
  }
  updateDynamicHtmlEntries(etext,assistState);
}

function addHistory(y,x,prevvalue,newvalue) {
  moveHistory.push([y,x,prevvalue,newvalue]);
}

function addMove(moveType,y,x) {
  addHistory(y,x,puzzleBoardStates[y][x],moveType);
  puzzleBoardStates[y][x] = moveType;
  // colors will be overridden based upon error status
  globalBoardColors[y][x] =
    (moveType == STATE_WHITE) ? emptyCellColor :
    (moveType == STATE_BLACK) ? fillCellColor :
                                indetCellColor;
  globalBoardTextColors[y][x] = (moveType == STATE_BLACK) ? offFontColor : stdFontColor;
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
      case KEY_UP:
        if (globalCursorY) {
          globalCursorY--;
        }
        break;
      case KEY_DOWN:
        if (globalCursorY < (globalPuzzleH-1)) {
          globalCursorY++;
        }
        break;
      case KEY_LEFT:
        if (globalCursorX) {
          globalCursorX--;
        }
        break;
      case KEY_RIGHT:
        if (globalCursorX < (globalPuzzleW-1)) {
          globalCursorX++;
        }
        break;
      case KEY_SP: // toggle through states like the click
        if (puzzleBoardStates[globalCursorY][globalCursorX] == STATE_INDET) {
          addMove(STATE_BLACK,globalCursorY,globalCursorX);
        } else if (puzzleBoardStates[globalCursorY][globalCursorX] == STATE_BLACK) {
          addMove(STATE_WHITE,globalCursorY,globalCursorX);
        } else {
          addMove(STATE_INDET,globalCursorY,globalCursorX);
        }
        break;
      case KEY_BS:
        addMove(STATE_INDET,globalCursorY,globalCursorX);
        break;
      case KEY_0:
      case ALT_0:
        addMove(STATE_WHITE,globalCursorY,globalCursorX);
        break;
      case KEY_1:
      case ALT_1:
        addMove(STATE_BLACK,globalCursorY,globalCursorX);
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
  let wxh = size.split("x");
  let roomParams = puzzleSplit[1];
  let hexParams = puzzleSplit[2];
  globalPuzzleW = parseInt(wxh[0]);
  globalPuzzleH = parseInt(wxh[1]);
  setGridSize(globalPuzzleW);
  canvas.height = globalPuzzleH*globalGridSize;
  canvas.width  = globalPuzzleW*globalGridSize;

  globalInitBoardValues = initBoardValuesFromBoxes(roomParams);
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  globalCircleStates =    initYXFromValue(0);     // no circles, lines needed in this puzzle
  globalLineStates   =    initYXFromValue(0);
  globalBoardColors =     initYXFromValue(indetCellColor);
  puzzleBoardStates =     initYXFromValue(STATE_INDET);
  globalBoardTextColors = initYXFromValue(stdFontColor); // all text is black
  globalBoardLineColors = initYXFromValue("black"); // default line is black

  // override board colors if the hexParams are included, just for 0th
  // entry of the puzzles (example completed puzzle). this uses hex values
  // to define the black (1) or white (0) states
  if (hexParams) {
    let stateHexes = hexParams.split("");
    for (let y=0;y<globalPuzzleH;y++) {
      for (let x=0;x<globalPuzzleW;x++) {
        let stateHex = stateHexes[y*Math.ceil(globalPuzzleW/4)+Math.floor(x/4)];
        let stateTrue = (parseInt(stateHex,16) & (1<<(3-(x%4)))) ? 1 : 0;
        puzzleBoardStates[y][x] = stateTrue ? STATE_BLACK : STATE_WHITE;
      }
    }
  }

  // initialize the wall states based upon the room parameters
  globalInitWallStates  = initWallStatesFromBoxes(roomParams, constWallLight);
  globalWallStates = initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);
  puzzleRoomList  = initRoomsFromBoxes(roomParams);
  updateBoardStatus();
  drawBoard();
}

function removeDot(strval) {
  return strval.replace(/\./gi, "");
}

function findPosition(evnt, canvas) {
  let canvasElement = document.getElementById(canvas);
  let x = evnt.pageX-$(canvasElement).offset().left-parseInt($(canvasElement).css("border-left-width"));
  let y = evnt.pageY-$(canvasElement).offset().top-parseInt( $(canvasElement).css("border-top-width"));
  return x+","+y;
}

function handleClick(evnt) {
  if (!dragging) {
    curClickType = clickType(evnt);
  }
  $("#userPuzzleField").blur();
  let coords = findPosition(evnt, "puzzleCanvas");
  coords = coords.split(",");
  let yCell, xCell, isEdge, yEdge, xEdge;
  [ yCell, xCell, isEdge, yEdge, xEdge ] = getClickCellInfo(coords);

  // dragging, but no move yet 
  if (dragging && ((yCell == globalCursorY) && (xCell == globalCursorX))) {
    return;
  }
  
  globalCursorY = yCell;
  globalCursorX = xCell;

  // left sets to black, right sets to white, middle sets to indet
  // ignore if already the same state
  if ((curClickType == CLICK_LEFT)   && puzzleBoardStates[yCell][xCell] != STATE_BLACK) {
    addMove(STATE_BLACK,yCell,xCell);
  }
  if ((curClickType == CLICK_MIDDLE) && puzzleBoardStates[yCell][xCell] != STATE_INDET) {
    addMove(STATE_INDET,yCell,xCell);
  }
  if ((curClickType == CLICK_RIGHT)  && puzzleBoardStates[yCell][xCell] != STATE_WHITE) {
    addMove(STATE_WHITE,yCell,xCell);
  }

  updateBoardStatus();
  drawBoard();
}

// look for errors and incompletions
function updateBoardStatus() {
  // accounting the errors:
  //  1) too many set squares in a room with a number
  //  2) two black cells next to each other
  //  3) a white span that goes across 3 rooms
  //  4) white spans that are "blocked" from making a long river
  //
  // also count the incomplete rooms, which are rooms
  // that don't have the correct number of black squares
  errorCount = 0;
  let incompleteRooms = new Array();
  incompleteCount = 0;

  // start by reseting all cell and font colors to "standard"
  // before evaluating errors
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] == STATE_BLACK) {
        globalBoardColors[y][x] = fillCellColor;
        globalBoardTextColors[y][x] = offFontColor;
      } else if (puzzleBoardStates[y][x] == STATE_WHITE) {
        globalBoardColors[y][x] = emptyCellColor;
        globalBoardTextColors[y][x] = stdFontColor;
      } else {
        globalBoardColors[y][x] = indetCellColor;
        globalBoardTextColors[y][x] = stdFontColor;
      }
    }
  }

  // look for incomplete rooms, and rule 1 accounting of digits
  // within rooms
  for (let p=0;p<puzzleRoomList.length;p++) {
    let roomInfo = puzzleRoomList[p];
    let roomCount = roomInfo[4];
    let bcount = 0;
    let isIncomplete = 0;
    for (let y=roomInfo[0];y<(roomInfo[0]+roomInfo[2]);y++) {
      for (let x=roomInfo[1];x<(roomInfo[1]+roomInfo[3]);x++) {
        if (puzzleBoardStates[y][x] == STATE_BLACK) {
          bcount++;
        } else if (puzzleBoardStates[y][x] == STATE_INDET) {
          isIncomplete = 1;
        }
      }
    }
    if ((roomCount != EMPTYCELL) && (bcount > roomCount)) {
      errorCount++;
    }
    if (isIncomplete) {
      incompleteCount++;
    }
    // if isn't incomplete, also count errors if < expected count
    if (!isIncomplete && (roomCount != EMPTYCELL) && (bcount < roomCount)) {
      errorCount++;
    }
    // if is complete and room count is off and in assist mode 2,
    // turn any digit inside red. if complete and correct, turn
    // green. since this needs to be undoable, we need to set it
    // to black in all other cases
    for (let y=roomInfo[0];y<(roomInfo[0]+roomInfo[2]);y++) {
      for (let x=roomInfo[1];x<(roomInfo[1]+roomInfo[3]);x++) {
        if ((globalBoardValues[y][x] == "0") || (globalBoardValues[y][x] != "")) {
          if (!isIncomplete && (roomCount != EMPTYCELL) && (assistState == 2)) {
            globalBoardTextColors[y][x] =
              (bcount == roomCount) ? correctFontColor : errorFontColor;
          } else {
            globalBoardTextColors[y][x] =
              (puzzleBoardStates[y][x] == STATE_BLACK) ?
                offFontColor : stdFontColor;
          }
        }
      }
    }
  }

  // rule 2: now count adjacent black cells, only counting
  // one error per "clump". in assist mode 2 these error
  // cells should be colored to indicate the error.
  let filledCells = new Array();
  for (let y=0;y<(globalPuzzleH-1);y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((puzzleBoardStates[y  ][x] == STATE_BLACK) &&
          (puzzleBoardStates[y+1][x] == STATE_BLACK)) {
        errorCount++;
        if (assistState == 2) {
          globalBoardColors[y  ][x] = incorrectCellColor;
          globalBoardColors[y+1][x] = incorrectCellColor;
        }
      }
    }
  }
  for (let x=0;x<(globalPuzzleW-1);x++) {
    for (let y=0;y<globalPuzzleH;y++) {
      if ((puzzleBoardStates[y][x  ] == STATE_BLACK) &&
          (puzzleBoardStates[y][x+1] == STATE_BLACK)) {
        errorCount++;
        if (assistState == 2) {
          globalBoardColors[y][x  ] = incorrectCellColor;
          globalBoardColors[y][x+1] = incorrectCellColor;
        }
      }
    }
  }

  // rule 3: look for too many crossings of room walls
  // for contiguous white cells. if in assist mode 2,
  // color the walls differently to indicate the error

  // start horizontally
  for (let y=0;y<globalPuzzleH;y++) {
    let inwhite = false;
    let crossings = 0;
    let x0;
    for (let x=0;x<globalPuzzleW;x++) {
      if (puzzleBoardStates[y][x] == STATE_WHITE) {
        if (inwhite) {
          if (globalWallStates[2*y+1][2*x] == constWallBorder) {
            crossings++;
            if (crossings==2) {
              errorCount++;
              if (assistState==2) {
                for (let xi=x0;xi<=x;xi++) {
                  globalBoardColors[y][xi] = tooLongSpanColor;
                }
              }
            } else if ((assistState==2) && (crossings>=2)) {
              globalBoardColors[y][x] = tooLongSpanColor;
            }
          } else if ((assistState==2) && (crossings>=2)) {
            globalBoardColors[y][x] = tooLongSpanColor;
          }
        } else {
          inwhite = true;
          crossings = 0;
          x0 = x;
        }
      } else {
        inwhite = false;
        crossings = 0;
      }
    }
  }

  // now vertically
  for (let x=0;x<globalPuzzleW;x++) {
    let inwhite = false;
    let crossings = 0;
    let y0;
    for (let y=0;y<globalPuzzleH;y++) {
      if (puzzleBoardStates[y][x] == STATE_WHITE) {
        if (inwhite) {
          if (globalWallStates[2*y][2*x+1] == constWallBorder) {
            crossings++;
            if (crossings==2) {
              errorCount++;
              if (assistState==2) {
                for (let yi=y0;yi<=y;yi++) {
                  globalBoardColors[yi][x] = tooLongSpanColor;
                }
              }
            } else if ((assistState==2) && (crossings>=2)) {
              globalBoardColors[y][x] = tooLongSpanColor;
            }
          } else if ((assistState==2) && (crossings>=2)) {
            globalBoardColors[y][x] = tooLongSpanColor;
          }
        } else {
          inwhite = true;
          crossings = 0;
          y0 = y;
        }
      } else {
        inwhite = false;
        crossings = 0;
      }
    }
  }

  // now rule 4: check for stranded rivers. make sure to not
  // consider indeterminant cells as blocking
  let unfilledCells = new Array();
  let riverCount = 0;
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if ((puzzleBoardStates[y][x] != STATE_BLACK) &&
          (unfilledCells.indexOf(y+","+x) == -1)) {
        let visitedCells = travelRiver(puzzleBoardStates,y,x,false,STATE_BLACK);
        if (riverCount) {
          errorCount++;
          // if in assistState==2 then color these second river
          // cells differently
          if (assistState==2) {
            for (let i=0;i<visitedCells.length;i++) {
              let curCell = visitedCells[i].split(",");
              let iy = curCell[0];
              let ix = curCell[1];
              globalBoardColors[iy][ix] = incorrectRiverColor;
            }
          }
        }
        unfilledCells.push.apply(unfilledCells, visitedCells);
        riverCount++;
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
    puzzleBoardStates[lastMove[0]][lastMove[1]] = lastMove[2];
    updateBoardStatus();
    drawBoard();
  }
}

function resetBoard() {
  $("#resetButton").blur();
  $("#showButton").blur();
  $("#assistButton").blur();
  initStructures(puzzle);
}

function updateDemoRegion(demoNum) {
  let demotext, demomoves;
  // for brevity in the demo steps below, use B and W for black and white
  if (demoNum==1) {
    demotext = [
      "<p>In this demo we will walk through the steps of solving this puzzle. " +
        "Press the 'next' button to walk through the solving steps, or the " +
        "'back' button to return to the previous step.</p>" +
        "<p>At the beginning of a solve, there are no errors, but there are " +
        "many incomplete rooms. For our first time through we can " +
        "turn on Assist Mode 2 to see any errors that we might generate in the " +
        "process of the solve.</p>",
      "In Heyawake, it is always easiest to solve two types of rooms: those " +
        "where there is only solution (e.g. single-square rooms with a '1' " +
        "digit within, or a 3-wide or 3-tall room with a '2' digit within.) " +
        "There are two of the 2-digit variety on this board. We can also " +
        "go ahead and clear out all rooms with a zero digit inside.",
      "Always in Heyawake the next step after setting any cell black is " +
        "set all neighboring cells white so as to not violate rule 2 of the " +
        "puzzle involving adjoining black cells. We will do that now and for " +
        "all subsequent black cells.",
      "<p>Now let's look at two interesting edge cases that are similar to the " +
        "minimum-sized room attack. First, the '2' digit room in the upper " +
        "right of the puzzle: there are only two legal arrangements of the " +
        "two black squares required, effectively a diagonal in one of two " +
        "directions. Considering rule 4 about not isolating the 'river of " +
        "white cells', you can quickly determine that only the diagonal " +
        "pointing into the center of the puzzle board is legal.</p><p>" +
        "Similarly, let's look at the '3' digit room near the upper left. " +
        "This also has only two possible arrangements of the three black " +
        "squares, and only one of them is legal so as to not violate rule 4. " +
        "We can paint these squares black and their surrounding squares white.",
      "OK now we can begin to take advantage of the other cells that could " +
        "otherwise be potentially violating rule 4 about the continuous river " +
        "of white cells. Several cells that are currently white on the edges " +
        "of the board would be isolated if their neighbors were painted black. " +
        "One example is the cell below the upper left square. If that square " +
        "were painted black, the one below would be isolated, and thus the " +
        "upper left must be set to white. Similarly there are 7 more cells " +
        "that must be white to avoid isolation of their neighbors. We must " +
        "be careful to not make any false assumptions in this process, rivers " +
        "can flow in multiple directions, so do not clear too many squares.",
      "Once these cells are determined, the '2' digit room in the upper " +
        "portion of the board is reduced to a 'minimalist state', i.e. there " +
        "is only one arrangement of black squares to complete it.",
      "Now we can begin to see some potential trouble with rule 3, the one that " + 
        "requires that no string of white cells can pass through three consecutive " +
        "rooms. Looking at the right-most columns, we can see that the black " +
        "cell in the 5th row, must be set to black, else it will violate the " +
        "border rule. Once that is set (and its adjacent cells cleared) it is " +
        "clear that the cell near the bottom right corner must also be set to " +
        "avoid another rule 3 violation.",
      "Another rule 3 violation is nearing in the 5th row from the top on the " +
        "right side. We can set that cell to black to avoid violation.",
      "At this time the 4x2 room in the upper half has three potential spots  " +
        "remaining for its 2 black squares. Clearly one of them would isolate " +
        "a white cell and thus violate rule 4. The other two can be set.",
      "There is a large 'river' of white squares potentially blocked above a " +
        "black square in the 6th row 4th column. It must be set to white.",
      "Now there are two black cells that must be set to keep from violating " +
        "the three-room rule. Once those two are set, and their neighbors cleared, " +
        "it is complete.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      [],
      ["B35","B55","B70","B72","W56","W57","W66","W67","W77"],
      ["W25","W34","W36","W45","W54","W65","W60","W71","W62","W73"],
      ["B07","B16","B11","B20","B31","W06","W15","W17","W26","W01","W10","W12","W21","W30","W32","W41"],
      ["W00","W02","W05","W27","W22","W40","W61"],
      ["B04","B24","W03","W14","W23"],
      ["B47","W37","W46","B76","W75"],
      ["B44","W43"],
      ["B13","W33","B42","W52"],
      ["W53"],
      ["B51","B63","W50","W64","W74"],[]];
  } else {
    demotext = [
      "<p>In this demo we will walk more quickly through the steps of solving " +
        "this puzzle. It is recommended to go through demo 1 first. Press the " +
        "'next' button to walk through the solving steps, or the 'back' button " +
        "to return to the previous step. You can also use the undo button to move " +
        "backwards individual steps, or continue playing forward if you wish.</p>" +
        "<p>The first thing to do is to turn on the assist mode to let us know " +
        "which rooms still need completion. Then there are several 'minimalistic' " +
        "rooms (those with only one choice of black cell arrangements), and zero " +
        "rooms that we can solve immediately, setting neighbors of black cells " +
        "to white in the process.</p>",
      "Now we can see two 3-rooms that have only one possible arrangement that " +
        "doesn't isolate their white cells, and a 1-cell in the bottom row that " +
        "only have one remaining cell to set black. Once that is set its " +
        "neighbor to the right can be completed as well.",
      "We can see some white cells at risk of being isolated, so their neighbors " +
        "need to be set to white to keep the river flowing.",
      "Now we can see several potential rule 3 violations pending, requiring the " +
        "edges of the consecutive squares to be set to black to avoid violating " +
        "the three consecutive rooms of white squares rule.",
      "The two remaining 3-rooms are now deterministic, and can be set.",
      "Back again to preventing rule 4 violations, certain cells can be set to " +
        "white to not block their neighbors.",
      "Two cells must be set to black to avoid violating rule 3",
      "Either of the final two undetermined squares could be used to keep the " +
        "left column from being a long string of which cells, however setting " +
        "the upper one to black would isolate the corner from the rest of the " +
        "white stream.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      ["W01","W08","W09","W11","W16","W17","W26","W27","W36","W37","W70",
       "W80","W90","W87","W88","W89","W12","W13","W22","W23","W32","W33",
       "B06","W05","W07","W16","B81","W71","W82","W91","B86","W76","W85",
       "W96","B97","B99","W98"],
      ["B18","B29","B38","W19","W28","W39","W48","B92","W93","B94","W84",
       "W95","B67","B78","B69","W57","W66","W68","W59","W77","W79"],
      ["W49","W58","W83"],
      ["B10","B14","B47","B72","B75","W00","W20","W04","W15","W24","W62",
       "W46","W73","W65","W74","B02","W03","B21","W31","B43","W42","W44",
       "W53"],
      ["B25","B34","W35","B52","B63","W51","W64"],
      ["W30","W57","W54","W56","W61"],
      ["B55","W45","B41","W40"],
      ["B60","W50"]];
  }
  if (demoStepNum < demotext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHtmlText('demotext', demotext[demoStepNum]);
    puzzleBoardStates = initYXFromValue(STATE_INDET);
    globalBoardColors = initYXFromValue(indetCellColor);
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      let demosteps = demomoves[step];
      for (let i=0;i<demosteps.length;i++) {
        let steps = demosteps[i].split("");
        let s0 = (steps[0] == 'W') ? STATE_WHITE : STATE_BLACK;
        addMove(s0,steps[1],steps[2]);
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}

function fdelay(num) {
  let now = new Date();
  let stop = now.getTime() + num;
  while (true) {
    now = new Date();
    if (now.getTime() > stop) {
      return;
    }
  }
}
