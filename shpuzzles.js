// Shakashaka puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the black squares with or without digits at the beginning.
// The value 0-4 is for numbered cells, and * is for a black
// square without a number. a-z define from 1-26 white cells in
// between black cells, or '-' for one space. The first entry also
// includes solution values representing the diagonal cells,
// NE (A), SE (B), SW (C), NW (D)
let cannedPuzzles = [
  // example completed one
  "6x6:DA2DA-.CB*CB*.-*-DA2.DA-C-A.C-A*CB.2CB-*1", 
  // demos
  "6x6:b2c.b*b*.a*c2.f.c*b.2c*1",
  // D1
  "8x8:2f0.c*d.d4c.1d3b.e*b.1g.c*c2.1b*b2*",                          // v189 #1
  "10x10:1b**b2b.2c3b*b.e4d.j.c*c*b.c*d3*.3c4d*.j.j.2e3b2",           // box2014 #1
  "10x10:2b3d21.j.d*e.2b4d*a.*3h.*c*e.e4d.f*b3.2b*c3b.c12b2b",        // 2018 #1
  "8x8:00b1c.h.h.b4c*1.2*c*b.h.h.c3b*1",                              // v189 #2
  "10x10:1c0d2.*i.j.b*c4b3.3b4f.d4e.j.h31.a2h.a0c3d",                 // 2018 #2
  "10x10:b2*f.d3e.e4c3.b3c4c.g*b.i2.3c0b*b.j.j.2e2b0",                // 2018 #3
  "10x10:b1*2e.b1*f.1b*d32.*b*2b4b.b1g.e*c3.1**g.2b4b4c.e3c2.e2b**",  // v189 #3
  "10x10:1c22d.j.f4b2.3b21e.j.d3e.c3b4b3.j.c1f.b2*1d1",               // box2014 #2
  "10x10:2b3d0*.h21.e*d.j.d2d1.3d3d.j.d4e.12h.*1d2b0",                // 2018 #4
  "10x10:2b*1e.d3e.h*1.f4c.b4b*d.c3f.i3.e*d.d3b3b.0c2b1b",            // v189 #4
  "10x10:b3d3b.j.i*.*d2d.d4e.c2d30.3i.j.j.b0c3b2",                    // 2018 #5

  // D2
  "10x10:2d3c*.i2.d4e.e4d.j.0c3b4b.j.i3.c2f.c2b1c",                   // v189 #5
  "10x10:b3d3b.j.f4c.0b1f.d1e.i3.*i.e*d.j.2c2b3b",                    // box2014 #3
  "10x10:0i.j.e3b2a.d*2b*a.3b4f.b*d4b.h*2.j.j.2b3b3b2",               // 2018 #6
  "10x10:*d3d.1i.h32.c2f.b4b13c.1*h.*c3c*1.b4g.j.c***2c",             // 2018 #7
  "10x10:d3b1b.j.j.3h1.e2d.d4e.3h2.j.j.b2b1d",                        // v189 #6
  "10x10:*e1c.j.h2*.1i.c0f.b2d2b.i3.j.1i.*c3b*b",                     // box2014 #4
  "10x10:2b3b3c.j.j.g0b.j.2a0a3e.h21.i1.f22b.1b3c1b",                 // 2018 #8
  "10x10:b*2b*b2.b2g.2i.c4b2a2a.b3g.f*c.c*f.2c4d2.e3d.b2d2b",         // 2018 #9
  "10x10:g2b.b2g.e3d.j.b0f2.c2f.d2b1b.j.j.b2c3c",                     // v189 #7
  "10x10:e2c0.e2c2.j.3b4f.j.d3e.j.13d2b3.f2c.b3g",                    // box2014 #5
  "10x10:0b*b2b*.j.j.*b0b*b3.j.j.2b3b4b*.j.j.*b3b*b2",                // 2018 #10
  "10x10:b3d0b.j.j.*3c3a2b.b4g.j.f3b2.12h.j.d3d2",                    // 2018 #11
  "10x10:*h1.2h2.b20b*c.f1c.j.b*f*.b1f1.j.e*d.*1c0d",                 // v189 #8
  "10x10:1**0d21.j.j.b2g.e4c1.3c3e.g3b.j.j.*0d20*0",                  // box2014 #6
  "10x10:02b3d*.i0.j.e3d.c3e2.*e3c.d3e.j.2i.1d0b1*",                  // 2018 #12
  "10x10:2c0d0.j.j.c4b3c.d**b3a.d11d.3b3b3c.i2.d2e.g2b",              // 2018 #13
  "10x10:a2e3b.j.h2*.c1f.22d1c.i2.c4f.2i.j.b2e2*",                    // 2018 #14
  "17x17:2c0c*c2c1.d2c3h.d*d4g.e2k.0d3h20*.f3e*2c.k0e.b4n." +
        "2*m**.n3b.e3k.c*3e4f.1*2h3d1.k1e.g2d*d.h*c1d." +
        "0c3c0c*c2",                                                  // 2018 #17
  // D3
  "10x10:c2e*.c2e*.i0.f3b2.3b2f.d3e.e2d.*i.j.b11*e",                  // v189 #9
  "10x10:*c3b1b.2f*b.i2.e3d.c1f.b**f.b1e**.***d4b.*c2e.0c*1d",        // v189 #10
  "10x10:b3g.f3c.3b3e3.e3d.j.j.b3b3d.3i.c3f.g3b",                     // 2018 #15
  "10x10:1b1c3b.*i.i1.b*g.c3e1.2b3f.b2g.e2b11.e1d.b1b*d",             // 2018 #16
  "17x17:**b2****c2d.e2b2c*d.n*b.o3*.2c3e0e*.*3c4c*f*.f*h2*.q." +
        "h3h.3c0d4g.c0**d3c1*2.d0***d1*c.e*g0c.a*f1h.i1g.c2f*f." +
        "1*a*2e1b2b2",                                                // v189 #11
  "17x17:12f0d*c.h1h.j2c*b.d4h2c.0d4f4b20.f2j.q.i4g.c3c1d*c2." +
        "*b1b*f0b*.0d1h***.q.l*d.*3i4e.2i*e3.c1m.c**c2**2e",          // box2014 #7
  "17x17:11b0c0c3c0.d0c1h.d3e12e.l3d.f*i2.f3b2e10.3p.e2k." +
        "c3b4g3b.b*g0d10.q.*a0d*i.f4d*d2.e4d3f.3c*l.i3f2." +
        "b*a0c21e2*",                                                 // 2018 #18
  "17x17:1*2b2c21b22b.q.l2d.q.*b3k30.1i3f.0e3b2c3c.e3k.q.k4e." +
        "c3c*b4e2.f*i0.22k2b2.q.d3l.q.b2*b20c2b11*",                  // v189 #12
  "17x17:c211c012b3b.e*k.2p.c3g3**b1.c*b20h0.2b3b2h*1.*j30d." +
        "1k3d.q.d2k1.d*2j*.1*h*b3b2.*h1*b0c.0b**3g3c.p2.k3e." +
        "b3b202c**1c",                                                // 2018 #19
  "17x17:c3d*b2b2b.q.2e2i3.c2m.g4f1b.j2f.c3m.h3c2d.p3.2p." +
        "f3b2c*c.p3.g3i.b2g3c3b.h3g1.2p.d3d3b2d",                     // 2022 #18
  "17x17:2p.f2d3e.e2f3d.d2b4e3b1.*g4h.i3f1.f*j.b4n.c4f1c3b.d4l." +
        "e*a3c2d3.j4b4c.f*b4g.h4f3a.c2j4b.d2d3c3c.a2c2k",             // v189 #13
  "17x17:02b3b*b1c3b.q.c3e3f*.2c*c2h.e4k.p2.a3e1h0.b*e0f1a." +
        "c4e*2b2c.l*d.1*2m2.i1e30.j**1d.e33f2c.0c4j31.k1e." +
        "g11b1b3b",                                                   // box2014 #8
  "17x17:b3b3d2e1.p*.l31b0.e32b3g.d3d*g.i2d3b.121b2h3b." +
        "c**e13e.i0f2.2d1*b2g.b*f2c1c.b*d1i.1f*h2.*f2i." +
        "*b01*h3b.k2b2b.f3d2b1b",                                     // 2018 #20
  "17x17:2b3b1c2b1b0.q.q.2b4b1c4b3b1.q.q.1b2b0c3b2b3.q.q.q." +
        "0b3b4c2b4b1.q.q.2b3b2c3b3b1.q.q.2b3b2c3b1b0",                // 2018 #21
  "17x17:0c2d3b2*c.e3i20.q.q.3b31f1e.e2d00e.f1j.p2.0d4i3a." +
        "a1i*e.b1g1f.q.a3e4h3.2g2b*3d.h1b2e.e0k.2c0*j0",              // 2022 #19
  "17x17:2h2f2.q.c3d3h.d*h1c.2d*d*e1.q.i*c3c.b3c3g3b.c2c3c2e." +
        "q.f2f*b2.1p.q.b1b2f0c2.k1e.q.2e3f2b2",                       // box2014 #9
  "17x17:1c*b1**c3b*.*f*0h.2p.d4i**2.e3*f0c.m1c.a*k*b*." +
        "b*g0f.f2*a02f.f3f*2b.1b3k3a.c*m.c*g3e.**3i*d.p2." +
        "h21f0.*b0c2**b3c*",                                          // 2022 #20
  "17x17:f1d2e.c*m.i1f3.q.c3m.2c4e2b2c.e2*e*d.b2i0d.l0b2a.e*c2g.q." +
        "f32b1c*b.22c3k.p3.j3f.f3j.0e2f2c",                           // v189 #14
  "17x17:b1*e*1f.b2*1c1*1d1*.c20c11d2**.n11a.q.3c*2k.c0*0i11." +
        "c21i***.n11a.2d*2d*1d.e2**b2*0d.f10b1*e.q.n21a." +
        "c*2d21b**1a.b0*1c1*1b*1b.b0*d**g",                           // 2018 #22
  "17x17:c2b3b1c2c.n*b.3f2i.c2i2c.e2k.g1c*d3.c*i1c.b*n.a3c2k." +
        "q.f3j.k1b2b.e*b1h.0l*b3.c*j*b.e1k.b3c*f3c",                  // 2022 #21
  "17x17:c0c3h2.l3d.3j4e.c1m.q.c3b3j.1j1b0b.g*i.f1j.e3d4f." +
        "a*b2f*a*b0.c*d3h.q.e1i2a.3i*a2d.q.e0c8d3b",                  // 2018 #23
  "17x17:**2d*1c201**.0p.2c2*1j.g*d2*c.b2h*0*c.b1f2**e.b*k1*1." +
        "*b*j*b.2k2d.e*f1d.e0f*d.d**h21*.0b**c211f.1b1*l." +
        "*e1*c3e.*e*d2d1.*e1d0c2*",                                   // box2014 #10
  "17x17:**c**c11**2b.*1c1*e*d.c*d1c3d.h1*e2a.1*e2f*0*.q.k2e." +
        "*1g2d*b.*2f*f0*.b*d2g2*.e1k.q.*1*f1e*0.a1e*1h.d2c2d*c." +
        "d*e*1c1*.b0**02c**c**",                                      // v189 #15
  "17x17:f2e1d.1p.c1e0*1b3b.c*c3**d1b.b**3i*b.c*i**2a.q.a3o." +
        "f*b*d3b.i022e.e2b**g.2l*1b.*1**c*e2b*.c*b21d**c." +
        "g*1c1d.*f*i.c3d*g1",                                         // 2022 #25
  "17x17:1*e21c12c.q.c12e2d10.g*i.0f*i.1i*c1b.1b3f2c*b.c2m." +
        "h2h.m*c.b1c2f*b2.b3c3i*.i3f2.i1g.22d4e32c.q." +
        "c*2c10e20",                                                  // 2018 #24
  "17x17:d1l.g3i.f2c1b13b.2*j3d.b13m.g11**b*b2.m*b*.c32h2c." +
        "q.1j*e.b2h*d3.b2b2*1*11f.b0n.k2c*a.g12e4b.j2b*c." +
        "1c1e2f",                                                     // 2022 #26
  // D4
  "31x45:c1a0e2b2d2g2c.w3g.13h1h2k.2f4c2c11d1f2b.za4b1." +
        "r2f4e.k0f*b*i.a3p0l.2n*k1b0.c3i3a*h*f.ze.d1o4b2c0b*." +
        "d3n*c3g.c3c4j3l.x2b*b0.f*b3m4g.b0b*d*i2j.b2h4f*b4e4b1." +
        "f3e3i4h.g1a3f3h4e.112d3d1r.1k1o1b.d1r2a2e.d3l2m." +
        "a*a*d0d1b0e01c10*a.b3p*i*a.k4s.i4b2h4i.c*w01b.l*d4e3b1d." +
        "a*d1d3l*f.c3l2b4k.n1b4l3.f0p2c32b.3b*b0b2i4d4f.e*d2i2j." +
        "q3m.m3c1j3a0.c1a*d0*i4b*b2c.b3s2h.f1k2j3a.i3b1d4c3i." +
        "ze.e2y.0c2*2e0d21b3d0c2",                                    // 2018 #25
  "31x45:2b3c2b1c3f0c20b0*.z*b*1.d2d4g0h1d.h*q1d.0a2d4l3h1*." +
        "e1n0a*f**.z*b0*.w3a**b*1.3u4c0d.e**3j3*2*d*d.d4l4h1d." +
        "2h3f3i1d.*1d*b22e1b4b3b3*d.e4d1c3*1f*b2d.d*e*a*j3e1*." +
        "l3c3l1*.01c*b4d*g4d2d.b1d3r1d.b0c*h4d*d3*b2a.e4j4d*d2d." +
        "b*n*d2h.a**o4c*f2a.s*c4b2d.t4c*a0d.2*x0d.b4p3f2d." +
        "c3n22b1d*0b.2b*3l21l.e3p2h.f*h3c***b4f.f0g4b2b3j." +
        "001c*a3d3c*h2d.f1b4g**h*b2.l02c2j4b.c3d4g*n.02b4d*e4n3." +
        "k4b*p.h*d3*p.f4g*p.3j*d4m1.h*b3e4j4b.b4b4d*p*c." +
        "h2e0d3f3c3.d*i*d*2e*d.0c1b1b3c0d1*2c0b2b",                   // genius 64
];

let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;

// which puzzles have demos
const demoPuzzles =  [1,2,13];
// which puzzles are at which level [D1,D2,D3,D4]
const puzzleLevels = [1,13,31,57];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are errors representing the " +
    "default state where there is at least one non-rectangular white space, " +
    "and all of the digits except '0's are incomplete. For our first time " +
    "through we can turn on Assist Mode 2 to see the number of errors and " +
    "incomplete digits, as well as visualize the rectangles in the process " +
    "of the solve.</p>",
  "<p>In Shakashaka, as with many of these puzzles, the key is to recognize " +
    "those cells where current constraints dictate the solution, and to not " +
    "assume too much about the expected final result. We can focus first " +
    "on then those digits which must by constraint have diagonals on all " +
    "sides, which in this simple case is all four of the digit cells.</p>" +
    "<p>Starting with just the one in the SW corner, we can see that the " +
    "'2' must have a diagonal to its right and above. But which direction? " +
    "In order to satisfy the fundamental rule of 'all white cells must " +
    "form a rectangle at 45 or 90 degrees', we can first conclude that the " +
    "diagonal must have its flat edge against the black square of the '2'. " +
    "Secondly, the diagonal edge must face inwards into the puzzle in order " +
    "to eventually join with other diagonals to form a rectangle.</p>",
  "Now we can visually see the singular edge of the rectangle that will " +
    "eventually grow inwards. We could make progress there given the " +
    "constraints, but first let's do the same for the similar diagonals " +
    "that are on the puzzle edge next to numbers. NOTE it is not yet " +
    "deterministic which way the second diagonal will face to the left " +
    "of the '2' on the right wall. We know it will face inwards, but " +
    "also upwards or downwards is not yet known.",
  "Now we could apply what could be called a 'bounce' rule for known " +
    "diagonal rooms that are 'hitting' a barrier such as the puzzle edge " +
    "or a solid black square. Starting at the upper left, the forming " +
    "diagonal rectangle must turn - or bounce - at the wall at the top " +
    "of the board in order to stay rectangular. Similarly the other " +
    "beginning diagonals that we created can bounce off walls, and in " +
    "the case of the SE '1', bounce off the solid black cell.",
  "We can continue this 'bounce' progression to complete the diagonal " +
     "forms in the upper row, both into squares of 1x1 diagonals. We must " +
     "turn the corners on the '2' in the SW corner as well, but we so " +
     "can't assume the same about the rectangle in the SE corner, as " +
     "for now we can't see if it stops as a square or grows larger, " +
     "since it is not yet constrained.",
  "Now that we see the board, we can deduce that the diagonal rectangle " +
     "in the SE corner <b>must</b> continue to grow. This is because " +
     "the '2' is not yet satisfied and must have one more diagonal. " +
     "Given the current board layout, this diagonal must have its long " +
     "edge facing into the growing rectangle. Once placed, that constrains " +
     "its final shape as its northern edge must 'bounce' off the other " +
     "black cells and end with a 1x2 diagonal edge shape..",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "this larger puzzle. It is recommended to go through demo 1 first. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step. You can also use the " +
    "undo button to move backwards individual steps, or continue playing " +
    "forward if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to let us know " +
    "where progress or errors are made.  We can use the same methods from " +
    "demo 1 to complete all of the '2' digits. We can also see that the '0' " +
    "in the NE corner must have no adjacent diagonals. We can 'dot' the " +
    "adjacent cells, reminding us that no diagonals are allowed.</p>",
  "We can already constrain the two complete diagonal rectangles begun. " +
    "The upper left one must 'bounce' off the two walls. After that, the " +
    "lower section is unconstrained, but the upper section is blocked " +
    "by a black cell, terminating its expansion to a 2x1 diagonal edge " +
    "shape. Similarly, the lower right one bounces off both walls, then " +
    "could continue in the upper region, but the lower one limits its " +
    "size to 3x1 diagonal edges.",
  "Now let's look at the '1' cells on the left wall. The upper one is " +
    "already satisfied, so we can 'dot' its other two sides. Also, the " +
    "isolated white cell in between the two lower '1's can not possibly " +
    "house any diagonal, thus we can dot it as well",
  "Now let's pause there and focus on the '4' and '3' in the center " +
    "section. All of their edges must have diagonals. Furthermore, " +
    "given the sawtooh nature of the cells adjacent, it is clear which " +
    "direction they must point in order to have a chance to create " +
    "a rectangle with them.",
  "We can discern the final size of the upper right rectangle as 3x1 " +
    "diagonal edges given the space remaing. The center one we can " +
    "bounce. After that it seems unconstrained, but the dot next to " +
    "the one effectively acts as a wall, since it can't allow any " +
    "diagonals as well.",
  "The final step is the two '1' cells. The lower one should be easy " +
    "to see with prior methods that first its diagonal must point " +
    "inward, then then that the wall and existing black cells constrain " +
    "it to a 1x1 diagonal edge square. Until it is placed it is not " +
    "immediately obvious which direction the other '1's diagonal must " +
    "be oriented.",
  "Now that that square is in place, it is clear that the other '1' " +
    "must have a similar 1x1 diagonal sqaure in order to fit in the " +
    "only remaining space.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this final demo we will walk quickly through a tougher puzzle " +
    "that requires one more advanced technique important for tougher " +
    "boards. It is recommended you go through the other two demos first. " +
    "You can press the 'next' button to walk through the solving steps, " +
    "or the 'back' button to return to the previous step. You can also use the " +
    "undo button to move backwards individual steps, or continue playing " +
    "forward if you wish.</p>" +
    "<p>We can use the same methods from the first two demos to make much " +
    "progress, especially on numbers on the edges, then using the 'bounce' " +
    "technique to turn the diagonal rectangles inwards.</p>",
  "All that progress was made using prior techniques. But we can make a " +
    "new observation around the '0' cell on the left wall. Since white " +
    "non-diagonal areas also must be rectangular, we can deduce that there " +
    "must be a diagonal pointing into the board in between the pairs of " +
    "dots near that cell. Otherwise if they were to connect, then the " +
    "shape would not be rectangular. This can help shape the rest of the " +
    "completion of the existing diagonal shapes.",
  "Once that is placed, the upper one in particular, the shape can be " +
    "confirmed and completed. Since the center '3' is completed we can " +
    "dot its remaining cell.",
  "It is perhaps obvious from other constraints, but worth recognizing " +
    "that the two misaligned dots below center must be part of a larger " +
    "non-diagonal rectangle, since there is no room for diagonals, " +
    "so we can dot them too for good measure.",
  "Now the only solution to complete the existing diagonals is two 1x1 " +
    "diagonal squares.",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
  [[],
   [],
   ["340","351"],
   ["101","403","135","245"],
   ["400","104","430","252","344"],
   ["310","211","313","214","131","142"],
   ["124","423","333"]],
  [[],
   ["401","410","257","266","275",".06",".17"],
   ["102","212","221","320","374","464","455","446","147"],
   [".31",".40",".60"],
   ["123","134","314","325","336"],
   ["404","105","116","127","237","422","332","343","244"],
   ["371","272","162","461"],
   ["351","441","142","252"]],
  [[],
   ["410","401","102","212","221","320","403","104","214","313","406","107",
    "118","129","239","248","347","336","325","415","269","368","458","159",
    "189","299","398","387","376","466","167","178","256","355","445","146",
    "134","244","123","422",".40",".51",".60","292","391","182","394","484",
    "295","185",".73"],
   ["341","461"],
   ["431","352","253",".64"],
   [".63",".65",".74",".75"],
   ["162","272","371","481"]]];
