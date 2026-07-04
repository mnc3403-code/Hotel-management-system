import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useUser, useClerk } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const offers = [
  {
    id: 1,
    title: 'Summer Escape Package',
    description: 'Enjoy a complimentary night and daily breakfast',
    longDescription: 'Escape to paradise with our Summer Escape Package. This exclusive offer includes a complimentary night when you book 3 or more nights, daily gourmet breakfast for two, and access to all premium resort facilities.',
    discount: '25% off',
    expires: 'Aug 31',
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Romantic Getaway',
    description: 'Special couples package including spa treatment',
    longDescription: 'Celebrate love with our Romantic Getaway. Enjoy a beautifully decorated suite, a complimentary 60-minute couples massage at our award-winning spa, and a romantic candlelit dinner by the beach.',
    discount: '20% off',
    expires: 'Sep 20',
    image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'Luxury Retreat',
    description: 'Book 60 days in advance and save on your stay at any of our luxury properties worldwide.',
    longDescription: 'Plan ahead and indulge in ultimate luxury. By booking 60 days in advance, you secure our best rates along with VIP check-in, late check-out, and a dedicated concierge for your entire stay.',
    discount: '30% off',
    expires: 'Sep 25',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  }
];

const ExclusiveOffers = () => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(200);
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  const handleViewOffer = (offer) => {
    setSelectedOffer(offer);
  };

  const handleProceedToPayment = () => {
    if (!user) {
      toast.error("Please log in to claim an offer");
      return openSignIn();
    }
    setShowPaymentModal(true);
  };

  const confirmPayment = async (paymentMethod, isPaid, paymentStatus) => {
    setShowPaymentModal(false);
    
    const email = user.primaryEmailAddress?.emailAddress;
    const { data: dbUser } = await supabase.from('users').select('id').eq('email', email).single();

    if (!dbUser) {
       return toast.error("User profile not synced yet, please try again in a moment.");
    }

    // Insert into a new offer_purchases table
    const { error } = await supabase.from('offer_purchases').insert({
      user_id: dbUser.id,
      offer_title: selectedOffer.title,
      price: selectedPrice,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      is_paid: isPaid
    });

    if (error) {
      console.error("Payment error:", error);
      // If table doesn't exist, show a helpful message
      if (error.code === '42P01') {
        toast.error("Database table 'offer_purchases' is missing. Please create it in Supabase.");
      } else {
        toast.error("Failed to process payment");
      }
    } else {
      toast.success(`Offer Claimed! Payment Status: ${paymentStatus}`);
      setSelectedOffer(null);
      // Navigate to somewhere like my-bookings or a new my-offers page
      navigate('/my-bookings');
    }
  };

  return (
    <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32 min-h-screen bg-[#FDFBF7] relative'>
      
      {/* Offer Details Modal */}
      {selectedOffer && !showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 h-64 md:h-auto">
               <img src={selectedOffer.image} alt={selectedOffer.title} className="w-full h-full object-cover" />
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-3 py-1 rounded-full mb-4 self-start">
                {selectedOffer.discount}
              </span>
              <h2 className="text-3xl font-playfair mb-4">{selectedOffer.title}</h2>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">{selectedOffer.longDescription}</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Package Tier</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-orange-500"
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(Number(e.target.value))}
                >
                  <option value={200}>Standard Package - $200</option>
                  <option value={400}>Deluxe Package - $400</option>
                  <option value={600}>Premium Package - $600</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleProceedToPayment}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                  Claim Offer
                </button>
                <button 
                  onClick={() => setSelectedOffer(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-playfair mb-2 text-center">Checkout</h2>
            <p className="text-gray-500 mb-6 text-center text-sm">You are purchasing the {selectedOffer.title} for ${selectedPrice}.</p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => confirmPayment('Credit Card (Fake)', true, 'paid')}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                Pay Now (Mock Payment)
              </button>
              <button 
                onClick={() => confirmPayment('Pay at Hotel', false, 'unpaid')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Pay Later
              </button>
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-playfair text-[#1A1A1A] mb-4">Exclusive Offers</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Discover our curated selection of special packages and limited-time promotions designed to make your stay unforgettable.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {offers.map((offer) => (
          <div 
            key={offer.id}
            className="group relative h-96 rounded-2xl overflow-hidden shadow-lg transition-transform duration-500 hover:-translate-y-2"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={offer.image} 
                alt={offer.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-between text-white z-10">
              {/* Top - Discount Badge */}
              <div>
                <span className="inline-block bg-white text-gray-900 text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm">
                  {offer.discount}
                </span>
              </div>

              {/* Bottom - Details */}
              <div>
                <h3 className="text-2xl font-playfair mb-2">{offer.title}</h3>
                <p className="text-gray-200 text-sm mb-4 line-clamp-2">{offer.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Expires: {offer.expires}</span>
                  <button 
                    onClick={() => handleViewOffer(offer)}
                    className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:text-[#C8A97E] transition-colors cursor-pointer"
                  >
                    VIEW OFFER
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExclusiveOffers;
