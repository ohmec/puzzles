// Masyu puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the circles (1 for empty, or 2 for filled); a-z define from 1-26 spaces
// in between circles. The first one has some solution path information
// after a second color. The path information defines the solution,
// FJL7 for turns, and _| for straight edges
let cannedPuzzles = [
  // example completed one
  "8x8:2b22c.f1a.11d1a.b2c1a.h.e1b.a2a2b11.a1a1d:" +
      "F__7F__7.|F7||F_J.|||LJL_7.LJL_7F_J.F70FJL_7.||0|F_7|.|L_J|0||.L___J0LJ",
  // demos
  "8x8:2b22c.f1a.11d1a.b2c1a.h.e1b.a2a2b11.a1a1d",
  "10x10:a1b11d.d2d1.a111b2a21.j.1a11f.f1a11.2e1b1.j.1c2a111a.c1f",             // 5 21 2018 #1
  // D1
  "10x10:2a2a1a1c.c1d11.c1b11b.f21a2.1d1c2.b12f.2b1c2a2.a2d2c.a1b1d1.b11b2a1a", // 12 19 2018 #3
  // D2
  "10x10:a2b1a2a1a.j.e1d.1a1a2c2a.1b2f.f1b2.a1c1a2a2.d2e.j.a2a1a2b1a",          // 11 11 2018 #5
  "10x10:a2b2b1b.j.b1c2b2.1c2c1a.a2h.h1a.a2c1c2.1b1c2b.j.b2b1b1a",              // 10 10 2018 #7
  "10x10:j.1b2b1a1a.i2.f1c.1c22d.b1g.f1b1.2b11a11b.i1.b11c2b",                  // 6 15 2018 #9
  "10x10:d1e.a11d1b.a11b2b1a.e1b1a.a2a2f.f2b1.a2h.d2c11.b11a2a2b.j",            // 8 14 2018 #11
  "17x17:2b22d1d11a.i1c1c.c2b22b1d1a.h1a1a1d.b2f1a1c11.e2g1a1a.2d2a1d1c1." +
        "b2a2l.f1a2a2e2.11g2d2b.d11b22c2c.1b11b1f2b.b11i2c.b1d1a22e2." +
        "11g22f.1c1b1h2.c1b11e2c",                                              // 29 40 2018 #13
  "17x17:d1a1c1b1b2.b2a1e1b1a2a.c2a1d1b1c.a1i2a2c.a11111b2e1b.f2j." +
        "a2e1a1a2a1c.g1b2b1c.a1a2a2i2a.h11c11b.c1c2a1a2b1b.a1d1b1g." +
        "c22d1a2a1c.c22b22c21111.2p.a1c1a1g21.a1b1g1d",                         // 26 46 2018 #14
  "17x17:b2h2c2a.d2a2a11b1d.1j1a2c.d2a2a2e2b.1a1b1c22f.c2a1e1d1.o1a." +
        "1b22b22b2b2b.c2k1a.1a1e22g.l1111a.b2a22a1b11e.f11b11e." +
        "b1j1b2.1c2e1b1c.a1a2b1a1c1d.b2f2b1a2a2",                               // 32 37 2024 #17 tough but fun
  // D3
  "10x10:h1a.a11a2b1a1.a1d2c.h1a.1i.a1b1d1.1a2a1a11b.h1a.j.a1b2a22b",           // 6 17 2018 #12 pretty brilliant
  "10x10:g2b.a2h.b2f2.1d2a1b.d1e.b22b2c.g1a1.c22e.b1d2b.g1b",                   // 11 7 2024 #14 pretty tough, nice
  "17x17:b2b1b2a1f.o2a.1c2d1g.e1a2d1a2a1.1c1b2c2e.b2i1d.b2g2c1b." +
        "d2b1h2.1g1d1a1a.1a2c1a1b1e.c11g2b1a.a1e1i.d22b1a1a1a1a1." +
        "j1a1b2a.1a1c2j.h2a1f.b22d1a1b2b2",                                     // 24 37 2018 #15
  "17x17:k1e.a2a211b2a12c2a.m1b1.c2e1a2e.1b1a2h1a2.j2f.2a2b2b1e1b.f1j." +
        "2h2b2b2a.c11d2b1b1a.2d1f1b2a.b1d2a1g.b1a2e111b2a.b1c12g1a." +
        "c2a1e2a11b.g1g1a.b22a1c11b2a1a",                                       // 29 37 2024 #20 wow great
  "17x17:f1c2a1b2a.a2a1a1b1h.d1a1a1c2a1b.1b2a1b1a1e1.a1k11b.b1b1211212a1c." +
        "e2e1d1.a2a1a1e1b2b.2d2e1a121a.a2c1e2a1c.c1a1e1e.e2111112b1b.2l1b2." +
        "a2b1d1d2b.c1a1a1a1e1a.d1f2a1c.p2",                                     // 24 52 2024 #22 playful and fun
  "17x17:b11b2c1b22b.b2n.f2c2b1c.a111a2a2a1a2e.a1d2c1d2a.d1i1a2.2b1a1b2f1a." +
        "d1b2a2b2d.11f1b1e.d1g2c1.c2a1c2g.2c2c1a2c2a1.i1g.1e1j.b1b2a2c2b1a1." +
        "a1h1b1c.a1c1a1b1c2a2.",                                                // 29 38 2024 #23 methodical but good
  // D4
  "31x45:k1b1b1a2a2a2f2.a2b1c22e1a1g11d.l1a1f2f1a2.c1a2b11a11c11b11c12a2b." +
        "11l1h11d1a.c2a2a2a2a1a2e2a11c2a1b.d1e1c1a1e1d1c.b11b1b2b1a2i1f." +
        "b1b11c11c2a2a211b1b1b2.g112b2g1j.2b11f11d2b2b2c12a2." +
        "d2b11f1a1e21f.2f1b2i1c1e2.d11g1a1a12a1e21a2a.b2c2a2a2b2b11g1e." +
        "l1b11c1a2c2d.1c2a2a2a2d1b11c1f1.b11c1a1c1g1e2c.b11d1c1c1a1b11b1e." +
        "e2b2a1a2a2a1d21f2a.11d1j1a1k.c1a11b12a2a2a1c1b2d1a1.f2f1121a1a11d11c." +
        "a2a2d1a2g2a2d1d2.d1a21e2i11f.a2e1a2a2c1a11d11b1c.m1b1a2b1c211b1." +
        "1a11h1b1e1a1g.c11b11a1c2c1a2a1211a1b2.2c11a11d1c1f1b1a1a." +
        "e11c11b2b2b2e1d.2a21b2a12a2h11b112a2b.k1b2g1h.2c2f1d1a11b1c1c1." +
        "b1e2a1a2a2c11d2a21a1a.b1a2a2h1a1b1b2a2b11a.g1a11c2c1a11e1c." +
        "a1b2a21a1211c2a21a1c2e.1u11f2.b2a211a1a2a2a2k11c.i1g1c1c1a1b2." +
        "b2a1a11e1a1a1e11f.h2b11b11a112a2a21a11b.a2d1c1a1h1i.b1a2i2b2i11b",     // 128 254 2024 #27
];
let puzzleChoice = 17;
let puzzleCount = cannedPuzzles.length;
const demoPuzzles = [1,3];
