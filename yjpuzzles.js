// Yajilin puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the initial or current values. 0-9 are digit values followed by
// a direction ^v<L; a-z define from 1-26 spaces in between digits
// '-' is one space. the first one has the path information that
// defines the solution.
let cannedPuzzles = [
  // example completed one
  "8x8:*F7F_7*1v.1^|LJ*L_7.*|2>*F7*|.FJ0<FJ|2^|.L_7|1^L_J.*1<|L_71>*.F_J*1<L_7.L______J",
  // demos
  "8x8:g1v.1^g.b2>e.b0<c2^a.d1^c.a1<d1>a.d1<c.h",
  "10x10:h1>a.a0^c0^d.g0^b.c2^a0^a0v1^a.1^a0vg.d1va1v0vb.a0<h." +
        "a1vc1vd.c1ve1v.j",                                               // 2022 #1
  // D1
  "10x10:j.b1<a1^e.f2>c.a1<b2<e.f1>c.b1<b1>b0>a.c2vf.h1>a.a0<c1>d.j",     // 2018 #1
  "10x10:e2<d.1^i.b1^a1>d0^.j.a1^a1^a1<a2^b.j.c1va3<d.2^a2^c2^a2<a." +
        "b0<d0>b.e1<c1<",                                                 // 2018 #2
  "10x10:b0<g.f1<b1^.b1<g.c2^d2<a.a1<h.j.f3<a1>a.j.c2<f.0>e0<0>b",        // box2014 #1
  "10x10:e0<d.h0^a.c2<f.h1>a.c3va2^d.j.f2>c.j.a0^h.f1^0>b",               // 2022 #3
  "10x10:d1<e.a0^e2<b.b1<g.b2vg.d2vb2<1^a.j.g2vb.a1<h.d1<e.j",            // 2018 #3
  "10x10:c0<f.g1^b.g1vb.1>c2^a0vc.a2^h.f2<1>b.j.c2<1vb0>b.i1v.f0<c",      // 2018 #4
  "10x10:c0vb0<0>b.j.d3ve.c2<b0>b1v.j.c1<a0>d.j.0vc2>e.g1vb.j",           // 2022 #5
  "10x10:f2>a1>a.j.h3<a.b2^g.e1>b1va.a1^h.d2<b1vb.j.d1>b1vb.0^i",         // box2014 #2
  "10x10:c0<f.j.c2<f.f2^a1^a.a1va0<b2vc.g1>b.j.e3<a4<b.1vi.j",            // 2018 #5
  "10x10:f2<c.j.f2<c.0va2^g.g2^b.j.g2vb.0va1va2^e.j.d2^e",                // 2018 #6
  // D2
  "10x10:i0v.j.a1<e3<b.g2vb.j.j.i3<.d2>e.j.0>e3^c",                       // 2022 #7
  "10x10:1vi.e0^d.f2>c.a1<e2<b.h3va.a0vh.b2>e0>a.c4^f.d1<e.i1<",          // 2018 #7
  "10x10:j.d0>b1^b.j.b2^g.e1^a3vb.j.0^a1vb1vd.j.d1>e.b0<g",               // 2018 #8
  "10x10:e1<d.h2<a.a1<h.b3vd2<b.j.j.f2^b3<.b1vg.d3^a1<c.h1<a",            // box2014 #3
  "10x10:i2v.f1^c.j.0^b2^f.f1va1>a.j.j.0^a2^d3<b.j.j",                    // 2022 #9
  "10x10:1vi.b0^a1^e.f2>c.j.e3<d.h1<a.e2<d.j.c1>b1>b2^.j",                // 2018 #9
  "10x10:j.b0^d1^b.d2<e.3>f1^b.j.b2^b1<b1va.j.a0va1va2>d.j.i1^",          // 2018 #10
  "10x10:b0<g.f0>c.h3va.b1va1>e.f1^c.i1^.j.g4<b.j.i1<",                   // box2014 #4
  "10x10:f0>c.a2vf1va.e2<d.j.b0^d0^b.0^c0^e.f1>b0v.j.b1va0^e.f0>c",       // 2022 #11
  "10x10:g0>b.j.j.0^b2^f.c2<a1^2>c.j.d2>e.e2<d.g3^b.d0>e",                // 2018 #11
  "10x10:j.j.g0^b.a1^a2^a1^d.h1<a.g3<b.a2^a2^f.j.e2<a2^b.b0<g",           // 2018 #12
  "10x10:f0>c.a0^b2ve.j.a0<b1va3va0^a.j.b2vc3<a1>a.1^i.b0<g.h0>a.j",      // box2014 #5
  "10x10:h1>a.b1^c3vc.j.c1^d1<a.j.b2^f1v.i1v.c2^c3<b.j.0>i",              // 2018 #13
  "17x17:k5ve.p1^.f2<d5ve.0^1^o.b0^1^g4vb2^b.d1<b2^i.q." +
        "k3va2^2^b.0^b3^a1<b2^2^1>f.a1<m1>a.c1<b0^g2^b.d1<d3<g." +
        "j2vc0vb.d2vj1va.a1<e1>i.m0>c.h1<c1<1>c",                         // 2022 #17

  // D3
  "10x10:0>d0>d.b1>e1<a.e1vd.b2>d3<b.b0>d0<b.b2>d1<b.b2>e2<a." +
        "b0>d1<b.g0<b.e0<d",                                              // 2022 #13
  "10x10:f0vb1<.c1^f.j.0^d2<b1>a.b0vg.g0<b.a1<b2vd1v.j.f0>c.1>b1>f",      // 2018 #14
  "10x10:2vh1v.c2<a1vd.j.d1<e.a1<d2<a0^a.d2ve.j.b0<c2>c.j.0>c0>e",        // 2018 #15
  "10x10:j.b1^g.f2<a1>a.j.f1^c.b1^g.d2>b2vb.b1^g.a0vh.c2>f",              // 2022 #15
  "10x10:b3vc0<c.j.i0v.j.j.3>i.i3<.j.j.2>d4^d",                           // box2014 #6
  "10x10:2>i.e3vd.j.a2^d2<b2<.g2<b.b2vg.0vb1<d0va.j.d1>e.i2^",            // 2018 #16
  "17x17:q.k0^a0^a0^a.a1<a1<m.d1^f3<d4v.q.a1^a2^d3^b2vd3v.f3^j." +
        "c2^i3^c.a1^f2<h.l2^a2va2v.e2<c0^3^f.1^f1<b1vf.h2vd2>c." +
        "a1^b2vf1ve.q.g2<c1vd1v.1^p",                                     // 2018 #17
  "17x17:q.a0^f1^h.o1>a.a1<h4<a2^d.m1>c.d3^e3<f.l2>d.b2^1^e2<g." +
        "n3vb.h1va2^a4vd.a0<a2vm.f2>b2>g.a1<e1>a1vg.d2>l.a0<f3>g0v." +
        "e0<k.e0<k",                                                      // 2022 #18
  "17x17:h0<h.q.e2<e3<e.a1<o.i0^d0^b.q.b1^n.b3>d3^b1^a3^d.h2vh." +
        "d1<a1<c3>f.q.b1^a3>a2>b2>c3>c.f2>a2>h.h2>h." +
        "b1^2^a2>a2>g4^a.n0>b.k1>e",                                      // box2014 #7
  "17x17:f1>c1>f.q.c3>i2<c.b2ve3<e1^b.q.h0>h.2^e4vc3>e1v.h1<h." +
        "e0<b0<b0<e.h1vh.0ve3<c2^e1v.h2>h.q.b0<k5<b.c0vi2>c.q.f0<c0>f",   // 2022 #19
  "17x17:c0<e1<g.f1^j.d3>d2>a1>0^b1>a.b1^c1^j.i1^b1<1<c." +
        "b1^f1^2^a1>c1^.c3>a2>f1>d.q.f2<c4<f.a0<c2>c3^1>b1>a1^a." +
        "b0<b1vk.q.a1^c1vd2>f.b2vc2>b2>g.c2^a1>f2^d.q.i2<2<d3<3<",        // box2014 #8
  "17x17:q.i1^d0>b.d2<a3<e1>d.j2<f.c2<i1>c.j2<f.g3<i.k3>e." +
        "b3^a2<c2<h.j2>f.c0>d1^g2v.i3^c1>c.0ve3<d4<e.i2vc2va1>a." +
        "b0vb0<k.q.f0<j",                                                 // 2018 #18
  "17x17:q.b1^g1^a0^a1^b.h3<h.b2^a1<l.i2vg.f2<e2>d.c2^e0^b0vd." +
        "1^e4>e2>d.a1<b1<b1<i.e2vh1vb.h3>h.b1vf2vc3vc.a1vo." +
        "0vf2>a2vf0v.c4>m.q.c0<m",                                        // 2018 #19
  "17x17:q.b1^f1>g.o0>a.f2^b1^a2>e.a1<o.c3<a1^a2>d2^c2^.j5vf." +
        "g2<i.c2<i2>c.h2vb1>e.j3vf.a1vd2<g3vb.h1va2<f.b2vn." +
        "h3<h.e1vd1vf.q",                                                 // box2014 #9
  "17x17:q.b7vn.c2<g0>c0va.d2^a1^g1^b.g0va0vc5<c.b6vg3^f.e0vg3<c." +
        "d3vg2^d.q.d1<g1<d.c2>g1>e.f3^g5^b.c6>c0^a0^g.b0<g0va0vd." +
        "a0<c1>g0>c.n0>b.q",                                              // 2022 #20
  "17x17:a1<i4<b1>1>a.e1^b1^h.m0^c.b1^k1^a1^.b1^a1<a2<b2<g." +
        "n1^b.b2^e1<b3^e.a1<o.h2<2<c4<4<1^a.b3^a1<l.e2vk." +
        "a1<a4>b4>b1va3>e.d0vl.b2ve2>a1>f.g0v0vf1>a.e0<e1ve.l3<d",        // 2018 #20
  "17x17:q.f1^j.h2<h.q.e3<a0^a3<b1>d.m1>c.c1<e1ve1>a.k3^e." +
        "a1<j2>a3^b.e2^k.d2>b1^c2>e.a2>f0^h.f0>d3^b5^b.a1>b1vl." +
        "h1<b1>e.e1vc0>c1vc.3^p",                                         // box2014 #10
  "17x17:q.n1^b.d0^d0vb1>d.c2<0^2<c0va4<4<d.d2>l.a0<l1^b.f1^2>2>h." +
        "c0<b1^j.a3>g0vb1>a0>b.d1<1<e2<e.a0<g0v0vf.f1^a1v0v0vc2vb." +
        "2^b1vb1^g2vb.2^k3<c3<.c0vc0va2>g.a1>o.c0<m",                     // 2022 #21
  "17x17:q.e4vk.c4vf2>c0>b.b1^e1^h.j3va0>a5vb.e2vk.1ve2<j.l2^d.c1vm." +
        "a0vf4^a1vf.n2vb.b2v5>e2>g.q.f3>c1>a5^d.c4>c2>i.n0>b.f2>j",       // 2022 #22
  "17x17:q.q.i1>a1>b0>b.b2^f3<g.k0^0>d.g4vh2v.0^p.e1<a4va1<a1vb1^b." +
        "q.a3^a2vg1<e.q.a3^i2>e.q.k3>e.a1<c3<f4<d.h1vh.q",                // 2018 #23
  "17x17:1vc0<i0>b.i2vg.g0^i.q.e3<e2^b2^b.h3vh.j2>d1^a.0vg0<h." +
        "d1<1vc1<c2^c.i1vf1^.a3vd3vd2>e.n4^b.q.0vc2<g2>d.l2<d.e1<k.i0>g", // 2022 #23
  "17x17:k0>e.m0^c.f3>j.b2^e2>h.e2<h2^b.0^f1<b3^f.n3vb.g1^a3>g." +
        "d2^e2va1>d.q.b5^n.g2<b1>a3vd.d2>l.0vi2>f.e2<k.h1>a1>a1vd.b0<n",  // 2022 #24
  "17x17:p2v.q.f1<0^a0^0^f.c2<a2<2>c3<2^a1^c.q.c0<i1>c." +
        "b2^0<b0>2^a0>0^b2v0>b.b0<c1<c1vc0>b.h1>h.b0<c2<c1>c0vb." +
        "b2v1^b0<2va0<1vb2v0vb.c0<i2vc.q.c1<a1v0vc3<0va2vc." +
        "f0<0va2>2>f.q.3>p",                                              // 2022 #25
  // D4
  "17x17:m0>c.g1^i.d2<g0^d.h4>c2>d.c2<0^l.k1^b0^b.f2^j.b2^2^c1^0^g1^." +
        "a1<k1^c.k3^e.d1<g0>d.l2>d.d2<b1^a3^b2vd.e3^k.d0vd1>g." +
        "a1^2^d1vh2^.d0<k2<",                                             // 2022 #26
  "17x17:q.e1<h1^b.h3<h.b2^i3<d.n3<b.e2^c0<g.c1>j1^b.1^e0<h0^a." +
        "q.g4>c4^e.d2>l.q.c2<h2^b1>a.f1<j.d1^d0>b1<d.b5^l0>a.h0<1^g",     // 2018 #24
  "31x45:ze.g1^f2>e0^a1^h.k0<e3<k1>a.g4<a4<i2>k.n3<p.y3^e.o2<k1^b2^." +
        "e2^a0<a1<l4>h.i1<i3<e4^e.b4^c0<i3<c0^j.b0<1^i2<g3^e3<3<b.ze." +
        "l4<g0^e8<d.g3<j5^j1>a.i1<f4^a3<l.f0<h2^o.g3^a2^h5^c2^g4^." +
        "2^z4^c.2^f4^b0^5^c3^d3^j.2vc6^h5^c1^f3^d1^a.c1<d4^b5^d3>n." +
        "o3^3>d3>b4^3>e.t5vj.l5<e6v3vk.k5^2^a2<h1>g.e0<f4>l3>e." +
        "g6^o5vf6^.b2va4ve3^2<a1vl2>c4v.f4va6^f4vf2>a2vf.b2va3vf3vm6ve." +
        "1vzb0>a.1vr2vc4v3>f.g3va4vl1vh.h8^b1vk2>c3>c.d2<d3vd3v1vd3>j." +
        "c2vh4ve3vl.1vt2>e2>a1>a.e3<k8<l1v.s3>k.h4<b5<a6<d2vg2>d.ze." +
        "0ve1<c2vf3<c2vi.c0vc1<u1>a.b1<l1vb1vl.z0>d",                     // 2018 #25
  "31x45:f1<d2>b2>p.b1^h3>e2>a0^a1>b0^f.n0^i0^a1>b1>a" +
        "b2^b1^a2^k0^k.i1^g4<m.f7ve3>f1^b2>2>g." +
        "b6>6>g4>4>i2>g1^.b3>3>d2^c1>d1>f0^1^d1^.c1<c1<i1^c2>2>a0^1^e." +
        "k2<f3vi1^b.b0<b0<6vd0<0<a1<e2>a2>h.f6vh4<b4<g3^a1^b." +
        "r3vc1>h.f5vc1<1<b1<k3^d.c2^d3^a1<1<h2^d2>2>d." +
        "b0<e3^i3vb3^a3^g.e2<a4>4>a4>a4>b4>o.p5^a3va2>2>a4^c2^c." +
        "d0<k5^j2^0>b.e1<1<b1<a2<d3<c3vd0>a2^0>b.b0<b0<k2^3vc1^h." +
        "e1<f2<a2<e3vj.b0<b0<c0<0<c4^e4>b3>a2>a1>c.b0<d3^c1<e2^3vk3v." +
        "g3^4^e5^b2^3vc1^a2>a5^d.d0<o3vi2v.b0<a0<b3^b2>2>b6^a6^i5^d." +
        "d0<b0<c2<e3<b2vb0>0>f.b5vk6^3^o.b5vd2<g3^b2vf1>1>a0>a2v." +
        "j6ve7^b2>2>j.ze.f3va2<a5vb3<l6^d.b0<0<a0<3vk3>3>1ve6^0>b2v." +
        "m2<a2v9^c1vb3<g.d1vb1<1<b2>j3<1>g.b3vd3>3>d3>3>c3>3>1vd2>b1>b." +
        "d1ve2vq0>b.d1<e3vb1vl6^a0>b.b3vd1<g1vb0va1va1>1>g.j2vb1vd0vg7^d." +
        "e1<2>2>e2>c2>2>b2>a2>g.f1vh0vk0>0>a0v.s3<e4<e.v1>h",             // 2022 #27
];
let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;

// which puzzles have demos
const demoPuzzles =  [1,2];
// which puzzles are at which level [D1,D2,D3,D4]
const puzzleLevels = [1,13,27,50];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many unsolved numbers which we need to satisfy by turning cells black " +
    "in the arrow direction before being able to solve the puzzle. Then we " +
    "must craft a path through all remaining white cells that makes a complete " +
    "loop. For our first time through we can turn on Assist " +
    "Mode 2 to see any errors that we might generate in the process of " +
    "the solve, as well as get an indicator as to when numbers have been " +
    "satisfied.</p>",
  "As shown with the green text, the '0&larr;' cell is already satisfied, " +
    "but we can put dots in the cells to its left to remind ourselves that " +
    "we will need a path through them. Next, we can look for 'freebies', " +
    "that is easy cells to satisfy. Looking at the board, we can see four " +
    "such easy ones. There are three '1' digits that have only one cell " +
    "between them and the wall in the direction of their arrow. Those cells " +
    "must by definition be black. In addition, the '2&uarr;' has three " +
    "cells above it. In order to not violate the rule about adjacent black " +
    "cells, we can determine where the two black cells must lie.",
  "<p>Now the task is to determine where to put the black cells to satisfy " +
    "the three unsolved numbers, and how to create the path loop to go " +
    "through the remaining white cells. Recall there are many cells that " +
    "are not under the 'control' of any arrow cells, so they could be black " +
    "or white as required by the creation of the path.</p><p>Thinking about " +
    "the nature of the loop, we can infer its shape in some corners of the " +
    "board. For instance, in the cells next to black cells near the edge " +
    "of the board, there can not be black cells (in order to avoid the " +
    "adjacency rule violations), so thus they must be white cells with a " +
    "path going through them. Given that they are in a corner, that path " +
    "must by definition be a turn. We can place path segments in those " +
    "corners to begin to visualize the loop required. We can also place " +
    "dot placeholders in other cells next to the existing black squares.</p>",
  "<p>Now let's look at what we can, and at what we can't determine at this " +
     "stage of the solution. It appears tempting to put a path bend just " +
     "below the upper-left '1&uarr;' square, as we did in the other corners " +
     "of the path. But note here that, first off, gray number squares do not " +
     "have a rule of requiring a white square next to them; and secondly, " +
     "there are no number/arrow squares that dictate the rules of this " +
     "particular cell. Thus at this time we must leave it unknown.</p><p>" +
     "Areas we can make progress are those such as the lower left and right " +
     "squares, where an existing path must turn back into the board, and any " +
     "dotted cell (which must contain a path) that is one cell wide, thus " +
     "requiring a straight path. There are two of these in the upper right. " +
     "Similarly the square below the '2&uarr;' must continue inwards.</p>",
  "Looking in the bottom row, we can see two segments which can now progress. " +
     "Given that there can only be one loop, the small segments can not connect " +
     "to themselves, so thus the must move inward until there is room for them " +
     "to connect to another segment. For the segment on the left, there is still " +
     "an unsatisfied '1&larr;' rule, and thus it is clear that it must be just " +
     "to the left of the number in order for there to be room for the segment " +
     "to move upwards. With this in place, and with the right segment also " +
     "forced upwards, the bottom two rows can thus be completed.",
  "Now looking at the dotted square in the upper right region, knowing that it " +
    "must have a path through it, and its above neighbor is completed, it must " +
    "have a bend down and into the center of the board. Once that segment is " +
    "placed, it is clear there is only one square left that can be black on " +
    "that row with the '2&rarr;' in it. It can be set to black and its " +
    "neighboring cells dotted.",
  "Of the two new dotted squares, it is clear that the one below the black " +
    "cell must have a turn. Once that turn is placed, there is only one " +
    "other cell left to satisfy the '1&uarr;' square that remains. Setting " +
    "it to black satisfies all of the numerical squares, and only the final "+
    "connection of the path remains.",
  "Now progress must be made piecemeal on the path segments. In the upper " +
    "row, the path must continue left, while the dotted square below that " +
    "must contain a bend. That completes those rows, and forces the direction " +
    "of its leftmost leg.",
  "Now on the left side, the dotted square must contain a path, so it is " +
    "clear that it must come from above, then turn left to avoid stranding " +
    "the end in the left column. This indicates that the white square above must " +
    "be turned black. Doing so will not violate any of the numerical constraints.",
  "Now the safest way to proceed is to connect path ends where only one choice " +
    "remains, such as the one two to the right of the '2&rarr;' cell. Connecting " +
    "that one leaves only one choice for the one SE of that.",
  "Finally, there is only one solution that creates one contiguous loop, rather " +
    "than two indepedent ones. Connecting the ends completes the path.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "this puzzle. It is recommended to go through demo 1 first. Press the " +
    "'next' button to walk through the solving steps, or the 'back' button " +
    "to return to the previous step. You can also use the undo button to move " +
    "backwards individual steps, or continue playing forward if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to let us know " +
    "which rooms still need completion. Let's start with the '0' squares and " +
    "either put a path segment where definitive, or a dot where not.</p>",
  "Next we can fill the '1' and '2' digit freebies, and begin to place path " +
    "corners where they are deterministic.",
  "These path segments help us satisfy a few other number square requirements, " +
    "and then determine more path segments, such as in the lower left and " +
    "upper right corners.",
  "Looking at the left side, it is unclear at the moment if the square between " +
    "the '1&uarr;' and '0&darr;' squares is black or white since it is under " +
    "no numerical constraints. But looking above it is evident that the incomplete " +
    "path can only connect downwards in a snaking pattern, in order to connect " +
    "both dots.",
  "The incomplete segment in the upper middle must turn downwards on both ends, " +
    "which leaves the remaining white cell in the second row isolated, meaning " +
    "it must be set to black.",
  "The center '1&darr;' square can be satisfied as well, forcing some bends in " +
    "path segments. These path segments allow the final unsolved digit to be " +
    "completed.",
  "A few more line segments have only one option to progress, and there " +
    "is one corner bend that can be definitely added as well in the second " +
    "to bottom row.",
  "The two segment ends in the lower left must join now, and there is only " +
    "is only one way to join them while also connecting the remaining " +
    "dots. This requires that the stranded cell must be set to black.",
  "The remaining dotted square requires a path segment, which forces the " +
    "connectivity with the row below.",
  "Finally, the two remaining path ends must be connected. They can't isolate " +
    "all 5 remaining empty squares, so there is only one solution that doesn't " +
    "require adjoining black squares.",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
 [[],
  [],
  [".30",".31","100","150","157","106","126"],
  ["F01","L40","F60","705","J47","767",".16",".25",".27"],
  ["-16","|27","L70","J77","-46"],
  ["J62","163","-72","-74","-75","L65"],
  ["725","123",".13",".33"],
  ["F33","114"],
  ["F03","L12","|11"],
  ["J31","120","-41"],
  ["J34","L45"],
  ["742","L53","-54"]],
 [[],
  ["|10","-01","-05","-25","-47",".07",".17",".67",".77",".87",".97","|60",".52",".62",".72",".82",".92"],
  ["130",".31","193","103","123",".22","-13","109","199","702","F04","L20","F50","J92","L94","719","J98"],
  ["181","|80","L90","|82","128","185",".86","|39","|84","-95","707","L17"],
  ["722","F31","|41"],
  ["|34","|36","116"],
  ["164","774","L65",".63","176"],
  ["745","-66","F86","787"],
  ["F52","753","|62","|63","143"],
  ["L77","778"],
  ["|58","|59","L68","J69","179"]]];
