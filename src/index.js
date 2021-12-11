const keyboard = document.getElementById('keyboard');
const playButton = document.getElementById('play');
const selectedSongElement = document.getElementById('selected-song');

// Notes with their frequencies
const notes = {
  'C': [16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00, 4186.01],
  'C#': [17.32, 34.65, 69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
  'D': [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.63],
  'D#': [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03],
  'E': [20.60, 41.20, 82.41, 164.81, 329.63, 659.25, 1318.51, 2637.02, 5274.04],
  'F': [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83, 5587.65],
  'F#': [23.12, 46.25, 92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96, 5919.91],
  'G': [24.50, 49.00, 98.00, 196.00, 392, 783.99, 1567.98, 3135.96, 6271.93],
  'G#': [25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44, 6644.88],
  'A': [27.50, 55.00, 110.00, 220.00, 440, 880.00, 1760.00, 3520.00, 7040.00],
  'A#': [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31, 7458.62],
  'B': [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07, 7902.13]
};

const audioContext = new AudioContext({
  sampleRate: 768000
});

const songs = {
  'NF-Time': [
    { chord: 'G#', octave: 2, scale: 'minor' },
    { chord: 'C', octave: 3, scale: 'minor' },
    { chord: 'A#', octave: 2, scale: 'major' },
    { chord: 'F', octave: 2, scale: 'minor' },
  ],
  'NF-How-Could-You-Leave-Us': [
    { chord: 'F', octave: 3, scale: 'major' },
    { chord: 'A', octave: 3, scale: 'minor' },
    { chord: 'G', octave: 3, scale: 'major' },
    { chord: 'F', octave: 3, scale: 'major' },
  ],
  'Requiem-For-A-Dream': [
    { chord: 'A#', octave: 4 },
    { chord: 'A', octave: 4 },
    { chord: 'G', octave: 4 },
    { chord: 'D', octave: 4 },
    { chord: 'A#', octave: 4 },
    { chord: 'A', octave: 4 },
    { chord: 'G', octave: 4 },
    { chord: 'D', octave: 4 },
    { chord: 'A#', octave: 4 },
    { chord: 'A', octave: 4 },
    { chord: 'G', octave: 4 },
    { chord: 'D', octave: 4 },
    { chord: 'C', octave: 5 },
    { chord: 'A#', octave: 4 },
    { chord: 'A', octave: 4 },
    { chord: 'A#', octave: 4 },
  ]
}

const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);
gainNode.gain.value = 1;

const sineTerms = new Float32Array([0, 0, 0, 0, 0]);
const cosineTerms = new Float32Array(sineTerms.length);
const waveForm = audioContext.createPeriodicWave(cosineTerms, sineTerms);

playButton.addEventListener('click', async () => {
  playButton.disabled = true;
  const savedText = playButton.innerText;
  playButton.innerText = 'Playing...';
  
  await playSong(selectedSongElement.value);
  
  playButton.innerText = savedText;
  playButton.disabled = false;
})

function delay(ms = 500) {
  return new Promise((res) => setTimeout(res,ms))
}

async function playSong(songName) {
  const songToPlay = songs[songName];
  
  if (songToPlay) {
    for (let i = 0; i < songToPlay.length; i++) {
      const chord = songToPlay[i].chord;
      const octave = songToPlay[i].octave;
      const scale = songToPlay[i].scale;

      await playChord(chord, octave, scale);
    }
  } else {
    console.log('Song not found');
  }
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
  } else {
    await playNote(chord, octave, 500);
    return;
  }

  const attackTime = 0;
  const decayTime = 0;
  const sustainLevel = 0;
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

  const attackTime = 0;
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

function renderNotes() {
  const allNotes = Object.keys(notes);

    for (let currentOctave = 3; currentOctave < 6; currentOctave++) {
      for (let i = 0; i < 12; i++) {

    const div = document.createElement('div');
    div.classList.add('note-key');
    const noteName = allNotes[i];
    
    if (noteName.includes('#')) {
      div.classList.add('sharp');
    } else {
      div.classList.add('regular');
      div.innerText = noteName + currentOctave;
    }

    div.dataset.note = noteName;
    div.dataset.octave = currentOctave;

    keyboard.appendChild(div);
  }

  }
}

keyboard.addEventListener('click', (event) => {
  const pressedNote = {
    note: event.target.dataset ? event.target.dataset.note : null,
    octave: event.target.dataset ? event.target.dataset.octave : null,
  }

  if (pressedNote.note && pressedNote.octave) {
    playNote(pressedNote.note, Number(pressedNote.octave), 500);
  }
})

renderNotes();