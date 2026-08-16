export class AudioEngine {
  private ctx: AudioContext | null = null;

  private bgmOsc: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying = false;
  private nextNoteTime = 0;
  private noteIndex = 0;
  private intervalId: any = null;
  private musicEnabled = true;
  private sfxEnabled = true;
  public currentTone: 'normal' | 'boss' | 'mine' = 'normal';

  setEnabled(options: { music: boolean; sfx: boolean }) {
    this.musicEnabled = options.music;
    this.sfxEnabled = options.sfx;
    if (!this.musicEnabled) this.stopBGM();
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.musicEnabled) this.startBGM();
  }

  setTone(tone: 'normal' | 'boss' | 'mine') {
    this.currentTone = tone;
  }

  startBGM() {
    if (!this.musicEnabled || !this.ctx || this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.noteIndex = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.scheduleNotes();
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
    }
  }

  private scheduleNotes() {
    if (!this.isBgmPlaying || !this.ctx) return;
    
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.playBGMNote();
      this.nextNoteTime += 0.25; // 16th notes
      this.noteIndex++;
    }
    this.intervalId = setTimeout(() => this.scheduleNotes(), 25);
  }

  private playBGMNote() {
    if (!this.ctx) return;
    
    let notes: number[] = [];
    if (this.currentTone === 'boss') {
      notes = [
         65.41, 77.78, 98.00, 77.78,
         65.41, 77.78, 98.00, 77.78,
         61.74, 73.42, 92.50, 73.42,
         61.74, 73.42, 92.50, 73.42
      ];
    } else if (this.currentTone === 'mine') {
      // Eerie, hollow minor arpeggios
      notes = [
         110.00, 130.81, 164.81, 130.81, // A C E C
         110.00, 130.81, 164.81, 130.81, // A C E C
         123.47, 146.83, 185.00, 146.83, // B D F# D
         130.81, 155.56, 196.00, 155.56  // C D# G D#
      ];
    } else {
      // Simple happy mariachi-ish bassline
      notes = [
         // C major / G major / F major simple arpeggios
         130.81, 164.81, 196.00, 164.81, // C E G E
         130.81, 164.81, 196.00, 164.81, // C E G E
         146.83, 174.61, 220.00, 174.61, // D F A F
         196.00, 246.94, 293.66, 246.94  // G B D B
      ];
    }
    
    const freq = notes[this.noteIndex % notes.length];
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    if (this.currentTone === 'boss') {
      osc.type = 'sawtooth';
    } else if (this.currentTone === 'mine') {
      osc.type = 'sine';
    } else {
      osc.type = 'triangle';
    }
    
    osc.frequency.value = freq;
    
    let vol = 0.05;
    if (this.currentTone === 'boss') vol = 0.08;
    if (this.currentTone === 'mine') vol = 0.06;

    let decay = 0.2;
    if (this.currentTone === 'boss') decay = 0.15;
    if (this.currentTone === 'mine') decay = 0.4;

    gain.gain.setValueAtTime(vol, this.nextNoteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.nextNoteTime + decay);
    
    osc.start(this.nextNoteTime);
    osc.stop(this.nextNoteTime + decay);
  }

  playJump() {
    if (!this.sfxEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playTaco() {
    if (!this.sfxEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playStomp() {
    if (!this.sfxEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playDie() {
    if (!this.sfxEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playWin() {
    if (!this.sfxEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.setValueAtTime(500, this.ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }
}

export const audioEngine = new AudioEngine();
