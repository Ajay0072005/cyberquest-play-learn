import { useCallback, useRef } from 'react';

export const useAchievementSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playAchievementSound = useCallback(() => {
    // Create or reuse AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Create master gain for overall volume
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.3, now);

    // Sparkle/chime effect - multiple ascending tones
    const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now);
      
      // Stagger the notes
      const startTime = now + index * 0.08;
      const duration = 0.4;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });

    // Add a subtle low "success" tone
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.connect(bassGain);
    bassGain.connect(masterGain);
    
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(261.63, now); // C4
    bassOsc.frequency.linearRampToValueAtTime(329.63, now + 0.3); // E4
    
    bassGain.gain.setValueAtTime(0, now);
    bassGain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    bassOsc.start(now);
    bassOsc.stop(now + 0.5);

    // Add shimmer effect
    const shimmerOsc = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(masterGain);
    
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.setValueAtTime(1567.98, now + 0.2); // G6
    shimmerOsc.frequency.linearRampToValueAtTime(2093, now + 0.5); // C7
    
    shimmerGain.gain.setValueAtTime(0, now + 0.2);
    shimmerGain.gain.linearRampToValueAtTime(0.15, now + 0.25);
    shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    shimmerOsc.start(now + 0.2);
    shimmerOsc.stop(now + 0.6);
  }, []);

  return { playAchievementSound };
};
