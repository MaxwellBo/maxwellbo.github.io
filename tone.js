// DTMF frequencies for phone dialing
const rowFreqs = [697, 770, 852, 941];  // Row frequencies
const colFreqs = [1209, 1336, 1477, 1633];  // Column frequencies

let audioContext = null;

// Initialize audio context
const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
};

// Play DTMF tone for phone dialing
const playDTMF = (digit) => {
  initAudio();
  if (!audioContext) return;

  if (!digit || digit === '*') digit = '10';
  if (digit === '#') digit = '11';
  if (digit === '0') digit = '12';
  
  const num = parseInt(digit) - 1;
  const row = Math.floor(num / 3);
  const col = num % 3;
  
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator1.type = 'sine';
  oscillator2.type = 'sine';
  
  oscillator1.frequency.value = rowFreqs[row];
  oscillator2.frequency.value = colFreqs[col];
  
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.value = 0.1;
  
  oscillator1.start();
  oscillator2.start();
  
  setTimeout(() => {
    oscillator1.stop();
    oscillator2.stop();
  }, 150);
};

// Add click handlers to the buttons
document.querySelectorAll('.has-tone').forEach(button => {
  button.addEventListener('click', () => {
    const digit = button.textContent;
    playDTMF(digit);
    
    // Visual feedback
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
  });
});