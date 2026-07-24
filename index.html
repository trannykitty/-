<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Boyfeet — R6 recoil trainer</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<style>
  .music_bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.6rem 1.25rem;
    padding-top: calc(0.6rem + env(safe-area-inset-top));
    background: rgba(8,8,8,0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .music_track_info {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
    flex: 1;
  }

  .music_track_name {
    font-size: 0.68rem;
    font-weight: 400;
    color: #efefef;
    letter-spacing: 0.04em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .music_track_sub {
    font-size: 0.58rem;
    font-weight: 300;
    color: #555;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .music_controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .music_btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #888;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s ease;
    border-radius: 2px;
  }

  .music_btn:hover { color: #efefef; }

  .music_btn svg { width: 14px; height: 14px; }

  .music_btn_play svg { width: 16px; height: 16px; }

  .music_volume {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .music_volume svg { width: 12px; height: 12px; color: #555; flex-shrink: 0; }

  .music_volume_slider {
    -webkit-appearance: none;
    appearance: none;
    width: 72px;
    height: 2px;
    background: rgba(255,255,255,0.12);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  .music_volume_slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #d0d0d0;
    cursor: pointer;
  }

  .music_volume_slider::-moz-range-thumb {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #d0d0d0;
    cursor: pointer;
    border: none;
  }

  @media (max-width: 600px) {
    .music_bar {
      padding: 0.5rem 1rem;
      padding-top: calc(0.5rem + env(safe-area-inset-top));
    }
    .music_volume { display: none; }
    .music_btn { padding: 0.4rem; }
  }
</style>
</head>
<body>

<canvas id="snowfall" aria-hidden="true"></canvas>

<header class="music_bar">
  <div class="music_track_info">
    <span class="music_track_name" id="music_track_name">9 Scarecrows</span>
    <span class="music_track_sub">Now Playing</span>
  </div>
  <div class="music_controls">
    <button class="music_btn" id="music_prev" aria-label="Previous">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
    </button>
    <button class="music_btn music_btn_play" id="music_play" aria-label="Play">
      <svg id="icon_play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      <svg id="icon_pause" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
    </button>
    <button class="music_btn" id="music_next" aria-label="Next">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg>
    </button>
  </div>
  <div class="music_volume">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
    <input class="music_volume_slider" id="music_vol" type="range" min="0" max="1" step="0.01" value="0.18" />
  </div>
</header>

<audio id="audio_player" preload="auto"></audio>

<header>
  <a class="logo" href="#top">Boyfeet</a>
</header>

<main id="top">

  <section class="hero">
    <div class="hero-text">
      <p class="kicker">R6 recoil</p>
      <h1>WE ALL LOVE BOYFEET.</h1>
      <p class="lede">Boyfeet Recoil is pretty UD in Siege and offers a lot of fun features to experiment with, making the game easier and more enjoyable to play.</p>
    </div>
  </section>

  <section id="features" class="section">
    <h2>How it works</h2>
    <ul class="feature-list">
      <li>
        <span class="feature-mark" aria-hidden="true"></span>
        <span class="feature-name">macro</span>
        <p>UD FROM WHAT I KNOW.</p>
      </li>
      <li>
        <span class="feature-mark" aria-hidden="true"></span>
        <span class="feature-name">different methods</span>
        <p>like mouse_event SetCursorPos SendInput keybd_event Direct Hold.</p>
      </li>
    </ul>
  </section>

  <section id="download" class="section">
    <h2>Download</h2>
    <div class="download-card">
      <div class="download-info">
        <p class="recommended">Free</p>
        <h3>Boyfeet for desktop</h3>
        <p>all of it, Runs alongside Siege, no overlay hooks into the game itself.</p>
        <p class="download-meta">v1.4 · 1.02 MB · Windows 10/11</p>
      </div>
      <a class="btn download-btn" href="https://github.com/trannykitty/kitty/raw/refs/heads/main/boyfeet.exe" download>Download free</a>
    </div>
  </section>

</main>

<footer>
  <p>Boyfeet, 2026</p>
</footer>

<script>
(function(){
  var canvas = document.getElementById('snowfall');
  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var flakes = [];
  var count;

  function size(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    count = Math.round((canvas.width * canvas.height) / 15000);
  }

  function makeFlake(){
    var far = Math.random() < 0.55;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: far ? (Math.random() * 1.1 + 0.5) : (Math.random() * 2.2 + 1.6),
      speed: far ? (Math.random() * 0.5 + 0.25) : (Math.random() * 1.3 + 0.9),
      drift: Math.random() * 0.6 - 0.3,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.015 + 0.008,
      alpha: far ? (Math.random() * 0.25 + 0.12) : (Math.random() * 0.45 + 0.4),
      blur: far ? 0 : Math.random() * 2.5
    };
  }

  function init(){
    size();
    flakes = [];
    for (var i = 0; i < count; i++) flakes.push(makeFlake());
    flakes.sort(function(a, b){ return a.r - b.r; });
  }

  function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < flakes.length; i++){
      var f = flakes[i];
      ctx.globalAlpha = f.alpha;
      ctx.shadowColor = 'rgba(233,231,226,0.9)';
      ctx.shadowBlur = f.blur;
      ctx.fillStyle = '#e9e7e2';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  function step(){
    for (var i = 0; i < flakes.length; i++){
      var f = flakes[i];
      f.wobble += f.wobbleSpeed;
      f.y += f.speed;
      f.x += f.drift + Math.sin(f.wobble) * 0.2;
      if (f.y > canvas.height + 4){
        f.y = -4;
        f.x = Math.random() * canvas.width;
      }
      if (f.x > canvas.width + 4) f.x = -4;
      if (f.x < -4) f.x = canvas.width + 4;
    }
    draw();
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', init);
  init();
  draw();
  if (!reduceMotion) requestAnimationFrame(step);
})();

const playlist = [
  { name: '9 Scarecrows', src: 'https://github.com/trannykitty/kitty/raw/main/ELUSIN__SEMATARY_-_9_SCARECROWS_PROD._GRAVE_MAN_1.mp3' },
  { name: 'My Teddy', src: 'https://github.com/trannykitty/kitty/raw/main/MY_TEDDY.mp3' },
  { name: 'Headlights', src: 'https://github.com/trannykitty/kitty/raw/main/Sematary%20-%20Headlights.mp3' }
];

const audio = document.getElementById( 'audio_player' );
const btn_play = document.getElementById( 'music_play' );
const btn_prev = document.getElementById( 'music_prev' );
const btn_next = document.getElementById( 'music_next' );
const vol_slider = document.getElementById( 'music_vol' );
const track_name = document.getElementById( 'music_track_name' );
const icon_play = document.getElementById( 'icon_play' );
const icon_pause = document.getElementById( 'icon_pause' );

let current_idx = 0;
let started = false;

function load_track( idx, autoplay ) {
  current_idx = ( idx + playlist.length ) % playlist.length;
  audio.src = playlist[ current_idx ].src;
  audio.volume = parseFloat( vol_slider.value );
  track_name.textContent = playlist[ current_idx ].name;
  if ( autoplay ) audio.play( ).catch( () => {} );
}

function set_play_state( playing ) {
  icon_play.style.display = playing ? 'none' : '';
  icon_pause.style.display = playing ? '' : 'none';
}

audio.addEventListener( 'play', () => set_play_state( true ) );
audio.addEventListener( 'pause', () => set_play_state( false ) );
audio.addEventListener( 'ended', () => load_track( current_idx + 1, true ) );

btn_play.addEventListener( 'click', () => {
  if ( !started ) { started = true; load_track( 0, true ); return; }
  audio.paused ? audio.play( ) : audio.pause( );
} );

btn_prev.addEventListener( 'click', () => load_track( current_idx - 1, !audio.paused ) );
btn_next.addEventListener( 'click', () => load_track( current_idx + 1, !audio.paused ) );
vol_slider.addEventListener( 'input', () => { audio.volume = parseFloat( vol_slider.value ); } );

load_track( 0, false );

function try_autoplay( ) {
  if ( started ) return;
  started = true;
  audio.volume = parseFloat( vol_slider.value );
  audio.play( ).catch( () => { started = false; } );
}

document.addEventListener( 'click', try_autoplay, { once: true } );
document.addEventListener( 'keydown', try_autoplay, { once: true } );
document.addEventListener( 'touchstart', try_autoplay, { once: true } );

window.addEventListener( 'load', () => {
  load_track( 0, false );
  audio.volume = parseFloat( vol_slider.value );
  audio.play( ).then( () => { started = true; } ).catch( () => {
    document.addEventListener( 'click', try_autoplay, { once: true } );
    document.addEventListener( 'keydown', try_autoplay, { once: true } );
    document.addEventListener( 'touchstart', try_autoplay, { once: true } );
  } );
} );
</script>
</body>
</html>
