/**
 * Procedural Web Audio Engine for "The Game That Learns You"
 * Meditative, organic psychoacoustic soundscapes with warm sine harmonics,
 * glass/marimba percussives, and calming binaural resonance.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isInitialized = false;

        // Ambient nodes
        this.droneGain = null;
        this.droneOsc1 = null;
        this.droneOsc2 = null;
        this.droneFilter = null;

        // Heartbeat pulse timer
        this.heartbeatTimer = null;
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.isInitialized = true;
            this.setupCalmAmbience();
        } catch (e) {
            console.warn("Web Audio API not supported or blocked", e);
        }
    }

    resumeContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setupCalmAmbience() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Master ambient gain with smooth warmth
        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.setValueAtTime(this.isMuted ? 0 : 0.06, now);

        // Warm, lush lowpass filter (zen meditation quality)
        this.droneFilter = this.ctx.createBiquadFilter();
        this.droneFilter.type = 'lowpass';
        this.droneFilter.frequency.setValueAtTime(140, now);
        this.droneFilter.Q.setValueAtTime(1.2, now);

        // Gentle sub-sine (F#1 - 46.25 Hz)
        this.droneOsc1 = this.ctx.createOscillator();
        this.droneOsc1.type = 'sine';
        this.droneOsc1.frequency.setValueAtTime(55.0, now); // ~A1 warm foundation

        // Harmonic fifth with micro-detune (82.5 Hz + binaural drift)
        this.droneOsc2 = this.ctx.createOscillator();
        this.droneOsc2.type = 'triangle';
        this.droneOsc2.frequency.setValueAtTime(82.7, now); // ~E2 gentle overtone

        this.droneOsc1.connect(this.droneFilter);
        this.droneOsc2.connect(this.droneFilter);
        this.droneFilter.connect(this.droneGain);
        this.droneGain.connect(this.ctx.destination);

        this.droneOsc1.start();
        this.droneOsc2.start();
    }

    setDroneConfidence(confidencePct) {
        if (!this.ctx || !this.droneFilter || !this.droneOsc1) return;
        const now = this.ctx.currentTime;
        const normalized = Math.max(0, Math.min(100, confidencePct)) / 100;
        // Smooth warm opening, never harsh
        const targetFreq = 120 + normalized * 180; // 120Hz to 300Hz (soft warm range)
        const targetBase = 55.0 + (normalized * 4); // gentle micro-shift

        this.droneFilter.frequency.exponentialRampToValueAtTime(Math.max(20, targetFreq), now + 1.2);
        this.droneOsc1.frequency.exponentialRampToValueAtTime(Math.max(20, targetBase), now + 1.2);
    }

    // Soft wooden / glass droplet click
    playClick(pitch = 1.0) {
        if (!this.ctx || this.isMuted) return;
        this.resumeContext();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const baseFreq = 440 * pitch;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    // Delicate glass resonance on hover
    playHover() {
        if (!this.ctx || this.isMuted) return;
        this.resumeContext();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(784, now); // G5 soft harmonic
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05); // A5

        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    // Gentle ripple whisper (calm alternative to harsh glitch)
    playGlitch() {
        if (!this.ctx || this.isMuted) return;
        this.resumeContext();
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    // Soft singing bowl swell when AI reveals a thought
    playPredictionReveal(isHighCertainty) {
        if (!this.ctx || this.isMuted) return;
        this.resumeContext();
        const now = this.ctx.currentTime;

        [293.66, 440].forEach((f, idx) => { // D4 and A4 warm fifth
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.05);

            gain.gain.setValueAtTime(0.001, now + idx * 0.05);
            gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.05 + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.55);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.6);
        });
    }

    // Outcome chimes: warm contemplative bells
    playOutcome(systemWon) {
        if (!this.ctx || this.isMuted) return;
        this.resumeContext();
        const now = this.ctx.currentTime;

        if (systemWon) {
            // Warm contemplative minor chord bell (E4 -> B4)
            [329.63, 493.88].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);

                gain.gain.setValueAtTime(0.08, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.45);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.46);
            });
        } else {
            // Ethereal major glass chime (G4 -> D5 -> G5)
            [392.00, 587.33, 784.00].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.06);

                gain.gain.setValueAtTime(0.07, now + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.55);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.06);
                osc.stop(now + idx * 0.06 + 0.56);
            });
        }
    }

    // Gentle rhythmic pulse (soft organic heartbeat, calming tempo)
    startHeartbeat() {
        if (this.heartbeatTimer) return;
        this.heartbeatTimer = setInterval(() => {
            if (!this.ctx || this.isMuted) return;
            const now = this.ctx.currentTime;

            // Soft low warmth thump
            this._softPulse(65, 0.14, now);
            this._softPulse(78, 0.10, now + 0.22);
        }, 950);
    }

    _softPulse(freq, vol, time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(32, time + 0.15);

        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.16);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    // Peaceful celestial ending chords
    playEndingChord(endingId) {
        if (!this.ctx || this.isMuted) return;
        this.resumeContext();
        const now = this.ctx.currentTime;

        let freqs = [220, 277.18, 329.63, 440, 554.37]; // A major serene
        if (endingId === 'unpredictable' || endingId === 'hidden_rule' || endingId === 'secret') {
            freqs = [261.63, 329.63, 392, 493.88, 587.33, 783.99]; // Cmaj9 / Celestial
        } else if (endingId === 'predictable' || endingId === 'system_wins') {
            freqs = [196, 246.94, 293.66, 392, 440]; // G6 contemplative
        }

        freqs.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.12);

            gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
            gain.gain.linearRampToValueAtTime(0.08 / (idx + 1), now + idx * 0.12 + 0.6);
            gain.gain.exponentialRampToValueAtTime(0.00001, now + idx * 0.12 + 4.8);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 4.9);
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.droneGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.droneGain.gain.setValueAtTime(this.isMuted ? 0 : 0.06, now);
        }
        return this.isMuted;
    }
}

window.soundEngine = new SoundEngine();
