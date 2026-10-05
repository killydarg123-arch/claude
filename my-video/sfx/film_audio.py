"""Scores the Onbaraka film: a 140 BPM melodic trap beat in F sharp minor,
built so every cut in the edit lands on a hit. Mixed to one track at
public/audio/film.wav.

Everything is synthesised here, so the brand owns it outright.
Run: python3 sfx/film_audio.py
"""

from pathlib import Path

import numpy as np
from scipy.io import wavfile

from dsp import SR, bell, env, filt, make_ir, noise, pan, reverb, stereo, svf, sweep, times, tone

OUT = Path(__file__).resolve().parent.parent / "public" / "audio" / "film.wav"
BPM = 140
BEAT = 60 / BPM
LENGTH = 13.0
N = int(LENGTH * SR)
rng = np.random.default_rng(21)

NAMES = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(name):
    pitch, octave = name[:-1], int(name[-1])
    midi = 12 * (octave + 1) + NAMES[pitch]
    return 440 * 2 ** ((midi - 69) / 12)


def b(n):
    return n * BEAT


def place(track, x, at, gain=1.0):
    if x.ndim == 1:
        x = stereo(x)
    i = int(at * SR)
    j = min(N, i + len(x))
    if j > i:
        track[i:j] += gain * x[: j - i]


def blank():
    return np.zeros((N, 2))


# Drum kit ------------------------------------------------------------------

def kick():
    d = 0.5
    t = times(d)
    f = 48 + 110 * np.exp(-t / 0.028)
    body = np.tanh(2.2 * tone(f) * env(d, 0.001, 0.16))
    click = filt(noise(0.004), "highpass", 3000) * np.hanning(int(0.004 * SR))
    body[: len(click)] += 0.5 * click
    return body


def clap():
    d = 0.6
    out = np.zeros(int(d * SR))
    for k, delay in enumerate([0, 0.009, 0.019, 0.03]):
        burst = filt(noise(0.012 if k < 3 else 0.2), "bandpass", [900, 3200])
        bt = np.arange(len(burst)) / SR
        burst *= np.clip(bt / 0.0005, 0, 1) * np.exp(-bt / (0.006 if k < 3 else 0.09))
        i = int(delay * SR)
        out[i : i + len(burst)] += burst
    return reverb(out, 0.18)


def hat(open_=False):
    d = 0.3 if open_ else 0.06
    n = filt(noise(d), "highpass", 7500) + 0.4 * filt(noise(d), "bandpass", [9000, 12000])
    return n * env(d, 0.0005, 0.09 if open_ else 0.018)


def crash():
    d = 2.2
    t = times(d)
    metal = sum(
        a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6))
        for f, a in [(3150, 0.3), (4370, 0.25), (5610, 0.2), (6870, 0.18), (8230, 0.12)]
    )
    wash = filt(noise(d), "highpass", 4000)
    return reverb((wash + metal * 0.4) * env(d, 0.002, 0.55), 0.25)


def snap():
    d = 0.25
    x = filt(noise(0.01), "bandpass", [1500, 6000]) * env(0.01, 0.0003, 0.003)
    return reverb(np.pad(x, (0, int(d * SR) - len(x))), 0.3)


# Melodic voices --------------------------------------------------------------

def bass808(freq, length):
    d = length + 0.08
    t = times(d)
    f = freq * (1 + 0.5 * np.exp(-t / 0.02))
    x = tone(f) * env(d, 0.002, max(0.25, length * 0.7))
    x *= np.clip((d - t) / 0.03, 0, 1)
    return np.tanh(4.0 * x)


def bell_note(freq, vel):
    d = 1.6
    t = times(d)
    vib = 1 + 0.002 * np.sin(2 * np.pi * 5.5 * t)
    x = (
        np.sin(2 * np.pi * freq * vib * t) * np.exp(-t / 0.7)
        + 0.45 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t / 0.35)
        + 0.2 * np.sin(2 * np.pi * 3 * freq * t) * np.exp(-t / 0.18)
        + 0.12 * np.sin(2 * np.pi * 4.07 * freq * t) * np.exp(-t / 0.09)
    )
    return x * np.clip(t / 0.002, 0, 1) * vel


def pad_chord(notes, length, cutoff):
    d = length + 0.6
    t = times(d)
    left = np.zeros_like(t)
    right = np.zeros_like(t)
    for name in notes:
        f0 = hz(name)
        for side, det in [(left, 0.996), (right, 1.004)]:
            f = f0 * det
            for n in range(1, 14):
                if n * f > 7000:
                    break
                resp = 1 / np.sqrt(1 + (n * f / cutoff) ** 4)
                side += np.sin(2 * np.pi * n * f * t + rng.uniform(0, 6)) * resp / n
    shape = np.sin(np.clip(t / 0.25, 0, 1) * np.pi / 2) ** 2 * np.cos(np.clip((t - length) / 0.6, 0, 1) * np.pi / 2) ** 2
    return stereo(left * shape, right * shape)


# Transitions -----------------------------------------------------------------

def whoosh(d, f0, f1, peak=0.5):
    left = svf(noise(d), sweep(d, f0, f1, 0.9), 1.3)
    right = svf(noise(d), sweep(d, f0 * 1.05, f1 * 1.05, 0.9), 1.3)
    shape = bell(d, peak)
    return stereo(filt(left * shape, "lowpass", 8000), filt(right * shape, "lowpass", 8000))


def riser(d):
    t = times(d) / d
    n = svf(noise(d), sweep(d, 300, 9000, 1.5), 0.9, "lp")
    lift = 0.25 * tone(sweep(d, 180, 900, 1.3))
    amp = t**2 * np.clip((1 - t) / 0.02, 0, 1)
    return (n + lift) * amp


def reverse_crash(d):
    x = crash()[: int(d * SR), 0][::-1]
    return x * np.clip(np.arange(len(x))[::-1] / (0.01 * SR), 0, 1)


def boom():
    d = 2.5
    t = times(d)
    f = 40 + 30 * np.exp(-t / 0.18)
    return reverb(np.tanh(2.2 * tone(f) * env(d, 0.002, 0.8)), 0.2, make_ir(2.0, 0.6))


# Arrangement -----------------------------------------------------------------

CHORDS = [
    (0, 4, ["F#3", "A3", "C#4", "E4", "G#4"]),
    (4, 8, ["F#3", "A3", "C#4", "E4", "G#4"]),
    (8, 12, ["D3", "F#3", "A3", "C#4", "E4"]),
    (12, 16, ["D3", "F#3", "A3", "B3", "C#4"]),
    (16, 19, ["E3", "G#3", "B3", "C#4", "E4"]),
    (20, 30.4, ["F#3", "A3", "C#4", "E4", "G#4"]),
]

BASS = [
    (4, "F#1", 1.4), (5.5, "F#1", 0.45), (6, "F#1", 0.9), (7.25, "A1", 0.7),
    (8, "D2", 1.4), (9.5, "D2", 0.45), (10, "D2", 0.9), (11.25, "E2", 0.7),
    (12, "B1", 1.4), (13.5, "B1", 0.45), (14, "B1", 0.9), (15.25, "C#2", 0.7),
    (16, "C#2", 1.4), (17.5, "C#2", 0.45),
    (20, "F#1", 3.0), (23.5, "F#1", 0.45), (24, "F#1", 1.8), (26, "A1", 1.0),
    (28, "F#1", 2.2),
]
KICKS = [4, 5.5, 8, 9.75, 12, 13.5, 16, 17.5, 20, 23.5, 24, 26, 28]
CLAPS = [6, 10, 14, 18, 22, 26]
MOTIF = [(0, "C#6", 0.9), (0.75, "B5", 0.6), (1.5, "A5", 0.75), (2, "F#5", 0.6), (3, "E5", 0.55)]


def hats():
    out = blank()
    h = hat()
    open_hat = hat(True)

    def run(start, end, step):
        beat = start
        while beat < end - 1e-6:
            accent = 1.0 if abs(beat - round(beat)) < 1e-6 else 0.65
            place(out, pan(h, 0.15), b(beat), accent)
            beat += step

    for bar in [4, 8, 12, 16]:
        top = 18 if bar == 16 else bar + 4
        if bar == 4:
            run(4, 7, 0.5)
            run(7, 8, 0.25)
        elif bar == 8:
            run(8, 11, 0.5)
            run(11, 12, 0.25)
        elif bar == 12:
            run(12, 15, 0.5)
            run(15, 16, 1 / 3)
        else:
            run(16, top, 0.5)
    run(20, 28, 0.5)
    for beat in [7.5, 11.5, 21.5, 25.5]:
        place(out, pan(open_hat, -0.2), b(beat), 0.5)
    return out


def score():
    drums, bass, pads, bells, fx = blank(), blank(), blank(), blank(), blank()

    k = kick()
    for beat in KICKS:
        place(drums, k, b(beat))
    c = clap()
    for beat in CLAPS:
        place(drums, c, b(beat), 0.9)
    drums += hats() * 0.55

    for beat, note, length in BASS:
        place(bass, bass808(hz(note), b(length)), b(beat))

    for start, end, notes in CHORDS:
        cutoff = 650 if start == 0 else 2200
        place(pads, pad_chord(notes, b(end - start), cutoff), b(start))

    for bar in [4, 8, 12, 16, 20, 24]:
        for offset, note, vel in MOTIF:
            if bar == 16 and offset > 1.6:
                continue
            place(bells, pan(bell_note(hz(note), vel), rng.uniform(-0.3, 0.3)), b(bar + offset))

    # Opening words: a stab on each, the last one bigger.
    stab = snap()
    for beat, size in [(0, 0.8), (1, 0.8), (2, 1.0)]:
        place(drums, k, b(beat), 0.3 * size)
        place(drums, stab, b(beat), 0.7 * size)
        place(bells, bell_note(hz("C#5"), 0.45 * size), b(beat))
    place(fx, riser(b(1.6)), b(2.4), 0.9)
    place(fx, reverse_crash(b(1.5)), b(2.5), 0.5)

    # Drop: phone flies in.
    cr = crash()
    place(fx, cr, b(4), 0.8)
    place(fx, whoosh(0.7, 2400, 500, 0.25), b(4) - 0.05, 0.9)

    # Screen swipes.
    for beat in [10, 14]:
        place(fx, whoosh(0.45, 2600, 900, 0.3), b(beat), 0.6)

    # Whip out, breakdown, then the logo hit.
    place(fx, whoosh(0.8, 600, 4800, 0.4), b(18), 1.0)
    place(fx, riser(b(2)), b(18), 0.9)
    place(fx, reverse_crash(b(1.6)), b(18.4), 0.6)
    place(fx, cr, b(20), 1.0)
    place(fx, boom(), b(20), 1.0)

    # Sidechain: the pads and bells duck under every kick.
    duck = np.ones(N)
    t = np.arange(N) / SR
    for beat in KICKS:
        s = b(beat)
        mask = t >= s
        duck[mask] *= 1 - 0.55 * np.exp(-(t[mask] - s) / 0.12)
    pads *= duck[:, None]
    bells *= (0.5 + 0.5 * duck)[:, None]

    hall = make_ir(2.6, 0.8)
    pads = reverb(pads, 0.3, hall)[:N]
    bells = reverb(bells, 0.45, hall)[:N]
    return drums, bass, pads, bells, fx


def rms(x):
    return np.sqrt(np.mean(x**2)) + 1e-12


def level(x, db):
    active = x[np.abs(x).max(axis=1) > 1e-4]
    return x * (10 ** (db / 20) / rms(active))


if __name__ == "__main__":
    drums, bass, pads, bells, fx = score()
    mix = (
        level(drums, -19)
        + level(bass, -22)
        + level(pads, -25)
        + level(bells, -21)
        + level(fx, -24)
    )
    mix = np.stack([filt(mix[:, c], "highpass", 35) for c in range(2)], axis=1)
    mix *= 0.85 / np.max(np.abs(mix))
    mix = np.tanh(1.1 * mix) / np.tanh(1.1)
    tail = np.clip((LENGTH - np.arange(N) / SR) / 0.7, 0, 1)
    mix *= tail[:, None]
    mix *= 0.84 / np.max(np.abs(mix))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(OUT, SR, (mix * 32767).astype(np.int16))
    print(f"{OUT.name}: {LENGTH}s at {BPM} BPM, rms {20 * np.log10(rms(mix)):.1f} dBFS")
