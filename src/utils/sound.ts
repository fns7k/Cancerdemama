// Web Audio API Sound Synthesizer for Kahoot Game Effects
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lobbyTimer: number | null = null;
  private lobbyStep = 0;

  constructor() {
    // Check localStorage if available
    try {
      const saved = localStorage.getItem('inca_kahoot_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch {
      // ignore
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('inca_kahoot_muted', String(muted));
    } catch {
      // ignore
    }
    if (muted) {
      this.stopLobbyMusic();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Play a simple synthesized note
  private playTone(freq: number, type: OscillatorType, duration: number, delay = 0, gain = 0.15) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gainNode.gain.setValueAtTime(gain, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  // Button click / answer chosen
  public playClick() {
    this.playTone(520, 'sine', 0.08, 0, 0.2);
    this.playTone(780, 'sine', 0.1, 0.04, 0.15);
  }

  // Normal question countdown tick
  public playTick(isUrgent = false) {
    if (isUrgent) {
      this.playTone(880, 'triangle', 0.06, 0, 0.22);
      this.playTone(1174, 'sine', 0.05, 0.02, 0.18);
    } else {
      this.playTone(440, 'sine', 0.05, 0, 0.12);
    }
  }

  // 3-2-1 Countdown Beep
  public playCountdownBeep(num: number) {
    if (num === 0) {
      // Go!
      this.playTone(784, 'triangle', 0.35, 0, 0.3);
      this.playTone(1046.5, 'sine', 0.45, 0.05, 0.25);
    } else {
      this.playTone(440, 'triangle', 0.18, 0, 0.25);
    }
  }

  // Correct answer celebratory chime
  public playCorrect() {
    this.playTone(523.25, 'triangle', 0.18, 0, 0.25); // C5
    this.playTone(659.25, 'triangle', 0.22, 0.1, 0.25); // E5
    this.playTone(783.99, 'triangle', 0.28, 0.2, 0.3); // G5
    this.playTone(1046.5, 'sine', 0.5, 0.3, 0.35); // C6
  }

  // Wrong answer subtle buzz
  public playWrong() {
    this.playTone(280, 'sawtooth', 0.15, 0, 0.18);
    this.playTone(210, 'sawtooth', 0.25, 0.12, 0.2);
  }

  // Leaderboard whoosh
  public playWhoosh() {
    this.playTone(330, 'sine', 0.1, 0, 0.1);
    this.playTone(493.88, 'sine', 0.12, 0.06, 0.15);
    this.playTone(659.25, 'sine', 0.18, 0.12, 0.2);
  }

  // Podium celebratory fanfare!
  public playVictoryFanfare() {
    if (this.isMuted) return;
    const chords = [
      { f: 523.25, d: 0.18, t: 0 },
      { f: 659.25, d: 0.18, t: 0.14 },
      { f: 783.99, d: 0.22, t: 0.28 },
      { f: 1046.5, d: 0.55, t: 0.42 },
      { f: 1318.5, d: 0.65, t: 0.65 },
    ];
    chords.forEach((c) => {
      this.playTone(c.f, 'triangle', c.d, c.t, 0.28);
    });
  }

  // Ambient rhythmic lobby synth loop (Kahoot lobby vibe)
  public startLobbyMusic() {
    if (this.lobbyTimer !== null || this.isMuted) return;
    this.initCtx();

    const notes = [
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
      293.66, 349.23, 440.00, 587.33, 440.00, 349.23,
    ];

    this.lobbyTimer = window.setInterval(() => {
      if (this.isMuted) return;
      const freq = notes[this.lobbyStep % notes.length];
      this.playTone(freq, 'sine', 0.16, 0, 0.06);
      if (this.lobbyStep % 4 === 0) {
        this.playTone(130.81, 'triangle', 0.22, 0, 0.1); // Bass kick
      }
      this.lobbyStep++;
    }, 280);
  }

  public stopLobbyMusic() {
    if (this.lobbyTimer !== null) {
      clearInterval(this.lobbyTimer);
      this.lobbyTimer = null;
    }
  }
}

export const sounds = new SoundEngine();
