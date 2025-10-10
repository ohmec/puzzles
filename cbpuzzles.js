// Choco Banana puzzle definitions, must be of the form:
// WxH:<digit-descriptors> where W is puzzle width, H is height.
// Digit descriptors are '-' for blank values, 1-9A-Z for digit
// values 1-35, or a-z for 1-26 consecutive blank tiles.
//
// special case for the 0th entry, which includes a hexadecimal descriptor
// of the black (1) / white (0) starting points for a solved puzzle.
const cannedPuzzles = [
  // example completed one
  "5x5:e.d2.b6a2.a4c.1a1b:00.e8.e8.10.a0",
  "5x5:e.d2.b6a2.a4c.1a1b",
  // pencil 2024 easy ones
  "6x6:24d.2e.c6b.e4.3a3c.a1d",
  "6x6:1b2b.d2a.b4c.f.c3b.b7c",
  "6x6:3b4b.f.a1d.16b1a.e3.e2",
  "6x6:a5c3.c1b.b2c.2e.2a4a4a.b4c",
  "10x10:a1f13.b3c8c.22g4.j.f1c.4a8f3.j.a2a3b4c.a2g2.1d223a2",
  "10x10:1b23e.c5b8c.8e8c.j.j.j.8c9e.c9f.d2a6c.2a2b1d",
  "10x10:a4a4a4c1.1a1a6c4a.a3a4a6c4.h4a.i6.5a2a8e.a6a7f.j.e2a8b.f2c",
  "10x10:24b2d2.d4a1c.a2e3b.j.d23c1.d31d.j.j.f3a6a.82a1c1a1",
  "10x10:d3a22a1.b6e5a.j.2g7a.i4.j.b4a2b4a1.2i.a22e4a.c4f",
  "10x10:b3d25a.a2e2b.a2h.i2.4d4a1a2.1a9d91a.j.j.a64g.a18g",
  "10x10:a223f.4f2a3.j.d9b3a3.e8d.i2.9b6e2.c6b3b5.i6.3a3c6b6",
  // D2
  "10x10:e3b73.a4f7a.h7a.h98.j.c6f.4a2g.b2b4d.22b2c1a.j",
  "10x10:61h.d6226b.g6b.b22f.g8b.a6h.e4d.f1c.j.23b5d6",           // two solutions?
  "10x10:f7c.h6a.3a6g.92e3b.a2h.h4a.6f3b.i3.c7e1.f4c",
  "10x10:1a4e22.3d31c.2f666.j.c7f.5a3g.h41.44c6b25.f2c.d4a2a22",  // easy + fun
  "10x10:2c4a1b3.3i.h5a.1b6a6d.j.j.a2g3.j.22b5c2a.99b1d1",
  "10x10:gBBB.88e999.j.j.a887bBc.c2f.c2a4d.a6e8b.66h.6i",
  "10x10:j.j.b9Cb27b.b92bC5b.j.j.j.b6CbC5b.b48b85b.j",
  // D3
  "10x10:h6a.b6g.a714c1b.b3g.j.j.g5b.b1c713a.g4b.a6h",
  "10x10:h2a.b2g.a2c3d.g3b.c3d4a.h4a.3e65b.b2g.b2g.41d522a",
  "17x17:a1aAj4b.3a6hAd2.2n2a.6d8cBe4a.q.g331g.p5.c6a8k.2h55f.q." +
        "42bDf3e.b2n.6d6i7a.b6h4d6.b6b444i.a4a44c3f2a.f1b44c2a4",
];
let puzzleChoice = 2;
let puzzleCount = cannedPuzzles.length;

// which puzzles have demos
const demoPuzzles  = [1,2];
// which puzzles are at which level [D1,D2,D3,D4]
const puzzleLevels = [1,13,20,99];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many indeterminate squares which we need to turn white or black to " +
    "solve the puzzle. For our first time through we can turn on Assist " +
    "Mode 2 to see any errors that we might generate in the process of " +
    "the solve. Note as the 'rooms' are forming, there will temporarily " +
    "be errors denoted, for instance as you are forming a square of 2x2 " +
    "black squares, the first three clicked will create a non-rectangular " +
    "black square room, which is temporarily erroneous. These can be ignored.</p>",
  "In Choco Banana, it is always easiest to solve two types of rooms: those " +
    "with a '1' digit inside, and those with a '2'. By definition, these " +
    "must be rectangular, and thus must be black. These rooms can be " +
    "satisfied, though recognize that a '2' digit by itself can be set " +
    "black, but it isn't always obvious where its second neighbor is as " +
    "in this case.",
  "Now we can turn to the definition of a region and infer that all " +
    "horizontal and vertical neighbors of these black rooms can now be " +
    "set to white, so as to not add any more black squares to the completed " +
    "rooms. Since we're in assist mode two, these are highlighted as " +
    "erroneous for indeed at the moment they are all rectangular white " +
    "regions, which violates rule 3.",
  "Now an important observation must be made in order to proceed. Looking " +
    "at the upper-right isolated white square, it <b>must</b> have a white " +
    "square to its left, as a black square would isolate it as a white " +
    "1x1 rectangle, which would violate rule 3. So we can set its left " +
    "neighbor to white as well. Similarly, the white square above the " +
    "two black '1' cells must be set to white as well, for the same " +
    "reason. This declares that the '4' digit is indeed a 4-square " +
    "room of white cells. This 'validates' those two white squares, " +
    "combining them into legal non-rectangular white rooms.",
  "Now we must lock in the shape of the '4' digit room with four white " +
    "squares. In order to not grow any larger, its above neighbors and " +
    "right neighbor must be set to black.",
  "Now this sets the stage for the final steps. The '6' digit is in " +
    "violation of rule 1, as there are only 3 black squares in its room " +
    "at the moment. But it is clear there is only one geometric arrangement " +
    "of black squares that would make it a 6-square rectangle at this point. " +
    "We can set those 3 cells above it to black, and the 3 above that to " +
    "white to ensure it doesn't 'grow'.",
  "Now there is only one indeterminate square remaining. It might seem there " + 
    "are two potential solutions to this puzzle, that either black or white " +
    "would satisfy the puzzle. But recall that even rooms without digits " +
    "in them must satisfy rules 2 and 3. If we were to set the bottom " +
    "right square to black, then the white squares would be isolated as " +
    "1x1 rectangles, which violated rule 3. Thus white is the only correct " +
    "solution.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "this puzzle. It is recommended to go through demo 1 first. Press the " +
    "'next' button to walk through the solving steps, or the 'back' button " +
    "to return to the previous step. You can also use the undo button to move " +
    "backwards individual steps, or continue playing forward if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to let us know " +
    "which rooms still need completion. Then there are two easy rooms to solve, " +
    "again the 1-digit and 2-digit rooms. We can set them to black and their " +
    "horizontal and vertical neighbors to white.</p>",
  "Like the first demo, we can extend the white region in the isolated room " +
    "in the bottom left, which guarantees that the 3-digit in the leftmost " +
    "column must be white. Once that is ensured, we can set its neighbors to " +
    "black to ensure it doesn't grow.",
  "Now we see several areas that can be solved. The isolated white square on " +
    "the leftmost column must be connected to a white non-rectangular room, " +
    "so setting its righthand neighbor to white completes the '4'-digit room. " +
    "Its righthand neighbors can thus be set to black. Now looking at the " +
    "'3'-digit in violation in the second to bottom row, there is only one " +
    "direction that rectangular room can grow, and that is to the right. So " +
    "we can set its neighbors to white to bound its size.",
  "At this point we can't be sure if the '6'-digit pertains to a black " +
    "rectangle or a white non-rectangular room. But looking at the '4'-digit " +
    "we can see that setting it to white would join it into a region that is " +
    "already larger than 4. Thus it must be black. And then it is clear that " +
    "growing upwards is the only option. While we are at it we can set the " +
    "bottom right square to white to connect the otherwise isolated rectangular " +
    "region of white on the bottom row.",
  "Now it is clear there is no way to make a white region including the " +
    "'6'-digit, so it must be part of a 3x2 rectangle, completing the solve.",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
 [[],
  [],
  ["B14","B24","B40","B42"],
  ["W04","W13","W23","W34","W30","W41","W32","W43"],
  ["W03","W31"],
  ["B20","B21","B22","B33"],
  ["B10","B11","B12","W00","W01","W02"],
  ["W44"]],
 [[],
  ["B00","B10","W01","W11","W20","B51","W50","W41","W52"],
  ["W40","B30","B31","B42",],
  ["W21","B02","B12","B22","B43","B44","W32","W33","W34","W45","W53","W54"],
  ["B35","B25","B15","B05","W24","W14","W04","W55"],
  ["B23","B13","B03"]]];
