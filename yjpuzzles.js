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
  "10x10:e0<d.h0^a.c2<f.h1>a.c3va2^d.j.f2>c.j.a0^h.f1^0>b",               // 2022 #3
  "10x10:c0vb0<0>b.j.d3ve.c2<b0>b1v.j.c1<a0>d.j.0vc2>e.g1vb.j",           // 2022 #5
  // D2
  "10x10:i0v.j.a1<e3<b.g2vb.j.j.i3<.d2>e.j.0>e3^c",                       // 2022 #7
  "10x10:i2v.f1^c.j.0^b2^f.f1va1>a.j.j.0^a2^d3<b.j.j",                    // 2022 #9
  "10x10:f0>c.a2vf1va.e2<d.j.b0^d0^b.0^c0^e.f1>b0v.j.b1va0^e.f0>c",       // 2022 #11
  "17x17:k5ve.p1^.f2<d5ve.0^1^o.b0^1^g4vb2^b.d1<b2^i.q." +
        "k3va2^2^b.0^b3^a1<b2^2^1>f.a1<m1>a.c1<b0^g2^b.d1<d3<g." +
        "j2vc0vb.d2vj1va.a1<e1>i.m0>c.h1<c1<1>c",                         // 2022 #17
  // D3
  "10x10:0>d0>d.b1>e1<a.e1vd.b2>d3<b.b0>d0<b.b2>d1<b.b2>e2<a." +
        "b0>d1<b.g0<b.e0<d",                                              // 2022 #13
  "10x10:j.b1^g.f2<a1>a.j.f1^c.b1^g.d2>b2vb.b1^g.a0vh.c2>f",              // 2022 #15
  "17x17:q.a0^f1^h.o1>a.a1<h4<a2^d.m1>c.d3^e3<f.l2>d.b2^1^e2<g." +
        "n3vb.h1va2^a4vd.a0<a2vm.f2>b2>g.a1<e1>a1vg.d2>l.a0<f3>g0v." +
        "e0<k.e0<k",                                                      // 2022 #18
  "17x17:f1>c1>f.q.c3>i2<c.b2ve3<e1^b.q.h0>h.2^e4vc3>e1v.h1<h." +
        "e0<b0<b0<e.h1vh.0ve3<c2^e1v.h2>h.q.b0<k5<b.c0vi2>c.q.f0<c0>f",   // 2022 #19
  "17x17:q.b7vn.c2<g0>c0va.d2^a1^g1^b.g0va0vc5<c.b6vg3^f.e0vg3<c." +
        "d3vg2^d.q.d1<g1<d.c2>g1>e.f3^g5^b.c6>c0^a0^g.b0<g0va0vd." +
        "a0<c1>g0>c.n0>b.q",                                              // 2022 #20
  "17x17:q.n1^b.d0^d0vb1>d.c2<0^2<c0va4<4<d.d2>l.a0<l1^b.f1^2>2>h." +
        "c0<b1^j.a3>g0vb1>a0>b.d1<1<e2<e.a0<g0v0vf.f1^a1v0v0vc2vb." +
        "2^b1vb1^g2vb.2^k3<c3<.c0vc0va2>g.a1>o.c0<m",                     // 2022 #21
  "17x17:q.e4vk.c4vf2>c0>b.b1^e1^h.j3va0>a5vb.e2vk.1ve2<j.l2^d.c1vm." +
        "a0vf4^a1vf.n2vb.b2v5>e2>g.q.f3>c1>a5^d.c4>c2>i.n0>b.f2>j",       // 2022 #22
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
  "31x45:f1<d2>b2>p.b1^h3>e2>a0^a1>b0^f.n0^i0^a1>b1>a" +
        "b2^b1^a2^k0^k.i1^g4<m.f7ve3>f1^b2>2>g." +
        "b6>6>g4>4>i2>g1^.b3>3>d2^c1>d1>f0^1^d1^.c1<c1<i1^c2>2>a0^1^e." +
        "k2<f3vi1^b.b0<b0<6vd0<0<a1<e2>a2>h.f6vh4<b4<g3^a1^b." +
        "r3vc1>h.f5vc1<1<b1<k3^d.c2^d3^a1<1<h2^d2>2>d." +
        "b0<e3^i3vb3^a3^g.e2<a4>4>a4>a4>b4>o.p5^a3va2>2>a4^c2^c." +
        "d0<k5^j2^0>b.e1<1<b1<a2<d3<c3vd0>a2^0>b.b0<b0<k2^3vc1^h." +
        "e1<f2<a2<e3vj.b0<b0<c0<0<c4^e4>b3>a2>a1>c." +
        "b0<d3^c1<e2^3vc1^a2>a5^d.g3^4^e5^b2^3vc1^a2>a5^d.d0<o3vi2v." +
        "b0<a0<b3^b2>2>b6^a6^i5^d.d0<b0<c2<e3<b2vb0>0>f.b5vk6^3^o." +
        "b5vd2<g3^b2vf1>1>a0>a2v.j6ve7^b2>2>j.ze.f3va2<a5vb3<l6^d." +
        "b0<0<a0<3vk3>3>1ve6^0>b2v.m2<a2v9^c1vb3<g.d1vb1<1<b2>j3<1>g." +
        "b3vd3>3>d3>3>c3>3>1vd2>b1>b.d1ve2vq0>b.d1<e3vb1vl6^a0>b." +
        "b3vd1<g1vb0va1va1>1>g.j2vb1vd0vg7^d.e1<2>2>e2>c2>2>b2>a2>g." +
        "f1vh0vk0>0>a0v.s3<e4<e.v1>h",                                    // 2022 #27
];
let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;

// which puzzles have demos
const demoPuzzles =  [1,2];
// which puzzles are at which level [D1,D2,D3,D4]
const puzzleLevels = [1,5,9,19];

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
