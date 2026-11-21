// Tentai Show (Astronomical Show / Spiral Galaxies) definitions.
// Form: WxH:<star-descriptor>[:<row-wall-hexes>:<col-wall-hexes>]
// Star glyphs (at most one per cell; a-z/- blank runs; '.' row sep):
//   center: * black, O white
//   east:   > black, E white
//   south:  V black, S white
//   SE:     + black, @ white
// Optional wall hex segments match Double Choco (solved #0).
// Source: astronomical_show1.pdf — 10x10 Easy #1-26 + Medium #27-29
//         (larger Easy/Medium/Hard left for manual entry).
let cannedPuzzles = [
  // 例題 — unsolved until walls encoded for solved demo
  "10x10:Ea*a*bVOS.a+aEaOOc.Ob+bV+aO.bVbVd.EcVa>aEa.SOaObSbO.bOa*cOa.Ed*aEb.@aEaVaEaSa.cOa>cO",
  // --- Easy #1-26 (10x10) ---
  // Easy #1 (p12, 17B+29W, conf=high, OK)
  "10x10:SO*a*aOSEa.a*Ob>bSa.>b*OO>bO.S*aOdVa.bOOEaEc.a*cEbO*.cOa>b>a.Ea*aEaObO.SaSVa*bOa.dO*EbO",
  // Easy #2 (p13, 14B+25W, conf=high, OK)
  "10x10:OSaEb*bO.ScEa>aEa.aEa>cSb.b*Sb*a*S.+c+a>c.bOVcSOa.OEcEd.aOc>aSEa.Sa*aSaVbS.bObOa*b",
  // Easy #3 (p14, 16B+22W, conf=high, OK)
  "10x10:SOc*bEa.a>aSbO>aO.dEc>a.*EaVaOVOOa.bOfV.a@bEbEb.*b*b*Sb.cO>cVa.O>bEdS.Ec>b*Oa",
  // Easy #4 (p15, 18B+20W, conf=high, OK)
  "10x10:O@cEb@a.c+aO+c.Ea*fO.O+bO*aO>a.dVa*@b.Va@b*ObV.a*c@bVa.aOa*cVb.>bOaVbSO.Oa*cEc",
  // Easy #5 (p16, 14B+21W, conf=high, OK)
  "10x10:Vb*cSb.aOaO*ScV.Oa*aSbOb.SdOd.aSaScVa*.bVaSVd.OeOaO*.j.SOVOS*S*S*.j",
  // Easy #6 (p17, 16B+25W, conf=high, OK)
  "10x10:EaEaSb*aO.Sd*EbV.aO*EaVO*Oa.bScEb*.cO@b*aS.OaOdOb.>c*bO>a.@bVSV@c.hOa.aOa*>a>bO",
  // Easy #7 (p18, 19B+22W, conf=high, OK)
  "10x10:Sa*ObOSaO.a>a>bVa@a.SdOd.aVbOc*a.cOaOEa>a.Sc*>b*a.aVOVSO*SaS.hVa.O*bEa*Ob.a>a*>dO",
  // Easy #8 (p19, 18B+20W, conf=high, OK)
  "10x10:OEa*b+aOa.a>bOObEa.>a+aSbVb.Sd>bSO.aOa*Ee.b*bVa+aV.Ei.Sa>a*OVc.aSaSV*aEaV.OeOc",
  // Easy #9 (p20, 13B+17W, conf=high, OK)
  "10x10:SaOb>bEa.b>cOVOa.EcEdS.aV@e*a.dEbSb.a@aVeV.Vd+d.a@a>cEaV.fVEb.Oc>dO",
  // Easy #10 (p21, 14B+29W, conf=high, OK)
  "10x10:aSOa>b*b.OcSaObO.OOa*aEaO*a.aObEaEc.bOb*a*aS.Ea*EaOSc.cOc**a.*a*a>bSaS.SVSaEa*c.cEaOaEaO",
  // Easy #11 (p22, 12B+18W, conf=high, OK)
  "10x10:*aVa*@aOaS.VOaOc+b.d*e.b+bOVbO.aVe+b.dEe.EdEcS.ObEbSaVa.@a*g.dEbOaO",
  // Easy #12 (p23, 16B+25W, conf=high, OK)
  "10x10:OEa*a*Oa@a.VSVa*bOb.cOaObOa.b+aOa*aVO.Ei.EaVEaOb*a.aOb*a*EaO.SaEbOaVb.b*b*cS.aEbO*aOb",
  // Easy #13 (p24, 13B+25W, conf=high, OK)
  "10x10:@aEb*cS.bVbOaSb.dVS*a*S.bVOcOb.*cOSd.aEa@cOEa.**c@bEa.aVaEcSaV.OaVSOcVa.aOdObO",
  // Easy #14 (p25, 20B+23W, conf=high, OK)
  "10x10:+bEd*a.bO*aEa>aO.aO*OOaS*aV.a*a*dOa.OEb*EaOb.bSOa*c*.aObSa+a*a.a>cOd.**Ec*aSO.aO>b*aOb",
  // Easy #15 (p26, 15B+24W, conf=high, OK)
  "10x10:EaSb*a@b.c*Oa*bS.OO*@aOOaSa.a*eSb.*aEb@cO.a>bOcEa.b*VcOaV.*cOb>b.S>aEa*a+b.bEbOcO",
  // Easy #16 (p27, 20B+18W, conf=high, OK)
  "10x10:>b*a*VaOa.aEb@c*a.OeVSa*.EaOaOe.cOEaVa>a.>c*bOb.Oa*aEa@a*a.*VcVd.Va>aVc>a.bObOEbO",
  // Easy #17 (p28, 8B+24W, conf=high, OK)
  "10x10:aSEbOEbO.Oc*cOa.EbObOc.bOaVObOa.EbVcOaO.e*d.Sa*g.dOa+aEa.a*VSaObSa.OcEe",
  // Easy #18 (p29, 13B+19W, conf=high, OK)
  "10x10:bEd@aO.a@aVa+d.OcVdO.aOaSbEaEa.a>cVd.*+e>b.cSVaSbS.O@e@b.c*a*cS.Eb*b>aOa",
  // Easy #19 (p30, 15B+17W, conf=high, OK)
  "10x10:OaEb*cO.aSbO*EaEa.gOb.Sa**bVaOa.d@bVb.V>fVO.b+c*c.@cSb@b.b*b*cS.b>bO>c",
  // Easy #20 (p31, 18B+23W, conf=high, OK)
  "10x10:>aO>dOa.aOaOEa>a*a.EaVbEbOO.Sd*b*a.a*bEaV@b.aOVSe*.*c*a*Eb.bObEa>b.*Eb*ObOa.Oa*aEcEa",
  // Easy #21 (p32, 16B+15W, conf=high, OK)
  "10x10:b@c>b*.aObSEaSb.aEfEa.>aEb+d.VbEc>b.c*c>b.bOEd*a.a>b>e.*SVOaSVS>a.i*",
  // Easy #22 (p33, 11B+20W, conf=high, OK)
  "10x10:*+b@bOaO.fVa*a.VbOf.aEbSOaEaO.bEbSd.Ee+bS.bEbVd.+b>cEb.bSaO@bSO.*b>f",
  // Easy #23 (p34, 12B+22W, conf=high, OK)
  "10x10:OaEa*VaSaS.@cOe.cEaEaEb.aSb*bEb.cOaVd.Sa*c>aOS.aO>dEb.aVc*OaVa.bO*+aEc.aEeEb",
  // Easy #24 (p35, 15B+19W, conf=high, OK)
  "10x10:EaSbOEbO.c+bVaOa.SOc*aVb.c>d+a.aVO*bOc.*c*a>bV.>dEaOb.@d*cS.c*O@d.OaEeOa",
  // Easy #25 (p36, 20B+18W, conf=high, OK)
  "10x10:bOd>b.aEbV*a*aO.Oa*bEaOb.bOc*a>a.VbSEbOaS.aVbVa>c.bOdO>a.c*a*O*b.VaSVOObOV.e>a*b",
  // Easy #26 (p37, 10B+20W, conf=high, OK)
  "10x10:aSa>a*a*b.Ob@bEc.a>c@bOa.gEb.eS>bV.OaEa*bOb.aVOdEb.dOOd.SaEa>aO@b.a*Eg",
  // --- Medium #27-29 (10x10) ---
  // Medium #27 (p38, 1B+25W, conf=high, OK)
  "10x10:@a@aOc@a.eOd.cOSObSa.gOaO.d+aOEb.EbOcOSa.aEh.fSc.OcOdS.EdEbOa",
  // Medium #28 (p39, 8B+17W, conf=high, OK)
  "10x10:bSa*bSOa.aOh.Sb*EcEa.e*bOa.a*eOb.fEbS.aOeSb.aSd*aEa.b>aO*d.Ee>c",
  // Medium #29 (p40, 14B+18W, conf=high, OK)
  "10x10:bOaEbOb.a*c>c*.*bOEbVOa.EbSa*Oc.aOb>b*Ea.fVc.aEb*dS.EaO*dSa.OaVa@bVb.c*f",
];
let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;

const demoPuzzles = [];
// D1 = Easy (idx 1), D2 = Medium (idx 27); D3/D4 unused for now
const puzzleLevels = [1, 27, 99, 99];

const demoText = [];
const demoMoves = [];
