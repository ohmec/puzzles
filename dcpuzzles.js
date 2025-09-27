// Nurikabe puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the initial or current values. 1-9 are digit values, a-z
// define from 1-26 spaces in between digits, A-Z are digit
// values 10-35, '-' is one space, and '*' is blackened.
let cannedPuzzles = [
  // example from booklet
  "8x8:a1b21a1c1a2bg1b24d22c4bf3aa9d3af3a:e4.37.e0.1d.1d.e3.e2.e0:" +
      "da.f2.72.a2.8c.04.04.04:48.78.98.b8.58.c8.d8.58",                  // solved
  // D1
  "8x8:a1b21a1c1a2bg1b24d22c4bf3aa9d3af3a:e4.37.e0.1d.1d.e3.e2.e0",
  "6x6:d51.d51.f.9e.c3b.c33a:18.1c.10.e0.ec.e4",                          // 2020 #1
  "6x6:a26a63.b6a63.1c33.1d1.1e.1e:44.44.b4.b4.b0.8c",                    // 2020 #2
  "6x6:b31b.f.1344b.b4c.4c2a.d2a:cc.cc.30.30.c8.c8",                      // 2020 #3
  "6x6:d44.c224.f.1c4a.b244a.d23:1c.1c.80.1c.7c.1c",                      // 2020 #4
  "10x10:9b5f.c3e2.c3f.c3f.h1a.h1a.5a25d1a.b2e1a.c2d1a.c3d16:" +
        "000.0fc.064.f00.fcc.f8c.f8c.e8c.8cc.18c",                        // 2020 #5
  "10x10:b555e.b545e.b444b3b.j.a42b1a1b.3a2g.1d41c.h6a.c1c36a.1b1d6a:" +
        "b94.3a8.384.c60.e70.260.090.eac.7ac.5ac",                        // 2020 #6
  "10x10:431a2c13.g24a.j.j.j.b2c1c.h34.b2g.e2b2a.51b1e:" +
        "830.bb0.b80.bbc.03c.f00.f74.074.374.304",                        // 2020 #7
  "10x10:a1d8a5a.1i.a3a1a1d.j.f1c.j.5a1c3c.c1c4b.8i.j:" +
        "434.c34.7f4.8b4.d20.ef8.100.0e0.f0c.f0c",                        // 2020 #8
  "10x10:j.1b4a6a2b.g1b.i3.b1d2b.a6h.j.d2c1a.i1.c5e6:" +
        "3c0240e7c3e4224224e3c7fc6407c0",
  "10x10:c1f.b61f.b11c9b.b1c4c.g1b.j.1f1b.e91c.g1b.g1Aa:" +
        "f00.f00.100.3e0.3f0.dec.03c.e0c.e3c.e1c",                        // 2023 #1
  "10x10:d3e.f2c.9i.88e5a4.e1d.j.j.7i.j.h6a:" +
        "ef8.e80.ec8.c58.c3c.c4c.c4c.860.860.f80",                        // 2023 #2
  "10x10:a13g.i3.i1.1i.4i.j.d1b1a3.2i.1i.g134:" +
        "fbc.8a4.8a4.8bc.f80.078.e78.a00.ee0.0e0",                        // 2023 #3
  "10x10:fBc.e8d.e8d.a8d999a.i6.j.j.b1a9e.d9b3b.d9d3:" +
        "01c.3c4.3c4.9c4.9c0.9dc.81c.b1c.f1c.f00",                        // 2023 #4
  "10x10:9b21e.c2e1.i2.333c6c.j.j.j.a3c2d.c3f.6b2d45:" +
        "f80.f04.e34.e34.034.4f8.4b0.4b0.e30.e70",                        // box2014 #1
  // D2
  "10x10:4g32.3i.2i.5i.j.g3b.b4g.4i.j.4f134:" +
        "ff8.008.fac.1a4.224.984.f04.70c.11c.f1c",                        // box2014 #2
  "10x10:8i.226d6b.a11g.b3c1c.j.j.f1c.f3c.a5a2f.2i:" +
        "ff4.000.9f4.f90.384.084.cb4.8b4.580.7bc",                        // box2014 #3
  "10x10:f3c.b88f.b88f.b88b1c.b88f.a2h.d22d.b1a44b44.d44b44.52b22b22:" +
        "330.330.330.330.330.ccc.ccc.ccc.ccc.ccc",                        // box2014 #4
  "10x10:c6c3a3.a9f5a.i1.f2c.j.f1c.e2d.e4d.a66g.3i:" +
        "19c.19c.19c.e60.e60.e60.e60.e60.e60.19c",                        // 2023 #5
  "10x10:6h2.5c65d.a3h.b3c2c.d1d1.5d5d.c5c5b.h1a.d33c3.1h6:" +
        "0f0.07c.c3c.e0c.f04.7c0.3e0.0f0.07c.c3c",                        // 2023 #6
  "10x10:42h.d1c42.32h.f4c.j.c5f.j.3i.f42b.g3b:" +
        "1dc.01c.780.7bc.03c.f00.f78.078.e00.ee0",                        // 2023 #7
  "10x10:3c1a4a1a.a1h.2e2c.b1a1e.c4f.1h2.c1d1a.f3c.b5a1c4a.j:" +
        "c4c.c4c.38c.c70.c70.38c.38c.c70.c8c.c8c",                        // 2023 #8
  "10x10:b5b1d.j.a14g.1b2d3a.f3c.c1a2d.j.b1b2d.a1d2c.a66c2c:" +
        "08c.0dc.7d0.fc4.e1c.314.2fc.3f0.630.030",                        // 2023 #9
  "10x10:c5f.c3f.a1d3a2a.e22c.1i.e1a1a3.a1h.j.e1c2.a2a2f:" +
        "fa0.104.114.534.1e8.f70.fec.a24.f20.90c",                        // 2023 #10
  "10x10:6b6b6b5.2d4a3b.d1e.i5.3h5.a1f1a.c1a1d.h3a.a4h.2i:" +
        "1e0.1e0.dec.c0c.5d8.5d8.330.330.000.ffc",                        // 2023 #11
  "10x10:4d3d.h4a.5b1b4c.3b4f.j.j.f4b2.c1e1.a1h.d3d3:" +
        "38c.38c.d90.e60.e60.19c.19c.26c.c70.c70",                        // 2023 #12
  "10x10:c7b5c.b3g.b4a4e.j.j.j.g8b.42c28448.j.3i:" +
        "f4c.e60.f30.e00.030.030.080.ebc.fbc.e3c",                        // 2020 #9
  "10x10:b32f.j.d2a53b.j.45h.d3a2c.b4g.i1.a4a4a2c3.i2:" +
        "f50.970.924.b2c.e78.0cc.fa0.42c.c2c.02c",                        // 2020 #10
  "10x10:21a3b1c.e2d.c2d1a.c1f.5e3c.h5a.1i.c1f.h5a.b13431c:" +
        "ce0.ce0.31c.31c.ce0.ce0.ce0.31c.31c.31c",                        // 2020 #11
  "10x10:j.a444b6a6a.a994f.f5a5a.a9a4f.f5a3a.a4a9f.f663a.a4a4b644a.j:" +
        "35c.34c.ec4.efc.e64.004.870.870.f10.11c",                        // 2020 #12
  "10x10:a2544a531a.b544e.j.c44e.c44a1c.a3h.j.1b5f.f1c.31h:" +
        "de8.1c8.0d8.000.660.7e4.4f4.d94.c94.d9c",                        // 2020 #13
  "10x10:c4d2a.a5d3c.4h1.j.c24e.b4d5b.c3b3c.j.h3a.3g4a:" +
        "068.548.774.040.fdc.90c.818.fe0.eec.03c",                        // 2020 #14
  "10x10:a4b145c.d2d3.b3g.b2g.j.b3e41.3d53c.j.1i.c2b3a1a:" +
        "738.e1c.c0c.8e4.1e0.1e0.9c4.c0c.e1c.738",                        // 2020 #15
  // D3
  "10x10:c2f.5c4d4.a1f1a.g3b.j.a4b2e.3i.a1a1f.5i.c4a3c6:" +
        "000.000.ffc.ffc.ffc.000.000.000.ffc.ffc",                        // box2014 #5
  "10x10:f4a1a.a2a3e3.j.f3c.a1a1e4.e2d.c3b4c.j.1g4a.a2h:" +
        "dec.d2c.120.120.ed4.adc.120.120.d2c.dec",                        // box2014 #6
  "16x16:6f2g4.b1d8e1b.i2a5a2b.2a6j5b.h1c7a4a.p.p.g4a3f." +
        "m1b.g1h.4o.1a1k32.d4k.d1k.a36a4e36b9a.b3m:" +
        "e338.ef38.ef38.0038.01c7.81c7.9f07.9f38.1f78." +
        "c143.c1e3.cee3.0ee0.eee7.e107.e067",                             // box2014 #7
  "10x10:j.b3g.a3b13d.4a43f.a53g.a3h.a2e3b.c2f.c3a53c.j:" +
        "f54.f58.008.1e0.1ec.1e4.5e4.40c.f04.f28",                        // 2023 #13
  "10x10:f3b7.a2f2a.7a7g.9a9g.j.j.9a9g.5a5g.f4b4.h4a:" +
        "e1c.f1c.e1c.160.1e0.1e0.1e0.e08.e1c.e1c",                        // 2023 #14
  "10x10:a7d7c.a37g.j.e3d.f7c.h7a.e1d.b7g.a1h.j:" +
        "ccc.ccc.ccc.ccc.ccc.330.330.330.330.330",                        // 2023 #15
  "10x10:1a1a1a2c.d5b1b.a3a11e.2c1e.e1a1b.f4c.j.g241.b4g.i1:" +
        "a8c.f94.f10.ae0.058.03c.c40.a3c.7b8.23c",                        // 2023 #16 tricky and fun
  "10x10:5g1a.b2g.4a4c4c.j.j.i5.24c6d.j.j.c3c1a4:" +
        "e0c.c1c.3e0.3e0.c1c.e0c.1f0.1f0.e0c.c1c",                        // 2020 #16
  "10x10:h3a.2e5c.a4h.a3f2a.a1a3f.j.j.a2h.g52a.d2c3a:" +
        "878.784.784.784.784.878.878.878.878.784",                        // 2020 #17
  "10x10:a3f25.c5a5a2b.1a2d5b.4b4e3.j.j.2g5a.a4a5f.i2.a3e32a:" +
        "c1c.d9c.19c.780.780.078.078.e60.e6c.e0c",                        // 2020 #18
  "10x10:4g1a.j.j.4i.f4c.j.j.h4a.a4b4e.j:" +
        "304.30c.f0c.39c.39c.ffc.0fc.000.6c0.6c4",                        // 2020 #19
  "10x10:c38a2c.b1d1b.h2a.a2h.i1.1i.h3a.a2h.b2d1b.c3a71c:" +
        "15c.554.15c.f40.07c.f80.0bc.ea0.aa8.ea0",                        // 2020 #20
  "16x16:m68a.a9a3b2d6268a.c2h268a.a3i5a68a.p.g57a2e.c5l.13l4a." +
        "c33k.c66k.f7a4g.p.2f4a3b1234.c1c1f9a.j2c19.563d7f9a:" +
        "e30f.fc2f.e44f.447f.44d0.4410.7c3c.ce3c.0073.18e1." +
        "18e3.db07.020f.fbf0.fa9a.fbf0",                                  // 2020 #21
  "16x16:j4c34.8l99a.1c1b1f9a.d2b3h.a6f2g.m188.e2j.i2f.2a6a62d2b3b." +
        "b1h44b1.d6a3g33.dCd1a4b4a.4j3d.CCCm.e2f2b2.e1b1a3a2442:" +
        "f12f.f1ef.0e0f.ce0f.ce00.c007.c3c7.03c7.e3c0.e3c3.e003." +
        "0073.f073.f070.f78f.f48f",                                       // 2023 #17 methodical and fun
  "16x16:21a2c5h.b8b1h1a.2f1b1e.l1c.4a1d2a1d34.h1e2a.b3k2a.14n." +
        "j1e.4m2a.p.5a1j6b.e3i2.f1a2g.a1i9d.2d13b1a2b13:" +
        "b800.bbf3.bbd3.b853.805b.8018.f99e.fbc0.03df." +
        "799f.1801.da01.ca1d.cbdd.cfdd.001d",                             // 2023 #18, nice, tricky in the middle
  "16x16:e5j.b12b5c5a1b2.c2a5c5f.h2c22b.2f5e55a.d5a5b1a1d.c5a5b5d2b." +
        "a1d1d5d.b5a5c5a5e.b1k25.l1c.c5l.a1h5b51a.b5c52b5e.p.e25g1a:" +
        "1f84.5e98.463f.e1d1.3b97.cce9.244f.2f48.3ba3.24b0.fc7c.70ec." +
        "0944.1e8e.76b8.772c",                                            // 2023 #19
  "16x16:g4a4c366.n66.n66.f19g1.cAl.a3i3a4b.f1b1d1a.b4j2b.3j2d.g3h." +
        "4g7d1a3.4d7a7a7f.4g7g.p.666h9d.4b49k:" +
        "0014.11d4.01d4.bfdf.bc1e.b530.7f7e.6131.6f39.6e39.01c6.01c6." +
        "01c6.ee39.ee39.fe3b",                                            // 2023 #20
  "16x16:f36h.f3i.a1l8a.b5a1f1c3.a2n.j4e.k2d.a3m2.i3f.a1a6d1e8a." +
        "e6c3d8a.i35d2.k52c.a727g8b8a.p.d3i82:" +
        "70e1.70e1.70e1.f7ef.870e.870e.873e.1c38.1c38.7ce1.70e1.70e1." +
        "f7ef.870e.870e.870e",                                            // 2023 #21
  "16x16:25d5bAAc1a.o3.n6a.b7c4i.jAe.e4dA2d.m3b.c1g3d.d6f6d.7c6f6d." +
        "d42g2b.g44c5c.f5c3b2b.3c6k.a2h24a34a.e43h6:" +
        "718e.718e.1db8.1db8.0180.f99f.fc3f.8c31.8c31.fc3f.f99f.0180." +
        "1db8.1db8.718e.718e",                                            // 2023 #22
  "16x16:h4g.d8d1f.e8f13a4.p.b15f3a1c.h1g.d1b2c4d.a5l4a.p.dFc2a2e." +
        "4k4c.j4d1.a3d1i.c4l.c1l.4o:" +
        "a017.fed2.00b4.4f8e.0371.2cab.45cd.f8e8.8917.8074.87b2.048e." +
        "f6a1.f1dc.f1e7.f1ef",                                            // 2023 #23
  "16x16:g321e1.n2a.m3b.7k4c.eLe5d.6o.jLd1.5n2.o3.4o.p.3o.p.2o.p." +
        "1a2a3a4a5a6a7c:" +
        "1fcb.3bf0.5067.7d37.0518.7791.cfcd.1a64.af08.17a0.9336.1b92." +
        "b990.3f5f.ba21.124f",                                            // 2023 #24
  // D4
  "16x16:d4b4a4c1a4.a9b4i1a.39e4e4b.n1a.4h3f.a1d63h.e16i." +
        "m42a.d1d23c41.l2c.f1i.b5f2e2.f2b2a1a1b.p.54a1k6.e2j:" +
        "0195.039f.0fe1.fe07.bfc0.fe02.8bce.837e.0b61.cb67." +
        "f826.80e6.bde4.a47c.b33c.03c1",                                  // box2014 #8
];
let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;
const demoPuzzles = [1,16];
const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many incomplete digits and rooms which we need to solve. For our " +
    "first time through we can turn on Assist Mode 2 to see any errors " +
    "that we might generate in the process of the solve, and to visualize " +
    "the groups better.</p>",
  "For Double Choco the easy first moves are to find digit-defined rooms " +
    "that can only be satisfied with one shape. These are often '1' " +
    "numbers or large numbers that are fully constrained. On this board, " +
    "we can see three '1' digits in one colored cell where there is only " +
    "one other opposite colored cell adjacent. We can lock those into " +
    "a two cell room to complete their definition.",
  "Meanwhile, the '9' in the lower left corner is among only nine gray " +
    "cell neighbors, so we know the final result must be two adjacent " +
    "3x3 squares of opposite color. Looking at its neighbors, there is " +
    "only one 3x3 square of white cells that could possibly be joined " +
    "to complete the shape.",
  "Now looking at the board, we have two more straightforward solves. " +
    "First, the '1' near the upper right is now constrained to go " +
    "downwards. Also, the white portion of the '3' in the lower right " +
    "is also clear. It might appear that there are two options to " +
    "make an L-shaped gray collection, however if it doesn't contain " +
    "both '3' digits, then the lower one would be isolated. Therefore " +
    "it must contain both, locking in its location as well.",
  "Now it appears that all of the numbered cells have multiple options. " +
    "We will address those next. But we can see that there are two " +
    "un-numbered gray isolates that must be part of an un-numbered " +
    "two-cell pairing. The first is in the upper left corner, and " +
    "the second is on the right wall. These can be paired now.",
  "OK, let's walk through each of the remaining numbered cells to see " +
    "if there is an obvious solution for any. First, the white '2' " +
    "on the top row: it could be two horizontal paired with two grays " +
    "to the left, or two vertical paired with 2 grays to the right. " +
    "Likewise the gray '2' next to it could go either left or down. " +
    "Next the '1' near the top also has three potential solutions, " +
    "thus we must still wait. Now, concentrating on the '4's in the " +
    "middle. We can first deduce that they <b>must</b> be paired " +
    "together, since there is not room for two sets of 4 gray cells. " +
    "Next we can deduce that they must form an 'L' shape in order to " +
    "be paired in that space. Thus we must look for space amongst " +
    "the white cells to form an 'L' of size 4 to match. There is " +
    "only one place that set of four can be located that doesn't " +
    "have any non-'4' digits within it. Rather than complete the " +
    "pairing let's just circle those four white cells to visualize " +
    "them together.",
  "Now that we see those four white cells together, we see that " +
    "between the two options for the shape of the gray 'L', only the " +
    "one with its long side on top will connect with the drawn " +
    "white cells.",
  "Now with the '4' cells solved, some of the upper portion can " +
    "be completed. The gray '2' can only connect in one direction: " +
    "to the left.",
  "Now it appears we're back to a situation where every cell has " +
    "multiple options. But let's make a critical observation about " +
    "the sets of white '2's on the left side. If the two in the " +
    "lower row were joined together, then they would have no ability " +
    "to connect with any gray cells. Thus they must be independent, " +
    "so we have a situation with three sets of '2' sized white halves. " +
    "We can carve out the leftmost '2' upwards in order to allow it " +
    "to connect with gray counterparts. Once done, there is only one " +
    "way to complete its gray half.",
  "With the same mindset, we can complete the other two '2' pairs. " +
    "The lower one can only join gray cells to the right, and once " +
    "that is completed, the upper one is constrained as well.",
  "Now the remaining cells are easy to complete, as the gray cell on " +
    "the top row is isolated, and must go to the right.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "a tougher puzzle, using some more advanced techniques in some cases. " +
    "It is recommended to go through demo 1 first. Press the 'next' button " +
    "to walk through the solving steps, or the 'back' button to return to " +
    "the previous step. You can also use the undo button to move backwards " +
    "individual steps, or continue playing forward if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to visualize " +
    "rooms as they are completed, and show the number of rooms left to " +
    "complete. Looking at this tougher board it doesn't appear that there " +
    "a lot of progress that can be made initially. One exception is the '1' " +
    "on the bottom row. But we can begin to draw some partial boundaries " +
    "in a few places that can help us visualize the future solutions. " +
    "For example, the '4' in the upper left must grow to the right, and " +
    "can't combine with the '3' below it. That '3' itself must grow to " +
    "the right, but can't connect with the '2' below it. And that '2' " +
    "should be isolated from the '5' below that. Additionally, the '4' in " +
    "the lower left corner must grow to the right and can't connect to " +
    "the white space above it.</p>",
  "Now that these are visualized it is likely easier to see that the " +
    "numbers in the upper left can all be completed, since there are " +
    "limitations as to where they can connect to the opposite color cells. " +
    "Likewise the '4' in the lower left has only one place to go to find " +
    "four white cells in a row.",
  "Now the '5' on the left side is clearly delimited in the white half. " +
    "The gray version of the same shape isn't at first as clear, but " +
    "looking around there is only one place that could fit this same " +
    "stair-step shape.",
  "With these completed, we can see the simple completion of the '4' in the " +
    "lower left. Also, we can see one isolated gray cell in the middle of the " +
    "left portion of the board. This can be completed as well.",
  "At this stage it appears that there is no place to make definitive " +
    "progress, with all numbers having multiple options. However, a closer " +
    "look at the '3' in the upper right reveals that there is indeed a " +
    "solution available at this time. If it were to grow in the gray area " +
    "even one cell to the left, it would isolate the other gray cells further " +
    "to the left. Thus it must grow downwards. We can isolate it from the " +
    "other gray cells and evaluate what remains.",
  "With just the small separation drawn, we can see at least one gray/white " +
    "combo ready to be completed. This is the four gray in a row on the top " +
    "row, which can only be completed with four white straight down below " +
    "them. With that in place, the '3' and '2' to the right of it are also " +
    "easy to complete.",
  "With these pieces placed and completed, we can now make a critical " +
    "observation in the lower right corner. Like with the '3' on the top " +
    "row earlier, the '4' can similarly be constrained. It appears that " +
    "it could be either a straight line of four, or a 3:1 'L' shape. " +
    "However, a straight line of four would isolate two gray cells above " +
    "it. We can draw the separation between the gray cells.",
  "With these separations drawn, we still can't conclude the '3' and '4' " +
    "shapes. However, we can complete the three isolated gray cells on " +
    "the right column, which must connect with three straight white " +
    "cells in the interior.",
  "With this completed, we can finish off the '4' and the '3' rooms below " +
    "it. The '4' grows to the left, and must then jog upwards in order to " +
    "leave room for the '3'. These can be thus completed.",
  "The final pieces can easily be put into place at this point. The '3' " +
    "digit's white collection can only be satisfied with the three gray " +
    "pieces above, which leaves straightforward constraints on the final " +
    "two rooms of two grays and whites apiece.",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
 [[],
  [],
  ["|00","|10","_11","|11","|01","|04","_05","_06","|06","|16","_17"],
  ["_40","_41","_42","_43","_44","_45","|55","|65","|75"],
  ["|26","|36","_37","_46","_47"],
  ["_10","|45","_36"],
  ["|23","_14","_15","_16"],
  ["_23","|32","_33","_34","|44"],
  ["|03","|13"],
  ["|30","|40","_21","|21"],
  ["_31","_32","_02","|12","|22"],
  ["_03"]],
 [[],
  ["|95","_86","_87","|97","_00","_01","_02","_10","_11","_20","_80","_81","_82","_83"],
  ["|03","|12","_13","_14","_15","_16","_04","_05","_06","|16","|21","_22","_23","_24",
   "|24","|30","_31","_32","|32","|83","|73","|63","_54","|64","|74","|84","|94"],
  ["_60","|70","_71","_72","|72","_62","|61","_52","|52","_42","|41"],
  ["_53","_33","|43","_43"],
  ["|07","|08","|18","|28"],
  ["|26","|36","|46","_47","|47","|37","|27","|17","|57","_58","|58","|48","|38","_39"],
  ["_69","_78","|88","|98"],
  ["_57","_56","|65","_66","_67","_68"],
  ["_55","_75","_76","_77"],
  ["|54","_45","|45","|35","|25","_34","_35"]]];
