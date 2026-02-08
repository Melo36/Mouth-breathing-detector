/**
 * Plays a soft, non-annoying chime sound using the Web Audio API.
 */
export const playAlertSound = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Soft sine wave
    oscillator.type = 'sine';

    // Start at a pleasant frequency (e.g., 880Hz - A5) and slide down slightly
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

    // Envelope for a soft "ding"
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); // Decay

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
};
