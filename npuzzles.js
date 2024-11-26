// Nurikabe puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the initial or current values. 1-9 are digit values, a-z
// define from 1-26 spaces in between digits, A-Z are digit
// values 10-35, '-' is one space, and '*' is blackened.
let cannedPuzzles = [
  // example completed one
  "7x7:2*3*c.a*a***4.**a*1**.a****4a.a*a*a*a.a*2*2*a.a5*****",
  // Nikoli sample puzzle
  "7x7:2a3d.f4.d1b.e4a.g.b2a2b.a5e",
];
let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;
