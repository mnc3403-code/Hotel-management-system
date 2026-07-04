import React from 'react';

const About = () => {
  return (
    <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32 min-h-screen bg-[#FDFBF7]'>
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-playfair text-[#1A1A1A] mb-4">About Us</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Discover the story behind our luxury hotel chain and our commitment to providing unforgettable experiences.</p>
      </div>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-playfair mb-4">Our Heritage</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">Founded with a vision to redefine hospitality, we have been welcoming guests from around the globe for over a decade. Our properties blend local culture with world-class amenities to create a truly unique stay.</p>
        
        <h2 className="text-2xl font-playfair mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed">To deliver exceptional service, unparalleled comfort, and authentic local experiences that inspire and rejuvenate our guests, making every stay a cherished memory.</p>
      </div>
    </div>
  );
};

export default About;
