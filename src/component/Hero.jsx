import React, { useState, useEffect } from 'react'
import { assets, cities } from '../assets/assets'

const Hero = () => {
  const [currentImage] = useState(0);
  
  // Luxury Hero backgrounds
  const bgImages = [
    '/src/assets/heroImage.png',
    assets.roomImg1,
    assets.roomImg2,
    assets.roomImg3,
  ];

  useEffect(() => {
    // const intervalId = setInterval(() => {
    //   setCurrentImage((prev) => (prev + 1) % bgImages.length);
    // }, 6000); // Change image every 6 seconds for a slow, premium feel
    // return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white h-screen overflow-hidden">
      
      {/* Dynamic Background Image Slider */}
      {bgImages.map((img, index) => (
        <div 
          key={index}
          className={`absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center transition-opacity duration-2000 ease-in-out ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      
      {/* Elegant Dark Overlay */}
      <div className="absolute inset-0 bg-black/40"></div> 

      {/* Hero Foreground Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto pt-20">
        
        <p className='border border-white/50 backdrop-blur-md px-6 py-1.5 rounded-full inline-block text-xs md:text-sm tracking-[0.2em] uppercase font-light text-white/90'>
          The Zenith of Comfort
        </p>
        
        <h1 className='font-playfair text-4xl md:text-6xl lg:text-[76px] lg:leading-[1.1] font-normal max-w-4xl mt-8 drop-shadow-2xl text-[#FDFBF7]'>
          Experience Absolute Luxury & Serenity.
        </h1>
        
        <p className='max-w-2xl mt-6 text-base md:text-lg text-white/80 font-light tracking-wide drop-shadow-md'>
          Start your journey with us and chase the horizon today. Unveil a world of bespoke elegance tailored just for you.
        </p>

        {/* Ultra-Premium Glassmorphism Search Form */}
        <form className='glass-panel rounded-2xl px-8 py-6 mt-14 flex flex-col md:flex-row max-md:items-start md:items-end gap-6 max-md:mx-auto w-full'>
          
          <div className="flex-1 w-full">
              <div className='flex items-center gap-2 mb-2'>
                  <img src={assets.locationIcon} alt="" className='h-4 opacity-70 grayscale'/>
                  <label htmlFor="destinationInput" className="font-playfair text-sm tracking-widest uppercase text-gray-600 font-semibold">Destination</label>
                  <datalist id='destinations'>
                    {cities.map((city, i) => (
                      <option key={i} value={city} />
                    ))}
                  </datalist>
              </div>
              <input list='destinations' id="destinationInput" type="text" className="w-full bg-transparent border-b border-gray-300 pb-2 text-lg text-gray-800 outline-none placeholder-gray-400 focus:border-[#C8A97E] transition-colors" placeholder="Where to?" required />
          </div>

          <div className="flex-1 w-full">
              <div className='flex items-center gap-2 mb-2'>
                    <img src={assets.calenderIcon} alt="" className='h-4 opacity-70 grayscale'/>
                  <label htmlFor="checkIn" className="font-playfair text-sm tracking-widest uppercase text-gray-600 font-semibold">Check In</label>
              </div>
              <input id="checkIn" type="date" className="w-full bg-transparent border-b border-gray-300 pb-2 text-lg text-gray-800 outline-none focus:border-[#C8A97E] transition-colors" />
          </div>

          <div className="flex-1 w-full">
              <div className='flex items-center gap-2 mb-2'>
                  <img src={assets.calenderIcon} alt="" className='h-4 opacity-70 grayscale'/>
                  <label htmlFor="checkOut" className="font-playfair text-sm tracking-widest uppercase text-gray-600 font-semibold">Check Out</label>
              </div>
              <input id="checkOut" type="date" className="w-full bg-transparent border-b border-gray-300 pb-2 text-lg text-gray-800 outline-none focus:border-[#C8A97E] transition-colors" />
          </div>

          <div className="w-full md:w-32">
              <div className='flex items-center gap-2 mb-2'>
                  <img src={assets.guestsIcon} alt="" className='h-4 opacity-70 grayscale'/>
                  <label htmlFor="guests" className="font-playfair text-sm tracking-widest uppercase text-gray-600 font-semibold">Guests</label>
              </div>
              <input min={1} max={4} id="guests" type="number" className="w-full bg-transparent border-b border-gray-300 pb-2 text-lg text-gray-800 outline-none focus:border-[#C8A97E] transition-colors" placeholder="0" />
          </div>

          <button className='flex mt-4 md:mt-0 items-center justify-center gap-2 rounded-xl bg-[#C8A97E] hover:bg-[#D4AF37] transition-all duration-500 py-4 px-10 text-white cursor-pointer max-md:w-full shadow-lg hover:shadow-xl' >
              <span className="font-semibold tracking-wide">Search</span>
              <img src={assets.searchIcon} alt="searchIcon" className='h-5 invert'/>
          </button>
        </form>

      </div>
    </div>
  )
}

export default Hero