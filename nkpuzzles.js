// Nurikabe puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the initial or current values. 1-9 are digit values, a-z
// define from 1-26 spaces in between digits, A-Z are digit
// values 10-35, '-' is one space, and '*' is blackened.
let cannedPuzzles = [
  // example completed one
  "7x7:2*3*___._*_***4.**_*1**._****4_._*_*_*_._*2*2*_._5*****",
  // demos
  "7x7:2a3d.f4.d1b.e4a.g.b2a2b.a5e",
  "8x8:a6b2b6.b3e.h.h.h.e1b.b4e.a3c3a4",
  // D1
  "10x10:e3a1b.7g3a.a2h.j.d2c2a.a1c3d.j.h2a.a4g5.b1a6e",        // 2024 #1
  "10x10:d1e.4i.a4g6.g6b.j.i2.a3e6b.i4.g6b.3b2f",               // 2024 #2
  "10x10:4e4b3.g4b.3a3g.j.d4e.5h2.j.i4.j.3a2a4d3",              // 2024 #3
  "10x10:a5h.j.c3e6.d3c3a.j.j.b4g.i5.j.8a2b7c6",                // 2024 #4
  "10x10:aAh.b7e1a.i3.j.j.a6h.4h5.h2a.d4e.c2f",                 // 2024 #5 fun
  "10x10:4b6e2.d3e.h1a.e2c4.j.j.5c3e.a2h.e2d.3e3b6",            // box2014 #1
  "10x10:6c3e.i8.2g2a.j.d3e.e2d.j.a3g1.8i.e2c8",                // 2018 #1
  "10x10:d3e.j.3d4a3a4.j.g3a3.3a3g.d3b2b.3a3g.d1e.g2a3",        // 2018 #2
  "10x10:b1b2c5.a5h.i4.j.c5a1d.d1a3c.j.2i.h4a.3c5b2b",          // box2014 #2
  "10x10:3f2b.i1.e3d.2b3f.g3b.i4.j.a3a5f.2i.c2c6a6",            // 2018 #3
  "10x10:3d2a2a6.j.2c3e.j.1a5a2e.i3.f2c.i2.j.4a3a2b2a1",        // 2018 #4
  // D2
  "10x10:7f5b.f3c.3i.j.3f2b.c1f.i3.a2c4d.g8b.a3a1f",            // 2024 #6
  "10x10:4b2c4a1.d2e.j.j.1c4c6a.j.b3c6c.c4f.j.4h2",             // 2024 #7
  "10x10:a3e3a3.b1a4e.j.g1b.a3b2e.e2b2a.b3g.j.e2a2b.6a2e5a",    // 2024 #11 nice medium
  "10x10:2aBa3e.j.e4a3b.j.d4b1b.e5c2.j.i4.j.i3",                // 2024 #12
  "17x17:a4d2a2h.b3n.k4a6a2a.b5c3i2.c2c3a3c2c.o1a.m3c.n2b." +
        "3c5a4j.g3c5e.c5m.h5b7a2b7.a1c2k.k4e.6p.c3e4g.2g3e2a4", // 2024 #17
  "10x10:c3f.d5c5a.a1h.g7b.a4h.b2g.j.b3d4b.c2b6c.a1h",          // box2014 #3
  "10x10:4a4e1a.e1d.j.g3b.a5d5c.b2e5a.j.d6e.g3a1.3d2d",         // box2014 #4
  "10x10:1a7a2b3b.h3a.j.c1b4c.j.j.c4b4c.j.a2h.b3b2a2a4",        // 2018 #5
  "10x10:a7d2c.b6f1.j.h3a.d3d4.2a4g.j.d1e.j.1a4d4a3",           // 2018 #6
  "10x10:2e1a2a.j.c4b4c.1a2f4.j.4e4c.b4b2d.i1.b1g.c4c2b",       // box2014 #5
  "10x10:a5a4a3d.i4.h4a.j.c5f.2i.j.j.h5a.5a3d7b",               // 2018 #7
  "10x10:4e6b4.g2b.a5h.b5g.j.j.g4b.h4a.b3g.3b5e5",              // 2018 #8
  "10x10:b3b3d.c3e2.j.3f5b.a3a3f.j.f3c.e3d.h3a.4a3d3b",         // 2018 #9
  "10x10:e4d.j.e1a3b.j.b2a4a2b4.6i.e4a3b.3i.e4d.5i",            // 2018 #10
  "10x10:j.1a3a4a5c.g2b.b6g.g1b.b3g.g4b.b1g.c6a2a3a5.j",        // 2018 #11
  // D3
  "10x10:c5e3.1i.e1d.g3a2.4i.i2.3a6g.d5e.i3.6e2c",              // 2024 #14 nice, guesswork
  "10x10:1i.h1a.g9b.a1b2e.i5.4a5g.i4.j.2e5c.g4b",               // box2014 #6
  "10x10:a5h.b4e2a.i3.c3b3c.j.j.c1b4c.4i.a5e3b.h6a",            // 2018 #12
  "17x17:b5l4a.a4l4b.k2e.g5b6f.h5h.4i4f.a5g7d4b.o7a.a4f4h." +
        "4h4e4a.d3i3b.e5k.q.g4c4e.f2c7f.a4l3b.b5l7a",           // box2014 #7
  "17x17:h1d7b6.b7f2d2b.4p.a4f2h.m1c.5e2a2h.g1c2e.m3b2." +      
        "3a3b3b3a2f.k3d4.3a2n.i2g.l3d.c3c4c8e.p4.g5i.4a3c8c4e2",// 2018 #13
  "17x17:a6c3c1f7.b4a4l.p4.h6h.o4a.p2.g1a4g.c2b7c1b4c." +      
        "4g1g3.c4b6c3b3c.g1a5g.2p.a2o.h6h.5p.l3a6b.6f1c5c9a",   // 2018 #14
  "17x17:a4d3c3d8a.b2b2e3b2b.q.f2b2a3e.b2n.a4h1f.d4a2j.e3c7f5." +
        "2b5k2a.k5e.e3j4.3g2a6f.d4b2i.q.p5.d2b2i.5b3d4c4c6",    // box2014 #8
  "17x17:d4j9a.e7b8e7b.b2d8a3g.aAo.b2n.q.q.o7a.a3n6.b3n.f2j." +
        "g8b2f.f2b3g.4a4n.a7i6e.j4a2d.n4a7",                    // 2018 #15
  "17x17:a6j3d.b4c3d4e.e3j5.o2a.i2g.h4b5e.b7g5e6.a4m4a.g4i." +  
        "a7d2j.b3i7d.e4e3d4.d2j3a.q.q.b4d8g5a.a4d3g4b",         // 2018 #16
  "17x17:p5.a5b4e3a6d.6d2c3f5.q.g4i.f5j.d4b4g8a.n3b.d5l.e2h3b." +
        "q.b3j3c.a4j4d.bHn.h3h.c2c2a2g.b5h6a2b4",               // box2014 #9
  "17x17:1j5e.a2a3a4f4b4a.k4e.b4l2a.5h3g.g5h2.q.2e3g4a4.i3g." +
        "4e6g6b.q.6g3d5a2a.b3a3l.f2a2b1e.b3a3j2a.h3d5c.g2f4b",  // 2018 #17
  "17x17:5a5f2f4.n5b.f3f4c.d3b2c5e.l1d.4c4f1d5.a1g3g.j4c4b." +
        "q.b3c4j.g9g5a.4d1f3c7.d5l.e1c2b1d.c4f2f.b4n.1f5f2a3",  // 2018 #18
  "17x17:3f2c3e.j8d3a.2d5j4.m3c.g1i.c7b3d4e.6g6h.m1c.h4c2a4b." +
        "b1a4l.a1h4f.4n4a.f6c2b5c.q.j2e5.a4o.b4d4d4c4",         // box2014 #10
  "17x17:3a2e2e2b.d4d2e5a.q.i6c4c.f4j.4j5e.a2b2b6i.m5c.i6g." +
        "d5k2.a4f7h.3i6d3a.d5k2.k7e.q.a5f3h.b4g1c4a1",          // 2018 #19
  "17x17:h6c6a6a6.g2i.a8o.6a7d1i.q.q.iDg.q.q.q.9o7.a9j5b6a.q." +
        "q.p5.b5e4f8a.a7e8i",                                   // 2024 #18
  // D4
  // from big book, pages 56-
  "31x45:b3c4f7b8e4e3b.a5e5d2j7g.zb4b.d6a8p3g.p8n.b4q2d7e.j8b4a9n4" +
        "e6j5i8d.3u5h.aFv9f.m3c4e5e8a.e4c2i4e5e.ze.p6n.c9c5rAd.j1f4a4cBg" +
        "eAc6b6c5o.ze.za3b.c8d6h4g4d3.f2h6p.u2h.j2dGk3b6.s5i6a.x3f.9h6h8c4h" +
        "a7n4n.t9e6d.g2c2i4g4a.zd5.a6p7l.k4a1e4e6aBc.d6b6w.e6w3a.k4s.e5fAf9i7a" +
        "w4g.3a3m4b2e5e.m3a7o.zd9.a4b3c6b3d4l4a.w6g.ze.c1h5i6c2c5.f3f5b4f4g",
];
let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;

// which puzzles have demos
const demoPuzzles =  [1,2];
// which puzzles are at which level [D1,D2,D3,D4]
const puzzleLevels = [1,14,29,44];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many indeterminate cell which we need to turn white or black to " +
    "solve the puzzle. For our first time through we can turn on Assist " +
    "Mode 2 to see any errors that we might generate in the process of " +
    "the solve.</p>",
  "In Nurikabe, the easiest 'freebies' are the '1' digits, which must be " +
    "surrounded by all black cells in order to keep them contained into a " +
    "room of size 1.",
  "The next observation is that all numbered cells must be kept away from " +
    "other ones to avoid violating rule 3, so we can isolate them if they " +
    "are too close by setting their neighbor cells to black.",
  "Now we can see that some directions are already determinable. The '2' " +
    "in the NW corner must move downward, the '5' in the SW corner must " +
    "move to the left and then up, and the '2' next to it must move up. We " +
    "can begin to set their squares to white in those directions.",
  "For the two '2' rooms that have been created, we can set their borders " +
    "by setting the boundary squares to black. But sure to not assume that " +
    "you need to set the diagonal boundary squares.",
  "It is now clear how to complete the '5' room in the lower left.",
  "Now two new observations can be made. The first is that the black square " +
    "in the left column is isolated, as is the one in the bottom row. They " +
    "must be connected to the others, and the only way to do so is to set " +
    "their neighbor to black. Secondly, the single isolated indeterminate " +
    "square in the middle can only be set to black, else setting it to " +
    "white would isolate it as a '1' room with no digit, which violates " +
    "rule 2.",
  "Now we have two potential 'pool violations' brewing, below the '3' and " + 
    "above the incomplete '2'. Setting a 4th black square to create a 2x2 " +
    "grid of black squares would violate rule 5, and thus they must be set " +
    "to white.",
  "For the unsolved '2', this completes its room, and its neighbors can be " +
    "set to black. For the cell below the '3', it is now clear that it can " +
    "only be satisfied from above; all other digits are not long enough to " +
    "'make it' to that white square.",
  "In the upper row we have another pool forming, and it must be avoided " +
    "with a white cell, which can only be reached by the '4' to its right.",
  "Now the path for the '4', the final remaining unsolved number is clear.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "this puzzle. It is recommended to go through demo 1 first. Press the " +
    "'next' button to walk through the solving steps, or the 'back' button " +
    "to return to the previous step. You can also use the undo button to move " +
    "backwards individual steps, or continue playing forward if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to let us know " +
    "which rooms still need completion. Let's start with the '1' solves and " +
    "the number separation like in the first demo.</p>",
  "We can extend the direction of the '6' in the NW corner, complete the '3' " +
    "in the SW corner, and begin working on the middle bottom '3' and the '4' " +
    "in the SE corner. Meanwhile we can extend the black squares where they " +
    "would otherwise be stranded from connecting with others.",
  "The bottom row '3' is now completeable, as is the SE '4'. Their completions " +
    "and the previous ones strand more black 'rivers' that must be extended " +
    "to connect with others.",
  "The forcing downwards of the '6' and '3' rooms continues to force the " +
    "black river between them to grow downwards as well, until it is at risk " +
    "of being cut off completely. Meanwhile we can grow the '4' in the SW " +
    "corner upwards.",
  "Now the need for that left-side river to connect to the others forces it " +
    "to flow to the right, forcing a turn in the '3' and '4' numbers that " +
    "are coming together.",
  "Now the river to the left of the '2' must connect, so the '2' is forced " +
    "to the right.",
  "Now there are two inner squares at risk of being 'black pools' and must " +
    "be set to white. Also, the black square next to the six must extend " +
    "south one to avoid being stranded.",
  "Finally it should be clear how to complete the six without stranding the " +
    "black square on the right column. In this way you've completed the " +
    "puzzle by attacking those regions that are solveable and saving the " +
    "rest for last.",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
 [[],
  [],
  ["B23","B14","B25","B34"],
  ["B01","B51","B62","B53"],
  ["W10","W60","W50","W40","W42"],
  ["B20","B11","B41","B32","B43"],
  ["W30","B31"],
  ["B21","B63","B33"],
  ["W22","W44"],
  ["B45","B55","B64","W12","B03","B13"],
  ["W04","W05","W06","B15","B26"],
  ["W36","W46","W56","B66","B65"]],
 [[],
  ["B02","B11","B54","B45","B56","B65","B61","B72","B76"],
  ["W00","W10","W20","W70","W60","B50","W74","W67","W57","B03","B73","B66"],
  ["W64","B63","W47","B37","B46","B13","B21","B51","B53"],
  ["W30","W22","B31","W40","B41","W52","W42"],
  ["B32","B33","W23","B24","W43","B44","B34"],
  ["B14","W05","B15","B06"],
  ["W25","W35","B16"],
  ["W17","W27","W26","B36"]]];
