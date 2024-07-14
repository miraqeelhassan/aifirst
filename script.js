// Get DOM elements
const startRecordBtn = document.getElementById('startRecord');
const stopRecordBtn = document.getElementById('stopRecord');
const outputText = document.getElementById('outputText');
const textToSpeechBtn = document.getElementById('textToSpeech');
const downloadSpeechBtn = document.getElementById('downloadSpeech');
const micStatus = document.getElementById('micStatus');
const micIndicator = document.getElementById('micIndicator');
const clearTextBtn = document.getElementById('clearText'); // New button for clearing text

// Initialize speech recognition and synthesis objects
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
const synthesis = window.speechSynthesis;

recognition.lang = 'en-US';
recognition.interimResults = true; // Use interim results for faster response
recognition.maxAlternatives = 1;

let isRecording = false;
let finalTranscript = ''; // Variable to hold the final recognized text

// Function to update mic status
function updateMicStatus(active) {
    if (active) {
        micIndicator.textContent = 'On';
        micIndicator.classList.remove('off');
        micIndicator.classList.add('on');
    } else {
        micIndicator.textContent = 'Off';
        micIndicator.classList.remove('on');
        micIndicator.classList.add('off');
    }
}

// Event listener for start recording
startRecordBtn.addEventListener('click', () => {
    recognition.start();
    startRecordBtn.disabled = true;
    stopRecordBtn.disabled = false;
    isRecording = true;
    updateMicStatus(true); // Update mic status to On
});

// Event listener for stop recording
stopRecordBtn.addEventListener('click', () => {
    recognition.stop();
    startRecordBtn.disabled = false;
    stopRecordBtn.disabled = true;
    isRecording = false;
    updateMicStatus(false); // Update mic status to Off
});

// Event listener for text to speech
textToSpeechBtn.addEventListener('click', () => {
    const text = finalTranscript.trim();
    if (text !== '') {
        const utterance = new SpeechSynthesisUtterance(text);
        synthesis.speak(utterance);

        // Enable download button and create downloadable speech
        downloadSpeechBtn.disabled = false;
        downloadSpeechBtn.addEventListener('click', () => {
            const blob = new Blob([text], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'speech.wav';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        });
    }
});

// Event listener for clear text button
clearTextBtn.addEventListener('click', () => {
    outputText.value = '';
    downloadSpeechBtn.disabled = true; // Disable download button after clearing text
    finalTranscript = ''; // Reset final transcript variable
});

// Speech recognition events
recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
        } else {
            interimTranscript += event.results[i][0].transcript;
        }
    }
    outputText.value = finalTranscript + interimTranscript;
};

recognition.onend = () => {
    if (isRecording) {
        recognition.start(); // Restart recognition if still recording
    } else {
        updateMicStatus(false); // Update mic status to Off when recognition ends
    }
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    startRecordBtn.disabled = false;
    stopRecordBtn.disabled = true;
    updateMicStatus(false); // Update mic status to Off on error
};
