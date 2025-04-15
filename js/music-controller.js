/**
 * Music Controller
 * Handles audio playback continuity across pages
 */
const MusicController = (function() {
  // Initialize audio elements
  let backgroundAudio;
  let soundControl;
  let soundIcon;
  
  /**
   * Initialize the music controller
   * @param {HTMLAudioElement} audio - The background audio element
   * @param {HTMLElement} control - The sound control button
   */
  function init(audio, control) {
    backgroundAudio = audio;
    soundControl = control;
    soundIcon = control ? control.querySelector('.sound-icon') : null;
    
    // Set up audio control
    if (soundControl && backgroundAudio) {
      soundControl.addEventListener('click', toggleAudio);
    }
    
    // Restore audio state from previous page
    restoreAudioState();
  }
  
  /**
   * Toggle audio play/pause
   */
  function toggleAudio() {
    if (!backgroundAudio) return;
    
    if (backgroundAudio.paused) {
      backgroundAudio.play().then(() => {
        updateSoundIcon(true);
      }).catch(error => {
        console.log('Audio playback failed:', error);
      });
    } else {
      backgroundAudio.pause();
      updateSoundIcon(false);
    }
    
    // Save current state
    saveAudioState();
  }
  
  /**
   * Update sound icon to reflect audio state
   * @param {boolean} isPlaying - Whether audio is playing
   */
  function updateSoundIcon(isPlaying) {
    if (!soundIcon) return;
    
    if (isPlaying) {
      soundIcon.classList.remove('fa-volume-mute', 'sound-off');
      soundIcon.classList.add('fa-volume-up', 'sound-on');
    } else {
      soundIcon.classList.remove('fa-volume-up', 'sound-on');
      soundIcon.classList.add('fa-volume-mute', 'sound-off');
    }
  }
  
  /**
   * Save current audio state to localStorage
   */
  function saveAudioState() {
    if (!backgroundAudio) return;
    
    const audioState = {
      src: backgroundAudio.src,
      currentTime: backgroundAudio.currentTime,
      isPlaying: !backgroundAudio.paused,
      volume: backgroundAudio.volume
    };
    
    localStorage.setItem('audioState', JSON.stringify(audioState));
  }
  
  /**
   * Restore audio state from localStorage
   */
  function restoreAudioState() {
    if (!backgroundAudio) return;
    
    const savedState = localStorage.getItem('audioState');
    if (savedState) {
      try {
        const audioState = JSON.parse(savedState);
        
        // Set the source if different
        if (backgroundAudio.src !== audioState.src && audioState.src) {
          backgroundAudio.src = audioState.src;
        }
        
        // Set time position
        backgroundAudio.currentTime = audioState.currentTime || 0;
        
        // Set volume
        backgroundAudio.volume = audioState.volume !== undefined ? audioState.volume : 0.5;
        
        // Play/pause based on saved state
        if (audioState.isPlaying) {
          backgroundAudio.play().catch(error => {
            console.log('Audio playback failed:', error);
            updateSoundIcon(false);
          });
          updateSoundIcon(true);
        } else {
          updateSoundIcon(false);
        }
      } catch (error) {
        console.error('Error restoring audio state:', error);
      }
    }
  }
  
  /**
   * Save state before leaving page
   */
  function setupPageUnloadSaving() {
    window.addEventListener('beforeunload', saveAudioState);
  }
  
  /**
   * Change the currently playing song
   * @param {string} src - Audio source URL
   * @param {boolean} autoplay - Whether to start playing immediately
   */
  function changeSong(src, autoplay = true) {
    if (!backgroundAudio) return;
    
    backgroundAudio.src = src;
    if (autoplay) {
      backgroundAudio.play().then(() => {
        updateSoundIcon(true);
      }).catch(error => {
        console.log('Audio playback failed:', error);
        updateSoundIcon(false);
      });
    } else {
      backgroundAudio.pause();
      updateSoundIcon(false);
    }
    
    saveAudioState();
  }
  
  // Return public API
  return {
    init: init,
    toggleAudio: toggleAudio,
    saveState: saveAudioState,
    changeSong: changeSong,
    setupPageUnloadSaving: setupPageUnloadSaving
  };
})();

// Run when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('backgroundAudio');
  const control = document.getElementById('soundControl');
  
  if (audio) {
    MusicController.init(audio, control);
    MusicController.setupPageUnloadSaving();
  }
});
