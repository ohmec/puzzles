// Shikaku puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the initial or current values. 1-9 are digit values, a-z
// define from 1-26 spaces in between digits, A-Z are digit
// values 10-35, and '-' is one space.
let cannedPuzzles = [
  // example completed one
  "7x7:a64d.c4a2a.f4.b3a4b.3f.a4a8c.d52a:" +
      "0032.0214.0641.1222.1412.2422.3031.3113.4122.4324.6015.6512",            // completed demo
  // demo
  "7x7:a64d.c4a2a.f4.b3a4b.3f.a4a8c.d52a",                                      // 2014 demo
  "7x7:6e4.f6.3c4b.c3c.b2c8.6f.2e5",                                            // v189 demo
  // D1
  "10x10:44h.a2b54d.e2a36a.b43d4a.c4f.f2c.a6d39b.a22a4e.dA6b4a.h43",            // 2014 #1
  "10x10:4b6c9a3.e4d.6b4f.g3a4.a4b34d.d22b2a.3a3g.f8b2.d6e.6a3c5b4",            // 2014 #2
  "10x10:5e3c.5c5a2c.d5b3b.c8d44.a33g.g44a.34d2c.b3b4d.c4a3c9.c4e6",            // v189 #1
  "10x10:h4a.Af3b.a6d3c.b2aC4d.b4g.g4b.d46a2b.c8dCa.b4f3.a9h",                  // v189 #2
  "10x10:g5b.h4a.b928d2.b3a3e.b622e.e329b.e4a3b.6d526b.a5h.b9g",                // godzilla 265
  "10x10:b8g.c4f.c4e4.d2b6Ca.d2a4c.cAa4d.aA6b4d.Ae4c.f2c.g4b",                  // godzilla 267
  "10x10:3hA.j.b9a84a8b.j.b6a5e.e6a8b.j.b6a22a3b.j.8hC",                        // godzille 270
  // D2
  "10x10:d65c4.a4h.8e9c.d5e.c4d3a.a8d4c.e4d.c4e9.hAa.5c44d",                    // 2014 #3
  "10x10:d6e.j.bAf9.7a4e2a.c6f.f9c.a6e5a8.6f6b.j.eGd",                          // 2014 #4
  "10x10:Cc7d6.b2b3b5a.j.c9c4b.b3c4c.c4c3b.b2c2c.j.a3bAb3b.4d6c8",              // 2014 #5
  "10x10:f2b6.a9a4f.f6b6.a3a4f.d55d.d55d.f8a4a.6b9f.f4a4a.2b3f",                // 2014 #6
  "10x10:9b6f.eAb3a.j.3b6f.e5b8a.a3b3e.f8b8.j.aCb6e.f4b6",                      // v189 #3
  "17x17:jCf.dAa9j.eAa6fLb.kCe.f5j.a8o.aGo.hCcFd.dFc7c9d.dCcCh.o6a.oCa.j4f." +  
        "e8k.bIfCaGe.jAa6d.f6j",                                                // v189 #5
  "10x18:d64d.b6d6b.a6f8a.j.e46c.b6d2b.a4c2b4a.5b5b6c.2a6g.gAa4.c2b2b3." +
         "a4b3c4a.b9d5b.c46e.j.a4f6a.b8d9b.d45d",                               // godzilla 271
  "10x18:c8c6a3.e4d.c6d2a.a4d4c.4c3b6b.bAg.e4c6.3c4e.c4c8b.b4c4c.e2c4.8c4e." +
        "g6b.b6b5c6.c4dAa.a3d6c.d8e.4a5c2c",                                    // godzilla 272 "nice"
  // D3
  "10x10:9h9.e9d.dAe.c4b6c.aCe3b.b4e3a.c3b4c.e5d.d7e.4h8",                      // v189 #4
  "17x17:bAc86b2c5b.m6c.8c8c74b9c6.o6a.b6c4c79b2b.q.2c5g46b3.h6h.a34d3a6d32a." +
        "h7h.4b35g2c8.q.bAb24c6cAb.a8o.6c4b26cCc9.c2m.b6c4b42c3b",              // v189 #6 "methodical and fun"
  "17x17:2a2a2a3i6.i2a6a2c.2a9a4a6c2a2a2b.i6a2a2a4a.2a2a6a3c2a2a3b.i4a2a2a4a." +
        "4a4a6a4c2a2a3b.k2a2a6a.h4h.a8a2a6k.b3a3a3cAaCa2a6.a2a2a2a2i." +
        "b2a2a2c4a3a6a2.a2a2a2a3i.b3a2a4c2a9a2a2.c6a4a9i.6i2a2a2a4",            // 2014 #7
  "17x17:Af6aAf6.h4h.b938gA5Fb.q.f3c6f.q.6c8g3c4.a2b4g3b6a.b3eCe3b.aAb6g2b3a." +
        "6cCg4c8.q.f9cCf.q.b688g64Cb.h3h.4f5a5f7",                              // 2014 #8
  "17x17:b6c4gAb.c9a2g8c.d6d6b8d.h6d3c.g3f9b.Ac4c3h.a6a4e4g.b8c8e4d.e9e3e." +
        "d5e6cFb.g6e5a4a.h5c4cC.b6f5g.c6d4h.d6b5d5d.c3g4a6c.bCgCcAb",           // 2014 #9
  "17x17:e4d34e.fCj.a9a3a4k.bIh4b68a.j2c42a.a3c42b8g.Aa2b6Ae63c.l42c.h4h.c64l." +
        "c32e66b6a8.g8b26c5a.a22c6j.a63b9h3b.k8a3aAa.j6f.e68d8e",               // 2014 #10
  "17x17:bAc86b2c5b.m6c.8c8c74b9c6.o6a.b6c4c79b2b.q.2c5g46b3.h6h.a34d3a6d32a." +
        "h7h.4b35g2c8.q.bAb24c6cAb.a8o.6c4b26cCc9.c2m.b6c4b42c3b",              // v189 #6
  "14x24:c3b42b4c.b3h2b.a6c6b6c6a.d9d6d.a3j8a.6e54e6.c3f3c.b2h4b.a3d6a9c4a." +
        "d6a4b4d.c9j.9h82b2.3b26h4.j2c.d6b2a4d.a4c6a6d6a.b8h8b.c6f4c.6e66e6." +
        "a4j8a.d9d6d.a3c4b2c6a.b8h4b.c4b33b4c",                                 // godzilla 275
  // D4
];

let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;

// which puzzles have demos
const demoPuzzles =  [1,9];
// which puzzles are at which level [D1,D2,D3,D4]
const puzzleLevels = [1,10,18,99];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many incomplete numbers which we need draw rectangular rooms around " +
    "to complete the puzzle. For our first time through we can turn on " +
    "Assist Mode 2 to see any errors that we might generate in the process " +
    "of the solve, and to visualize the rooms better.</p>",
  "<p>In Shikaku, the first step is always to look to see which numbered " +
    "circles are constrained to have only one solution availabled. An " +
    "example here of one that is <b>not</b> so constrained is the '3' " +
    "in the leftmost column. You could draw a 1x3 rectangle around it in " +
    "three different places, as well as a 3x1 rectangle.</p><p>At this " +
    "point we can see four such constrained numbers, but let's take them " +
    "one at a time. The '6' in the upper left will require a room of size " +
    "1x6, 6x1, 2x3, or 3x2 to sum to its value. It should be clear that " +
    "a 2x3 rectangle is the only option here that only incorporates that " +
    "'6' circle without including another numbered circle.</p>",
  "Another one that is constrained at this point is the '4' on the top " +
    "row. It doesn't have enough room to grow down, and can't form a 2x2 " +
    "rectangle, so must grow to the right in a 1x4 room",
  "Similarly the '5' on the bottom row, can only fit in one location.",
  "Now looking at the '4' in the right column, it appears that there are " +
    "many ways to complete a room around it. However, looking at the " +
    "blank cell in the upper right, it is not yet covered, and there is " +
    "no other number that could possible cover it with a rectangular room, " +
    "thus the '4' must cover it.",
  "Large numbers are always good to try early, since they often have few " +
    "options for completion. The '8' on this board is one example. There " +
    "are two locations for a 2x4 room to cover it, so we can't complete " +
    "it just yet, it appears. However, we can put a placeholder erroneous " +
    "room around the 6 cells that must be covered with the eventual room. " +
    "This will light up in error, but helps us understand the constraints " +
    "put upon other numbers.",
  "Once this constraint is placed, it is clear that only extending all the " +
    "way to the right edge is the legal placement, else those two cells " +
    "could not be covered by any other number.",
  "Once that critical piece is placed, several others fall into place, " +
    "including the '2' in the SE corner, and the '4' to the left of the " +
    "'8', which then constrains the '3' to its left",
  "Now we can use the earlier logical reasoning to see that the one " +
    "uncovered cell in the second column must come from the '3' to its " +
    "right. Once that is placed, the '4' to the right of it is constrained " +
    "to a 2x2 square.",
  "The final two pieces are now constrained, and easy to complete.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "a tougher puzzle. It is recommended to go through demo 1 first. Press " +
    "the 'next' button to walk through the solving steps, or the 'back' " +
    "button to return to the previous step. You can also use the undo " +
    "button to move backwards individual steps, or continue playing forward " +
    "if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to let us know " +
    "which numbers still need completion. Looking at this tougher board it " +
    "appears that there is only one number that has a clear cut solution " +
    "at the outset. See if you can find it, for this is the key to making " +
    "progress in general on Shikaku.</p>",
  "Now that this '8' room is completed the two rooms to its left can be " +
    "satisfied.",
  "Now every one of the numbers remaining has at least two potential solutions. " +
    "However, we can use the partial-room trick introduced in the first demo " +
    "to mark the guaranteed cells needed by the '5' in the middle of the " +
    "board. There is no room for it to grow downwards, so it must grow at " +
    "least four spaces to the right.",
  "With that visual separator we can see that the '8' below the '5' room now " +
    "has only one option. This in turn locks in the '6' to its left.",
  "Now let's study the upper right corner. The '10' circle could grown down " +
    "or to the left. However, growing to the left would force the '8' to use " +
    "a non-rectangular shape to get all of the cells it needs. Thus the '10' " +
    "must grown downwards.",
  "Now it is clear the shape required by the '5' after all.",
  "With these completed, the large '12' room at the bottom is constrained. " +
    "Once that is set, the '3' and '2's above it are constrained as well.",
  "The '8' in the lower left corner appears to have two directions, but " +
    "it should be readily clear that it must grow to the right. Once that " +
    "is added the two '6' rooms fall into place.",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
 [[],
  [],
  ["A0032"],
  ["A0214"],
  ["A6015"],
  ["A0641"],
  ["A4323"],
  ["D43","A4324"],
  ["A6512","A4122","A3031"],
  ["A3113","A2422"],
  ["A1222","A1412"]],
 [[],
  ["A0342"],
  ["A1033","A0013"],
  ["A4414"],
  ["A5624","A5323"],
  ["A0852","A0642","A0541"],
  ["D44",  "A4315"],
  ["A8426","A7312","A7512","A7713"],
  ["A8024","A6023","A4023"]]];
