const gameName = 'tentai';

// Unresolved regions (open, or closed with 2+ stars) stay this gray.
const pendingGalaxyColor = "#d0d0d0";
// Mode 0/1: valid galaxy painted by star color (preview of the show).
const validWhiteGalaxyColor = "#ffffff";
const validBlackGalaxyColor = "#808080";
// Mode 2: valid galaxy tinted green (lighter / darker by star).
const assistWhiteGalaxyColor = "#e0ffe0";
const assistBlackGalaxyColor = "#90b090";
// Closed with 0 stars, or 1 star but asymmetric.
const errorGalaxyColor = "#ffe0e0";
const unpairedCellColor = "#ff8080";
// Full solve: black-star galaxies for the "show" picture.
const showBlackGalaxyColor = "#303030";

const constMoveEraseWall = 1;
const constMoveAddWall = 2;

let incompleteCount = 0;
let incompleteBoard = true;
let curClickType = constClickUnknown;
let moveHistory;
// Stars as {sy,sx,black} in cell-geometry centers (half-integers OK)
let puzzleStars;

function puzzleInit() {
  globalCursorOn = false;
  globalWallCursorOn = false;
  initElements();
  initRibbons(gameName);
  listenKeys(handledKeys, handleKey);
  listenClick(handleClick, initStructures, undoMove);

  if (cannedPuzzles[puzzleChoice]) {
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

let handledKeys = [
  constKeyBackspace, constKeyCR, constKeySpace, constKey0, constKey1,
  constKeyAlt0, constKeyAlt1, constKeyEsc, constKeyLeft, constKeyUp,
  constKeyRight, constKeyDown
];

function updateDynTextFields() {
  let etext = '';
  if (playState.assistState == 0) {
    if (playState.errorCount && incompleteCount) {
      etext = "there are errors and incomplete galaxies";
    } else if (playState.errorCount) {
      etext = "there are errors";
    } else if (incompleteCount) {
      etext = "there are incomplete galaxies";
    } else if (incompleteBoard) {
      etext = "there are pending regions";
    } else {
      etext = "the puzzle is complete!!";
    }
  } else {
    if (playState.errorCount || incompleteCount) {
      etext = "there are " + playState.errorCount + " errors and " +
              incompleteCount + " incomplete galaxies";
    } else if (incompleteBoard) {
      etext = "there are pending regions";
    } else {
      etext = "the puzzle is complete!!";
    }
  }
  updateDynamicHtmlEntries(etext, playState.assistState);
}

function addHistory(movetype, y, x, prevvalue) {
  moveHistory.push([movetype, y, x, prevvalue]);
}

function addMove(y, x, moveType) {
  // ignore corners (not edges)
  if ((y % 2) == (x % 2)) {
    return;
  }
  if (moveType == constMoveEraseWall) {
    if (globalWallStates[y][x] & constWallUserEdge) {
      addHistory(moveType, y, x, globalWallStates[y][x]);
      globalWallStates[y][x] &= ~constWallUserEdge;
    }
  } else {
    if ((globalWallStates[y][x] & constWallUserEdge) == 0) {
      addHistory(moveType, y, x, globalWallStates[y][x]);
      globalWallStates[y][x] |= constWallUserEdge;
    }
  }
}

function handleKey(keynum) {
  const focusedElement = document.activeElement;
  if ((keynum == constKeyCR) && focusedElement && focusedElement.id == "userPuzzle") {
    let pval = elemStruct.userPuzzle.value;
    if (pval.search(/:/) == -1) {
      if (pval < cannedPuzzles.length) {
        puzzleChoice = pval;
        initPuzzle = cannedPuzzles[pval];
        puzzle = removeDot(initPuzzle);
        updateHtmlDescr(initPuzzle);
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
      puzzleChoice = 0;
      updateHtmlDescr(initPuzzle);
    }
    initStructures(puzzle);
  } else if (focusedElement && focusedElement.id != "userPuzzle") {
    if (keynum == constKeyEsc) {
      globalWallCursorOn = false;
      console.log(globalWallStates);
      console.log(puzzleStars);
      console.log(moveHistory);
    } else if (globalWallCursorOn) {
      switch (keynum) {
        case constKeyUp:
          if ((globalWallCursorX % 2) == 0) {
            if (globalWallCursorY) {
              globalWallCursorY--;
              if (playState.shifting && ((globalWallCursorX % 2) || (globalWallCursorY % 2))) {
                addMove(globalWallCursorY, globalWallCursorX, constMoveAddWall);
              }
              if (playState.shifting && (globalWallCursorY % 2)) {
                globalWallCursorY--;
              }
            }
          }
          break;
        case constKeyDown:
          if ((globalWallCursorX % 2) == 0) {
            if (globalWallCursorY < (2 * globalPuzzleH)) {
              globalWallCursorY++;
              if (playState.shifting && ((globalWallCursorX % 2) || (globalWallCursorY % 2))) {
                addMove(globalWallCursorY, globalWallCursorX, constMoveAddWall);
              }
              if (playState.shifting && (globalWallCursorY % 2)) {
                globalWallCursorY++;
              }
            }
          }
          break;
        case constKeyLeft:
          if ((globalWallCursorY % 2) == 0) {
            if (globalWallCursorX) {
              globalWallCursorX--;
              if (playState.shifting && ((globalWallCursorX % 2) || (globalWallCursorY % 2))) {
                addMove(globalWallCursorY, globalWallCursorX, constMoveAddWall);
              }
              if (playState.shifting && (globalWallCursorX % 2)) {
                globalWallCursorX--;
              }
            }
          }
          break;
        case constKeyRight:
          if ((globalWallCursorY % 2) == 0) {
            if (globalWallCursorX < (2 * globalPuzzleW)) {
              globalWallCursorX++;
              if (playState.shifting && ((globalWallCursorX % 2) || (globalWallCursorY % 2))) {
                addMove(globalWallCursorY, globalWallCursorX, constMoveAddWall);
              }
              if (playState.shifting && (globalWallCursorX % 2)) {
                globalWallCursorX++;
              }
            }
          }
          break;
        case constKeySpace:
          if ((globalWallStates[globalWallCursorY][globalWallCursorX] & constWallUserEdge) == 0) {
            addMove(globalWallCursorY, globalWallCursorX, constMoveAddWall);
          } else {
            addMove(globalWallCursorY, globalWallCursorX, constMoveEraseWall);
          }
          break;
        case constKey0:
        case constKeyAlt0:
        case constKeyBackspace:
          addMove(globalWallCursorY, globalWallCursorX, constMoveEraseWall);
          break;
        case constKey1:
        case constKeyAlt1:
          addMove(globalWallCursorY, globalWallCursorX, constMoveAddWall);
          break;
      }
    }
    updateBoardStatus();
    drawBoard();
  }
}

function placeStar(sy, sx, black) {
  puzzleStars.push({ sy: sy, sx: sx, black: black });
}

function initStructures(puzzle) {
  elemStruct.canvasDiv.style.borderColor = "black";
  moveHistory = new Array();
  puzzleStars = new Array();
  let puzzleSplit = puzzle.split(":");
  let size = puzzleSplit[0];
  let starParams = puzzleSplit[1];
  let rwallParams = puzzleSplit[2];
  let cwallParams = puzzleSplit[3];
  isDemo = false;

  basicInitStructures(size, emptyCellColor, constWallDash, constWallBorder, stdFontColor);

  if (puzzleSplit.length > 3) {
    globalWallStates = initWallStatesFromHexes(
      rwallParams, cwallParams, constWallUserEdge, constWallDash);
  }

  let starExp = expandNumParams(starParams);
  if (starExp.length != (globalPuzzleH * globalPuzzleW)) {
    throw "ERROR in tentai star descriptor, got length " + starExp.length +
          " expected " + (globalPuzzleH * globalPuzzleW);
  }

  for (let y = 0; y < globalPuzzleH; y++) {
    for (let x = 0; x < globalPuzzleW; x++) {
      let ch = starExp[y * globalPuzzleW + x];
      switch (ch) {
        case '*':
          // constCircleDot matches midloop / edge-dot size (not full Masyu circles)
          globalCircleStates[y][x] = constCircleDot;
          globalCircleColors[y][x] = "black";
          placeStar(y + 0.5, x + 0.5, true);
          break;
        case 'O':
          globalCircleStates[y][x] = constCircleDotWhite;
          globalCircleColors[y][x] = "black";
          placeStar(y + 0.5, x + 0.5, false);
          break;
        case '>':
          globalWallStates[2 * y + 1][2 * x + 2] |= constWallDot;
          placeStar(y + 0.5, x + 1, true);
          break;
        case 'E':
          globalWallStates[2 * y + 1][2 * x + 2] |= constWallDot | constWallDotWhite;
          placeStar(y + 0.5, x + 1, false);
          break;
        case 'V':
          globalWallStates[2 * y + 2][2 * x + 1] |= constWallDot;
          placeStar(y + 1, x + 0.5, true);
          break;
        case 'S':
          globalWallStates[2 * y + 2][2 * x + 1] |= constWallDot | constWallDotWhite;
          placeStar(y + 1, x + 0.5, false);
          break;
        case '+':
          globalWallStates[2 * y + 2][2 * x + 2] |= constWallDot;
          placeStar(y + 1, x + 1, true);
          break;
        case '@':
          globalWallStates[2 * y + 2][2 * x + 2] |= constWallDot | constWallDotWhite;
          placeStar(y + 1, x + 1, false);
          break;
        case '-':
          break;
        default:
          throw "ERROR unknown tentai star glyph '" + ch + "' at " + y + "," + x;
      }
    }
  }

  updateBoardStatus();
  drawBoard();
}

function handleClick(evnt) {
  let yCell, xCell, isCorner, isEdge, yEdge, xEdge;
  [yCell, xCell, isCorner, isEdge, yEdge, xEdge] =
    getClickCellInfo(evnt, "puzzleCanvas");

  if (!isEdge && !isCorner) {
    return;
  }
  if (!playState.dragging) {
    curClickType = clickType(evnt);
  }
  if (curClickType == constClickMiddle) {
    return;
  }
  if (playState.dragging && (yEdge == globalWallCursorY) && (xEdge == globalWallCursorX)) {
    return;
  }
  if (playState.dragging && !isEdge) {
    return;
  }

  globalWallCursorY = yEdge;
  globalWallCursorX = xEdge;
  globalWallCursorOn = true;

  if (isEdge && (curClickType == constClickLeft)) {
    addMove(yEdge, xEdge, constMoveAddWall);
  } else if (isEdge && (curClickType == constClickRight)) {
    addMove(yEdge, xEdge, constMoveEraseWall);
  }
  updateBoardStatus();
  drawBoard();
}

function colorRoom(roomInfo, color) {
  for (let cell of roomInfo) {
    let cc = cell.split(",");
    globalBoardColors[cc[0]][cc[1]] = color;
  }
}

function pairCell(y, x, sy, sx) {
  return [2 * sy - y - 1, 2 * sx - x - 1];
}

function starsInRoom(room) {
  let found = [];
  let roomSet = {};
  for (let cell of room) {
    roomSet[cell] = true;
  }
  for (let star of puzzleStars) {
    // A star belongs to a room if every cell that touches it is in the room.
    // Touching cells: those whose centers are within 0.5 of the star in each axis
    // (center → 1 cell; edge → 2; corner → 4).
    let touches = [];
    let y0 = Math.floor(star.sy - 0.5);
    let y1 = Math.ceil(star.sy - 0.5);
    let x0 = Math.floor(star.sx - 0.5);
    let x1 = Math.ceil(star.sx - 0.5);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (y >= 0 && y < globalPuzzleH && x >= 0 && x < globalPuzzleW) {
          touches.push(y + "," + x);
        }
      }
    }
    let allIn = touches.length > 0;
    for (let t of touches) {
      if (!roomSet[t]) {
        allIn = false;
        break;
      }
    }
    if (allIn) {
      found.push(star);
    }
  }
  return found;
}

function checkSymmetry(room, star) {
  let roomSet = {};
  for (let cell of room) {
    roomSet[cell] = true;
  }
  let unpaired = [];
  for (let cell of room) {
    let cc = cell.split(",");
    let y = parseInt(cc[0]);
    let x = parseInt(cc[1]);
    let pair = pairCell(y, x, star.sy, star.sx);
    let py = pair[0];
    let px = pair[1];
    if (py < 0 || py >= globalPuzzleH || px < 0 || px >= globalPuzzleW ||
        !roomSet[py + "," + px]) {
      unpaired.push(cell);
    }
  }
  return unpaired;
}

// Rooms start gray. Only fully enclosed regions with 0 or 1 star resolve
// to a color; 2+ stars stay gray (same as still-open / initial).
function updateBoardStatus() {
  playState.errorCount = 0;
  incompleteCount = 0;
  incompleteBoard = false;

  for (let y = 0; y < globalPuzzleH; y++) {
    for (let x = 0; x < globalPuzzleW; x++) {
      globalBoardColors[y][x] = pendingGalaxyColor;
    }
  }

  let rooms = findRooms();
  let validGalaxies = 0;

  for (let room of rooms) {
    let stars = starsInRoom(room);

    // 2+ stars: unresolved (stay gray), counts as incomplete/error for status
    if (stars.length >= 2) {
      playState.errorCount++;
      incompleteBoard = true;
      continue;
    }

    // 0 stars: if this is still the whole open board, pending; else a
    // sealed empty pocket is an error (red).
    if (stars.length == 0) {
      if (room.length == globalPuzzleH * globalPuzzleW) {
        incompleteBoard = true;
      } else {
        // Sealed region with no star — only paint red once it's not the
        // single remaining open component. Heuristic: error if any wall
        // was drawn (multiple rooms exist).
        if (rooms.length > 1) {
          playState.errorCount++;
          colorRoom(room, errorGalaxyColor);
        } else {
          incompleteBoard = true;
        }
      }
      continue;
    }

    // Exactly one star: check 180° symmetry about that star.
    let star = stars[0];
    let unpaired = checkSymmetry(room, star);
    if (unpaired.length) {
      playState.errorCount++;
      colorRoom(room, errorGalaxyColor);
      if (playState.assistState == 2) {
        for (let cell of unpaired) {
          let cc = cell.split(",");
          globalBoardColors[cc[0]][cc[1]] = unpairedCellColor;
        }
      }
    } else {
      validGalaxies++;
      if (playState.assistState == 2) {
        colorRoom(room, star.black ? assistBlackGalaxyColor : assistWhiteGalaxyColor);
      } else {
        colorRoom(room, star.black ? validBlackGalaxyColor : validWhiteGalaxyColor);
      }
    }
  }

  incompleteCount = puzzleStars.length - validGalaxies;
  if (incompleteCount < 0) {
    incompleteCount = 0;
  }

  updateDynTextFields();
  let solved = (playState.errorCount == 0) && (incompleteCount == 0) &&
               !incompleteBoard && (rooms.length == puzzleStars.length);
  if (solved) {
    for (let room of rooms) {
      let stars = starsInRoom(room);
      if (stars.length == 1 && stars[0].black) {
        colorRoom(room, showBlackGalaxyColor);
      } else if (stars.length == 1) {
        colorRoom(room, validWhiteGalaxyColor);
      }
    }
    canvasSuccess(isDemo, gameName, puzzleChoice);
  } else {
    canvasIncomplete();
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    let lastMove = moveHistory.pop();
    globalWallStates[lastMove[1]][lastMove[2]] = lastMove[3];
    updateBoardStatus();
    drawBoard();
  }
}

function updateDemoRegion(demoNum) {
  // demos not wired yet
}
