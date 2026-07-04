import React from 'react';

const Experiences = () => {
  return (
    <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32 min-h-screen bg-[#FDFBF7]'>
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-playfair text-[#1A1A1A] mb-4">Curated Experiences</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Immerse yourself in our destination with activities and adventures designed exclusively for our guests.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="h-64 bg-gray-200">
            <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80" alt="Outdoor Games" className="w-full h-full object-cover"/>
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-playfair mb-3">Outdoor Games & Adventure</h3>
            <p className="text-gray-600">Step outside and engage in our wide array of outdoor activities. From lawn tennis to hiking trails, there's always an adventure waiting for you under the open sky.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="h-64 bg-gray-200">
            <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80" alt="Coffee Corner" className="w-full h-full object-cover"/>
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-playfair mb-3">The Coffee Corner</h3>
            <p className="text-gray-600">Start your morning right or take a cozy afternoon break at our artisan coffee corner. Enjoy freshly roasted blends, exquisite lattes, and delicate pastries.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="h-64 bg-gray-200">
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" alt="Health Corner" className="w-full h-full object-cover"/>
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-playfair mb-3">Health & Wellness Corner</h3>
            <p className="text-gray-600">Stay fit and balanced during your stay. Our dedicated health corner features a state-of-the-art gym, daily yoga sessions, and nutritious organic smoothies.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experiences;
