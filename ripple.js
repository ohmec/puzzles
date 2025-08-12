
let emptyCellColor = "white";         // default
let fillCellColor = "black";          // default
let completeFillColor = "#e0ffe0";    // light green
let errorFontColor = "red";
let clicking = false;
let dragging = false;
let errorCount = 0;
let incompleteCount = 0;
let assistState = 0;

const MOVE_CLEAR  = 1;
const MOVE_SET    = 2;

// the digits and letters are added below
let handledKeys = [ KEY_BS, KEY_CR, KEY_SP, KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN ];

let initPuzzle, puzzle, moveHistory;
let boardStates, demoStepNum, puzzleRoomList, largestPolyo;

function puzzleInit() {
  globalCursorOn = true;

  // add digits and letters to handled key list
  for (let key=KEY_1;key<=KEY_9;key++) {
    handledKeys.push(key);
  }
  for (let key=ALT_1;key<=ALT_9;key++) {
    handledKeys.push(key);
  }
  for (let key=KEY_a;key<=KEY_z;key++) {
    handledKeys.push(key);
  }
  for (let key=KEY_A;key<=KEY_Z;key++) {
    handledKeys.push(key);
  }

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
    let pval = $("#userPuzzle").val();
    if (pval.search(/:/) == -1) {
      if (pval < cannedPuzzles.length) {
        puzzleChoice = pval;
        initPuzzle = cannedPuzzles[pval];
        updateHtmlDescr(initPuzzle);
        puzzle = removeDot(initPuzzle);
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

function addMove(y,x,value) {
  addHistory(y,x,globalBoardValues[y][x],value);
  globalBoardValues[y][x] = value;
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
      case KEY_BS:
      case KEY_SP: // clear the board contents unless default
        // don't delete those that are pre-set
        if (globalInitBoardValues[globalCursorY][globalCursorX] == '') {
          addMove(globalCursorY,globalCursorX,'');
        }
        break;
      default:    // here we handle all digit keys including A-Z
        // don't overwrite those that are pre-set
        let setValue = 0;
        if (globalInitBoardValues[globalCursorY][globalCursorX] == '') {
          if (keynum >= KEY_1 && keynum <= KEY_9) {
            setValue = keynum-KEY_0;
          } else if (keynum >= ALT_1 && keynum <= ALT_9) {
            setValue = keynum-ALT_0;
          } else if(keynum >= KEY_a && keynum <= KEY_z) {
            setValue = keynum-KEY_a+10;
          } else {
            setValue = keynum-KEY_A+10;
          }
        }
        if (setValue && setValue <= largestPolyo) {
          addMove(globalCursorY,globalCursorX,setValue);
        }
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
  let numParams = puzzleSplit[1];
  let rwallParams = puzzleSplit[2];
  let cwallParams = puzzleSplit[3];
  globalPuzzleW = parseInt(wxh[0]);
  globalPuzzleH = parseInt(wxh[1]);
  setGridSize(globalPuzzleW);
  canvas.height = globalPuzzleH*globalGridSize;
  canvas.width  = globalPuzzleW*globalGridSize;

  globalInitBoardValues = initBoardValuesFromParams(numParams);
  globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
  globalCircleStates =    initYXFromValue(0);     // no circles, lines needed in this puzzle
  globalLineStates   =    initYXFromValue(0);
  globalBoardColors =     initYXFromValue(emptyCellColor);
  globalBoardTextColors = initYXFromValue(fillCellColor); // all text is black
  globalLineColors =      initYXFromValue("black"); // default line is black
  globalCircleColors =    initYXFromValue("black");

  // initialize the wall states based upon the given parameters
  globalInitWallStates  = initWallStatesFromHexes(rwallParams, cwallParams, constWallLight);
  globalWallStates = initYXFromArray(globalPuzzleH*2+1,globalPuzzleW*2+1,globalInitWallStates);

  // find all the rooms
  puzzleRoomList = findRooms();
  largestPolyo = 0;
  for (let i=0;i<puzzleRoomList.length;i++) {
    if (puzzleRoomList[i].length > largestPolyo) {
      largestPolyo = puzzleRoomList[i].length;
    }
  }
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
  let tileColor;
  $("#userPuzzleField").blur();
  let coords = findPosition(evnt, "puzzleCanvas");
  coords = coords.split(",");
  let yCell, xCell, isEdge, yEdge, xEdge;
  [ yCell, xCell, isEdge, yEdge, xEdge ] = getClickCellInfo(coords);
  
  globalCursorY = yCell;
  globalCursorX = xCell;
  drawBoard();
}

// look for errors and incompletions
function updateBoardStatus() {
  // accounting the errors:
  //  1) duplicates of a digit in a room
  //  2) too large of a value in a room
  //  3) two digits too close to each other
  // also count the incompletes, which are rooms
  // that don't have all of the digits filled correctly
  let errorCells = new Array();
  let incompleteRooms = new Array();
  incompleteCount = 0;

  for (let p=0;p<puzzleRoomList.length;p++) {
    let room = puzzleRoomList[p];
    let vcounts = new Array();
    for (let i=1;i<=room.length;i++) {
      vcounts[i] = 0;
    }
    for (let i=0;i<room.length;i++) {
      let pcell = room[i].split(",");
      let py = pcell[0];
      let px = pcell[1];
      let pv = globalBoardValues[py][px];
      if (pv > room.length && (errorCells.indexOf(pcell) == -1)) {
        errorCells.push(room[i]);
      }
      vcounts[pv]++;
    }
    for (let c=1;c<=room.length;c++) {
      // if more than one, mark all in the room with that number in error
      if (vcounts[c] > 1) {
        for (let i=0;i<room.length;i++) {
          let pcell = room[i].split(",");
          let py = pcell[0];
          let px = pcell[1];
          let pv = globalBoardValues[py][px];
          if ((pv == c) && (errorCells.indexOf(pcell) == -1)) {
            errorCells.push(room[i]);
          }
        }
      // if zero, then this is an incomplete room
      } else if (vcounts[c] == 0) {
        if (incompleteRooms.indexOf(p) == -1) {
          incompleteRooms.push(p);
        }
      }
    }
  }

  // now check the ripple effect. only need to go in the positive
  // direction so as to not double count
  for (let y=0;y<globalPuzzleH;y++) {
    for (let x=0;x<globalPuzzleW;x++) {
      if (globalBoardValues[y][x]) {
        // count forward in both directions and look for duplicates
        for (let i=1;i<=globalBoardValues[y][x];i++) {
          let xi = x+i;
          let yi = y+i;
          let cellyx  = y +","+x;
          let cellyxi = y +","+xi;
          let cellyix = yi+","+x;
          if ((xi < globalPuzzleW) &&
              (globalBoardValues[y][xi] == globalBoardValues[y][x])) {
            if (errorCells.indexOf(cellyx) == -1) {
              errorCells.push(cellyx);
            }
            if (errorCells.indexOf(cellyxi) == -1) {
              errorCells.push(cellyxi);
            }
          }
          if ((yi < globalPuzzleH) &&
              (globalBoardValues[yi][x] == globalBoardValues[y][x])) {
            if (errorCells.indexOf(cellyx) == -1) {
              errorCells.push(cellyx);
            }
            if (errorCells.indexOf(cellyix) == -1) {
              errorCells.push(cellyix);
            }
          }
        }
      }
    }
  }

  // in assistState 2, color completed rooms light green,
  // and error cells with red font
  for (let p=0;p<puzzleRoomList.length;p++) {
    let room = puzzleRoomList[p];
    for (let i=0;i<room.length;i++) {
      let pcell = room[i].split(",");
      let py = pcell[0];
      let px = pcell[1];
      if ((assistState == 2) && (incompleteRooms.indexOf(p) == -1)) {
        globalBoardColors[py][px] = completeFillColor;
      } else {
        globalBoardColors[py][px] = emptyCellColor;
      }
      if ((assistState == 2) && (errorCells.indexOf(room[i]) != -1)) {
        globalBoardTextColors[py][px] = errorFontColor;
      } else {
        globalBoardTextColors[py][px] = fillCellColor;
      }
    }
  }

  errorCount = errorCells.length;
  incompleteCount = incompleteRooms.length;
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
    globalBoardValues[lastMove[0]][lastMove[1]] = lastMove[2];
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
  if (demoNum==1) {
    demotext = [
      "<p>In this demo we will walk through the steps of solving this puzzle. " +
        "Press the 'next' button to walk through the solving steps, or the " +
        "'back' button to return to the previous step.</p>" +
        "<p>At the beginning of a solve, there are no errors, but there are " +
        "many incomplete rooms (polyominos). For our first time through we can " +
        "turn on Assist Mode 2 to see any errors that we might generate in the " +
        "process of the solve.</p>",
      "Easy ones to knock out single-tile rooms, where the only solution " +
        "is to insert a '1' into the box.",
      "Now that these are inserted, it is clear where to place some other '1' " +
        "digits in adjacent rooms so as to not violate the second rule about " +
        "adjacent digits within their distance.",
      "We can now place a '2' to complete the 2-wide room above the bottom " +
        "right room, then then complete that bottom right room given that the " +
        "'2' forces its digit arrangement.",
      "Now that the '3' is placed in that bottom right room, it forces the " +
        "location of the '3' digit in the L-shaped room to its left, which " +
        "in turn affects the placement of the '3' in the square above that, " +
        "which is then easy to complete.",
      "Now looking at the L shape in the rightmost column above the (2,1) room, " + 
        "we can see that the '2's below it knock out the bottom row and the 2 " +
        "must thus sit on top. Similarly the '3' is blocked from the bottom " +
        "left corner and must be in the bottom right, allowing easy completion " +
        "of the room.",
      "Moving to the L near the middle, we can see an easy solution given the " +
        "effects of the '3' and '2' digits to its right. Similarly the inverted " +
        "L on the rightmost column is easy to complete given the digits below.",
      "The '2' and '3' digits in the 5-box room in the upper middle are now easy " +
        "to complete. Once they are placed the 3-high room in the second column " +
        "is easy to complete, also making the NW corner room solvable.",
      "Now observe the left-most square of the top row's 5-wide rectangle. " +
        "Below are 4 inhibitors for digits '1'-'4', so the only other possibility " +
        "is for it to have the '5' digit. Once the '5' is placed there is only " +
        "one legal spot for the '4' digit, then the other 3 fall into place.",
      "Propagating '2' digits in the bottom sector completes a few more rooms,",
      "Now the '4' digits have their effect, and the rest of the pieces should " +
        "fall into place.",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      [],
      ["2,0,1","1,2,1","5,5,1"],
      ["3,1,1","4,6,1","6,6,1"],
      ["4,5,2","6,5,3","5,6,2"],
      ["5,4,3","4,3,3","4,4,1","3,4,4"],
      ["2,6,2","3,6,3","3,5,1"],
      ["3,2,3","5,2,2","5,3,1","1,6,1","1,5,2","2,5,3"],
      ["2,2,2","1,4,3","1,1,2","2,1,3","0,0,2","1,0,3","0,1,1"],
      ["0,2,5","0,6,4","0,5,1","0,4,2","0,3,3"],
      ["6,1,2","5,1,1","6,3,4","6,2,1","6,4,2"],
      ["1,3,4","2,3,5","5,0,4","6,0,3","4,0,1","3,0,2","4,1,5"]];
  } else {
    demotext = [
      "<p>In this demo we will walk more quickly through the steps of solving " +
        "this puzzle, which is actually easier. It is recommended to go through " +
        "demo 1 first. Press the 'next' button to walk through the solving steps, " +
        "or the 'back' button to return to the previous step. You can also use " +
        "the undo button to move backwards individual steps, or continue playing " +
        "forward if you wish.</p>" +
        "<p>The first thing to do is to turn on the assist mode to let us know " +
        "which rooms still need completion. Then we can set the '1' digits in " +
        "the single-square rooms.</p>",
      "With these '1' digits set, we see a lot of boxes that can immediately " +
        "set their '1' digit and then be completed.",
      "The '3' digits begin to propagate in the upper region and several more " +
        "rooms can be completed.",
      "The '3' digits continue to propagate downwards, and the '1' and '2' " +
        "digits make the rest fall into place pretty easily.",
      "All the pieces are on the board for the final completion",
      "Congratulations! The puzzle is solved!"];
    demomoves = [
      [],
      ["0,2,1","0,6,1","2,6,1","3,1,1","4,5,1","6,0,1"],
      ["0,4,1","0,5,2","1,5,1","2,4,1","2,5,3","2,2,1","4,2,1","4,1,2","5,4,1","5,5,2","7,1,1"],
      ["0,3,3","1,4,4","1,3,1","1,2,2","3,2,3","2,1,4","2,3,2","0,1,2","1,0,1","1,7,1","2,7,4"],
      ["3,6,3","4,6,2","3,5,4","5,3,3","6,3,1","6,4,2","2,0,3","5,0,4","6,2,4","5,1,1","5,2,2"],
      ["7,2,3","7,3,2","7,4,4","7,5,1","5,6,4","7,6,2","6,5,3","5,7,3","6,7,2"]];
  }
  if (demoStepNum < demotext.length) {
    if (demoStepNum) {
      assistState = 2;
    } else {
      assistState = 0;
    }
    updateHtmlText('demotext', demotext[demoStepNum]);
    globalBoardValues =     initYXFromArray(globalPuzzleH,globalPuzzleW,globalInitBoardValues);
    // now add in all of the moves from each step including this one
    for (let step=0;step<=demoStepNum;step++) {
      let demosteps = demomoves[step];
      for (let i=0;i<demosteps.length;i++) {
        let steps = demosteps[i].split(",");
        addMove(steps[0],steps[1],steps[2]);
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}
