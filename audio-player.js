
document.addEventListener('DOMContentLoaded', () => {
    initAudioPlayers();
});

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
        playBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `;

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

        // Speed Control Button
        const speedBtn = document.createElement('button');
        speedBtn.className = 'custom-audio-speed-btn';
        speedBtn.setAttribute('aria-label', 'Playback speed: 1x');
        speedBtn.textContent = '1x';

        // Assemble the UI
        progressContainer.appendChild(progressInput);

        controlsContainer.appendChild(playBtn);
        controlsContainer.appendChild(progressContainer);
        controlsContainer.appendChild(timeDisplay);
        controlsContainer.appendChild(speedBtn);

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

        // Update UI on Play/Pause
        audio.addEventListener('play', () => {
            playBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            `;
            playBtn.setAttribute('aria-label', 'Pause');
            controlsContainer.classList.add('playing');
        });

        audio.addEventListener('pause', () => {
            playBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
            playBtn.setAttribute('aria-label', 'Play');
            controlsContainer.classList.remove('playing');
        });

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
            playBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
            playBtn.setAttribute('aria-label', 'Play');
            progressInput.value = 0;
            updateProgressBackground(progressInput, 0);
            currentSpan.textContent = '0:00';
            controlsContainer.classList.remove('playing');
        });

        // Playback Speed Control
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        let currentSpeedIndex = 2; // Start at 1x

        speedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
            const newSpeed = speeds[currentSpeedIndex];
            audio.playbackRate = newSpeed;
            speedBtn.textContent = `${newSpeed}x`;
            speedBtn.setAttribute('aria-label', `Playback speed: ${newSpeed}x`);
        });

        // Set initial speed
        audio.playbackRate = speeds[currentSpeedIndex];

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
