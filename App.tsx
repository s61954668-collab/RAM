
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Flame } from 'lucide-react';

const App: React.FC = () => {
  const [inputName, setInputName] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Background Audio Management - Starts on first user interaction
  useEffect(() => {
    let isMounted = true;
    const audioUrl = "https://image2url.com/r2/default/audio/1771060491157-1090b1c8-bffc-4405-bf36-31664fa55ee0.mp3";
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audioRef.current = audio;

    const startMusic = () => {
      if (audioRef.current && isMounted) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              window.removeEventListener('click', startMusic);
              window.removeEventListener('touchstart', startMusic);
              window.removeEventListener('keydown', startMusic);
            })
            .catch(err => {
              console.debug("Autoplay deferred:", err);
            });
        }
      }
    };

    window.addEventListener('click', startMusic);
    window.addEventListener('touchstart', startMusic);
    window.addEventListener('keydown', startMusic);

    const handleResize = () => {
      if (isMounted) {
        setIsKeyboardVisible(window.innerHeight < 550);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.removeEventListener('click', startMusic);
      window.removeEventListener('touchstart', startMusic);
      window.removeEventListener('keydown', startMusic);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Function to sync state from URL Parameter ?n= or #n=
  const syncFromUrl = useCallback(() => {
    try {
      // Check both search params and hash as fallback for blob environments
      const params = new URLSearchParams(window.location.search);
      let name = params.get('n');
      
      if (!name && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        name = hashParams.get('n');
      }

      if (name) {
        try {
          setDisplayName(decodeURIComponent(name));
        } catch (e) {
          setDisplayName(name);
        }
      } else {
        setDisplayName('');
      }
    } catch (e) {
      console.error("URL access error:", e);
    }
  }, []);

  useEffect(() => {
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('hashchange', syncFromUrl);
    };
  }, [syncFromUrl]);

  const handleShare = (e?: React.FormEvent) => {
    if (e) e.preventDefault(); 
    
    const name = inputName.trim();
    if (!name) return;

    try {
      const encodedName = encodeURIComponent(name);
      const queryString = `?n=${encodedName}`;
      
      // Update UI state immediately
      setDisplayName(name);

      // Construct absolute URL safely
      // In blob environments, origin + pathname might be tricky, so we use a fallback
      let baseUrl = window.location.origin + window.location.pathname;
      if (window.location.protocol === 'blob:') {
        // Fallback for special environments
        baseUrl = window.location.href.split('?')[0].split('#')[0];
      }
      
      const shareUrl = `${baseUrl}${queryString}`;

      // Try updating address bar, catch security errors in blob/sandboxed origins
      try {
        if (window.history && typeof window.history.pushState === 'function' && window.location.protocol !== 'blob:') {
          window.history.pushState({ n: name }, '', queryString);
        }
      } catch (historyError) {
        console.debug("History API restricted, using state only", historyError);
      }

      // WhatsApp Message Generation
      const message = `🚩 *महाशिवरात्रीच्या हार्दिक शुभेच्छा* 🚩\n\n${name} यांनी तुमच्यासाठी एक खास शुभेच्छा संदेश पाठवला आहे. खालील लिंकवर क्लिक करून पहा:\n\n${shareUrl}`;
      
      const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappLink, '_blank');
      setInputName('');
    } catch (error) {
      console.error("Share process failed:", error);
      setDisplayName(name); 
    }
  };

  return (
    <div className="app-container">
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: "url('https://res.cloudinary.com/dgxc8kzz8/image/upload/v1771057899/F_hpvx1d.jpg')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        
        <div className={`${isKeyboardVisible ? 'h-[20%]' : 'h-[52%]'} w-full relative`}>
          <div className="absolute left-6 bottom-4 animate-sway opacity-60">
            <div className="bg-orange-900 w-5 h-2.5 rounded-b-full relative">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-orange-400 flame-glow">
                <Flame size={18} fill="#ff8c00" strokeWidth={1} />
              </div>
            </div>
          </div>
          <div className="absolute right-6 bottom-4 animate-sway [animation-delay:-1.2s] opacity-60">
            <div className="bg-orange-900 w-5 h-2.5 rounded-b-full relative">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-orange-400 flame-glow">
                <Flame size={18} fill="#ff8c00" strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col items-center justify-center px-6 text-center">
          <div key={displayName} className="animate-float">
            <h2 className="marathi-font leading-tight font-black">
              {displayName ? (
                <>
                  <span className="text-orange-950 text-4xl block mb-3 drop-shadow-xl font-bold tracking-wide">
                    {displayName}
                  </span>
                  <span className="text-gradient text-2xl sm:text-3xl block uppercase tracking-tight leading-relaxed">
                    यांच्याकडून महाशिवरात्रीच्या <br/> तुम्हाला हार्दिक हार्दिक शुभेच्छा
                  </span>
                </>
              ) : (
                <span className="text-gradient text-3xl sm:text-4xl block leading-normal drop-shadow-lg">
                  तुम्हा व तुमच्या परिवारास <br/> 
                  महाशिवरात्रीच्या हार्दिक हार्दिक शुभेच्छा
                </span>
              )}
            </h2>
          </div>
        </div>

        <div className={`${isKeyboardVisible ? 'pb-2' : 'pb-14'} w-full px-8 flex flex-col items-center gap-3 transition-all duration-300`}>
          <div className="w-full max-w-[280px] flex flex-col gap-2.5">
            <p className="text-cyan-300 text-[10px] font-bold text-center uppercase tracking-[0.25em] drop-shadow-md animate-pulse">
              तुमचे नाव टाकून शुभेच्छा पाठवा 👇
            </p>
            
            <form 
              onSubmit={handleShare} 
              className="flex items-center gap-2 bg-black/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl w-full"
            >
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="तुमचे नाव..."
                className="flex-1 min-w-0 bg-white/90 border-none outline-none px-4 py-3 rounded-xl text-slate-900 font-bold marathi-font text-xl placeholder:font-normal placeholder:text-slate-400"
                maxLength={18}
                autoComplete="off"
              />
              <button
                type="submit"
                className="bg-gradient-to-br from-orange-500 via-red-600 to-red-800 text-white p-4 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-xl border border-white/10 shrink-0"
                aria-label="Share Link"
              >
                <Send size={22} fill="currentColor" stroke="none" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
