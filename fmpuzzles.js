// Fillomino puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the initial or current values. 1-9 are digit values, a-z
// define from 1-26 spaces in between digits, A-Z are digit
// values 10-35, and '-' is one space.
let cannedPuzzles = [
  // example completed one
  "6x6:444663466633AAA677A5AA77555A7715AAA7",
  // from original js
  "5x5:22f3b4a24b352e",
  "5x5:c451f44a33445a1c",
  "6x6:a13b1b4c2a4a33445a53d2a1b33a",
  "6x6:2d6c2b6b62a4c3a2a5b3c45a",
  "6x6:5d43a3f5b44a254a5a4d3c",
  "6x6:3a6b3a6c664435i6c2a4b4",
  "6x6:a2c3d2c653b64a6f6a2b3a",
  "6x6:3a2a3f46d6a5b2b446664c66",
  "6x6:a6643a666a333a3c2a5g5242c3",
  "9x7:3h2a6a68c7b62a442d33c9999c6a9c9a2a62b5d2",
  "13x9:b6a2a7a33g4d3a42b888822d62k46b6a69c9229e6c3b9a99a446677e442f9d69e9a",
  // nikoli small book vol 1 puzzles 1-6
  "10x10:c7a37d187a2b8c3b2a22a5g87577n33573g5a73a8b1c6b3a398d69a9c",
  "10x10:2a5a3e3a2a4c1a2c3c53d75c2134d7d1d2322c37d42c5c4a3c2a3a2e4a5a5",
  "10x10:a65d55a.a34d26a.j.c3b3a41.3d3c3.5c3d2.32a3b3c.j.a72d21a.a27d75a",
  "10x10:635a55c5.b7b3c1.b5d575.j.55g5.2g45.j.346d4b.4c4b5b.7c75a255",
  "10x10:6b55e.5c6c65.4h2.b52c2b.a4c46b6.4b26c6a.b6c42b.6h6.61c6c4.e32b6",
  "10x10:a53b31c.a1c6b46.i1.4b53e.61b2e.e5b42.e44b6.3i.42b6c2a.c24b26a",
  // from unknown provinence
  "13x9:52a1b4a29b9a5b444a3b9b5c5a29c32a5b27b2b4c2a4c5c3d337c555a4a8a84e77b885d6e7c3d",
  "10x18:453b363f2d3c2d1e4d4454b452f4d4c1d4e1d5436b615d241b2351d4e2d7c6d4f246b4352d3e2d6c2d1f461b241",
  "10x18:a4a2b5d5b2a3d3b5c3c2a4c5c4c2a2a5a3c3b53c4a4b24c5b4a1b2a2b3d1b4a4b4a5b2c44b4a3c15b5c3a4a5a4c1c3c5a2c4c3b2d4a4b5d3b4a4a",
  "10x18:a2b2b1c3b7b6c3b2b7c1b3b3c2b2b2b54b6b1f3b312d2e24326j71323e3d144b4f2b5b12b7b4b3c5b7b4c1b3b2c5b5b1c8b4b4a",
  "10x18:23b6a6a5d2b2a2c3c5a3b5b7b3b3k137g3a7a939a5a325a4a1g245b632g3a7a413a5a645a7a2g825k5b5b8b3b3a5c5c4a3b8d3a3a3b25",
  "18x10:c38b3543b23e88b88b35b14c54b48d43b41a33b33f32b332c4c55c4c14c1c22c2c235b55f24b37a55b32d55b31c34b32b74b31e47b7722b37c",
  // nikoli puzzle 12-13
  "10x18:9a3d56a1b2b1a4b6a3d1b1b3b5d1a6b1a51a4c6b36b1d1b2b32f2c1b21b3c4f51b4b1d3b44b5c2a11a5b1a2d2b2b1b6d5a3b2a1b1b9a93d5a4",
  "10x18:a54d53a.a43a31a64a.d63d.53f41.35b53b52.d54d.34f43.54f43.d63d.d24d.33f45.26f42.d24d.61b14b54.66f24.d32d.a44a52a43a.a35d43a",
  // puzzle 17
  "10x18:d82d87b37b1873f83ja37ga43b37a84e36a73b33f7a76e34e61a7f62b24a64e67a32b24ag62aj62f2654b43b64d46d",
  // puzzle 35
  "10x18:23456e.j.e43664.3456f.j.f4434.436g.j.g632.634g.j.g336.4654f.j.f4646.64655e.j.e56246",
  // 2018 9-12
  "10x10:6a5b5d.3b34c56.i1.a2a1d2a.3a3a2e.e5a5a1.a3d2a5a.6i.54c27b7.d5b2a4",
  "10x10:3a3a45a6a6.a4b34b1a.3a6d3a6.j.32b66b12.15b55b23.j.8a1d1a3.a4b25b3a.8a3a35a4a2",
  "10x10:462f2.e6c5.b4a3a6b5.a1a1c3b.8c6a6a3a.a2a2a6c5.b4c1a1a.2b8a1a5b.2c6e.8f865",
  "10x10:a35e4a.d4a1a5a.533a3a5a1a.d1e.d3a2562.5551a1d.e5d.a1a5a4a321.a5a4a6d.a3e32a",
  // puzzle 44-47
  "10x18:5225666655.5h7.7h7.7h5.7h2.3h5.7a721765a3.j.6a6d7a7.3a5d9a9.j.5a695956a6.6h6.6h5.6h4.1h2.4h1.4664953322",
  "14x24:f63f.766c55c334.343c54c125.n.d25b44d.d46b55d.33b32b77b42" +
        "16j55.57d64d75.f61f.f64f.a126f327a.a567f556a.f22f.f13f.26d72d35" +
        "25j15.34b44b16b32.d33b46d.d64b42d.n.356c55c373.257c22c276.f57f",
  "14x24:a63a25b52a31a.63c2154c45.n.52c1351c34.a14a24b47a71a.n.a24a14b17a72a" +
        "K2c2KM6c64.n.13c3231c35.a13a31b31a13a.n.n.a23a47b73a61a.M2c1234c56.n" +
        "62c1634c43.a33a22b13a52a.n.a35a34b41a34a.34c2541c23.n.54c3651c14.a54a16b64a42a",
  "14x24:d52b26d.c32e652a.c5b6d46a.a54c3e5a.43e5e6.4c35a35d5.c26b653d.c5f62b.a42b54g" +
        "34e346a33a.5b6d66b25.c6e5c3.3c3e13c.52b44d4b6.a46a625e35.g64b64a.b36f6c" +
        "d463b65c.5d41a31c3.4e6e45.a4e5c43a.a34d1b3c.a434e44c.d53b35e",
  "14x24:5d3344d2.3a4h6a4.4l5.a4c7343c6a.b4b3524b3b.n.2d4372d5.3a6h4a5.6d4536d8.a6c3b2c5a" +
        "b4h5b.e4b5e.e2b2e.b2h3b.a6c4b2c3a.4d3527d8.6a3h2a7.3d3433d1.n.b6b6523b3b.a6c4455c5a" +
        "3l3.5a3h3a4.4d4254d4",
  // puzzle 66 "brilliant"
  "14x24:3f43b12a.84b43f19.a3b342b12c.d5a1b382b.d1d2a5b" +
        "d5d4d.b651d6d.a6b6b771d.b51b2b5b85.g71b1b.133a17f51.n.n" +
        "42f43a132.b4b61g.47b5b3b43b.d166b6b5a.d7d516b.d7d3d" +
        "b7a4d2d.b2A5b5a1d.cA5b154b3a.92f34b45.a93b32f6",
  // puzzle 69-72
  "14x24:77b85b66b66.46b66b42b26.n.n.n.b74b45b45b.b31b48b44b.37b38b13b34.57b28b61b31.n.n.b24b61b24b" +
        "b77b15b47b.n.n.53b27b85b46.45b66b32b52.b33b82b42b.b21b85b15b.n.n.n.41b46b14b53.12b38b53b43",
  "14x24:a31b266a6a61a.a246a6c2d.e6a4a46a36.44a1a2a1d41.45a3a25a55d.c3c6c2b.45a542a6a19a44.a52h4b" +
        "a33c79a91b2.f39d2a.33a51a39a96b2.a85a7d9d.d9d2a96a.1b69a73a39a33.a8d77f.4b66a22c91a.b6h98a" +
        "14a63a7a713a82.b6c6c8c.d36a62a2a38.45d6a6a1a37.12a51a6a2e.d5c4a123a.a23a3a144b21a",
  "14x24:4b4a6b6a3b3.6466a4646a4636.n.n.6556a4655a4466.5b5a6b5a5b1.5b5a8b8a8b6.5577a8555a8686" +
        "n.n.5885a8887a8686.8b8a8b7a7b6.6b5a8b7a7b3.7687a6675a4643.n.n.7666a6675a3483.7b3a5b7a4b8" +
        "7b4a3b5a3b8.7664a4337a3788.n.n.7666a6477a7887.7b3a7b7a7b7",
  "14x24:6a1b4a4b2a1a.a6a2b1a1b8a8.1a6b1a2b1a1a.a1a1b1a6b8a8" +
        "n.a282b561b816.a1a1b1a6b6a1.a6a3b519b1a2.a326g685" +
        "n.1a2d1b8a5a.a8a3a1e6a8.1a2e2a1a8a.a1a3b1d6a6" +
        "n.614g548a.6a1b135b3a4a.1a3b3a5b4a4a.635b135b541a" +
        "n.2a1b4a1b5a1a.a3a2b4a1b4a5.1a3b1a2b4a1a.a2a3b5a5b4a2",
  // puzzle 75, 76 "tough, excellent", 77
  "14x24:a6a5f5a5a.a5a5f7a2a.a6a3f3a7a.a2a5f7a7a.a3a4f4a5a.a2a3f3a4a.28a87725432a32.n" +
        "58a48665432a32.a8a8f5a5a.a3a3f5a3a.a5a2f4a2a.a4a4f5a5a.a5a2f3a3a.a5a3f7a2a.44a23456788a32.n" +
        "54a23456727a34.a5a5f7a4a.a2a4f7a8a.a3a4f6a4a.a4a4f4a5a.a2a2f6a3a.a4a5f5a3a",
  "14x24:b52b33b61b.a52b3b2b26a.35b2a14a6b61.a67b3b3b44a.b63b21b45b" +
        "3l1.a2c3b3c4a.1a6b4b6b4a4.a5a5a5b6a6a4a.5a5b1b3b4a2" +
        "a7a2a7b2a3a3a.2a7h3a4.4a5h3a5.a1a4a4b5a6a4a.1a6b1b3b6a5" +
        "a5a5a2b3a5a6a.2a3b4b7b7a6.a3c6b5c3a.3l2.b65b27b51b.b4b2b5b44a" +
        "24b3a75a6b41.a45b5b5b43a.b13b66b61b",
  "14x24:31e2454b4.b3a31g4.c3b1b45a1a.c7b7a7b2b.47b34b4b3b.73g43c.c74g34.b7b7b32b25.b2b1a4b4c" +
        "a3a67b6b5c.7g21a1b.4k65.35k5.b1a22h.c5b4b46a1a.c5b2a6b5b.31b34b5b2b.12g25c.c53g12.b2b4b45b53" +
        "b1b3a4b1c.a3a44b3b5c.4g41a2b.3b2442e53",
  // puzzle 80 "Casty"
  "20x36:7d73a3d437c7.5a71d2a34e2a1.2a52a7a2b37a36a14b.e5g66d4.a5a23b72a3b54a3a3a.a6d57b3e1a1a" +
        "a5a65a7b1b14a4c7.c65c7b5e2b.53a44a32e24a5a2a.i77b12a1a1a.a664a3a2a43f3b.e4a7a41a3245c4" +
        "6a324b2i14a.6g2a1b6a4d.1a1a146d51c21a4.b3a343a26d3d3.a2f36a62a5b3a1.a4a5a1e41a1a1c" +
        "c4a6a32e3a4a7a.1a1b7a77a44f7a.4d7d33a313a4b.2a52c35d231a3a2.d2a3b1a6g7.a15i2b371a1" +
        "1c5625a63a3a1e.b2f45a4a3a424a.a2a2a12b63i.a4a4a53e43a24a24.b7e3b5c67c.4c5a36b3b6a67a2a" +
        "a2a2e1b61d3a.a6a1a44b4a17b41a6a.1d77g2e.b63a56a42b5a5a14a3.1a2e35a5d56a6.2c536d3a45d5",
  // from unknown provenance
  "14x24:7e5546e765f564e5744e8j554a723d345h533d546a237j1e3445e637f654e6331e6273g321h455h634h766g2354e4454e776f524e6585e4j344a452d533h584d424a335j6e4244e532f832e3542e4",
  "20x20:6b3h1a21a1d5b2b432c2b313a1b52b3c6g5b27a66a4c1f2f76b5b342e3b14b66b25c5a2a345c817343b232l3c1d7b7a34b1f1b8b8a5d4a355b8a5a3b822a1b141a5817c388h4e5b64c9a1c2a6a285a1c3a145b17c8b6b6a23h68h4b6b22a6b1323a3c4c6b3a21d3155a1b484f3a2b9b3h235b222a1b5a83b23c56a",
  "20x36:a2d5b22a453c2e2a5e3a1d553a1b1a25a4b8a231b5423e5c3a6b24a6b81a3a8n9a4988161g3a129a9g8c4c3b89a831a31a3631b7c8d52a4721e3a2a1273b3h6b2a77a2h42632a5a7c16a67a132d5b24b4b1a521a6b1b1a3c5e3e7c71a2a1c1b21b41d6a1a4a3a21b3f313a21a24a41b463d434d3b91a6c2647a9a2613a5d64a4g3b1a2a224a4c12a61d4c7a77h3c31a4b771d6b1a1b26d74315c1g4b7e31c1a4c4b299b4a42e1a3a1a2c3c3a7c3e3a2a3a5c4a62a421b5a6a3c3a2b24e2b71b6b81c9992a2e5b6643c9b7a9a1a3a34d4b21k57b5b3a413a6b4d53a2b33a3a71845a122c4b5c6d1c3a3a4a",
  "20x36:a53a55c25c24b44a2c5d2d2b5h53n64c4a27b24h5f2b7e57e43e5a45b2f8c5997a4l87a7b9b992c1b23a8d88b257a66a8a2b98j6b64d5h6a7744b95c77c8a62b6b4a5d6b76g54b66g8h46a6b48c36h4a6c5a37h41a42f2a46a25b5e4b5d4b1e5b72a72a2f54a55h74a5c4a5h43c12b4a66h2g83b26g78b2d8a4b1b57a4c42c84b3475a3h4d44b5j25b4a8a82a565b76d8a53b5c276b6b2a87l6a5738c5f3b15a7e54e24e7b7f8h44b33a3c12n46h5b4d4d1c8a76b37c95c55a14a",
  "20x36:b55e54e41d34d1b3d25b35b64a4d3a36b3246b64a4d2a56b34b35d5b7d54d45e43e34g2435b4271e5253l2642f23a52a42g14b6b5b4b2b37b54b6b4b2b6b66g63a24a62f3733l3571e5242b2373y3d4b4543b4d25a74a6a3d3a3a76a4a4b5b6d6b6b5b6b5b5d5b5b5a3a45a3a2d3a3a34a63d7b4534b2d3y2575b4243e3642l7676f46a25a24g43b2b7b4b6b72b25b5b2b4b5b54g36a52a62f1254l5534e5535b3453g34e44e55d36d7b7d37b33b55a7d3a45b4652b43a5d6a77b47b33d6b5d67d44e36e52b",
  // nikoli big book #18
  "23x37:5b1b6b7b7d2d2.a66a66a26d1727a7217a.a64a44a42d2b7a2b7a.6b7b7b7c7b7a7b2a.a64a44a45d1721a7277a.a64a44a42c1d7d7.1b7b1b5c7277a2122a.a74a44a47d1b2a1b7a.a27a23a36d2b1a2b2a.7b6b8b4c7122a7717a.l2d7d2.w.b2e1e4e1b.73a32282a23314a34428a42.a4a6c6a6c6a6c6a8a.a4a6c6a6c6a6c6a2a.a7a6c6a6c6a6c6a4a.21a32515a31342a33221a31.b4e1e4e6b.45a44922a32C44a46533a41.a5a5c5a1c1a6c3a3a.a4a9c9aCcCa5c5a1a.a3a3c3a1c1a4c1a5a.44a43934a91C19a415A2a21.b6e2e4e5b.w.4d1d3l.a4443a4343c4b4b4b4.a4b1a3b4d19a15a5Aa.a1b4a3b3d36a66a5Aa.a3414a4343c4b4b4b4.3d3d4c32a23a36a.a4334a4413d51a25a56a.a3b3a3b4c4b4b4b4.a3b3a1b1d21a35a66a.a4331a3144d88a12a22a.1d4d4b4b4b4b4",
  // nikoli big book #19
  "23x37:5e3a43a2a26a7e3.c52a2d3d6a17c.a5326m7343a.a46f4a4a4f26a.f41a1a2a2a62f.5b4o3b1.2a1a6m4a5a5.c6b5a364a139a9b9c.32c5k1c65.d5m6d.a5d5d3d9d6a.a3a61a2a24a4a34a3a81a8a.c36c32c43c28c.w.a4626m8318a.3d7a7372a5931a3d5.w.a7426a7i3a8328a.a4b2a9a827a723a7a3b8a.a4454a4i8a8325a.w.7d4a6727a5478a1d2.a7452m8652a.w.c42c72c12c85c.a1a18a9a91a2a86a6a21a1a.a7d6d8d6d5a.d8m3d.16c9k3c27.c3b1a859a428a6b2c.4a4a6m2a2a6.4b3o2b4.f91a9a2a2a56f.a43f1a9a6f12a.a1592m3726a.c49a2d9d5a46c.5e4a35a2a25a3e4",
  // nikoli big book #20-23
  "23x37:634c4c213c5c564.c3b3i4b1c.c6b1a42c35a5b5c.c2d63c64d4c.3b4d57c29d6b4.4b6o5b5.4c161c129c269c1.w.7c172c927c369c2.9b7o3b3.3b9d57c12d5b5.c1d54c46d6c.c4b1a13c21a6b7c.c5b5i2b6c.123c4c566c7c635.w.1a35a21b8a6a3b45a21a6.3a3c2b8a8a8b8c2a8.d3d1c3d4d.4a1c2b7a3a2b1c2a4.2a28a35b5a1a6b24a41a1.w.458c5c565c6c765.c8b8i8b7c.c5b7a42c25a7b3c.c8d36c63d3c.4b7d72c17d4b5.3b3o2b2.6c466c263c241c5.w.4c482c378c372c4.3b3o4b4.4b1d83c16d2b5.c2d44c68d8c.c4b8a86c23a3b4c.c1b4i2b5c.328c8c812c1c353",
  "23x37:a553c324c435c544a.w.a123372562a3a366343544a" +
        "a2g5a5a5g1a.a3g4a4a2b3a3b4a.a1b777b3c3a3c3a3a" +
        "a2b4a5b5c4g4a.a1b475b4c3a3c3a3a.a6g5a5a5b3a3b4a" +
        "a4g4a6a5g4a.a463743535a6a516343225a.w.a446c343c232c264a.w" +
        "5447a7a147271542a6a4231.c7a2a3g5a4a1c.a2a3a3a1a4a1a4a3a2a2a8a" +
        "c1c5g1c1c.a4a4c1a1c1a2c3a1a.c5c5g6c3c.a6a5a6a6a4a1a4a3a4a4a3a" +
        "c1a6a6g6a1a2c.4355a3a235354351a4a1265.w.a459c315c533c342a.w" +
        "a154141453a3a441423412a.a4g8a5a7g1a.a2b2a4b8a3a3g3a" +
        "a4a4c4a2c2b775b1a.a1g4c1b2a4b5a.a4a4c6a3c4b771b5a" +
        "a6b4a3b6a5a8g6a.a6g2a5a8g6a.a588318388a8a842146452a.w" +
        "a423c888c121c642a",
  "23x37:a48c88c42b32a2a21a.1b1a8g4a5e5a.4b8c88234c3aBBBa1a.a34c8f3cBaBc.e4b382b5a1aBBBa5a" +
        "a5b4b3e2a2e6a.4b4b8b883a3a44a1a34a.b1b3b1n.b5a3b8o.2a1a5a2b77826244253422.6a2a2a3a7n" +
        "b6c7a5a1a2a2a1a1a4a1.h5n.b61a5b3a1a6a2a1a1a5a3.a3f2n.2b5e24243153542453.3a4a6b1o.4b3b4a2b3e6a53b" +
        "a5e5b6a1b5e4a.b56a3e2b4a3b3b5.o2b6a5a3.42432432382633e2b6.n4f3a.1a1a1a1a1a1a1a5b4a25a" +
        "o4h.1a1a1a1a1a1a1a1a5c1b.n2a4a5a2a6.13256416565344b4a3a2a1.o5b1a4b.n5b1b4b" +
        "a36a4a24a3a234b1b3b4.a4e1a1e5b3b4a.a1a151a2a3b323b2e.c5a5c4f4c43a.a1a151a4c21444c2b3.a2e3a5g1a5b2" +
        "a63a5a54b32c12c43a",
  "23x37:9b3d3b3b6d8a82.w.b9366b33c4345b55b.2a1253b84a4a3733b88a8.h46i45b.e51a56f32a21b.b91a23f66a64d8.b45i52h" +
        "4a52b6555a3a55b5432a6.b34b6633c36b1652b.w.3b4d3b5b5d5b2.w.234c9262665a667c565.6a3c4e6a3a1c5b" +
        "6a3a4a2646221a3a5a5a362.6a3k6a1f.1a4c624e8a8c123.6a5a4a2a4bPb8a8a2a3a3.665c4a3e442c8a2.f6a6k8a2" +
        "442a2a3a6a1551463a3a3a3.b5c4a3a4e6c8a8.635c443a2425254c888.w.6b3d3b3b5d3b8.w.b1654b43c3134b63b" +
        "6a4642b25a7a6652b98a4.h77i93b.7d44a44f25a44b.b63a37f27a52e.b77i24h.3a34b4644a4a31b2542a4" +
        "b98b8637c74b9234b.w.66a9d9b6b3d4b1w",
  "30x30:234a6b323a2c2c666b33a2d3c6d1c23b6a614c7441b6a6a1a69b665541b5b1877a3c6a2c63a6b5b232c8b79a21a1b4a6a331b31b5b18a8e33c3c2b5a4d5a4a89a9a4b521a545c552a446a14b51a9a2a5a42b4413b54e7128b9c2f4a37b3447735g3a1a31c7a337a3a2377255b2a866a44a3a7466b2a7g5d8a64a2a55c6a344c55b443e1c65a4a21a3b5545a36a4534b5a926a6b6d1b5b44d5a4d2a6a2a6b7a52b884a6a5a3b157c33b2a7a2c38a31a72a412a1a71a3a51b3a4354a88b7c5a53d2c5a4a6a4b4a4c7a35a4a5b24b55a45b6b6234477a66a4435b3a244a2a5b26c23a24a66c254a364a31c326d1d252l823d2b255a12a5b4a45b6e54a2a354g5b12a443a1288b53a45b4a3a2a6a3a8a3b7a24a8a5b3b8a442346a1a2c99c7b1a1b1d1e64a1a2991c1g1a887c4a8b2a39b232a2a347a6628c13b8a2d9e512b1c5522a4a18e91a3a21c132a16c1c2b1552",
  "35x35:b1a23b2a342a3343g27b3b3a11344b4a2c1b3b552a99d2c212d4a4a4b55886a5c9a3b23334a1e7a5e5h2e4d2a3a28446c77a533b237b328h56a8a4a2c4a5b7d77b6a4a1b12a3a4e1b3e2a1b8836644c3a3c8a125a4a4322d4b7c6c34a5c26321c1e31a7e4b1a6d46e34c5a2a2b842214b7b6b521a3a2a6d366b5b8a6c55a25j55a342b6a355899e5a6b443a243a45d7466a12b9a5a3a3a8b3a4a588c2c4d7a91b552a1a4823b2c8d5a4b48a74d5a1e1b13c28a4b6k3b335b3b3b2b2b2c6428873f16b2d3b2b1b2b1b7b4a9a521a2b4a13a4d546b46b1b77b93b7a7g52a5a2b3a2b9c7c12a3a3a4a223b7a67a1b66c9122a9c2a86a6a55b23b6a17a511a6b2c9a1e624a5a32a56d8a7a3a5g23d3a4c4d23h6b6e14832b1a684a5b3d5a55a6a3a8a3b32b46d1a17b9a228c2a25d6a4a2a3b49c47a7h3a6a1a7b6a4a1a55b61b34a6a12a6a3a5a5a8a3b2246a1b5a6c5a6a4a3c93f241a54b822a9b9a5a2344a8a121a6a3554a4d3a5b4a2a5f3b5c4a65b9b151c53a31b7b3f13d6a7996b8a8a5e22a6b423b2b44a37b3c8a2b3c3b88a4g3c8b743b8a2a38d43a8a64c3c28b87c128b1d1a3b866a4423a5",
];
let puzzleChoice = 15;
let puzzleCount = cannedPuzzles.length;
const demoPuzzles = [1,31];
const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many incomplete numbers which we need to join with others to complete " +
    "their room. For our first time through we can turn on Assist " +
    "Mode 2 to see any errors that we might generate in the process of " +
    "the solve, and to visualize the groups better.</p>",
  "Just by turning on assist mode 2 we see that one of the digit rooms is " +
    "satisfied already. At this stage we can also see that both of the " +
    "other twos are easy to solve as well, as there is only one direction " +
    "they can go at this point.",
  "Now we can see that the '4' on the right column can only go upwards, " +
    "and is constrained long enough to complete its shape. The '5' on the " +
    "bottom row is constrained too, but only for the first 4 cells, after " +
    "that it is still undetermined.",
  "Now the lower '3' is constrained until its completion, which then " +
    "constrains the '5' below it until it is done. The '3' near the top " +
    "must go one to the left, but it isn't yet clear if it continues west " +
    "or completes northward.",
  "Now it is clear that there are only three spaces left to complete the " +
    "unfinished '4', so they must all be included in its room. This " +
    "finalizes the '3' above as well.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "a tougher puzzle, using some of the more advanced techniques that were " +
    "not needed in the first one. It is recommended to go through demo 1 " +
    "first. Press the 'next' button to walk through the solving steps, or " +
    "the 'back' button to return to the previous step. You can also use the " +
    "undo button to move backwards individual steps, or continue playing " +
    "forward if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to let us know " +
    "which rooms still need completion. Looking at this tougher board it " +
    "appears that there is not any cell that can definitively be completed. " +
    "However, we can take advantage of the ability to paint borders to " +
    "begin to designate some required separation. For instance, looking at " +
    "the three sets of '3' digits in the upper left, we can see that none " +
    "of those not already connected can be allowed to connect, else they " +
    "will create a room too large for the digit. Similarly the two '2' " +
    "digits in the lower right of the puzzle.</p>",
  "These wall additions allow the upper left '3' to be completed, as well " +
    "as the two '2' cells in the lower right. In addition, the '3' in the " +
    "upper center can progress one step to the right.",
  "Now a key form of observation required for more challenging puzzles is " +
    "visible in the lower right of the puzzle. Seemingly, it is not " +
    "knowable at this time what value can occupy the white cell in the " +
    "second to bottom row, right column. However, the critical observation " +
    "is that it can <b>not</b> be any of '1', '2', or '3'. If it were a '1', " +
    "it would illegally combine with '1' above it. Similarly with the '2's. " +
    "And a '3' would require two more to its left which would illegally " +
    "combine with the nearby '3' cells. Thus we can deduce that it must be " +
    "at least a '4'. For now we can at least use this information to draw " +
    "a border on those '3' cells to give space for this larger room to exist. " +
    "Unrelated, we can move the upper '5' on the left column downward by one " +
    "cell.",
  "With these restrictions, we can complete the right '3' on the bottom row, " +
    "and make another key observation with the upper '5' on the left column. " +
    "Again, we can see that if the '5' grows any more to the south, it will " +
    "combine with the other '5' cells below it to make too large of a room. " +
    "Thus it must complete its shape all to the right. Meanwhile, the '5's " +
    "below it must be restricted from growing upwards.",
  "More work can be done in the upper left corner. The '3' room can only be " +
    "completed by adding one on the second row; this forces the '5' above " +
    "it to move towards the right at least one cell.",
  "Now we must infer that the single empty cell in the upper left can only " +
    "be filled with a '1'. In addition, we can infer one more cell in the  " +
    "growing '5' on the top row. It could only gain two more cells by moving " +
    "southward (which is still possible), but it needs three more to complete " +
    "its shape. Therefore at least one of them must come to the right. This " +
    "blocks the '4' from moving straight upward, and then the same form of " +
    "logic can be used to say the '4' must also move at least one to the " +
    "right. This in turn defines the direction that nearby '3' room must " +
    "grow to complete its shape. Everything else in that area is still " +
    "pending at this time.",
  "Now it is more obvious that the '5's growing on the top row can only gain " +
    "one more if it were to move southward. Two more would make it connect " +
    "to the other '5's below. Thus at least one more '5' must come from " +
    "the right. Doing so blocks the '4', which means that it must indeed " +
    "take those two remaining isolated white cells, and the '5' must move " +
    "its last cell to the right.",
  "Now we can progress on two '2' cells. If you note the isolated white " +
    "cell in the middle can not have a '1' in it, the only other choice " +
    "could be a '2'. Meanwhile, in the middle of the right column, we " +
    "have another situation where the process of elimination can help us " +
    "make progress. The white space below that '2' can not contain a '1', " +
    "or a '2', else it would force two '1' cells next to each other. Thus " +
    "we can deduce that the '2' must connect upwards.",
  "Now we have a curious 'fight' going on for space in the upper right. " +
    "Both the '4' and the '5' need room to expand into the remaining white " +
    "spaces. If the '5' were to grow to the right, it wouldn't fit and " +
    "would need to also add one to the left. This would block the '4' from " +
    "having enough space to grow. Thus it must grow to the left and join " +
    "the other '5' nearby. It can't take that one cell on the top row else " +
    "it would connect with the neighboring '5'. Meanwhile the '4' must " +
    "finish all the way down to the right towards the '1' else we risk a " +
    "double '1' room there. This means that the white cell on the top row " +
    "must be a '1' and there is only one place left for the final '5' to go.",
  "Looking at the board in its current state, we can solve the '6' in the " +
    "right side of the board. The '5' next to it is restricted to go down, " +
    "so that hems in the '6' to the remaining white squares around it.",
  "Now we see that the '5' next to that '6' room has no choice but to " +
    "connect to the other '5' to its left and down. But which direction? " +
    "It can only take one of the two white cells, left or down. But it " +
    "can be seen that if it left the one to its left white, then only " +
    "a '1' cell would satisfy it, but that would violate the rule of " +
    "the '1' room being of size two.",
  "Now with that complete we can see that there is only one option for " +
    "the pending '3' in the lower right, it must go up one and left one " +
    "to avoid colliding with the other '3' cells below it. This begins " +
    "to constrain the '6' in the bottom area. It <b>could</b> take all " +
    "four of the white squares to its right (though we can't assume it " +
    "yet, those could be satisfied with a set of '4' cells). But even " +
    "so that is not enough, so we know it must have at least one '6' " +
    "in the west direction, which begins to constrain the '4's next to " +
    "it, where we can make a little more progress.",
  "We can see trouble brewing between the remaining unsolved '5' cells " +
    "in the lower left region. The upper collection of three '5's " +
    "cannot reach either of the '5's below it without making too big " +
    "of a room, and there just isn't enough room for three independent " +
    "rooms of '5's. This means that the two lower '5's must connect up.",
  "This move immediately solves the solo '4' on the second to bottom " +
    "row, and then our '6's in the lower right. This in turn allows us " +
    "to complete the '3' in the lower left corner.",
  "Almost there. We can complete the lower of the pending '5' rooms, " +
    "there is only one square it can go. This forces the completion " +
    "of the '4' next to it, upwards. Which then in turn forces the " +
    "'3' above that to the left.",
  "<p>Now it would seem we have a few options for the remaining white " +
    "cells since they are unconstrained. But starting with the two in " +
    "the left center, to the left of the '3's, they must be a '2' since " +
    "the only other solution would be two '1's which would violate the " +
    "primary rule. Now looking at the '5's below that, they need two " +
    "more cells, which could come from any of the four white cells " +
    "except the right-most, which is connected to the other nearby " +
    "'5' room. But that '1' among the white cells indicates that no " +
    "other '1' can be nearby. The only solution for this is to have " +
    "the '5's along the left wall, and place two '2's in the empty " +
    "space.</p><p>In this back-and-forth manner, searching out areas " +
    "of available constraints, we can slowly work our way to a more " +
    "complicated solve.",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
 [[],
  [],
  ["244","222"],
  ["414","404","403","543","542","541"],
  ["331","330","540","312"],
  ["410","411","420","421","302"]],
 [[],
  ["_01","_11","|22","|23","_78","_88"],
  ["300","310","268","299","325"],
  ["_77","_87","530"],
  ["396","395","531","532","533","_40","_41","_42"],
  ["312","503"],
  ["111","504","415","335","|44"],
  ["505","413","423","506"],
  ["245","239"],
  ["409","419","429","517","527","536","107","_37"],
  ["637","638","658","659","669","557"],
  ["566","556"],
  ["367","376","684","474","464"],
  ["572","582","_52","_62"],
  ["492","493","494","686","687","688","689","390","380"],
  ["563","454","343","342"],
  ["240","241","560","570","261","262"]]];
