// Frame-accurate renderer for composition/index.html.
// Splits the timeline across N headless Chromium instances; each one seeks the
// paused GSAP timeline frame by frame, screenshots it and pipes PNGs into its
// own ffmpeg (x264). Segments are then concatenated losslessly by build.sh.
//
// usage: node render/render.js --out build --fps 60 --workers 4 [--from 0 --to 150]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('out', 'build'));
const FPS = +arg('fps', 60);
const WORKERS = +arg('workers', 4);
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const CRF = arg('crf', '14');
const URL = 'file://' + path.resolve(__dirname, '../composition/index.html');

async function openPage() {
  const browser = await chromium.launch({ args: ['--disable-gpu', '--font-render-hinting=none', '--disable-lcd-text'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(URL);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  return { browser, page };
}

async function worker(id, f0, f1) {
  const { browser, page } = await openPage();
  const seg = path.join(OUT, `seg_${String(id).padStart(2, '0')}.mp4`);
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-tune', 'animation', '-profile:v', 'high', '-g', String(FPS * 2),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-movflags', '+faststart', seg],
  { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${id} exited ${c}`)))));
  const cdp = await page.context().newCDPSession(page);
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    await page.evaluate((t) => window.seekTo(t), f / FPS);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, captureBeyondViewport: false });
    const buf = Buffer.from(data, 'base64');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if ((f - f0) % 300 === 0) {
      const el = (Date.now() - t0) / 1000;
      console.log(`[w${id}] frame ${f - f0}/${f1 - f0}  ${el.toFixed(0)}s`);
    }
  }
  ff.stdin.end();
  await done;
  await browser.close();
  return seg;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  // export the sound-effect cue sheet alongside the video
  const { browser, page } = await openPage();
  const meta = await page.evaluate(() => ({ duration: window.__duration, sfx: window.__sfx, scenes: window.__scenes }));
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'cues.json'), JSON.stringify(meta, null, 1));

  const from = +arg('from', 0), to = +arg('to', meta.duration);
  const F0 = Math.round(from * FPS), F1 = Math.round(to * FPS);
  const per = Math.ceil((F1 - F0) / WORKERS);
  const jobs = [];
  for (let i = 0; i < WORKERS; i++) {
    const a = F0 + i * per, b = Math.min(F1, a + per);
    if (a < b) jobs.push(worker(i, a, b));
  }
  const segs = await Promise.all(jobs);
  fs.writeFileSync(path.join(OUT, 'segments.txt'), segs.map((s) => `file '${s}'`).join('\n') + '\n');
  console.log('segments ready:', segs.length);
})().catch((e) => { console.error(e); process.exit(1); });
