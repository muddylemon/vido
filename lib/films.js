(function (root) {
  'use strict';
  const films = {
    house: { id: 'house', title: 'The House Always Wins', page: 'demo/house.html', audio: 'demo/house-score.js', duration: 48, fps: 30, width: 1080, height: 1920, name: 'the-house-always-wins', pause: 1 },
    metabolic: { id: 'metabolic', title: 'The Metabolic Engine', page: 'index.html', audio: 'js/audio.js', duration: 10, fps: 30, width: 1280, height: 720, name: 'metabolic-engine', pause: 1.2 },
    apocalypse: { id: 'apocalypse', title: 'The Apocalypse of Peter', page: 'apocalypse/index.html', audio: 'apocalypse/js/score.js', duration: 130, fps: 30, width: 1280, height: 720, name: 'apocalypse-of-peter', pause: 1.5 },
    nightshift: { id: 'nightshift', title: 'The Night Shift', page: 'demo/index.html', audio: 'demo/score.js', duration: 18, fps: 30, width: 1280, height: 720, name: 'the-night-shift', pause: 1 }
  };
  for (const film of Object.values(films)) Object.freeze(film);
  Object.freeze(films);
  if (typeof module !== 'undefined') module.exports = films;
  else root.VIDO_FILMS = films;
})(globalThis);
