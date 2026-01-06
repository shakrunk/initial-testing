
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
        circle.setAttribute("class", "spinner");
        svg.appendChild(circle);
    } else {
        svg.setAttribute("fill", "currentColor");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        if (iconType === 'play') {
            path.setAttribute("d", "M8 5v14l11-7z");
        } else if (iconType === 'pause') {
            path.setAttribute("d", "M6 19h4V5H6v14zm8-14v14h4V5h-4z");
        } else if (iconType === 'volume') {
            path.setAttribute("d", "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z");
        } else if (iconType === 'volume-mute') {
            path.setAttribute("d", "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z");
        } else if (iconType === 'skip-forward') {
            path.setAttribute("d", "M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z");
        } else if (iconType === 'skip-backward') {
            path.setAttribute("d", "M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z");
        } else if (iconType === 'download') {
            path.setAttribute("d", "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z");
        } else if (iconType === 'speed') {
            path.setAttribute("d", "M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z");
        } else if (iconType === 'close') {
            path.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
        }
        svg.appendChild(path);
    }

    button.appendChild(svg);
}

function initAudioPlayers() {
    const audioElements = document.querySelectorAll('audio.audio-player');

    audioElements.forEach(audio => {
        const audioId = audio.src || 'audio-player';
        const storageKey = `audio-position-${btoa(audioId)}`;

        // Disable default controls and hide the original element
        audio.controls = false;
        audio.style.display = 'none';

        // Create container for custom controls
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'custom-audio-controls';
        controlsContainer.setAttribute('role', 'region');
        controlsContainer.setAttribute('aria-label', 'Audio player');

        // --- ROW 1: Progress Bar ---
        const progressContainer = document.createElement('div');
        progressContainer.className = 'audio-progress-row';

        // Current Time
        const currentTime = document.createElement('span');
        currentTime.className = 'time-current';
        currentTime.textContent = '0:00';
        currentTime.setAttribute('aria-live', 'off');

        // Range Input for Progress
        const progressInput = document.createElement('input');
        progressInput.type = 'range';
        progressInput.className = 'custom-audio-progress';
        progressInput.min = 0;
        progressInput.max = 100;
        progressInput.value = 0;
        progressInput.setAttribute('aria-label', 'Seek');
        progressInput.setAttribute('aria-valuemin', '0');
        progressInput.setAttribute('aria-valuemax', '100');
        progressInput.setAttribute('aria-valuenow', '0');
        progressInput.setAttribute('aria-valuetext', '0:00 of 0:00');

        // Duration Time
        const durationTime = document.createElement('span');
        durationTime.className = 'time-duration';
        durationTime.textContent = '0:00';

        progressContainer.appendChild(currentTime);
        progressContainer.appendChild(progressInput);
        progressContainer.appendChild(durationTime);

        // --- ROW 2: Main Controls (Skips + Play) ---
        const mainControlsRow = document.createElement('div');
        mainControlsRow.className = 'audio-main-controls';

        // Skip Backward Button
        const skipBackBtn = document.createElement('button');
        skipBackBtn.className = 'custom-audio-btn skip-btn';
        skipBackBtn.setAttribute('aria-label', 'Skip backward 15 seconds');
        skipBackBtn.title = 'Skip backward 15 seconds (←)';
        setButtonIcon(skipBackBtn, 'skip-backward');

        // Play/Pause Button
        const playBtn = document.createElement('button');
        playBtn.className = 'custom-audio-btn play-btn';
        playBtn.setAttribute('aria-label', 'Play');
        playBtn.title = 'Play (Space)';
        setButtonIcon(playBtn, 'play');

        // Skip Forward Button
        const skipForwardBtn = document.createElement('button');
        skipForwardBtn.className = 'custom-audio-btn skip-btn';
        skipForwardBtn.setAttribute('aria-label', 'Skip forward 15 seconds');
        skipForwardBtn.title = 'Skip forward 15 seconds (→)';
        setButtonIcon(skipForwardBtn, 'skip-forward');

        mainControlsRow.appendChild(skipBackBtn);
        mainControlsRow.appendChild(playBtn);
        mainControlsRow.appendChild(skipForwardBtn);

        // --- ROW 3: Secondary Controls (Vol, Speed, DL) ---
        const secondaryControlsRow = document.createElement('div');
        secondaryControlsRow.className = 'audio-secondary-controls';

        // Volume Control
        const volumeContainer = document.createElement('div');
        volumeContainer.className = 'volume-control';

        const volumeBtn = document.createElement('button');
        volumeBtn.className = 'custom-audio-btn volume-btn';
        volumeBtn.setAttribute('aria-label', 'Mute');
        volumeBtn.title = 'Mute (M)';
        setButtonIcon(volumeBtn, 'volume');

        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.className = 'volume-slider';
        volumeSlider.min = 0;
        volumeSlider.max = 100;
        volumeSlider.value = 100;
        volumeSlider.setAttribute('aria-label', 'Volume');
        volumeSlider.setAttribute('aria-valuemin', '0');
        volumeSlider.setAttribute('aria-valuemax', '100');
        volumeSlider.setAttribute('aria-valuenow', '100');
        volumeSlider.setAttribute('aria-valuetext', '100%');
        volumeSlider.title = 'Volume';

        volumeContainer.appendChild(volumeBtn);
        volumeContainer.appendChild(volumeSlider);

        // Playback Speed Control
        const speedContainer = document.createElement('div');
        speedContainer.className = 'speed-control';

        const speedBtn = document.createElement('button');
        speedBtn.className = 'custom-audio-btn speed-btn';
        speedBtn.setAttribute('aria-label', 'Playback speed: 1x');
        speedBtn.title = 'Playback speed';
        speedBtn.textContent = '1×';

        const speedMenu = document.createElement('div');
        speedMenu.className = 'speed-menu';
        speedMenu.setAttribute('role', 'menu');
        speedMenu.setAttribute('aria-label', 'Playback speed options');

        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        speeds.forEach(speed => {
            const speedOption = document.createElement('button');
            speedOption.className = 'speed-option';
            speedOption.setAttribute('role', 'menuitem');
            speedOption.textContent = `${speed}×`;
            speedOption.dataset.speed = speed;
            if (speed === 1) speedOption.classList.add('active');
            speedMenu.appendChild(speedOption);
        });

        speedContainer.appendChild(speedBtn);
        speedContainer.appendChild(speedMenu);

        // Download Button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'custom-audio-btn download-btn';
        downloadBtn.setAttribute('aria-label', 'Download audio file');
        downloadBtn.title = 'Download';
        setButtonIcon(downloadBtn, 'download');

        secondaryControlsRow.appendChild(volumeContainer);
        secondaryControlsRow.appendChild(speedContainer);
        secondaryControlsRow.appendChild(downloadBtn);

        // Assemble the UI: Progress Top, Main Middle, Secondary Bottom
        controlsContainer.appendChild(progressContainer);
        controlsContainer.appendChild(mainControlsRow);
        controlsContainer.appendChild(secondaryControlsRow);

        // Insert after the original audio element
        audio.parentNode.insertBefore(controlsContainer, audio.nextSibling);

        // --- Mini Player Logic ---
        createMiniPlayer(audio, playBtn, controlsContainer);

        // --- State Management ---
        let isSeeking = false;
        let lastVolume = 100;

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
            e.stopPropagation();
            togglePlay();
        });

        // Skip backward
        skipBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            audio.currentTime = Math.max(0, audio.currentTime - 15);
        });

        // Skip forward
        skipForwardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 15);
        });

        // Volume button (mute/unmute)
        volumeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (audio.volume > 0) {
                lastVolume = audio.volume * 100;
                audio.volume = 0;
                volumeSlider.value = 0;
                setButtonIcon(volumeBtn, 'volume-mute');
                volumeBtn.setAttribute('aria-label', 'Unmute');
                volumeBtn.title = 'Unmute (M)';
            } else {
                audio.volume = lastVolume / 100;
                volumeSlider.value = lastVolume;
                setButtonIcon(volumeBtn, 'volume');
                volumeBtn.setAttribute('aria-label', 'Mute');
                volumeBtn.title = 'Mute (M)';
            }
        });

        // Volume slider
        volumeSlider.addEventListener('input', (e) => {
            e.stopPropagation();
            const volume = e.target.value / 100;
            audio.volume = volume;
            volumeSlider.setAttribute('aria-valuenow', e.target.value);
            volumeSlider.setAttribute('aria-valuetext', `${e.target.value}%`);

            if (volume === 0) {
                setButtonIcon(volumeBtn, 'volume-mute');
                volumeBtn.setAttribute('aria-label', 'Unmute');
            } else {
                setButtonIcon(volumeBtn, 'volume');
                volumeBtn.setAttribute('aria-label', 'Mute');
                lastVolume = e.target.value;
            }
        });

        volumeSlider.addEventListener('mousedown', (e) => e.stopPropagation());
        volumeSlider.addEventListener('touchstart', (e) => e.stopPropagation());

        // Speed control
        speedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            speedMenu.classList.toggle('visible');
        });

        speedMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.classList.contains('speed-option')) {
                const speed = parseFloat(e.target.dataset.speed);
                audio.playbackRate = speed;
                speedBtn.textContent = `${speed}×`;
                speedBtn.setAttribute('aria-label', `Playback speed: ${speed}x`);

                // Update active state
                speedMenu.querySelectorAll('.speed-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.target.classList.add('active');

                speedMenu.classList.remove('visible');
            }
        });

        // Close speed menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!speedContainer.contains(e.target)) {
                speedMenu.classList.remove('visible');
            }
        });

        // Download button
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const link = document.createElement('a');
            link.href = audio.src;
            link.download = audio.src.split('/').pop() || 'audio.mp3';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        // Prevent container click when interacting with controls
        controlsContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        progressContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Ensure inputs don't trigger the container toggle
        progressInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        progressInput.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isSeeking = true;
        });

        progressInput.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            isSeeking = true;
        });

        document.addEventListener('mouseup', () => {
            if (isSeeking) {
                isSeeking = false;
                savePosition();
            }
        });

        document.addEventListener('touchend', () => {
            if (isSeeking) {
                isSeeking = false;
                savePosition();
            }
        });

        // Visual state updaters
        const showLoading = () => {
            setButtonIcon(playBtn, 'loading');
            playBtn.setAttribute('aria-label', 'Loading');
            playBtn.title = 'Loading...';
        };

        const showPause = () => {
            setButtonIcon(playBtn, 'pause');
            playBtn.setAttribute('aria-label', 'Pause');
            playBtn.title = 'Pause (Space)';
            controlsContainer.classList.add('playing');
        };

        const showPlay = () => {
            setButtonIcon(playBtn, 'play');
            playBtn.setAttribute('aria-label', 'Play');
            playBtn.title = 'Play (Space)';
            controlsContainer.classList.remove('playing');
        };

        // Update UI on Play/Pause/Waiting
        // audio.addEventListener('play', showLoading); // Avoid immediate loading state on click
        audio.addEventListener('waiting', showLoading);
        audio.addEventListener('playing', showPause);
        audio.addEventListener('pause', showPlay);

        // Update Progress Bar and Time
        audio.addEventListener('timeupdate', () => {
            if (!isNaN(audio.duration) && !isSeeking) {
                const percent = (audio.currentTime / audio.duration) * 100;
                progressInput.value = percent;
                progressInput.setAttribute('aria-valuenow', percent.toFixed(0));
                progressInput.setAttribute('aria-valuetext',
                    `${formatTime(audio.currentTime)} of ${formatTime(audio.duration)}`);

                // Update the background gradient for the progress bar
                updateProgressBackground(progressInput, percent);

                currentTime.textContent = formatTime(audio.currentTime);

                // Save position periodically
                if (Math.floor(audio.currentTime) % 5 === 0) {
                    savePosition();
                }
            }
        });

        // Seek functionality
        progressInput.addEventListener('input', () => {
            if (!isNaN(audio.duration)) {
                const time = (progressInput.value / 100) * audio.duration;
                audio.currentTime = time;
                updateProgressBackground(progressInput, progressInput.value);
                currentTime.textContent = formatTime(time);
            }
        });

        // Set Duration when metadata is loaded
        audio.addEventListener('loadedmetadata', () => {
            durationTime.textContent = formatTime(audio.duration);
            progressInput.setAttribute('aria-valuemax', audio.duration.toFixed(0));

            // Load saved position
            loadPosition();
        });

        // Also try to set duration immediately if already loaded
        if (audio.readyState >= 1) {
            durationTime.textContent = formatTime(audio.duration);
            progressInput.setAttribute('aria-valuemax', audio.duration.toFixed(0));
            loadPosition();
        }

        // Reset on End
        audio.addEventListener('ended', () => {
            showPlay();
            progressInput.value = 0;
            updateProgressBackground(progressInput, 0);
            currentTime.textContent = '0:00';
            controlsContainer.classList.remove('playing');
            savePosition(true); // Clear saved position
        });

        // Keyboard controls
        controlsContainer.addEventListener('keydown', (e) => {
            const tag = e.target.tagName.toLowerCase();
            const isInput = tag === 'input' || tag === 'button';

            // Prevent shortcuts from hijacking native input interactions
            if (e.key === ' ' && isInput) return;
            if ((e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End') && tag === 'input') return;

            switch(e.key) {
                case ' ':
                case 'k':
                case 'K':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    audio.currentTime = Math.max(0, audio.currentTime - 5);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    audio.volume = Math.min(1, audio.volume + 0.1);
                    volumeSlider.value = audio.volume * 100;
                    volumeSlider.setAttribute('aria-valuenow', (audio.volume * 100).toFixed(0));
                    volumeSlider.setAttribute('aria-valuetext', `${(audio.volume * 100).toFixed(0)}%`);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    audio.volume = Math.max(0, audio.volume - 0.1);
                    volumeSlider.value = audio.volume * 100;
                    volumeSlider.setAttribute('aria-valuenow', (audio.volume * 100).toFixed(0));
                    volumeSlider.setAttribute('aria-valuetext', `${(audio.volume * 100).toFixed(0)}%`);
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    volumeBtn.click();
                    break;
                case 'j':
                case 'J':
                    e.preventDefault();
                    audio.currentTime = Math.max(0, audio.currentTime - 10);
                    break;
                case 'l':
                case 'L':
                    e.preventDefault();
                    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
                    break;
                case '0':
                case 'Home':
                    e.preventDefault();
                    audio.currentTime = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    audio.currentTime = audio.duration;
                    break;
            }
        });

        // Make controls focusable
        controlsContainer.setAttribute('tabindex', '0');

        // Helper to update range input background
        function updateProgressBackground(input, percent) {
            input.style.background = `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${percent}%, var(--color-range-track) ${percent}%, var(--color-range-track) 100%)`;
        }

        // Save position to localStorage
        function savePosition(clear = false) {
            if (clear) {
                localStorage.removeItem(storageKey);
            } else if (audio.currentTime > 0 && audio.currentTime < audio.duration - 3) {
                localStorage.setItem(storageKey, audio.currentTime.toString());
            }
        }

        // Load position from localStorage
        function loadPosition() {
            const savedPosition = localStorage.getItem(storageKey);
            if (savedPosition) {
                const position = parseFloat(savedPosition);
                if (position > 0 && position < audio.duration - 3) {
                    audio.currentTime = position;
                }
            }
        }

        // Initialize background
        updateProgressBackground(progressInput, 0);
    });
}

function createMiniPlayer(audio, mainPlayBtn, controlsContainer) {
    const miniPlayer = document.createElement('div');
    miniPlayer.className = 'mini-player';
    miniPlayer.setAttribute('role', 'region');
    miniPlayer.setAttribute('aria-label', 'Mini Audio Player');

    const miniPlayBtn = document.createElement('button');
    miniPlayBtn.className = 'mini-player-btn';
    miniPlayBtn.setAttribute('aria-label', 'Play');
    miniPlayBtn.title = 'Play';
    setButtonIcon(miniPlayBtn, 'play');
    miniPlayBtn.onclick = (e) => {
        e.stopPropagation();
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    };

    const miniTitle = document.createElement('div');
    miniTitle.className = 'mini-player-title';
    // Try to find a title in the DOM nearby
    const articleTitle = document.querySelector('h1.hero-title') || document.querySelector('.audio-title');
    miniTitle.textContent = articleTitle ? articleTitle.textContent : 'Audio Player';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'mini-player-close';
    closeBtn.setAttribute('aria-label', 'Close Mini Player');
    closeBtn.title = 'Close';
    setButtonIcon(closeBtn, 'close');
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        miniPlayer.classList.remove('visible');
        // Optionally disable it for the session
    };

    miniPlayer.appendChild(miniPlayBtn);
    miniPlayer.appendChild(miniTitle);
    miniPlayer.appendChild(closeBtn);

    document.body.appendChild(miniPlayer);

    // Sync State
    audio.addEventListener('play', () => {
        setButtonIcon(miniPlayBtn, 'pause');
        miniPlayBtn.setAttribute('aria-label', 'Pause');
        miniPlayBtn.title = 'Pause';
        miniPlayer.classList.add('playing');
    });
    audio.addEventListener('pause', () => {
        setButtonIcon(miniPlayBtn, 'play');
        miniPlayBtn.setAttribute('aria-label', 'Play');
        miniPlayBtn.title = 'Play';
        miniPlayer.classList.remove('playing');
    });

    // Interaction: Scroll to main player on click
    miniPlayer.addEventListener('click', () => {
        controlsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Show mini player if main player is NOT intersecting AND (playing OR has progress)
            // But only if we have started playing at least once (currentTime > 0)
            const shouldShow = !entry.isIntersecting && (audio.currentTime > 0);
            if (shouldShow) {
                miniPlayer.classList.add('visible');
            } else {
                miniPlayer.classList.remove('visible');
            }
        });
    }, {
        threshold: 0
    });

    // Observe the main container (or the audio controls if container is too big)
    observer.observe(controlsContainer);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}
