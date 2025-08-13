// Akari puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the black squares with or without digits at the beginning.
// The value 0-4 is for numbered cells, and * is for a black
// square without a number. a-z define from 1-26 white cells in
// between black cells, or '-' for one space. The first one also
// includes bulb positions (@) that defines a solution.
let cannedPuzzles = [
  // example completed one
  "7x7:*a@c*.a@4@b1.b@2b@.@*b@1a.a@a*c.0b@*b.*d@1",
  // demos
  "7x7:*e*.b4c1.c2c.a*c1a.c*c.0c*b.*e1",
  "10x10:d1e.a4c**a0a.b**d1a.d*b2b.a*d3b*.*b*d1a.b2b*d.a3d*3b.a*a1*c2a.e*d",
];
let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;
const demoPuzzles = [1,2];
