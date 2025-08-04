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
  // D2
  "10x10:7f5b.f3c.3i.j.3f2b.c1f.i3.a2c4d.g8b.a3a1f",            // 2024 #6
  "10x10:4b2c4a1.d2e.j.j.1c4c6a.j.b3c6c.c4f.j.4h2",             // 2024 #7
  "10x10:a3e3a3.b1a4e.j.g1b.a3b2e.e2b2a.b3g.j.e2a2b.6a2e5a",    // 2024 #11 nice medium
  "10x10:2aBa3e.j.e4a3b.j.d4b1b.e5c2.j.i4.j.i3",                // 2024 #12
  "17x17:a4d2a2h.b3n.k4a6a2a.b5c3i2.c2c3a3c2c.o1a.m3c.n2b." +
        "3c5a4j.g3c5e.c5m.h5b7a2b7.a1c2k.k4e.6p.c3e4g.2g3e2a4", // 2024 #17
  // D3
  "10x10:c5e3.1i.e1d.g3a2.4i.i2.3a6g.d5e.i3.6e2c",              // 2024 #14 nice, guesswork
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
const demoPuzzles = [1,2];
