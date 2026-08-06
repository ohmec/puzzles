// Shared puzzle-page chrome: banner, tabs scaffold, play UI, demo/ribbon bars.
// Per-page HTML supplies data-display-name / data-jp-html on <body> and three
// #puzzleTabSources > [data-tab] bodies. Call mountPuzzleShell() before puzzleInit().

function mountPuzzleShell() {
  const body = document.body;
  const displayName = body.dataset.displayName || '';
  const jpHtml = body.dataset.jpHtml || '';
  const sources = document.getElementById('puzzleTabSources');
  if (!sources) {
    console.error('mountPuzzleShell: missing #puzzleTabSources');
    return;
  }

  const jpBanner = jpHtml
    ? ' <span class="jpfont">' + jpHtml + '</span>'
    : '';

  const root = document.createElement('div');
  root.id = 'puzzleShell';
  root.innerHTML =
    '<div id="banner">' +
      '<a href="index.html">Ohmec Puzzles</a><br/>' +
      'Player for ' + displayName + jpBanner +
    '</div>' +
    '<div id="tabContainer">' +
      '<ul id="tabs">' +
        '<li class="active"><a href="#tab1">Game Play   </a></li>' +
        '<li><a href="#tab2">Rules       </a></li>' +
        '<li><a href="#tab3">Puzzles     </a></li>' +
        '<li><a href="#tab4">About       </a></li>' +
      '</ul>' +
    '</div>' +
    '<div id="tabsContent">' +
      '<div id="tab1" class="tab_content" style="display: block;"></div>' +
      '<div id="tab2" class="tab_content" style="display: none;"></div>' +
      '<div id="tab3" class="tab_content" style="display: none;"></div>' +
      '<div id="tab4" class="tab_content" style="display: none;">' +
        'This playground was written using javascript and is available open ' +
        'source. All code is checked into the github repo at ' +
        '<a href="https://github.com/ohmec/puzzles">ohmec/puzzles</a>. ' +
        'Feel free to file bugs there!' +
      '</div>' +
    '</div>' +
    '<div id="puzzleEntry">' +
      '<center>' +
        '<input type="text" id="userPuzzle" size="40" />' +
        '<input type="button" value="Display Puzzle" id="displayButton" class="button small" />' +
      '</center>' +
    '</div>' +
    '<br />' +
    '<div id="puzzleInterface">' +
      '<div id="canvasDiv" style="border-color: black;">' +
        '<canvas id="puzzleCanvas" class="pcanvas" height="270" width="270" style="border-color: black;"></canvas>' +
      '</div>' +
      '<br />' +
      '<br />' +
      '<div id="buttonsDiv">' +
        '<input class="button small" type="button" value="Undo" id="undoButton" />' +
        '<input class="button small" type="button" value="Reset" id="resetButton" />' +
        '<input class="button small" type="button" value="Current Assist Mode (0)" id="assistButton" />' +
        '<input class="button small" type="button" value="Clear Ribbons" id="clearButton" style="display: none" />' +
        '<p><span id="puzzledescr"></span></p>' +
        '<p><span id="errortext"></span></p>' +
      '</div>' +
    '</div>' +
    '<div id="demotab" style="display: none;">' +
      '<input class="button small" type="button" value="prev" id="prevDemoButton" />' +
      '<input class="button small" type="button" value="next" id="nextDemoButton" />' +
      '<p id="demop"><span id="demotext"></span></p>' +
    '</div>' +
    '<div id="ribbonbar">&nbsp;</div>' +
    '<!-- space so the canvas does not shrink when demo mode opens -->' +
    '<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>';

  // Move unique tab bodies into the shared tab panels before attaching to DOM.
  for (let n = 1; n <= 3; n++) {
    const src = sources.querySelector('[data-tab="' + n + '"]');
    const dest = root.querySelector('#tab' + n);
    if (!src || !dest) {
      console.error('mountPuzzleShell: missing tab ' + n);
      continue;
    }
    while (src.firstChild) {
      dest.appendChild(src.firstChild);
    }
  }
  sources.remove();

  // Insert shell at the start of <body> (before trailing init scripts).
  body.insertBefore(root, body.firstChild);
}

mountPuzzleShell();
