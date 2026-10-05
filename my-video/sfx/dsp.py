"""Small DSP toolkit (filters, envelopes, synthetic reverb) used by
film_audio.py to synthesise the film's score and sound design.
"""

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
rng = np.random.default_rng(7)


def times(dur):
    return np.arange(int(dur * SR)) / SR


def env(dur, attack, decay):
    """Linear attack, then exponential decay with time constant `decay`."""
    t = times(dur)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    d = np.exp(-np.maximum(t - attack, 0) / decay)
    return a * d


def bell(dur, peak):
    """Smooth swell that peaks at `peak` (0..1) of the duration."""
    t = times(dur) / dur
    up = np.sin(np.clip(t / peak, 0, 1) * np.pi / 2) ** 2
    down = np.cos(np.clip((t - peak) / (1 - peak), 0, 1) * np.pi / 2) ** 2
    return np.where(t < peak, up, down)


def filt(x, kind, freq, order=2):
    return sosfilt(butter(order, freq, kind, fs=SR, output="sos"), x)


def svf(x, fc, q, mode="bp"):
    """Zavalishin TPT state variable filter with a per-sample cutoff."""
    fc = np.broadcast_to(np.clip(fc, 20, SR * 0.45), x.shape)
    g = np.tan(np.pi * fc / SR)
    k = 1 / q
    a1 = 1 / (1 + g * (g + k))
    a2 = g * a1
    a3 = g * a2
    out = np.empty_like(x)
    ic1 = ic2 = 0.0
    for i in range(len(x)):
        v3 = x[i] - ic2
        v1 = a1[i] * ic1 + a2[i] * v3
        v2 = ic2 + a2[i] * ic1 + a3[i] * v3
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        out[i] = v1 if mode == "bp" else v2 if mode == "lp" else x[i] - k * v1 - v2
    return out


def sweep(dur, f0, f1, curve=1.0):
    """Exponential frequency glide from f0 to f1, shaped by `curve`."""
    t = (times(dur) / dur) ** curve
    return f0 * (f1 / f0) ** t


def tone(freqs, phase=0.0):
    """Sine following a per-sample frequency array."""
    return np.sin(2 * np.pi * np.cumsum(freqs) / SR + phase)


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def pad(x, dur):
    n = int(dur * SR)
    return np.pad(x, (0, max(0, n - len(x))))[:n]


def stereo(left, right=None):
    return np.stack([left, left if right is None else right], axis=1)


def pan(mono, position):
    """Equal power pan; position is -1 (left) to 1 (right), scalar or array."""
    angle = (np.asarray(position) + 1) * np.pi / 4
    return stereo(mono * np.cos(angle), mono * np.sin(angle))


def make_ir(dur, decay):
    t = times(dur)
    channels = []
    for _ in range(2):
        n = rng.standard_normal(len(t))
        low = filt(n, "lowpass", 2500)
        high = n - low
        ir = low * np.exp(-t / decay) + 0.5 * high * np.exp(-t / (decay * 0.4))
        ir = np.concatenate([np.zeros(int(0.012 * SR)), ir])
        channels.append(ir / np.sqrt(np.sum(ir**2)))
    return channels


ROOM = make_ir(0.6, 0.12)
HALL = make_ir(2.4, 0.7)


def reverb(x, wet, ir=ROOM):
    if x.ndim == 1:
        x = stereo(x)
    # Fade the dry tail so long sounds never end on a click.
    fade = min(int(0.06 * SR), len(x))
    x = x.copy()
    x[-fade:] *= np.cos(np.linspace(0, np.pi / 2, fade))[:, None] ** 2
    tail = len(ir[0])
    dry = np.pad(x, ((0, tail - 1), (0, 0)))
    wet_sig = np.stack(
        [fftconvolve(x[:, c], ir[c]) for c in range(2)], axis=1
    )
    return dry + wet * wet_sig
