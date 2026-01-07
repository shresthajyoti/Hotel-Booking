import React, { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    // Hero Animation
    tl.fromTo(headerRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    // Content Animation
    gsap.fromTo(contentRef.current.children,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 80%",
        }
      }
    );

    // Image Reveal
    gsap.fromTo(imageRef.current,
      { scale: 0.95, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: imageRef.current,
          start: "top 70%",
        }
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80" 
            alt="Luxury Hotel" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 ref={headerRef} className="text-6xl md:text-8xl text-white font-['Poppins'] font-light tracking-wide">
            About Us
          </h1>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-[#FFFBF2] px-6 py-24 md:px-20 lg:px-32">
        <div ref={contentRef} className="max-w-7xl mx-auto">
          
          {/* Headline */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-6xl lg:text-7xl leading-tight text-gray-900 mb-8">
              <span className="font-['Playfair_Display'] italic font-medium">Explore your dream stay</span>{' '}
              <span className="font-['Poppins'] font-semibold">into reality.</span>
              <br />
              <span className="font-['Poppins'] font-semibold">Sharing hospitality since 2010.</span>
            </h2>
            
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl leading-relaxed font-['Poppins']">
              At Roomora, we're redefining how travelers experience Nepal by blending smart technology with authentic local expertise. Our mission is to make finding the perfect stay simple, transparent, and personalized for every guest, from the Himalayas to the Terai.
            </p>
          </div>

          {/* Mission & Vision Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 mb-24">
            {/* Mission */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">Mission</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Our mission is to simplify travel planning through trust, transparency, and curated choices. We strive to connect guests with hotels that offer not just a room, but a true taste of Nepali culture and warmth.
              </p>
            </div>

            {/* Vision */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">Vision</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Our vision is to redefine the hospitality landscape in Nepal through innovation, excellence, and accessibility, ensuring that every journey becomes a story worth telling and every stay feels like home.
              </p>
            </div>
          </div>

          {/* Large Bottom Image */}
          <div ref={imageRef} className="w-full h-[500px] md:h-[700px] rounded-[3rem] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80" 
              alt="Modern Luxury Villa at Dusk" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]" 
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;
