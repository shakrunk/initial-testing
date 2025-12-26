
document.addEventListener('DOMContentLoaded', () => {
    initAudioPlayers();
});

// Helper to create and set SVG icon
function setButtonIcon(button, iconType) {
    button.textContent = '';

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");

    if (iconType === 'loading') {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "12");
        circle.setAttribute("cy", "12");
        circle.setAttribute("r", "10");
        circle.setAttribute("stroke-width", "3");
        circle.setAttribute("stroke-dasharray", "30 30");
        circle.setAttribute("fill", "none");
        circle.style.stroke = "currentColor";

        // Add rotation animation class if needed, or rely on CSS.
        // The previous code had class="spinner"
        circle.setAttribute("class", "spinner");

        svg.appendChild(circle);
    } else {
        svg.setAttribute("fill", "currentColor");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        if (iconType === 'play') {
            path.setAttribute("d", "M8 5v14l11-7z");
        } else if (iconType === 'pause') {
            path.setAttribute("d", "M6 19h4V5H6v14zm8-14v14h4V5h-4z");
        }
        svg.appendChild(path);
    }

    button.appendChild(svg);
}

function initAudioPlayers() {
    const audioElements = document.querySelectorAll('audio.audio-player');

    audioElements.forEach(audio => {
        // Disable default controls and hide the original element
        audio.controls = false;
        audio.style.display = 'none';

        // Create container for custom controls
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'custom-audio-controls';

        // Play/Pause Button
        const playBtn = document.createElement('button');
        playBtn.className = 'custom-audio-btn play-btn';
        playBtn.setAttribute('aria-label', 'Play');
        setButtonIcon(playBtn, 'play');

        // Progress Bar Container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'custom-audio-progress-container';

        // Range Input for Progress
        const progressInput = document.createElement('input');
        progressInput.type = 'range';
        progressInput.className = 'custom-audio-progress';
        progressInput.min = 0;
        progressInput.max = 100;
        progressInput.value = 0;
        progressInput.setAttribute('aria-label', 'Audio Progress');

        // Time Display
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'custom-audio-time';
        const currentSpan = document.createElement('span');
        currentSpan.className = 'time-current';
        currentSpan.textContent = '0:00';
        const separator = document.createTextNode(' / ');
        const durationSpan = document.createElement('span');
        durationSpan.className = 'time-duration';
        durationSpan.textContent = '0:00';

        timeDisplay.appendChild(currentSpan);
        timeDisplay.appendChild(separator);
        timeDisplay.appendChild(durationSpan);

        // Assemble the UI
        progressContainer.appendChild(progressInput);

        controlsContainer.appendChild(playBtn);
        controlsContainer.appendChild(progressContainer);
        controlsContainer.appendChild(timeDisplay);

        // Insert after the original audio element
        audio.parentNode.insertBefore(controlsContainer, audio.nextSibling);

        // Find the main container to make it clickable
        const mainContainer = audio.closest('.audio-container');

        // --- Event Listeners ---

        // Function to toggle play/pause
        const togglePlay = () => {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        };

        // Play/Pause Toggle on button
        playBtn.addEventListener('click', (e) => {
            // Stop propagation so it doesn't trigger the container click as well
            e.stopPropagation();
            togglePlay();
        });

        // Play/Pause Toggle on container
        if (mainContainer) {
            mainContainer.addEventListener('click', () => {
                togglePlay();
            });
        }

        // Prevent container click when interacting with controls
        controlsContainer.addEventListener('click', (e) => {
            // We want the play button to work (handled above), but other control interactions
            // like clicking empty space in controls shouldn't necessarily toggle play
            // unless intended. However, the user asked for the *entire* component to be play/pause.
            // But precision clicks (seek) should be excluded.
        });

        progressContainer.addEventListener('click', (e) => {
             e.stopPropagation();
        });

        // Ensure inputs (seek bar) don't trigger the container toggle
        progressInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Also stop mousedown/touchstart on the range input to prevent accidental toggles while dragging
        progressInput.addEventListener('mousedown', (e) => e.stopPropagation());
        progressInput.addEventListener('touchstart', (e) => e.stopPropagation());

        // Visual state updaters
        const showLoading = () => {
            setButtonIcon(playBtn, 'loading');
            playBtn.setAttribute('aria-label', 'Loading');
        };

        const showPause = () => {
            setButtonIcon(playBtn, 'pause');
            playBtn.setAttribute('aria-label', 'Pause');
            controlsContainer.classList.add('playing');
        };

        const showPlay = () => {
            setButtonIcon(playBtn, 'play');
            playBtn.setAttribute('aria-label', 'Play');
            controlsContainer.classList.remove('playing');
        };

        // Update UI on Play/Pause/Waiting
        audio.addEventListener('play', showLoading); // Immediate feedback
        audio.addEventListener('waiting', showLoading); // Buffering feedback
        audio.addEventListener('playing', showPause); // Actual playback feedback
        audio.addEventListener('pause', showPlay);

        // Update Progress Bar and Time
        audio.addEventListener('timeupdate', () => {
            if (!isNaN(audio.duration)) {
                const percent = (audio.currentTime / audio.duration) * 100;
                progressInput.value = percent;

                // Update the background gradient for the progress bar
                updateProgressBackground(progressInput, percent);

                currentSpan.textContent = formatTime(audio.currentTime);
            }
        });

        // Seek functionality
        progressInput.addEventListener('input', () => {
            if (!isNaN(audio.duration)) {
                const time = (progressInput.value / 100) * audio.duration;
                audio.currentTime = time;
                updateProgressBackground(progressInput, progressInput.value);
            }
        });

        // Set Duration when metadata is loaded
        audio.addEventListener('loadedmetadata', () => {
            durationSpan.textContent = formatTime(audio.duration);
        });

        // Also try to set duration immediately if already loaded
        if (audio.readyState >= 1) {
            durationSpan.textContent = formatTime(audio.duration);
        }

        // Reset on End
        audio.addEventListener('ended', () => {
            showPlay();
            progressInput.value = 0;
            updateProgressBackground(progressInput, 0);
            currentSpan.textContent = '0:00';
            controlsContainer.classList.remove('playing');
        });

        // Helper to update range input background
        function updateProgressBackground(input, percent) {
            // This assumes the CSS variable --color-accent is available in the context
            // We'll compute the color style in the JS to handle the dynamic percentage
            input.style.background = `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${percent}%, #e0e0e0 ${percent}%, #e0e0e0 100%)`;
        }

        // Initialize background
        updateProgressBackground(progressInput, 0);
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}
