
import { SoundEffect } from "../types";

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx!;
}

/**
 * Plays a synthesized sound effect based on the SoundEffect enum.
 * This programmatic approach avoids the "source not found" issues common with
 * short/malformed base64 WAV strings and ensures consistent behavior across browsers.
 */
const play = (sound: SoundEffect, isMuted: boolean): void => {
  if (isMuted) {
    return;
  }

  try {
    const ctx = getAudioCtx();
    
    // Browsers often require the AudioContext to be resumed after a user interaction.
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    switch (sound) {
      case SoundEffect.MESSAGE_SEND:
        // A short, clean blip
        createTone(ctx, { freq: 880, type: 'sine', duration: 0.1, volume: 0.1, startTime: now });
        break;
      
      case SoundEffect.MESSAGE_RECEIVE:
        // A double-blip ascending
        createTone(ctx, { freq: 660, type: 'sine', duration: 0.1, volume: 0.1, startTime: now });
        createTone(ctx, { freq: 880, type: 'sine', duration: 0.1, volume: 0.1, startTime: now + 0.08 });
        break;
      
      case SoundEffect.PROCESSING_START:
        // A low, steady notification tone
        createTone(ctx, { freq: 220, type: 'triangle', duration: 0.4, volume: 0.05, startTime: now });
        break;
      
      case SoundEffect.PROCESSING_END:
        // A pleasant confirmation chime
        createTone(ctx, { freq: 440, type: 'sine', duration: 0.2, volume: 0.08, startTime: now });
        createTone(ctx, { freq: 554.37, type: 'sine', duration: 0.3, volume: 0.06, startTime: now + 0.12 });
        break;
      
      case SoundEffect.CLEAR_HISTORY:
        // A descending sequence
        [440, 349.23, 261.63].forEach((f, i) => {
          createTone(ctx, { freq: f, type: 'sine', duration: 0.4, volume: 0.07, startTime: now + i * 0.12 });
        });
        break;
      
      case SoundEffect.AWAKENING:
        // A long, resonant sweep representing spiritual awakening
        {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          // Sweep from A2 to A5
          osc.frequency.setValueAtTime(110, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 3);
          
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.1, now + 1);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 4);
          
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 4);
        }
        break;
      
      case SoundEffect.TIMER_COMPLETE:
        // Triple "alarm" blip
        [0, 0.4, 0.8].forEach(d => {
          createTone(ctx, { freq: 1174.66, type: 'square', duration: 0.2, volume: 0.03, startTime: now + d });
        });
        break;
      
      case SoundEffect.REMEMBRANCE:
        // Deep, foundational hum (E2)
        createTone(ctx, { freq: 82.41, type: 'sine', duration: 5, volume: 0.15, startTime: now });
        break;
        
      default:
        console.warn(`SoundEffect enum ${sound} triggered but no synth logic defined.`);
    }
  } catch (error) {
    console.error(`AudioService: Failed to play sound effect "${sound}":`, error);
  }
};

/**
 * Interface for internal tone generation.
 */
interface ToneConfig {
  freq: number;
  type: OscillatorType;
  duration: number;
  volume: number;
  startTime: number;
}

/**
 * Helper to schedule a single synthesized tone.
 */
function createTone(ctx: AudioContext, config: ToneConfig) {
  const { freq, type, duration, volume, startTime } = config;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  
  gain.gain.setValueAtTime(volume, startTime);
  // Smoothly fade out to avoid clicks
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

export const audioService = {
  play,
};
