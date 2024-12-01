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
  // simple 5x5s
  "5x5:1b2aec4ab3be",
  "5x5:5db3a3ed1e",
  "5x5:d1b2beb2a2e",
  // harder 5x5s
  "5x5:c6a2de3ee",
  "5x5:e1c5e1c1e",
  // simple 7x7s
  "7x7:c5cd6ba4a2cggc1cg",
  "7x7:ggc2b8ge4aa1b7bg",
  "7x7:gc3c1fa5c3af1c3cg",
  // from wikipedia page
  "10x9:2h2.f2c.a2b7e.j.f3a3a.b2d3b.2b4f.j.a1d2a4a",
  "10x10:1c4b4a2.j.a1c2d.b1c1b2.1d3d.b6f5.j.e1c2.d2b2b.j",
  // from big book, pages 56-
  "31x45:b3c4f7b8e4e3b.a5e5d2j7g.zb4b.d6a8p3g.p8n.b4q2d7e.j8b4a9n4" +
        "e6j5i8d.3u5h.aFv9f.m3c4e5e8a.e4c2i4e5e.ze.p6n.c9c5rAd.j1f4a4cBg" +
        "eAc6b6c5o.ze.za3b.c8d6h4g4d3.f2h6p.u2h.j2dGk3b6.s5i6a.x3f.9h6h8c4h" +
        "a7n4n.t9e6d.g2c2i4g4a.zd5.a6p7l.k4a1e4e6aBc.d6b6w.e6w3a.k4s.e5fAf9i7a" +
        "w4g.3a3m4b2e5e.m3a7o.zd9.a4b3c6b3d4l4a.w6g.ze.c1h5i6c2c5.f3f5b4f4g",
];
let puzzleChoice = 12;
let puzzleCount = cannedPuzzles.length;
