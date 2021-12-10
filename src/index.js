const app = document.getElementById('app');
const playButton = document.getElementById('play');
const playByChordsButton = document.getElementById('play-by-chords');

// Frequency for 4th Octave (Middle)
const notes = {
  'C': [16.35, 32.70, 65.41, 130.81, 261.63],
  'C#': [17.32, 34.65, 69.30, 138.59, 277.18],
  'D': [18.35, 36.71, 73.42, 146.83, 293.66],
  'D#': [19.45, 38.89, 77.78, 155.56, 311.13],
  'E': [20.60, 41.20, 82.41, 164.81, 329.63],
  'F': [21.83, 43.65, 87.31, 174.61, 349.23],
  'F#': [23.12, 46.25, 92.50, 185.00, 369.99],
  'G': [24.50, 49.00, 98.00, 196.00, 392],
  'G#': [25.96, 51.91, 103.83, 207.65, 415.30],
  'A': [27.50, 55.00, 110.00, 220.00, 440],
  'A#': [29.14, 58.27, 116.54, 233.08, 366.16],
  'B': [30.87, 61.74, 123.47, 246.94, 493.88]
};

const audioContext = new AudioContext({
  sampleRate: 768000
});

const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);
gainNode.gain.value = 0.2;

const sineTerms = new Float32Array([0, 0, 0, 0, 0]);
const cosineTerms = new Float32Array(sineTerms.length);
const waveForm = audioContext.createPeriodicWave(cosineTerms, sineTerms);

playByChordsButton.addEventListener('click', async () => {
  const octave = 3;
  await playChord('F', octave, 'major');
  await playChord('A', octave, 'minor');
  await playChord('G', octave, 'major');
  await playChord('F', octave, 'major');
});

playButton.addEventListener('click', async () => {
  await playNote('F', 2);
  // await delay(3000);
  await playNote('A', 2);
  // await delay(3000);
  await playNote('C', 2);
  
  // F
  // playNote('F', 2);
  // playNote('A', 2);
  // playNote('C', 3);

  // await delay(3000);
  // // A
  // playNote('A', 2);
  // playNote('C', 3);
  // playNote('E', 3);

  // await delay(3000)

  // // G
  // playNote('G', 2);
  // playNote('B', 2);
  // playNote('D', 3);
  
  // await delay(3000)
  
  // // F
  // playNote('F', 2);
  // playNote('A', 2);
  // playNote('C', 3);


  // await playNote('F', 2);
  // await playNote('C', 3);
  // await playNote('G', 2);
  // await playNote('F', 2);
  // await playNote('E', 4);
  // await playNote('F', 4);
  // await playNote('G', 4);
  // await playNote('A', 4);
  // await playNote('B', 4);
})

function delay(ms = 500) {
  return new Promise((res) => setTimeout(res,ms))
}

function getPeriodicWave() {
  // const n = 2;
  const real = new Float32Array([0, 0]);
  const imag = new Float32Array([0, 1]);
  
  // for(var x = 1; x < n; x+=2) {
  //   imag[x] = 1.0 / (Math.PI*x);
  // }

  return audioContext.createPeriodicWave(real, imag);
}

async function playChord(chord, octave, scale, time = 3000) {
  const allNotes = Object.keys(notes);
  const indexOfFirstNote = allNotes.indexOf(chord);

  let note1;
  let note1Octave;
  let note2;
  let note2Octave;
  let note3;
  let note3Octave;

  if (scale === 'major') {
    note1 = allNotes[indexOfFirstNote % 12];
    note1Octave = octave;
    note2 = allNotes[(indexOfFirstNote + 4) % 12]; // 2 Whole Steps
    note2Octave = (indexOfFirstNote + 4) > 11 ? octave + 1 : octave;
    note3 = allNotes[(indexOfFirstNote + 4 + 3) % 12]; // 1.5 Steps
    note3Octave = (indexOfFirstNote + 4 + 3) > 11 ? octave + 1 : octave;
  } else if (scale === 'minor') {
    note1 = allNotes[indexOfFirstNote % 12];
    note1Octave = octave;
    note2 = allNotes[(indexOfFirstNote + 3) % 12]; // 1.5 Steps
    note2Octave = (indexOfFirstNote + 3) > 11 ? octave + 1 : octave;
    note3 = allNotes[(indexOfFirstNote + 3 + 4) % 12]; // 2 Steps
    note3Octave = (indexOfFirstNote + 3 + 4) > 11 ? octave + 1 : octave;
  }

  const attackTime = 0;
  const decayTime = 0;
  const sustainLevel = 1;
  const releaseTime = 1;

  const now = audioContext.currentTime;
  const noteGain = audioContext.createGain();
  noteGain.gain.setValueAtTime(0, 0);
  noteGain.gain.linearRampToValueAtTime(time / 1000, now + attackTime);
  noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
  noteGain.gain.setValueAtTime(sustainLevel, now + (time / 1000) - releaseTime);
  noteGain.gain.linearRampToValueAtTime(0, now + (time / 1000));
  
  const merger = audioContext.createChannelMerger(3);
  merger.connect(audioContext.destination);

  const oscillatorNode1 = audioContext.createOscillator();
  oscillatorNode1.frequency.value = notes[note1][note1Octave];
  oscillatorNode1.type = 'triangle';
  oscillatorNode1.connect(merger, 0, 0);

  const oscillatorNode2 = audioContext.createOscillator();
  oscillatorNode2.frequency.value = notes[note2][note2Octave];
  oscillatorNode2.type = 'triangle';
  oscillatorNode2.connect(merger, 0, 1);

  const oscillatorNode3 = audioContext.createOscillator();
  oscillatorNode3.frequency.value = notes[note3][note3Octave];
  oscillatorNode3.type = 'triangle';
  oscillatorNode3.connect(merger, 0, 2);
  
  oscillatorNode1.connect(noteGain);
  oscillatorNode2.connect(noteGain);
  oscillatorNode3.connect(noteGain);
  noteGain.connect(gainNode);

  oscillatorNode1.start();
  oscillatorNode2.start();
  oscillatorNode3.start();
  await delay(time);
  oscillatorNode1.stop();
  oscillatorNode2.stop();
  oscillatorNode3.stop();
}

async function playNote(note, octave, time = 2000) {
  const frequency = notes[note][octave];

  const osc = audioContext.createOscillator();

  osc.frequency.value = frequency;

  const attackTime = 0.2;
  const decayTime = 0.3;
  const sustainLevel = 0.7;
  const releaseTime = 0.2;

  const now = audioContext.currentTime;
  const noteGain = audioContext.createGain();
  noteGain.gain.setValueAtTime(0, 0);
  noteGain.gain.linearRampToValueAtTime(time / 1000, now + attackTime);
  noteGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
  noteGain.gain.setValueAtTime(sustainLevel, now + (time / 1000) - releaseTime);
  noteGain.gain.linearRampToValueAtTime(0, now + (time / 1000));

  osc.connect(noteGain);
  noteGain.connect(gainNode);

  osc.start()
  await delay(time);
  osc.stop();
}