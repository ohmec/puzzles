// Ripple Effect puzzle definitions, must be of the form:
// WxH:<digit-descriptors>:<wall-descriptors-rows>:<wall-descriptors-cols>
// where W is puzzle width, H is height. digit descriptors are '-' for
// blank values, 1-9A-Z for digit values 1-35, or a-z for 1-26 consecutive
// blank tiles. wall descriptors are hex representations of 4
// consecutive wall values, 1 for true (wall is present), 0 for false,
// gathered into hex values. the ends of rows and columns are dropped
// off the hex, not wrapped into the next hex. for instance a grid
// of 6x6 would have 5 walls in each direction, and thus hex values
// could be (00000) 00 to (11111) F8.
const cannedPuzzles = [
  // example completed one
  "7x7:2153214.3214321.1325132.2132413.1543121.4121312.3214231:" +
      "40.e8.cc.e8.68.dc.c8:60.98.e4.ac.a8.bc.d8",
  // Godzilla sample puzzle
  "7x7:g.g.d1b.c2c.b4d.g.g:40.e8.cc.e8.68.dc.c8:60.98.e4.ac.a8.bc.d8",
  // D1 of 4
  "8x8:4f3.a3d2a.h.2b12b2.1b43b1.h.a3d1a.2f1:" +
      "76.4a.96.fa.bc.b6.aa.46:" +
      "46.7a.da.72.d6.fe.e8.18",                        // Godzilla 233
  "8x8:2g.g2.h.a5f.f4a.h.3g.g5:" +
      "4e.fa.4e.78.a8.ac.98.b4:" +
      "c8.54.f4.5e.fa.fe.54.74",                        // Godzilla 238
  "8x8:d1b6.c2a43a.b2c2a.a2e3.2e6a.a3c3b.a21a1c.3b1d:" +
      "68.f2.fe.64.c4.72.6c.46:" +
      "b4.cc.9a.7e.da.7c.4e.a4",                        // Godzilla 239
  "8x8:h.h.h.h.h.h.h.h:" +
      "f6.fe.36.36.68.6e.68.ee:" +
      "b6.74.70.14.54.9e.98.3e",                        // Godzilla 244
  "10x10:b12345b1.j.j.2h3.e1d.d5e.4h5.j.j.2b12345b:" +
      "550.548.4f0.f98.a80.f38.4b0.6d0.ce8.ca0:" +
      "250.290.7f0.690.7d0.7a0.5b8.7d0.f90.6d8",        // 2014 Box #4
  "10x10:b5c3c.c2c4b.a5c4c1.b1c4c.2c1c2a.a6c3c1.c1c4b." +
        "5c2c2a.b5c4c.c6c3b:8c8.798.740.ee8.de8.2a8.ef8." +
        "ed0.538.4f0:290.ac0.8a0.790.e98.490.d78.f40.f50.638",  // 2019 #1
  "10x10:jjjjjjjjjj:ec0.db0.fd8.ca8.bb8.fe8.b78.f70." +
        "de8.3f8:918.2a8.558.f30.3b0.de0.b40.f68.ed0.a28",      // 2019 #2
  "10x10:d4e.b2g.h3a.a1h.1h1.2h2.h1a.a5h.g5b.e5d:d28." +
        "7b0.770.768.7f0.a50.f70.958.fe0.6f8:d20.5b8.a70." +
        "320.4d8.dc0.8e8.6d0.d98.ea0",                          // 2019 #3
  // D2
  "10x10:jjjjjjjjjj:2d0.768.5a8.4e8.fa8.4a0.5f0.e68.bd8.c60:" +
        "d30.da0.ef8.bf8.b48.d78.738.ab0.ac8.370",               // 2019 #4
  "10x10:jjjjjjjjjj:970.230.278.d70.7d0.b60.938.f98.ae8.ef8:" +
        "fc8.de8.f78.e60.ef0.ff0.668.1f0.2a8.4e0",               // 2019 #5
  "10x10:j.f12b.d1e.b1g.4a2f5.1f2a6.g5b.e4d.b14f.j:958.4b0." +
        "760.958.3c8.f60.d48.d58.520.9c0:7b0.f48.bd0.d50.ca0." +
        "528.d58.7d8.7f8.e28",                                   // 2019 #6
  // D3
  "10x10:jjjjjjjjjj:160.cf0.378.b30.b68.560.598.5b8.950.968:" +
        "4d0.ed8.ed8.958.f50.370.b70.3d8.ac8.d30",                    // 2019 #11
  "10x10:j.1i.j.j.j.j.j.d4e.b23c4b.j:918.b50.d68.ee8.a50.338." +
        "538.b10.148.680:2d8.b68.e68.9d8.7b0.6b8.ab8.d98.da8.258",    // 2019 #12
  "17x17:e4k.d2l.q.c2g4e.c1d56a2a4c.e4g1c.f3a1h.c31b3i.h3h.i1b21c." +
        "h2a4f.c1g4e.c2a6a53d3c.e1g4c.q.l5d.k4e:f967.fad3.e862." +
        "fed6.9997.273e.7f7b.dfe9.2759.d2ec.467f.31ea.7ff7.28aa." +
        "689b.d8aa.e8a5:0eed.1fae.3afe.6bd3.a4fa.7def.647f.fc6f." +
        "71e7.fb2f.ad37.e2a6.e7fe.efa9.ebb9.5dca.537d",               // 2019 #13
  "17x17:k2e.e1h2b.a1o.d1l.f1f2c.1n2a.g1d2d.j2f.q." +
        "f4j.d4d3g.a4n3.c4f3f.l3d.o3a.b4h3e.e4k:" +
        "ba61.323a.cb72.27ba.abaa.49cb.f6fb.4d2f.cdad." +
        "f6b3.eaa9.452b.724e.a651.c6a4.547e.eb30:" +
        "3399.ce3e.edb5.7355.75df.b77f.926a.aebb.c52b." +
        "e32f.2b3b.6cac.daef.a54d.a7df.a477.aa1b",      // 2014 Box #7 Medium
  "10x18:j.j.j.h1a.j.i2.a3h.j.d6a2c.c2a4d.j.h4a.1i.j.a4h.j.j.j:" +
        "640.3e8.ff0.ff8.e60.a20.730.3d8.9e0.898.5a0.480.fe0.f70.df0.cf8.9a0.670:" +
        "c6e18.cbf18.cdcb0.bad78.9f3c8.9ea98.9eb88.9df90.ddbd8.afff8", // Godzilla 245 Medium
  "10x18:2c743c.c86b2b.a5c2a7a6.d1d5.1a2a3874b.4b3f.a7a6e2.b4f4.1b751a6b." +
        "c3a2b28.j.7a6e4a.3b2c4b.a2b4b8b.41d5c.5b67b5a3.j.b54a67c:" +
        "330.9e0.f38.920.998.ff0.998.360.a68.fe0.278.ea0.398.cf0.790.498.6f0.998:" +
        "c64d0.93f98.ff498.932f0.31f98.f3320.3edf8.92920.fcf78.939e0", // Godzilla 248 Medium
  "10x18:j.j.a3b2e.2a4g.a2h.6a5g.j.j.j.d1e.j.j.j.e5b2a.g5a6.h1a.g6a3.j:" +
        "7a8.e38.998.f58.ed8.2e0.590.b60.af8.a68.f60.b38.df0.e88.cb8.5e8.f20.890:" +
        "8b128.72f78.9edf0.772f8.b5568.e7d78.e92d8.ef6c8.4ffa8.26618",  // Godzilla 250 Medium
  "10x18:c4f.d2e.j.j.d5e.j.h4a.e1d.b6g.g4b.d4e.a3h.j.e4d.j.j.e1d.f6c:" +
        "958.558.5d8.d50.558.350.5c8.aa0.d50.d50.4a0.5a8.4f0.d90.540.6a8.ea8.558:" +
        "7e948.dd5d0.5eb98.55ba0.37668.73768.a66e8.a7560.6bda8.37fa0",  // Godzilla 252 Hard
  // D4
  "14x24:2d4b2d4.n.b21f14b.b13f52b.n.4d3b2d5.n.b13b53b64b.n.2d2b1d4.n.b12f31b." +
        "b34f12b.n.4d6b2d4.n.b21b24b21b.n.1d4b1d1.n.b12f12b.b35f21b.n.2d1b5d1:" +
        "6550.bd50.d5f8.bd90.b5c8.1d10.2d50.55d8.d550.0d00.dd08.d5d8." +
        "ddf8.9d88.0718.d5d0.d5d0.d550.87a0.0df0.8568.0df8.8758.0f28:"+
        "9da67e.ece67e.6eee7e.9cee7e.fec67e.54b67e.249268." +
        "24964c.1fea68.54f6f4.fcfe5a.dcee7e.74df56.4fc34a",             // Godzilla 256 Hard
  "17x17:qqqqqqqqqqqqqqqqq:" +                          // 2014 Box #10 Hard
        "dfa6.6fbf.d336.fd3b.dd1a.bff8.b72a.9f78.2566." +
        "2fc8.7aef.6aad.bf2e.b3ef.374f.2796.e797:" +
        "e6d2.35d7.2dd6.fb91.4ff7.69df.a852.2990.7a5e." +
        "bec9.baef.96d7.5bd5.abc7.4b50.eff4.3fcb",
  "14x24:nnnnnnnnnnnnnnnnnnnnnnnn:" +
        "57c8.65c8.faf0.9fc8.e630.2dd0.2278.7660.6e60.ae68.96a8.6ff8." +
        "7e50.63e8.9cd8.66c8.dd90.df38.f748.be50.7fa8.d6b8.b6c8.f228:" +
        "ae4e3a.f6ef44.4d593a.ff6f4c.4d7e5c.7cd364.9f2d62." +
        "7576aa.596bba.3d56b6.de29d6.f3f55e.efdbf6.1b452c",             // Godzilla 258 Hard
];
let puzzleChoice = 2;
let puzzleCount = cannedPuzzles.length;

// which puzzles have demos
const demoPuzzles =  [1,2];
// which puzzles are at which level [D1,D2,D3,D4]
const puzzleLevels = [1,10,13,21];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many incomplete rooms (polyominos). For our first time through we can " +
    "turn on Assist Mode 2 to see any errors that we might generate in the " +
    "process of the solve.</p>",
  "Easy ones to knock out are single-tile rooms, where the only solution " +
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
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
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
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
 [[],
  [],
  ["201","121","551"],
  ["311","461","661"],
  ["452","653","562"],
  ["543","433","441","344"],
  ["262","363","351"],
  ["323","522","531","161","152","253"],
  ["222","143","112","213","002","103","011"],
  ["025","064","051","042","033"],
  ["612","511","634","621","642"],
  ["134","235","504","603","401","302","415"]],
 [[],
  ["021","061","261","311","451","601"],
  ["041","052","151","241","253","221","421","412","541","552","711"],
  ["033","144","131","122","323","214","232","012","101","171","274"],
  ["363","462","354","533","631","642","203","504","624","511","522"],
  ["723","732","744","751","564","762","653","573","672"]]];
