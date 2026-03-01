// Microphone detection for blowing out candles
let audioContext;
let analyser;
let dataArray;
let bufferLength;
let candlesBlown = 0;
const totalCandles = 22;

// Initialize microphone
async function initMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);
        
        detectBlow();
    } catch (err) {
        console.error('Microphone access denied:', err);
        alert('Please allow microphone access to play this experience!');
    }
}

// Detect blowing sound
function detectBlow() {
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average frequency
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    const average = sum / bufferLength;
    
    // If sound is detected (threshold), blow out candles
    if (average > 50 && candlesBlown < totalCandles) {
        const candlesToBlow = Math.min(Math.random() < 0.5 ? 1 : (Math.random() < 0.5 ? 2 : 3), totalCandles - candlesBlown);
        blowOutCandles(candlesToBlow);
    }
    
    if (candlesBlown < totalCandles) {
        requestAnimationFrame(detectBlow);
    } else {
        // All candles blown out - transition to next section
        setTimeout(() => transitionToEnvelope(), 1000);
    }
}

// Blow out candles
function blowOutCandles(count) {
    const candles = document.querySelectorAll('.candle:not(.blown)');
    for (let i = 0; i < count && i < candles.length; i++) {
        candles[i].classList.add('blown');
        candlesBlown++;
    }
    
    document.getElementById('candle-count').textContent = totalCandles - candlesBlown;
    
    // Add sound effect (optional)
    playSound();
}

// Play sound effect
function playSound() {
    if (audioContext) {
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
}

// Create candles
function createCandles() {
    const container = document.getElementById('candles-container');
    const radius = 50;
    const angleStep = (Math.PI * 2) / totalCandles;
    
    for (let i = 0; i < totalCandles; i++) {
        const angle = angleStep * i;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        const candle = document.createElement('div');
        candle.className = 'candle';
        candle.style.left = (x + 71) + 'px';
        candle.style.top = (y + 20) + 'px';
        candle.style.transform = `rotate(${angle}rad)`;
        
        const flame = document.createElement('div');
        flame.className = 'flame';
        candle.appendChild(flame);
        
        container.appendChild(candle);
    }
}

// Section transitions
function transitionToEnvelope() {
    const cakeSection = document.getElementById('cake-section');
    const envelopeSection = document.getElementById('envelope-section');
    
    cakeSection.classList.remove('active');
    envelopeSection.classList.add('active');
    
    setTimeout(() => {
        const envelope = document.getElementById('envelope');
        envelope.classList.add('open');
        setTimeout(() => transitionToMessage(), 1500);
    }, 1000);
}

function transitionToMessage() {
    const envelopeSection = document.getElementById('envelope-section');
    const messageSection = document.getElementById('message-section');
    
    envelopeSection.classList.remove('active');
    messageSection.classList.add('active');
    
    // Allow scrolling to photo section
    enableScrolling();
}

function transitionToPhoto() {
    const photoSection = document.getElementById('photo-section');
    photoSection.classList.add('active');
    playMusic();
}

let scrollEnabled = false;

function enableScrolling() {
    scrollEnabled = true;
    window.addEventListener('scroll', handleScroll);
}

function handleScroll() {
    if (!scrollEnabled) return;
    
    const messageSection = document.getElementById('message-section');
    const messageRect = messageSection.getBoundingClientRect();
    
    if (messageRect.top < window.innerHeight * 0.3) {
        transitionToPhoto();
        window.removeEventListener('scroll', handleScroll);
    }
}

// Music control
function playMusic() {
    const audio = document.getElementById('background-music');
    audio.play().catch(err => console.log('Audio autoplay prevented:', err));
}

document.getElementById('play-btn').addEventListener('click', () => {
    document.getElementById('background-music').play();
});

document.getElementById('pause-btn').addEventListener('click', () => {
    document.getElementById('background-music').pause();
});

// Initialize on page load
window.addEventListener('load', () => {
    createCandles();
    initMicrophone();
});