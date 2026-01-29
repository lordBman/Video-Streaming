import { positionText, progress, progress_thumb, seekbar_handler, video } from "./imports";

let isDragging = false;

const updateSeekBar = (clientX: number) => {
    const rect = seekbar_handler.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    offsetX = Math.max(0, Math.min(offsetX, rect.width)); // clamp between 0 and width
    const percent = (offsetX / rect.width);

    video.currentTime = percent * video.duration;

    progress.style.width = `${percent * 100}%`;
    progress_thumb.style.left = `${percent * 100}%`;
    //valueDisplay.textContent = Math.round(percent);
}

// Touch events for mobile
progress_thumb.addEventListener('touchstart', () => { isDragging = true; });
document.addEventListener('touchend', () => { isDragging = false; });
document.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches[0]) {
        updateSeekBar(e.touches[0].clientX);
    }
});

// Mouse events
progress_thumb.addEventListener('mousedown', () => { isDragging = true; });
document.addEventListener('mouseup', () => { isDragging = false; });
document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updateSeekBar(e.clientX);
    }
});

// Function to get horizontal cursor position relative to seekbar
const getCursorPosition = (clientX: number) => {
    const rect = seekbar_handler.getBoundingClientRect(); // Get seekbar position & size
    let x = clientX - rect.left; // Distance from left edge
    x = Math.max(0, Math.min(x, rect.width)); // Clamp between 0 and width
    return x;
}

// Update progress bar and text on mouse move
seekbar_handler.addEventListener('mousemove', (e) => {
    const x = getCursorPosition(e.clientX);
    positionText.textContent = `Cursor X: ${x.toFixed(2)}px`;
});

// Update progress bar and text on touch slide
seekbar_handler.addEventListener('touchmove', (e) => {
    const x = getCursorPosition(e.touches[0]!.clientX);
    positionText.textContent = `Cursor X: ${x.toFixed(2)}px`;
});

// Seek video on click
seekbar_handler.addEventListener('click', (e) => {
    updateSeekBar(e.clientX);
});

// Update progress bar as video plays
video.addEventListener('timeupdate', () => {
    const percent = (video.currentTime / video.duration) * 100;
    progress.style.width = `${percent}%`;
});

