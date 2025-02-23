// script.js - Enhanced PixelVidArt with dynamic particle dot effect, comprehensive controls and new time slider.
// All code is written as ES modules.

const videoUpload = document.getElementById('videoUpload');
const sourceVideo = document.getElementById('sourceVideo');
const effectCanvas = document.getElementById('effectCanvas');
const replayBtn = document.getElementById('replayBtn');
const pausePlayBtn = document.getElementById('pausePlayBtn'); // Updated Pause/Play Button
const autoReplayBtn = document.getElementById('autoReplayBtn');
const toggleOriginalBtn = document.getElementById('toggleOriginalBtn');
const dotSizeSlider = document.getElementById('dotSize');
const dotSizeValue = document.getElementById('dotSizeValue');
const thresholdSlider = document.getElementById('thresholdSlider');
const thresholdValue = document.getElementById('thresholdValue');
const volumeSlider = document.getElementById('volumeSlider');
const soundBtn = document.getElementById('soundBtn');
const snapshotBtn = document.getElementById('snapshotBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');pausePlayBtn
const playbackRateValue = document.getElementById('playbackRateValue');
const dotColorBtn = document.getElementById('dotColorBtn');
const dotColorPicker = document.getElementById('dotColorPicker');
const videoContainer = document.getElementById('videoContainer');pausePlayBtn
const dynamicToggleBtn = document.getElementById('dynamicToggleBtn');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const modalClose = document.getElementById('modalClose');
const neonToggleBtn = document.getElementById('neonToggleBtn');
const neonColorBtn = document.getElementById('neonColorBtn'); 
const neonColorPicker = document.getElementById('neonColorPicker');
const neonColorPreview = document.getElementById('neonColorPreview');
const glowSizeSlider = document.getElementById('glowSize');
const glowSizeValue = document.getElementById('glowSizeValue');
const neonIcon = document.getElementById('neonIcon');
const resolutionSelect = document.getElementById('resolutionSelect');
const saveVideoBtn = document.getElementById('saveVideoBtn');
const conversionProgress = document.getElementById('conversionProgress');
const videoPlaceholder = document.getElementById('videoPlaceholder');
// New control elements for connection lines and dot visibility
const connectionToggleBtn = document.getElementById('connectionToggleBtn');
const dotToggleBtn = document.getElementById('dotToggleBtn');
const lineComplexitySlider = document.getElementById('lineComplexity');
const lineComplexityValue = document.getElementById('lineComplexityValue');
const lineThicknessSlider = document.getElementById('lineThickness');
const lineThicknessValue = document.getElementById('lineThicknessValue');
// New select dropdown for line style
const lineStyleSelect = document.getElementById('lineStyleSelect');
// New controls for Line Color
const lineColorBtn = document.getElementById('lineColorBtn');
const lineColorPicker = document.getElementById('lineColorPicker');
// New controls for background inversion and color adjustment
const backgroundToggleBtn = document.getElementById('backgroundToggleBtn');
const backgroundColorBtn = document.getElementById('backgroundColorBtn');
const backgroundColorPicker = document.getElementById('backgroundColorPicker');
// New control for Point Shape dropdown (moved from its original location)
const shapeSelect = document.getElementById('shapeSelect');
// New control for include audio during video save
const includeAudioCheck = document.getElementById('includeAudioCheck');
// New control for time slider
const timeSlider = document.getElementById('timeSlider');
const timeSliderValue = document.getElementById('timeSliderValue');
// New control for Intensity Mode toggle (now placed in the dot controls row)
const intensityToggleBtn = document.getElementById('intensityToggleBtn');
const intensityIcon = document.getElementById('intensityIcon');

const ctx = effectCanvas.getContext('2d');

let dotSize = parseInt(dotSizeSlider.value, 10);
let baseDotSize = dotSize;
let threshold = parseInt(thresholdSlider.value, 10);
let dotColor = '#000000';
let lineColor = '#000000';
let animationFrameId;
let autoReplay = false;
let dynamicMode = false;
let neonMode = false;
let intensityMode = false; // new mode: intensity-based dot sizing.
let neonColor = neonColorPicker.value;
let glowBlur = parseInt(glowSizeSlider.value, 10);
let selectedShape = shapeSelect.value;
let frameCount = 0;

let connectionMode = false;
let showDots = true;
let lineComplexity = parseInt(lineComplexitySlider.value, 10);
let lineThickness = parseInt(lineThicknessSlider.value, 10);

let originalVideoWidth = 0;
let originalVideoHeight = 0;

let mediaRecorder;
let recordedChunks = [];
let conversionActive = false;
let recordingCanvas; 
let recordingCtx;
let progressAnimationFrame;

// New variables for background control
let isBackgroundInverted = false;
let normalBGColor = '#ffffff'; 
let currentBGColor = normalBGColor;

const defaults = {
  dotSize: 5,
  threshold: 128,
  volume: 1,
  playbackRate: 1,
  dotColor: '#000000',
  lineColor: '#000000',
  neonColor: '#00ffff',
  glowSize: 20,
  shape: 'circle',
  lineStyle: 'curve',
  lineComplexity: 1,
  lineThickness: 1,
  resolution: 'original',
  includeAudio: true
};

dotSizeSlider.addEventListener('input', e => {
  baseDotSize = parseInt(e.target.value, 10);
  dotSizeValue.textContent = baseDotSize;
});

thresholdSlider.addEventListener('input', e => {
  threshold = parseInt(e.target.value, 10);
  thresholdValue.textContent = threshold;
});

playbackRateSlider.addEventListener('input', e => {
  const rate = parseFloat(e.target.value);
  playbackRateValue.textContent = rate.toFixed(2);
  sourceVideo.playbackRate = rate;
});

// Time Slider: Update video currentTime based on slider input.
timeSlider.addEventListener('input', e => {
  const time = parseFloat(e.target.value);
  sourceVideo.currentTime = time;
  updateTimeSliderValue(time);
});

function updateTimeSliderValue(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  timeSliderValue.textContent = `${minutes}:${seconds}`;
}

volumeSlider.addEventListener('input', e => {
  const volume = parseFloat(e.target.value);
  sourceVideo.volume = volume;
});

soundBtn.addEventListener('click', () => {
  sourceVideo.muted = !sourceVideo.muted;
  updateSoundIcon();
});

function updateSoundIcon() {
  const soundIcon = document.getElementById('soundIcon');
  if (sourceVideo.muted) {
    soundIcon.innerHTML = `
      <path fill="#fff" d="M3 9v6h4l5 5V4l-5 5H3z"/>
      <line x1="2" y1="2" x2="22" y2="22" stroke="#fff" stroke-width="2"/>
    `;
  } else {
    soundIcon.innerHTML = `
      <path fill="#fff" d="M3 9v6h4l5 5V4l-5 5H3z"/>
      <path fill="#fff" d="M14 3.23v2.06c3.39 1.14 6 4.31 6 7.71s-2.61 6.57-6 7.71v2.06c4.01-1.17 7-4.71 7-9.77s-2.99-8.6-7-9.77z"/>
    `;
  }
}

videoUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  sourceVideo.src = url;
  sourceVideo.load();
  sourceVideo.muted = false;
  updateSoundIcon();
  videoPlaceholder.style.display = 'none';
  sourceVideo.addEventListener('loadeddata', () => {
    originalVideoWidth = sourceVideo.videoWidth;
    originalVideoHeight = sourceVideo.videoHeight;
    effectCanvas.width = originalVideoWidth;
    effectCanvas.height = originalVideoHeight;
    // Update the timeSlider max value based on video duration.
    timeSlider.max = sourceVideo.duration;
    updateTimeSliderValue(0);
    sourceVideo.play().then(() => {
      pausePlayBtn.innerHTML = `
        <svg id="pausePlayIcon" width="10" height="10" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" fill="#fff"/>
          <rect x="14" y="4" width="4" height="16" fill="#fff"/>
        </svg>
      `;
    }).catch(() => {});
    processFrame();
  }, { once: true });
});

dynamicToggleBtn.addEventListener('click', () => {
  dynamicMode = !dynamicMode;
  updateDynamicIcon();
});

function updateDynamicIcon() {
  const dynamicIcon = document.getElementById('dynamicIcon');
  if (dynamicMode) {
    dynamicIcon.innerHTML = `
      <path fill="#0f0" d="M13 2v7h7l-9 13v-9H4l9-11z"/>
    `;
  } else {
    dynamicIcon.innerHTML = `
      <path fill="none" stroke="#fff" stroke-width="2" d="M13 2v7h7l-9 13v-9H4l9-11z"/>
    `;
  }
}

neonToggleBtn.addEventListener('click', () => {
  neonMode = !neonMode;
  updateNeonIcon();
});

function updateNeonIcon() {
  if (neonMode) {
    neonIcon.innerHTML = `
      <circle cx="12" cy="12" r="10" fill="none" stroke="#0ff" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="#0ff"/>
    `;
  } else {
    neonIcon.innerHTML = `
      <rect x="4" y="4" width="16" height="16" fill="none" stroke="#fff" stroke-width="2"/>
      <line x1="4" y1="4" x2="20" y2="20" stroke="#fff" stroke-width="2"/>
    `;
  }
}

glowSizeSlider.addEventListener('input', e => {
  glowBlur = parseInt(e.target.value, 10);
  glowSizeValue.textContent = e.target.value;
});

function toggleColorPicker(button, picker) {
  if (picker._toggleActive) {
    picker.blur();
    picker._toggleActive = false;
  } else {
    picker.focus();
    picker.click();
    picker._toggleActive = true;
  }
}

// Close color pickers when clicking outside of them.
document.addEventListener('click', e => {
  const colorPickers = [dotColorPicker, lineColorPicker, neonColorPicker, backgroundColorPicker];
  colorPickers.forEach(picker => {
    const btn = picker._associatedButton;
    if (btn && !btn.contains(e.target) && e.target !== picker) {
      picker.blur();
      picker._toggleActive = false;
    }
  });
});

dotColorBtn.addEventListener('click', e => {
  toggleColorPicker(dotColorBtn, dotColorPicker);
});
dotColorPicker.addEventListener('input', e => {
  dotColor = e.target.value;
});
dotColorPicker._associatedButton = dotColorBtn;

lineColorBtn.addEventListener('click', e => {
  toggleColorPicker(lineColorBtn, lineColorPicker);
});
lineColorPicker.addEventListener('input', e => {
  lineColor = e.target.value;
});
lineColorPicker._associatedButton = lineColorBtn;

neonColorBtn.addEventListener('click', e => {
  toggleColorPicker(neonColorBtn, neonColorPicker);
});
neonColorPicker.addEventListener('input', e => {
  neonColor = e.target.value;
  neonColorPreview.setAttribute('fill', neonColor);
});
neonColorPicker._associatedButton = neonColorBtn;

backgroundColorBtn.addEventListener('click', e => {
  toggleColorPicker(backgroundColorBtn, backgroundColorPicker);
});
backgroundColorPicker.addEventListener('input', e => {
  currentBGColor = e.target.value;
  if (!isBackgroundInverted) {
    normalBGColor = currentBGColor;
  }
});
backgroundColorPicker._associatedButton = backgroundColorBtn;

// New: Intensity Mode Toggle
intensityToggleBtn.addEventListener('click', () => {
  intensityMode = !intensityMode;
  updateIntensityIcon();
});
function updateIntensityIcon(){
  if(intensityMode){
    intensityIcon.innerHTML = `
      <circle cx="12" cy="12" r="10" fill="#ffcc00" stroke="#ffcc00" stroke-width="2"/>
    `;
  } else {
    intensityIcon.innerHTML = `
      <circle cx="12" cy="12" r="10" fill="none" stroke="#fff" stroke-width="2"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke="#fff" stroke-width="2"/>
    `;
  }
}

function updateInvertBGIcon() {
  const bgToggleIcon = document.getElementById('bgToggleIcon');
  if (isBackgroundInverted) {
    bgToggleIcon.innerHTML = `
      <rect x="3" y="3" width="18" height="18" fill="#000" stroke="#fff" stroke-width="2"/>
    `;
  } else {
    bgToggleIcon.innerHTML = `
      <rect x="3" y="3" width="18" height="18" fill="#fff" stroke="#000" stroke-width="2"/>
    `;
  }
}

backgroundToggleBtn.addEventListener('click', () => {
  isBackgroundInverted = !isBackgroundInverted;
  updateInvertBGIcon();
});

helpBtn.addEventListener('click', () => {
  helpModal.style.display = 'block';
});

modalClose.addEventListener('click', () => {
  helpModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === helpModal) {
    helpModal.style.display = 'none';
  }
});

connectionToggleBtn.addEventListener('click', () => {
  connectionMode = !connectionMode;
  updateConnectionIcon();
});

function updateConnectionIcon() {
  const connectionIcon = document.getElementById('connectionIcon');
  if (connectionMode) {
    connectionIcon.innerHTML = `
      <circle cx="12" cy="12" r="8" fill="#0f0"/>
    `;
  } else {
    connectionIcon.innerHTML = `
      <line x1="4" y1="12" x2="20" y2="12" stroke="#aaa" stroke-width="2" stroke-linecap="round"/>
    `;
  }
}

dotToggleBtn.addEventListener('click', () => {
  showDots = !showDots;
  if (showDots) {
    dotToggleBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" fill="#fff"/>
      </svg>
    `;
  } else {
    dotToggleBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" stroke-width="2"/>
        <line x1="6" y1="6" x2="18" y2="18" stroke="#fff" stroke-width="2"/>
      </svg>
    `;
  }
});

lineComplexitySlider.addEventListener('input', e => {
  lineComplexity = parseInt(e.target.value, 10);
  lineComplexityValue.textContent = lineComplexity;
});
lineThicknessSlider.addEventListener('input', e => {
  lineThickness = parseInt(e.target.value, 10);
  lineThicknessValue.textContent = lineThickness;
});

let dotPositions = [];

function drawDot(x, y, size, shape, offsetX = 0, offsetY = 0) {
  const posX = x + offsetX;
  const posY = y + offsetY;
  dotPositions.push({ x: posX, y: posY });
  
  if (!showDots) return;
  
  if (neonMode) {
    ctx.shadowColor = neonColor;
    ctx.shadowBlur = glowBlur;
  } else {
    ctx.shadowBlur = 0;
  }
  ctx.fillStyle = isBackgroundInverted ? '#fff' : dotColor;
  ctx.beginPath();
  switch(shape) {
    case 'circle':
      ctx.arc(posX, posY, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'square':
      ctx.fillRect(posX - size/2, posY - size/2, size, size);
      break;
    case 'hexagon': {
      const side = size * 0.5;
      ctx.moveTo(posX + side, posY);
      for(let i = 1; i < 6; i++){
        ctx.lineTo(posX + side * Math.cos(i * Math.PI/3), posY + side * Math.sin(i * Math.PI/3));
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'heart': {
      const r = size * 0.25;
      ctx.moveTo(posX, posY);
      ctx.bezierCurveTo(posX, posY - r, posX - size/2, posY - r, posX - size/2, posY);
      ctx.bezierCurveTo(posX - size/2, posY + size/3, posX, posY + size/1.5, posX, posY + size/1.2);
      ctx.bezierCurveTo(posX, posY + size/1.5, posX + size/2, posY + size/3, posX + size/2, posY);
      ctx.bezierCurveTo(posX + size/2, posY - r, posX, posY - r, posX, posY);
      ctx.fill();
      break;
    }
    case 'star': {
      const spikes = 5;
      const outerRadius = size * 0.5;
      const innerRadius = outerRadius * 0.5;
      let rot = Math.PI / 2 * 3;
      const cx = posX, cy = posY;
      const step = Math.PI / spikes;
      ctx.moveTo(posX, posY - outerRadius);
      for (let i = 0; i < spikes; i++) {
        let x1 = cx + Math.cos(rot) * outerRadius;
        let y1 = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x1, y1);
        rot += step;
        x1 = cx + Math.cos(rot) * innerRadius;
        y1 = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x1, y1);
        rot += step;
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'polygon': {
      const sides = 5;
      const radius = size * 0.5;
      ctx.moveTo(posX + radius * Math.cos(0), posY + radius * Math.sin(0));
      for (let i = 1; i <= sides; i++) {
        ctx.lineTo(posX + radius * Math.cos(i * 2 * Math.PI / sides),
                   posY + radius * Math.sin(i * 2 * Math.PI / sides));
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    default:
      ctx.arc(posX, posY, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
  }
}

function drawConnectionLines() {
  if (!connectionMode) return;
  ctx.lineWidth = lineThickness;
  
  if (neonMode) {
    ctx.shadowColor = neonColor;
    ctx.shadowBlur = glowBlur;
    ctx.strokeStyle = neonColor;
  } else {
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isBackgroundInverted ? '#fff' : lineColor;
  }
  
  const maxDistance = 50 * lineComplexity;
  const style = lineStyleSelect.value;
  
  for (let i = 0; i < dotPositions.length; i++) {
    for (let j = i + 1; j < dotPositions.length; j++) {
      const dx = dotPositions[i].x - dotPositions[j].x;
      const dy = dotPositions[i].y - dotPositions[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDistance) {
        const midX = (dotPositions[i].x + dotPositions[j].x) / 2;
        const midY = (dotPositions[i].y + dotPositions[j].y) / 2;
        const norm = Math.sqrt(dx * dx + dy * dy);
        const offset = (maxDistance - dist) / 4;
        const perpX = -dy / norm;
        const perpY = dx / norm;
        
        if (style === 'straight') {
          ctx.beginPath();
          ctx.moveTo(dotPositions[i].x, dotPositions[i].y);
          ctx.lineTo(dotPositions[j].x, dotPositions[j].y);
          ctx.stroke();
        } else if (style === 'curve') {
          const controlX = midX + perpX * offset;
          const controlY = midY + perpY * offset;
          ctx.beginPath();
          ctx.moveTo(dotPositions[i].x, dotPositions[i].y);
          ctx.quadraticCurveTo(controlX, controlY, dotPositions[j].x, dotPositions[j].y);
          ctx.stroke();
        } else if (style === 'zigzag') {
          const mid1X = dotPositions[i].x + dx / 3;
          const mid1Y = dotPositions[i].y + dy / 3;
          const mid2X = dotPositions[i].x + (2 * dx) / 3;
          const mid2Y = dotPositions[i].y + (2 * dy) / 3;
          const mid1OffsetX = mid1X + perpX * offset;
          const mid1OffsetY = mid1Y + perpY * offset;
          const mid2OffsetX = mid2X - perpX * offset;
          const mid2OffsetY = mid2Y - perpY * offset;
          ctx.beginPath();
          ctx.moveTo(dotPositions[i].x, dotPositions[i].y);
          ctx.lineTo(mid1OffsetX, mid1OffsetY);
          ctx.lineTo(mid2OffsetX, mid2OffsetY);
          ctx.lineTo(dotPositions[j].x, dotPositions[j].y);
          ctx.stroke();
        } else if (style === 'wave') {
          const waveAmplitude = offset;
          const waveLength = dist / 4;
          ctx.beginPath();
          ctx.moveTo(dotPositions[i].x, dotPositions[i].y);
          const steps = 20;
          for (let k = 1; k <= steps; k++) {
            const t = k / steps;
            const x = dotPositions[i].x + dx * t;
            const y = dotPositions[i].y + dy * t;
            const sineOffset = Math.sin(t * Math.PI * 2) * waveAmplitude;
            const cx = x + perpX * sineOffset;
            const cy = y + perpY * sineOffset;
            ctx.lineTo(cx, cy);
          }
          ctx.stroke();
        } else if (style === 'dotted') {
          ctx.save();
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(dotPositions[i].x, dotPositions[i].y);
          ctx.lineTo(dotPositions[j].x, dotPositions[j].y);
          ctx.stroke();
          ctx.restore();
        } else if (style === 'spiral') {
          const steps = 20;
          ctx.beginPath();
          ctx.moveTo(dotPositions[i].x, dotPositions[i].y);
          for (let k = 1; k <= steps; k++) {
            const t = k / steps;
            const angle = t * 4 * Math.PI;
            const radius = (1 - t) * offset * 3;
            const x = midX + Math.cos(angle) * radius;
            const y = midY + Math.sin(angle) * radius;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(dotPositions[j].x, dotPositions[j].y);
          ctx.stroke();
        } else if (style === 'dashed') {
          ctx.save();
          ctx.setLineDash([10, 5]);
          ctx.beginPath();
          ctx.moveTo(dotPositions[i].x, dotPositions[i].y);
          ctx.lineTo(dotPositions[j].x, dotPositions[j].y);
          ctx.stroke();
          ctx.restore();
        } else if (style === 'bounce') {
          ctx.beginPath();
          ctx.moveTo(dotPositions[i].x, dotPositions[i].y);
          const midX2 = midX;
          const midY2 = midY + offset;
          ctx.quadraticCurveTo(midX2, midY2, dotPositions[j].x, dotPositions[j].y);
          ctx.stroke();
        } else if (style === 'squiggly') {
          ctx.beginPath();
          ctx.moveTo(dotPositions[i].x, dotPositions[i].y);
          const steps = 10;
          for(let k = 1; k <= steps; k++){
            const t = k/steps;
            const x = dotPositions[i].x + dx * t;
            const y = dotPositions[i].y + dy * t;
            const offsetY = Math.sin(t * Math.PI * 4) * offset;
            ctx.lineTo(x, y + offsetY);
          }
          ctx.stroke();
        }
      }
    }
  }
}

function processFrame() {
  if (!sourceVideo.src) {
    ctx.clearRect(0, 0, effectCanvas.width, effectCanvas.height);
    return;
  }
  
  if (sourceVideo.paused) return;
  
  frameCount++;
  dotPositions = [];
  ctx.drawImage(sourceVideo, 0, 0, effectCanvas.width, effectCanvas.height);
  const frame = ctx.getImageData(0, 0, effectCanvas.width, effectCanvas.height);
  const { data, width, height } = frame;
  
  if (isBackgroundInverted) {
    ctx.fillStyle = '#000';
  } else {
    ctx.fillStyle = currentBGColor;
  }
  ctx.fillRect(0, 0, width, height);
  
  for (let y = 0; y < height; y += baseDotSize) {
    for (let x = 0; x < width; x += baseDotSize) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      
      if (intensityMode) {
        // In intensity mode, the dot size scales with luminance.
        let currentDotSize = baseDotSize * (luminance/255);
        if(currentDotSize < 1) continue;
        let offsetX = 0;
        let offsetY = 0;
        if (dynamicMode) {
          const scaleFactor = 0.8 + ((255 - luminance) / 255) * 0.5;
          currentDotSize = currentDotSize * scaleFactor;
          offsetX = Math.sin((x + y + frameCount) / 5) * 5;
          offsetY = Math.cos((x - y + frameCount) / 5) * 5;
        }
        drawDot(x, y, currentDotSize, selectedShape, offsetX, offsetY);
      } else {
        if (luminance < threshold) {
          let currentDotSize = baseDotSize;
          let offsetX = 0;
          let offsetY = 0;
          if (dynamicMode) {
            const scaleFactor = 0.8 + ((255 - luminance) / 255) * 0.5;
            currentDotSize = baseDotSize * scaleFactor;
            offsetX = Math.sin((x + y + frameCount) / 5) * 5;
            offsetY = Math.cos((x - y + frameCount) / 5) * 5;
          }
          drawDot(x, y, currentDotSize, selectedShape, offsetX, offsetY);
        }
      }
    }
  }
  
  drawConnectionLines();
  
  if (conversionActive && recordingCanvas) {
    recordingCtx.drawImage(effectCanvas, 0, 0, recordingCanvas.width, recordingCanvas.height);
    updateConversionProgress();
  }
  
  // Update the timeSlider position to reflect current video time.
  timeSlider.value = sourceVideo.currentTime;
  updateTimeSliderValue(sourceVideo.currentTime);
  
  animationFrameId = requestAnimationFrame(processFrame);
}

function updateConversionProgress() {
  if (sourceVideo.duration) {
    const progress = (sourceVideo.currentTime / sourceVideo.duration) * 100;
    conversionProgress.value = progress;
  }
}

function updatePlayPauseButton() {
  if (sourceVideo.paused || sourceVideo.ended) {
    pausePlayBtn.innerHTML = `
      <svg id="pausePlayIcon" width="10" height="10" viewBox="0 0 24 24">
        <polygon points="8,5 19,12 8,19" fill="#fff"/>
      </svg>
    `;
  } else {
    pausePlayBtn.innerHTML = `
      <svg id="pausePlayIcon" width="10" height="10" viewBox="0 0 24 24">
        <rect x="6" y="4" width="4" height="16" fill="#fff"/>
        <rect x="14" y="4" width="4" height="16" fill="#fff"/>
      </svg>
    `;
  }
}

sourceVideo.addEventListener('play', updatePlayPauseButton);
sourceVideo.addEventListener('pause', updatePlayPauseButton);

replayBtn.addEventListener('click', () => {
  if (!sourceVideo.src) {
    ctx.clearRect(0, 0, effectCanvas.width, effectCanvas.height);
    return;
  }
  sourceVideo.currentTime = 0;
  sourceVideo.play().catch(() => {});
  processFrame();
});

autoReplayBtn.addEventListener('click', () => {
  if (!sourceVideo.src) {
    ctx.clearRect(0, 0, effectCanvas.width, effectCanvas.height);
    return;
  }
  autoReplay = !autoReplay;
  autoReplayBtn.style.background = autoReplay ? 'rgba(0,150,0,0.6)' : 'rgba(0,0,0,0.6)';
  if (autoReplay && (sourceVideo.paused || sourceVideo.ended)) {
    sourceVideo.currentTime = 0;
    sourceVideo.play().catch(() => {});
    processFrame();
  }
});

pausePlayBtn.addEventListener('click', () => {
  if (!sourceVideo.src) return;
  if (sourceVideo.paused) {
    sourceVideo.play().then(() => {
      pausePlayBtn.innerHTML = `
        <svg id="pausePlayIcon" width="10" height="10" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" fill="#fff"/>
          <rect x="14" y="4" width="4" height="16" fill="#fff"/>
        </svg>
      `;
      processFrame();
    }).catch(err => {
      console.error('Play error:', err);
    });
  } else {
    sourceVideo.pause();
    pausePlayBtn.innerHTML = `
      <svg id="pausePlayIcon" width="10" height="10" viewBox="0 0 24 24">
        <polygon points="8,5 19,12 8,19" fill="#fff"/>
      </svg>
    `;
  }
});

sourceVideo.addEventListener('ended', () => {
  if (conversionActive) {
    stopConversion();
  } else if (autoReplay) {
    sourceVideo.currentTime = 0;
    sourceVideo.play().catch(() => {});
    processFrame();
  } else {
    cancelAnimationFrame(animationFrameId);
  }
});

sourceVideo.addEventListener('pause', () => {
  if (!autoReplay && !conversionActive) cancelAnimationFrame(animationFrameId);
});

snapshotBtn.addEventListener('click', () => {
  if (!sourceVideo.src) return;
  const snapshotURL = effectCanvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = snapshotURL;
  a.download = 'snapshot.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    effectCanvas.requestFullscreen().catch(err => {
      console.error(`Error enabling full-screen mode: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
});

resetBtn.addEventListener('click', () => {
  // Reset video controls and all settings back to default.
  dotSizeSlider.value = defaults.dotSize;
  thresholdSlider.value = defaults.threshold;
  volumeSlider.value = defaults.volume;
  playbackRateSlider.value = defaults.playbackRate;
  dotColor = defaults.dotColor;
  dotColorPicker.value = defaults.dotColor;
  baseDotSize = defaults.dotSize;
  threshold = defaults.threshold;
  dotSizeValue.textContent = defaults.dotSize;
  thresholdValue.textContent = defaults.threshold;
  playbackRateValue.textContent = defaults.playbackRate.toFixed(2);
  sourceVideo.volume = defaults.volume;
  sourceVideo.playbackRate = defaults.playbackRate;
  
  // Reset time slider as well.
  timeSlider.value = 0;
  updateTimeSliderValue(0);
  
  if (autoReplay) {
    autoReplay = false;
    autoReplayBtn.style.background = 'rgba(0,0,0,0.6)';
  }
  
  dynamicMode = false;
  neonMode = false;
  intensityMode = false;
  connectionMode = false;
  showDots = true;
  updateDynamicIcon();
  updateConnectionIcon();
  dotToggleBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" fill="#fff"/>
    </svg>
  `;
  updateNeonIcon();
  updateIntensityIcon();
  
  shapeSelect.value = defaults.shape;
  selectedShape = defaults.shape;
  
  isBackgroundInverted = false;
  updateInvertBGIcon();
  normalBGColor = '#ffffff';
  currentBGColor = normalBGColor;
  backgroundColorPicker.value = normalBGColor;
  
  lineColor = defaults.lineColor;
  lineColorPicker.value = defaults.lineColor;
  
  neonColor = defaults.neonColor;
  neonColorPicker.value = defaults.neonColor;
  neonColorPreview.setAttribute('fill', defaults.neonColor);
  
  glowSizeSlider.value = defaults.glowSize;
  glowSizeValue.textContent = defaults.glowSize;
  glowBlur = defaults.glowSize;
  
  lineStyleSelect.value = defaults.lineStyle;
  
  lineComplexitySlider.value = defaults.lineComplexity;
  lineComplexityValue.textContent = defaults.lineComplexity;
  lineComplexity = defaults.lineComplexity;
  
  lineThicknessSlider.value = defaults.lineThickness;
  lineThicknessValue.textContent = defaults.lineThickness;
  lineThickness = defaults.lineThickness;
  
  resolutionSelect.value = defaults.resolution;
  includeAudioCheck.checked = defaults.includeAudio;
});

toggleOriginalBtn.addEventListener('click', () => {
  const currentDisplay = sourceVideo.style.display;
  sourceVideo.style.display = (currentDisplay === 'none' || currentDisplay === '') ? 'block' : 'none';
});

saveVideoBtn.addEventListener('click', () => {
  if (!sourceVideo.src) return;
  convertVideo();
});

function convertVideo() {
  recordedChunks = [];
  conversionActive = true;
  conversionProgress.style.display = 'block';
  conversionProgress.value = 0;
  
  let stream;
  const selectedRes = resolutionSelect.value;
  if (selectedRes === 'original') {
    stream = effectCanvas.captureStream();
    recordingCanvas = null;
  } else {
    let targetWidth, targetHeight;
    const resMap = {
      '480p': 480,
      '720p': 720,
      '1080p': 1080,
      '4K': 2160
    };
    targetHeight = Math.min(resMap[selectedRes], originalVideoHeight);
    targetWidth = Math.floor(originalVideoWidth * (targetHeight / originalVideoHeight));
    recordingCanvas = document.createElement('canvas');
    recordingCanvas.width = targetWidth;
    recordingCanvas.height = targetHeight;
    recordingCtx = recordingCanvas.getContext('2d');
    stream = recordingCanvas.captureStream();
  }
  
  if (includeAudioCheck.checked) {
    try {
      const videoAudioStream = sourceVideo.captureStream();
      const audioTracks = videoAudioStream.getAudioTracks();
      audioTracks.forEach(track => {
        stream.addTrack(track);
      });
    } catch (error) {
      console.warn('Audio capture not supported:', error);
    }
  }
  
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.onstop = downloadVideo;
  mediaRecorder.start();
  
  progressAnimationFrame = requestAnimationFrame(function progressUpdater() {
    updateConversionProgress();
    if (conversionActive) {
      progressAnimationFrame = requestAnimationFrame(progressUpdater);
    }
  });
  
  sourceVideo.currentTime = 0;
  sourceVideo.play().catch(() => {});
  processFrame();
}

function stopConversion() {
  mediaRecorder.stop();
  conversionActive = false;
  conversionProgress.style.display = 'none';
  cancelAnimationFrame(progressAnimationFrame);
  sourceVideo.currentTime = 0;
}

function downloadVideo() {
  const blob = new Blob(recordedChunks, { type: 'video/mp4' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'dot_effect_video.mp4';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

shapeSelect.addEventListener('change', (e) => {
  selectedShape = e.target.value;
});

// Initialize the Invert BG button with default white background icon.
updateInvertBGIcon();