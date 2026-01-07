// Control script for GoCrazy visualization
(function() {
  let isPlaying = true;
  let initialized = false;
  
  // Function to play/pause the CABLES patch
  function setPlayState(shouldPlay) {
    console.log('Setting play state:', shouldPlay);
    isPlaying = shouldPlay;
    
    // Wait for CABLES to be fully initialized
    // Check if patch exists and is not null/undefined
    if (window.CABLES && CABLES.patch && typeof CABLES.patch === 'object') {
      try {
        if (shouldPlay) {
          // Resume the patch
          console.log('Resuming CABLES patch');
          
          // Use _paused property if play() method doesn't exist
          if (typeof CABLES.patch.play === 'function') {
            CABLES.patch.play();
            console.log('Called CABLES.patch.play()');
          } else if (CABLES.patch._paused !== undefined) {
            CABLES.patch._paused = false;
            console.log('Set _paused to false');
          } else {
            console.warn('CABLES.patch does not have play() method or _paused property');
            console.log('Available CABLES.patch properties:', Object.keys(CABLES.patch));
          }
          
          // Force a render frame to restart animations
          if (typeof CABLES.patch._renderOneFrame === 'function') {
            CABLES.patch._renderOneFrame();
            console.log('Called _renderOneFrame()');
          }
          
          // Try to start the render loop if it exists
          if (typeof CABLES.patch.start === 'function') {
            CABLES.patch.start();
            console.log('Called CABLES.patch.start()');
          }
          
          // Try to resume if there's a resume method
          if (typeof CABLES.patch.resume === 'function') {
            CABLES.patch.resume();
            console.log('Called CABLES.patch.resume()');
          }
          
          // Resume audio context if it exists
          if (window.audioContext) {
            console.log('Resuming audio context, current state:', window.audioContext.state);
            
            // Force resume the audio context
            const resumeAudio = async () => {
              try {
                await window.audioContext.resume();
                console.log('Audio context resumed, new state:', window.audioContext.state);
                
                // If we have any audio elements, try to play them
                const audioElements = document.querySelectorAll('audio');
                if (audioElements.length > 0) {
                  console.log('Found audio elements:', audioElements.length);
                  audioElements.forEach(audio => {
                    audio.play().catch(e => console.error('Error playing audio element:', e));
                  });
                }
              } catch (e) {
                console.error('Error resuming audio context:', e);
              }
            };
            
            resumeAudio();
          }
          
          // Try to find and restart any audio nodes in the CABLES patch
          if (CABLES.patch.ops) {
            console.log('Looking for audio ops in CABLES patch');
            for (const opId in CABLES.patch.ops) {
              const op = CABLES.patch.ops[opId];
              // Check if this op has audio-related properties
              if (op.name && (
                  op.name.toLowerCase().includes('audio') || 
                  op.name.toLowerCase().includes('sound') ||
                  op.name.toLowerCase().includes('music')
              )) {
                console.log('Found audio op:', op.name);
                // Try to restart the op
                if (typeof op.onPlay === 'function') {
                  console.log('Calling onPlay for op:', op.name);
                  op.onPlay();
                }
                
                // Try to set any play/active parameters to true
                if (op.params) {
                  for (const paramName in op.params) {
                    if (
                      paramName.toLowerCase().includes('play') || 
                      paramName.toLowerCase().includes('active') ||
                      paramName.toLowerCase().includes('enable')
                    ) {
                      console.log(`Setting ${paramName} to true for op:`, op.name);
                      op.params[paramName] = true;
                    }
                  }
                }
              }
            }
          }
        } else {
          // Pause the patch
          console.log('Pausing CABLES patch');
          
          // Use _paused property if pause() method doesn't exist
          if (typeof CABLES.patch.pause === 'function') {
            CABLES.patch.pause();
            console.log('Called CABLES.patch.pause()');
          } else if (CABLES.patch._paused !== undefined) {
            CABLES.patch._paused = true;
            console.log('Set _paused to true');
          } else {
            console.warn('CABLES.patch does not have pause() method or _paused property');
          }
          
          // Try to stop if there's a stop method
          if (typeof CABLES.patch.stop === 'function') {
            CABLES.patch.stop();
            console.log('Called CABLES.patch.stop()');
          }
          
          // Suspend audio context if it exists
          if (window.audioContext && window.audioContext.state === 'running') {
            console.log('Suspending audio context');
            window.audioContext.suspend();
          }
          
          // Pause any audio elements
          const audioElements = document.querySelectorAll('audio');
          if (audioElements.length > 0) {
            console.log('Pausing audio elements:', audioElements.length);
            audioElements.forEach(audio => audio.pause());
          }
        }
        
        console.log('CABLES patch state:', CABLES.patch._paused ? 'paused' : 'playing');
        if (window.audioContext) {
          console.log('Audio context state:', window.audioContext.state);
        }
      } catch (e) {
        console.error('Error controlling CABLES patch:', e);
      }
    } else {
      console.log('CABLES not initialized yet, will retry');
      // Retry after a short delay if CABLES is not initialized yet
      setTimeout(function() {
        setPlayState(shouldPlay);
      }, 500);
    }
  }
  
  // Listen for messages from the parent window
  window.addEventListener('message', function(event) {
    console.log('Received message:', event.data);
    // Make sure the message is from our parent
    if (event.source === window.parent) {
      if (event.data && event.data.action) {
        if (event.data.action === 'play') {
          setPlayState(true);
        } else if (event.data.action === 'pause') {
          setPlayState(false);
        } else if (event.data.action === 'toggle') {
          setPlayState(!isPlaying);
        }
      }
    }
  });
  
  // Initialize when CABLES is loaded
  document.addEventListener("CABLES.jsLoaded", function() {
    console.log('CABLES.jsLoaded event received');
    // Give CABLES time to initialize
    setTimeout(function() {
      console.log('CABLES initialization complete');
      initialized = true;
      
      // Try to start the patch automatically
      if (window.CABLES && CABLES.patch) {
        console.log('Attempting to start CABLES patch automatically');
        setPlayState(true);
      }
      
      // Add a keyboard event listener directly in the iframe
      window.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
          e.preventDefault();
          setPlayState(!isPlaying);
          // Also notify the parent
          if (window.parent) {
            window.parent.postMessage({ action: 'toggledInIframe', isPlaying: !isPlaying }, '*');
          }
        }
      });
      
      // Add click handler to ensure user interaction for audio context
      const handleUserInteraction = function() {
        console.log('User interaction detected, starting patch');
        setPlayState(true);
        // Remove listeners after first interaction
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      };
      
      // Listen for user interaction to start audio
      document.addEventListener('click', handleUserInteraction, { once: true });
      document.addEventListener('touchstart', handleUserInteraction, { once: true });
    }, 1000);
  });
  
  // Fallback initialization if CABLES.jsLoaded doesn't fire
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (!initialized && window.CABLES && CABLES.patch) {
        console.log('Fallback initialization');
        initialized = true;
      }
    }, 2000);
  });
})(); 