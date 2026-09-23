"""Original lo-fi score for "Ateliê Digital — como funciona".

A lo-fi bossa for a sewing atelier: warm Rhodes, nylon guitar (Karplus-Strong),
upright-style bass, brushed lo-fi drums, a celesta motif, and atelier foley
(sewing-machine stitches that "sew" the chapters together, scissors, fabric).
Everything is synthesised here — no samples, no third-party recordings.

80 BPM, 4/4 → one bar = 3.0 s, so every chapter change of the video sits on a
bar line. UI sound effects are read from the cue sheet exported by the renderer.

usage: python3 music/compose.py build/cues.json build/
       → build/music.wav, build/sfx.wav, build/mix.wav (48 kHz, 24-bit stereo)
"""
import json
import sys
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
BPM = 80
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
DUR = 150.0
N = int(DUR * SR) + SR  # 1 s of headroom for tails
rng = np.random.default_rng(2627)


# ---------------------------------------------------------------- utilities
def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(sec):
    return np.arange(int(sec * SR)) / SR


def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output="sos")


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x)


def bus():
    return np.zeros((2, N))


def place(b, x, t, gain=1.0, pan=0.0):
    """Add mono x to stereo bus b at time t (s) with constant-power pan."""
    i = int(round(t * SR))
    if i >= N or i + len(x) <= 0:
        return
    if i < 0:
        x, i = x[-i:], 0
    x = x[: N - i]
    a = (pan + 1) * np.pi / 4
    b[0, i:i + len(x)] += x * gain * np.cos(a)
    b[1, i:i + len(x)] += x * gain * np.sin(a)


def env_adsr(n, a=0.005, d=0.0, s=1.0, r=0.05, hold=None):
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    if hold is not None:
        nr = int(r * SR)
        h = int(hold * SR)
        if h + nr < n:
            e[h:h + nr] *= np.linspace(1, 0, nr)
            e[h + nr:] = 0
    return e


def reverb_ir(rt60=2.0, predelay=0.012, bright=5000):
    n = int(rt60 * SR)
    t = np.arange(n) / SR
    ir = np.zeros((2, n + int(predelay * SR)))
    for c in range(2):
        noise = rng.standard_normal(n) * np.exp(-6.9 * t / rt60)
        # darker tail: blend a low-passed copy in as time goes on
        dark = filt(noise, "low", 1800)
        mix = np.clip(t / (rt60 * 0.5), 0, 1)
        tail = filt(noise, "low", bright) * (1 - mix) + dark * mix
        ir[c, int(predelay * SR):] = tail
    return ir / np.sqrt(np.sum(ir ** 2) / 2)


def convolve(b, ir):
    out = np.zeros_like(b)
    for c in range(2):
        mono = b[c]
        out[c] = signal.fftconvolve(mono, ir[c])[: b.shape[1]]
    return out


# ---------------------------------------------------------------- instruments
def rhodes(m, dur, vel=0.8):
    """FM electric piano: 1:1 carrier/modulator + a short tine partial."""
    f = mtof(m)
    t = tt(dur + 1.6)
    idx = (1.1 + 1.6 * vel) * np.exp(-t / 0.35) + 0.25
    body = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    tine = 0.22 * vel * np.sin(2 * np.pi * f * 7.02 * t) * np.exp(-t / 0.05)
    decay = np.exp(-t / (2.4 - 1.2 * (m - 48) / 36))
    x = (body * decay + tine) * vel
    x *= env_adsr(len(t), a=0.004, r=0.35, hold=dur)
    x *= 1 + 0.18 * np.sin(2 * np.pi * 4.2 * t)  # tremolo
    return filt(x, "low", 3200)


def nylon(m, dur=2.2, vel=0.8, bright=0.5):
    """Karplus-Strong plucked nylon string (block-vectorised)."""
    f = mtof(m)
    L = int(dur * SR)
    D = max(2, int(round(SR / f - 0.5)))
    g = 0.996 - 0.004 * (m - 40) / 40
    y = np.zeros(L + D + 1)
    burst = rng.uniform(-1, 1, D)
    burst = filt(burst, "low", 1200 + 3800 * bright)
    y[1:D + 1] = burst
    k = 1
    while (k + 1) * D + 1 <= len(y):
        a = y[(k - 1) * D + 1: k * D + 1]
        b = y[(k - 1) * D: k * D]
        y[k * D + 1:(k + 1) * D + 1] = g * 0.5 * (a + b)
        k += 1
    x = y[1:L + 1] * vel
    x = filt(x, "low", 4200)
    x += 0.15 * filt(x, "band", [180, 400])  # a touch of wooden body
    fade = int(0.08 * SR)
    x[-fade:] *= np.linspace(1, 0, fade)
    return x


def upright(m, dur, vel=0.8):
    f = mtof(m)
    t = tt(dur + 0.3)
    pitch = f * (1 + 0.012 * np.exp(-t / 0.03))  # finger "thump" bend
    ph = 2 * np.pi * np.cumsum(pitch) / SR
    x = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    x *= np.exp(-t / 0.9) * env_adsr(len(t), a=0.006, r=0.12, hold=dur)
    thump = filt(rng.standard_normal(len(t)), "low", 300) * np.exp(-t / 0.02) * 0.4
    return filt((x + thump) * vel, "low", 900)


def celesta(m, vel=0.7):
    f = mtof(m)
    t = tt(2.2)
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.9)
         + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.28)
         + 0.12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t / 0.09))
    x *= env_adsr(len(t), a=0.003)
    return x * vel


def kick(vel=0.8):
    t = tt(0.4)
    f = 47 + 75 * np.exp(-t / 0.028)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2)
    click = filt(rng.standard_normal(len(t)), "low", 2500) * np.exp(-t / 0.003) * 0.25
    return filt(x + click, "low", 1800) * vel


def brush_snare(vel=0.7):
    t = tt(0.35)
    n = filt(rng.standard_normal(len(t)), "band", [900, 5500])
    e = np.minimum(t / 0.008, 1) * np.exp(-t / 0.11)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.04) * 0.5
    return filt(n * e * 0.8 + tone, "low", 5000) * vel


def rim(vel=0.6):
    t = tt(0.08)
    x = np.sin(2 * np.pi * 830 * t) * np.exp(-t / 0.018)
    n = filt(rng.standard_normal(len(t)), "band", [1400, 2600]) * np.exp(-t / 0.006)
    return (x * 0.7 + n) * vel


def shaker(vel=0.5):
    t = tt(0.09)
    n = filt(rng.standard_normal(len(t)), "high", 5500)
    e = np.minimum(t / 0.012, 1) * np.exp(-t / 0.03)
    return filt(n * e, "low", 11000) * vel


# ---------------------------------------------------------------- atelier foley
def sewing_machine(dur, rate=S16 / 2, vel=0.6):
    """Stitch train (needle click + thunk) over a motor whir."""
    L = int((dur + 0.2) * SR)
    x = np.zeros(L)
    t = np.arange(L) / SR
    n_st = int(dur / rate)
    for k in range(n_st):
        i = max(0, int(k * rate * SR + rng.normal(0, 0.0015) * SR))
        c = tt(0.03)
        click = filt(rng.standard_normal(len(c)), "band", [2600, 5200]) * np.exp(-c / 0.004)
        thunk = np.sin(2 * np.pi * 165 * c) * np.exp(-c / 0.012) * 0.8
        s = (click * 0.7 + thunk) * (0.8 + 0.2 * rng.random())
        n = min(len(s), L - i)
        x[i:i + n] += s[:n]
    motor_env = np.clip(t / 0.08, 0, 1) * np.clip((dur + 0.05 - t) / 0.12, 0, 1)
    whir = filt(rng.standard_normal(L), "band", [250, 900]) * (0.6 + 0.4 * np.sin(2 * np.pi * (1 / rate) * t))
    hum = signal.sawtooth(2 * np.pi * 96 * t) * 0.15
    x = x + (whir * 0.35 + filt(hum, "low", 600)) * motor_env
    return x * vel


def scissors(vel=0.5):
    out = np.zeros(int(0.5 * SR))
    for k, t0 in enumerate([0.0, 0.2]):
        t = tt(0.16)
        sweep = filt(rng.standard_normal(len(t)), "band", [3500, 8000]) * np.sin(np.pi * np.clip(t / 0.11, 0, 1)) ** 2
        ring = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(3120, .5), (4710, .35), (6230, .2)]) * np.exp(-(t - 0.1).clip(0) / 0.03) * (t > 0.1)
        snap = filt(rng.standard_normal(len(t)), "high", 2000) * np.exp(-(t - 0.11).clip(0) / 0.004) * (t > 0.11)
        s = sweep * 0.5 + ring * 0.3 + snap * 0.8
        i = int(t0 * SR)
        out[i:i + len(s)] += s * (1 if k == 0 else 0.85)
    return out * vel


def fabric_swish(dur=0.75, vel=0.5):
    t = tt(dur)
    n = rng.standard_normal(len(t))
    grain = filt(np.abs(rng.standard_normal(len(t))), "low", 40)
    grain = 0.55 + grain / (grain.max() + 1e-9)
    shape = np.sin(np.pi * t / dur) ** 1.6
    lo = filt(n, "band", [350, 1400])
    hi = filt(n, "band", [1400, 5000])
    mix = t / dur  # brighter as it passes
    return (lo * (1 - mix) + hi * mix * 0.7) * shape * grain * vel


# ---------------------------------------------------------------- UI foley
def ui_click(vel=1.0):
    t = tt(0.05)
    x = filt(rng.standard_normal(len(t)), "band", [2500, 7000]) * np.exp(-t / 0.0025)
    x += np.sin(2 * np.pi * 1900 * t) * np.exp(-t / 0.012) * 0.35
    x += np.sin(2 * np.pi * 240 * t) * np.exp(-t / 0.01) * 0.4
    return x * vel


def ui_pop(pitch=1.0, vel=1.0):
    t = tt(0.12)
    f = (620 + 520 * (1 - np.exp(-t / 0.02))) * pitch
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(t / 0.004, 1) * np.exp(-t / 0.035)
    return x * vel


def ui_type(vel=1.0):
    t = tt(0.04)
    x = filt(rng.standard_normal(len(t)), "band", [1800, 6000]) * np.exp(-t / 0.002)
    x += np.sin(2 * np.pi * (150 + 40 * rng.random()) * t) * np.exp(-t / 0.008) * 0.6
    return x * vel


def ui_chime(notes=(81, 88), vel=1.0):
    out = np.zeros(int(1.2 * SR))
    for k, m in enumerate(notes):
        s = celesta(m, 0.6)
        i = int(k * 0.09 * SR)
        n = min(len(s), len(out) - i)
        out[i:i + n] += s[:n]
    return out * vel


# ---------------------------------------------------------------- the score
# chord voicings: (bass, rhodes voicing)
CH = {
    "Gm9": (43, [58, 62, 65, 69]), "C13": (36, [58, 64, 69, 74]), "Fmaj9": (41, [57, 60, 64, 67]),
    "Dm9": (38, [60, 64, 65, 69]), "Bbmaj9": (46, [62, 65, 69, 72]), "Am7": (45, [55, 60, 64, 69]),
    "C7sus": (36, [58, 62, 65, 67]), "Fmaj9end": (41, [57, 60, 64, 67, 72]),
}
A = ["Gm9", "C13", "Fmaj9", "Dm9"]
B = ["Bbmaj9", "Am7", "Gm9", "C7sus"]
PROG = ["Fmaj9", "Dm9"] + A * 2 + A * 4 + B * 2 + A * 2 + B + ["Bbmaj9", "Am7", "Gm9", "Fmaj9end"]
NBARS = len(PROG)  # 50 bars = 150 s
assert NBARS == 50, NBARS

# which layers play in each bar
def bars(a, b):
    return set(range(a, b + 1))

L_BASS = bars(2, 48)
L_DRUMS_LIGHT = bars(2, 8)
L_DRUMS_FULL = bars(9, 41)
L_DRUMS_BREAK = bars(42, 45)
L_GUITAR = bars(9, 45)
L_MELODY = bars(15, 25) | bars(34, 41)
FILL_BARS = {8, 26, 33, 41}  # small drum lifts into new sections


def humanize(t, amt=0.006):
    return t + rng.normal(0, amt)


def swing(pos16):
    return pos16 * S16 + (0.028 if pos16 % 2 == 1 else 0.0)


def compose():
    keys, gtr, bass_b, drums, mel = bus(), bus(), bus(), bus(), bus()

    for bi, name in enumerate(PROG):
        t0 = bi * BAR
        root, voicing = CH[name]
        nxt = CH[PROG[bi + 1]][0] if bi + 1 < NBARS else root

        # --- Rhodes: warm pad hit on 1, ghost on the "and of 3" on odd bars
        last = bi == NBARS - 1
        hold = BAR * (1.7 if last else 1.0) - 0.05
        for k, m in enumerate(voicing):
            v = 0.42 + 0.1 * rng.random()
            place(keys, rhodes(m, hold, v), humanize(t0 + k * 0.014, 0.003), 0.3, pan=-0.25 + 0.5 * k / len(voicing))
        if bi % 2 == 1 and not last and bi >= 2:
            for k, m in enumerate(voicing[-2:]):
                place(keys, rhodes(m, BEAT * 1.2, 0.25), humanize(t0 + swing(10) + k * 0.01), 0.22, pan=0.2)

        # --- nylon guitar: bossa comping (thumb on 1 & 3, syncopated strums)
        if bi in L_GUITAR:
            gv = [n - 12 if n >= 64 else n for n in voicing][:4]
            pattern = [0, 6, 10] if bi % 2 == 0 else [4, 10, 14]
            for p in pattern:
                for k, m in enumerate(sorted(gv)):
                    place(gtr, nylon(m, 1.6, 0.35 + 0.08 * rng.random(), 0.45), humanize(t0 + swing(p) + k * 0.011, 0.003), 0.55, pan=0.35)
            for p, m in [(0, root + 12), (8, root + 19)]:
                place(gtr, nylon(m, 1.8, 0.5, 0.3), humanize(t0 + swing(p)), 0.55, pan=0.3)

        # --- upright bass: root on 1, fifth on 3, chromatic approach on the "and of 4"
        if bi in L_BASS:
            place(bass_b, upright(root, BEAT * 1.6, 0.9), humanize(t0), 0.9)
            place(bass_b, upright(root + 7, BEAT * 1.2, 0.7), humanize(t0 + 2 * BEAT), 0.8)
            if bi % 2 == 1:
                place(bass_b, upright(nxt - 1, BEAT * 0.4, 0.6), humanize(t0 + swing(14)), 0.7)
        if bi == NBARS - 1:
            place(bass_b, upright(root, BAR * 1.2, 0.9), t0, 0.9)

        # --- drums
        if bi in L_DRUMS_LIGHT or bi in L_DRUMS_FULL or bi in L_DRUMS_BREAK:
            full = bi in L_DRUMS_FULL
            brk = bi in L_DRUMS_BREAK
            if not brk:
                for p in ([0, 7, 10] if full else [0, 10]):
                    place(drums, kick(0.9 if p == 0 else 0.65), humanize(t0 + swing(p), 0.004), 0.72)
                for p in [4, 12]:
                    place(drums, brush_snare(0.7 if full else 0.5), humanize(t0 + swing(p), 0.006), 0.6, pan=0.05)
            for p in [0, 3, 6, 10, 13]:  # bossa rim pattern
                place(drums, rim(0.35 + 0.1 * rng.random()), humanize(t0 + swing(p), 0.004), 0.32, pan=-0.3)
            if full or brk:
                for p in range(16):
                    v = [0.55, 0.25, 0.4, 0.28][p % 4] * (0.8 + 0.3 * rng.random())
                    place(drums, shaker(v), humanize(t0 + swing(p), 0.004), 0.3, pan=0.4)
            if bi in FILL_BARS:
                for p in [13, 14, 15]:
                    place(drums, brush_snare(0.35 + 0.1 * (p - 13)), humanize(t0 + swing(p)), 0.45, pan=-0.1)

    # --- celesta motif (2-bar phrase, answered on the following 2 bars)
    MOTIF = [
        [(0, 81), (6, 84), (8, 81), (12, 79)], [(2, 77), (8, 74), (14, 72)],
        [(0, 81), (6, 84), (8, 86), (12, 84)], [(2, 81), (8, 79), (12, 77)],
    ]
    for bi in sorted(L_MELODY):
        phrase = MOTIF[(bi - 15) % 4] if bi <= 25 else MOTIF[(bi - 34) % 4]
        # B-section harmony is not used for the melody; on "Dm9"/"C13" bars keep it as is (fits F major)
        for p, m in phrase:
            place(mel, celesta(m, 0.5 + 0.15 * rng.random()), humanize(bi * BAR + swing(p), 0.004), 0.3, pan=0.15)

    return keys, gtr, bass_b, drums, mel


def section_gain(b, points):
    """Piecewise-linear automation over time: points = [(t, gain_db), ...]."""
    ts = np.array([p[0] for p in points])
    gs = 10 ** (np.array([p[1] for p in points]) / 20)
    g = np.interp(np.arange(b.shape[1]) / SR, ts, gs)
    return b * g


def wow_flutter(b):
    t = np.arange(b.shape[1]) / SR
    d = 0.0012 * np.sin(2 * np.pi * 0.45 * t) + 0.00018 * np.sin(2 * np.pi * 6.3 * t)
    out = np.empty_like(b)
    for c in range(2):
        out[c] = np.interp(t - d - 0.002, t, b[c])
    return out


def vinyl():
    v = bus()
    hiss = filt(rng.standard_normal((2, N)), "band", [800, 9000]) * 0.0035
    v += hiss
    n_pops = int(DUR * 7)
    for _ in range(n_pops):
        t = rng.uniform(0, DUR)
        a = rng.pareto(3) * 0.01 + 0.004
        c = tt(0.004)
        p = filt(rng.standard_normal(len(c)), "high", 1500) * np.exp(-c / 0.0007) * a
        place(v, p, t, 1.0, pan=rng.uniform(-0.6, 0.6))
    rumble = filt(rng.standard_normal((2, N)), "low", 60) * 0.004
    return v + rumble


def build_sfx(cues):
    fx = bus()
    last_tick, tick_i = -9, 0
    pent = [65, 67, 69, 72, 74, 77, 79, 81, 84]  # F major pentatonic
    for c in cues["sfx"]:
        t, kind, g = c["t"], c["type"], c.get("gain", 1)
        if kind == "click":
            place(fx, ui_click(), t, 0.16 * g, pan=0.1)
        elif kind == "pop":
            place(fx, ui_pop(0.95 + 0.12 * rng.random()), t, 0.075 * g, pan=0.45)
        elif kind == "type":
            place(fx, ui_type(), t + rng.normal(0, 0.004), 0.05 * g, pan=-0.25)
        elif kind == "whoosh":
            place(fx, fabric_swish(0.8), t - 0.25, 0.26 * g, pan=0.0)
        elif kind == "send":
            place(fx, fabric_swish(0.45), t - 0.1, 0.08, pan=0.4)
            place(fx, ui_chime((84, 91)), t + 0.25, 0.06, pan=0.4)
        elif kind == "recv":
            place(fx, ui_chime((88, 84)), t, 0.06 * g, pan=0.4)
        elif kind == "tick":
            tick_i = tick_i + 1 if t - last_tick < 0.6 else 0
            last_tick = t
            place(fx, celesta(pent[min(tick_i, len(pent) - 1)], 0.5), t, 0.07 * g, pan=-0.4 + 0.1 * tick_i)
    return fx


def build_foley(cues):
    """Atelier textures tied to the edit: machine stitches sew chapter changes."""
    fo = bus()
    scenes = cues["scenes"]
    # the sewing machine runs for the last beat before each mesa sub-chapter and a few others
    sew_at = [scenes[k][0] for k in ["s03", "s04", "s05", "s06", "s07", "s08", "s09", "s11", "s13"]]
    for t in sew_at:
        place(fo, sewing_machine(BEAT * 0.95, vel=0.5), t - BEAT, 0.32, pan=-0.2)
    place(fo, scissors(0.6), 5.25, 0.34, pan=0.15)  # the title is "cut" away
    place(fo, scissors(0.5), 140.35, 0.28, pan=-0.15)  # last cut before the call to action
    return fo


def limiter(x, ceiling=0.89, release=0.08):
    """Look-ahead peak limiter: instant attack (2 ms look-ahead), one-pole release."""
    from scipy.ndimage import minimum_filter1d
    peak = np.max(np.abs(x), axis=0)
    need = np.minimum(1.0, ceiling / np.maximum(peak, 1e-9))
    la = int(0.002 * SR)
    need = minimum_filter1d(need, size=2 * la + 1)
    a = np.exp(-1 / (release * SR))
    g = np.empty_like(need)
    cur = 1.0
    for i, v in enumerate(need):
        cur = v if v < cur else a * cur + (1 - a) * v
        g[i] = cur
    return x * g


def write(path, b):
    b = np.clip(b[:, : int(DUR * SR)], -1, 1)
    wavfile.write(path, SR, (b.T * (2 ** 31 - 1)).astype(np.int32))


def main():
    cues = json.loads(Path(sys.argv[1]).read_text())
    out = Path(sys.argv[2])
    keys, gtr, bass_b, drums, mel = compose()

    # arrangement automation (dB) — intro opens up, outro thins out
    keys = section_gain(keys, [(0, -9), (5.5, -1), (27, 0), (126, 0), (132, 1), (150, 1)])
    gtr = section_gain(gtr, [(0, 0), (132, 0), (138, -4), (150, -4)])
    drums = section_gain(drums, [(0, -3), (27, 0), (150, 0)])
    # intro: the Rhodes starts muffled, like behind the curtain, then opens
    muffled = np.stack([filt(keys[c], "low", 700) for c in range(2)])
    m = np.clip((np.arange(N) / SR - 1.0) / 4.8, 0, 1)[None, :]
    keys = muffled * (1 - m) + keys * m

    dry = keys * 0.9 + gtr * 0.8 + bass_b * 1.0 + drums * 0.85 + mel * 0.8
    send = keys * 0.35 + gtr * 0.3 + mel * 0.55 + drums * 0.08
    wet = convolve(send, reverb_ir(2.2))
    music = dry + wet * 0.35
    music = np.stack([filt(music[c], "high", 40) for c in range(2)])
    music = np.stack([filt(music[c], "low", 11000) for c in range(2)])
    music = wow_flutter(music)
    music = np.tanh(music * 1.6) / 1.6  # tape-style soft saturation
    music += vinyl()

    fx = build_sfx(cues) + build_foley(cues)
    fx_wet = convolve(fx, reverb_ir(1.1, bright=7000))
    fx = fx + fx_wet * 0.18

    # tuck the music under the start and let it ring into silence at the end
    t = np.arange(N) / SR
    fade = np.clip((DUR - t) / 3.2, 0, 1) ** 1.5 * np.clip(t / 0.4, 0, 1)
    music *= fade
    fx *= np.clip((DUR - t) / 1.0, 0, 1)

    # normalise music to a comfortable level, then mix
    rms = np.sqrt(np.mean(music[:, : int(140 * SR)] ** 2))
    music *= 10 ** (-17 / 20) / rms
    mix = limiter(music + fx)

    out.mkdir(parents=True, exist_ok=True)
    write(out / "music.wav", music)
    write(out / "sfx.wav", fx)
    write(out / "mix.wav", mix)
    print("peak", np.max(np.abs(mix)), "rms dB", 20 * np.log10(np.sqrt(np.mean(mix ** 2))))


if __name__ == "__main__":
    main()
