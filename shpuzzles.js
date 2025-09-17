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
  "8x8:00b1c.h.h.b4c*1.2*c*b.h.h.c3b*1",                              // v189 #2
  "10x10:b1*2e.b1*f.1b*d32.*b*2b4b.b1g.e*c3.1**g.2b4b4c.e3c2.e2b**",  // v189 #3
  "10x10:2b*1e.d3e.h*1.f4c.b4b*d.c3f.i3.e*d.d3b3b.0c2b1b",            // v189 #4
  // D2
  "10x10:2d3c*.i2.d4e.e4d.j.0c3b4b.j.i3.c2f.c2b1c",                   // v189 #5
  "10x10:d3b1b.j.j.3h1.e2d.d4e.3h2.j.j.b2b1d",                        // v189 #6
  "10x10:g2b.b2g.e3d.j.b0f2.c2f.d2b1b.j.j.b2c3c",                     // v189 #7
  "10x10:*h1.2h2.b20b*c.f1c.j.b*f*.b1f1.j.e*d.*1c0d",                 // v189 #8
  // D3
  "10x10:c2e*.c2e*.i0.f3b2.3b2f.d3e.e2d.*i.j.b11*e",                  // v189 #9
  "10x10:*c3b1b.2f*b.i2.e3d.c1f.b**f.b1e**.***d4b.*c2e.0c*1d",        // v189 #10
  "17x17:**b2****c2d.e2b2c*d.n*b.o3*.2c3e0e*.*3c4c*f*.f*h2*.q." +
        "h3h.3c0d4g.c0**d3c1*2.d0***d1*c.e*g0c.a*f1h.i1g.c2f*f." +
        "1*a*2e1b2b2",                                                // v189 #11
  "17x17:1*2b2c21b22b.q.l2d.q.*b3k30.1i3f.0e3b2c3c.e3k.q.k4e." +
        "c3c*b4e2.f*i0.22k2b2.q.d3l.q.b2*b20c2b11*",                  // v189 #12
  "17x17:2p.f2d3e.e2f3d.d2b4e3b1.*g4h.i3f1.f*j.b4n.c4f1c3b.d4l." +
        "e*a3c2d3.j4b4c.f*b4g.h4f3a.c2j4b.d2d3c3c.a2c2k",             // v189 #13
  "17x17:f1d2e.c*m.i1f3.q.c3m.2c4e2b2c.e2*e*d.b2i0d.l0b2a.e*c2g.q." +
        "f32b1c*b.22c3k.p3.j3f.f3j.0e2f2c",                           // v189 #14
  "17x17:**c**c11**2b.*1c1*e*d.c*d1c3d.h1*e2a.1*e2f*0*.q.k2e." +
        "*1g2d*b.*2f*f0*.b*d2g2*.e1k.q.*1*f1e*0.a1e*1h.d2c2d*c." +
        "d*e*1c1*.b0**02c**c**",                                      // v189 #15
];

let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;

const demoPuzzles = [1,2,6];

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
