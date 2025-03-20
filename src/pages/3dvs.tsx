import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RefreshCw } from 'lucide-react';

const GoCrazy = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playAttemptRef = useRef(0);

  const handleIframeLoad = () => {
    setIsLoading(false);
    // Initial play state
    setTimeout(() => {
      sendMessageToIframe(isPlaying ? 'play' : 'pause');
    }, 1000);
  };

  // Use useCallback to prevent recreating this function on every render
  const sendMessageToIframe = useCallback((action: string) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      console.log(`Sending ${action} message to iframe`);
      iframeRef.current.contentWindow.postMessage(
        { action },
        '*'
      );
    } else {
      console.warn('Iframe reference not available');
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prevState => {
      const newState = !prevState;
      sendMessageToIframe(newState ? 'play' : 'pause');
      
      // If we're trying to play, increment the attempt counter
      if (newState) {
        playAttemptRef.current += 1;
        console.log(`Play attempt: ${playAttemptRef.current}`);
      } else {
        // Reset the attempt counter when pausing
        playAttemptRef.current = 0;
      }
      
      return newState;
    });
  }, [sendMessageToIframe]);

  // Reload the iframe as a last resort if play doesn't work after multiple attempts
  useEffect(() => {
    if (isPlaying && playAttemptRef.current >= 3) {
      console.log('Multiple play attempts failed, reloading iframe');
      setReloadCount(prev => prev + 1);
      playAttemptRef.current = 0;
    }
  }, [isPlaying]);

  // Force reload the iframe
  const reloadIframe = useCallback(() => {
    setIsLoading(true);
    setReloadCount(prev => prev + 1);
    playAttemptRef.current = 0;
  }, []);

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Make sure the message is from our iframe
      if (event.source === iframeRef.current?.contentWindow) {
        console.log('Received message from iframe:', event.data);
        if (event.data && event.data.action === 'toggledInIframe') {
          setIsPlaying(event.data.isPlaying);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Handle keyboard events (space bar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlayPause]); // Correct dependency

  // Direct method to control audio context - as a fallback
  useEffect(() => {
    const tryDirectAudioControl = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const win = iframeRef.current.contentWindow as any;
          
          // Try to access the audio context
          if (win.audioContext) {
            if (isPlaying && win.audioContext.state === 'suspended') {
              console.log('Directly resuming audio context');
              win.audioContext.resume().then(() => {
                console.log('Audio context resumed successfully');
              }).catch((e: Error) => {
                console.error('Failed to resume audio context:', e);
              });
            } else if (!isPlaying && win.audioContext.state === 'running') {
              console.log('Directly suspending audio context');
              win.audioContext.suspend();
            }
          }
          
          // Try to access CABLES directly
          if (win.CABLES && win.CABLES.patch) {
            if (isPlaying) {
              console.log('Directly playing CABLES patch');
              win.CABLES.patch.play();
            } else {
              console.log('Directly pausing CABLES patch');
              win.CABLES.patch.pause();
            }
          }
        }
      } catch (e) {
        console.error('Error directly controlling audio:', e);
      }
    };

    // Try direct control after a delay to ensure iframe is loaded
    const timer = setTimeout(tryDirectAudioControl, 2000);
    return () => clearTimeout(timer);
  }, [isPlaying]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-20">
          Loading visualization...
        </div>
      )}
      
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 bg-black p-3 rounded-full border border-white/20 hover:bg-gray-900 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={24} className="text-white" />
      </button>
      
      {/* Play/Pause button */}
      <button 
        onClick={togglePlayPause}
        className="fixed top-6 right-6 z-50 bg-black p-3 rounded-full border border-white/20 hover:bg-gray-900 transition-colors"
        aria-label={isPlaying ? "Pause visualization" : "Play visualization"}
      >
        {isPlaying ? (
          <Pause size={24} className="text-white" />
        ) : (
          <Play size={24} className="text-white" />
        )}
      </button>
      
      {/* Reload button */}
      <button 
        onClick={reloadIframe}
        className="fixed top-6 right-20 z-50 bg-black p-3 rounded-full border border-white/20 hover:bg-gray-900 transition-colors"
        aria-label="Reload visualization"
      >
        <RefreshCw size={24} className="text-white" />
      </button>
      
      {/* Iframe containing the visualization */}
      <iframe 
        ref={iframeRef}
        src={`/gocrazy/index.html?reload=${reloadCount}`} 
        className="absolute inset-0 w-full h-full border-0 z-10"
        title="Go Crazy Visualization"
        onLoad={handleIframeLoad}
        allow="autoplay; microphone"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default GoCrazy; 