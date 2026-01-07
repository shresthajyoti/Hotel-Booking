import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Preloader = ({ onComplete }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const subTextRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 1,
          ease: "power4.inOut",
          onComplete: onComplete
        });
      }
    });

    const letters = textRef.current.children;

    // Initial State
    gsap.set(letters, { opacity: 0, y: 20, rotate: 5 });
    gsap.set(subTextRef.current, { opacity: 0, letterSpacing: "0.2em" });

    // Signature Animation
    tl.to(letters, {
      opacity: 1,
      y: 0,
      rotate: 0,
      duration: 1,
      stagger: 0.1,
      ease: "back.out(1.7)"
    })
    // Subtext Fade In & Spacing
    .to(subTextRef.current, {
      opacity: 1,
      letterSpacing: "0.5em",
      duration: 1.5,
      ease: "power2.out"
    }, "-=0.5")
    // Hold
    .to({}, { duration: 1 });

  }, [onComplete]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-100 bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 text-center">
        {/* Signature Text */}
        <h1 ref={textRef} className="text-white text-7xl md:text-9xl font-['Great_Vibes'] mb-6 overflow-hidden p-4">
          {"Roomora".split("").map((char, index) => (
            <span key={index} className="inline-block origin-bottom">
              {char}
            </span>
          ))}
        </h1>
        
        {/* Tagline */}
        <p ref={subTextRef} className="text-white/60 text-sm md:text-base font-['Poppins'] uppercase tracking-widest">
          Experience Luxury
        </p>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default Preloader;
