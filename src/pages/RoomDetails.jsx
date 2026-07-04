import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { assets, facilityIcons, roomCommonData, roomsDummyData, resolveRoomImage } from '../assets/assets';
import horizonLogo from '../assets/horizonLogo.png';
import StarRating from '../component/StarRating';
import { supabase } from '../supabase';
import { useUser, useClerk } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const RoomDetails  = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);
    const { user } = useUser();
    const { openSignIn } = useClerk();

    useEffect(() => {
      const fetchRoom = async () => {
        setLoading(true);
        // First try to fetch from Supabase
        const { data, error } = await supabase
          .from('rooms')
          .select('*, hotels(*)')
          .eq('id', id)
          .single();
          
        if (error || !data) {
          console.warn("Room not found in Supabase. Falling back to dummy data.");
          // Fallback to dummy data
          const fallbackRoom = roomsDummyData.find((r) => r._id === id);
          if (fallbackRoom) {
            // Normalize dummy data to look like Supabase data
            setRoom({
              ...fallbackRoom,
              id: fallbackRoom._id,
              hotel_id: fallbackRoom.hotel?._id,
              hotels: fallbackRoom.hotel ? {
                ...fallbackRoom.hotel,
                id: fallbackRoom.hotel._id,
              } : null,
              room_type: fallbackRoom.roomType,
              price_per_night: fallbackRoom.pricePerNight
            });
          }
        } else {
          setRoom(data);
        }
        setLoading(false);
      };
      
      fetchRoom();
    }, [id]);

    const mainImage = resolveRoomImage(selectedImage) || (room?.images ? resolveRoomImage(room.images[0]) : null);

    const handleInitialBooking = (e) => {
      e.preventDefault();
      if (!user) {
        toast.error("Please log in to book a room");
        return openSignIn();
      }
      
      const formData = new FormData(e.target);
      const checkInDate = formData.get('checkInDate');
      const checkOutDate = formData.get('checkOutDate');
      const guests = formData.get('guests');
      
      if (!checkInDate || !checkOutDate) {
        return toast.error("Please select both check-in and check-out dates");
      }
      
      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        return toast.error("Check-out date must be after check-in date");
      }
      
      setBookingDetails({ checkInDate, checkOutDate, guests });
      setShowPaymentModal(true);
    };

    const confirmBooking = async (paymentMethod, isPaid, paymentStatus) => {
      setShowPaymentModal(false);
      const email = user.primaryEmailAddress?.emailAddress;
      const { data: dbUser } = await supabase.from('users').select('id').eq('email', email).single();

      if (!dbUser) {
         return toast.error("User profile not synced yet, please try again in a moment.");
      }

      const days = (new Date(bookingDetails.checkOutDate) - new Date(bookingDetails.checkInDate)) / (1000 * 60 * 60 * 24);
      const totalPrice = days * room.price_per_night;

      const { data: insertedBooking, error } = await supabase.from('bookings').insert({
        user_id: dbUser.id,
        room_id: room.id,
        hotel_id: room.hotel_id,
        check_in_date: bookingDetails.checkInDate,
        check_out_date: bookingDetails.checkOutDate,
        total_price: totalPrice,
        guests: parseInt(bookingDetails.guests),
        payment_method: paymentMethod,
        is_paid: isPaid,
        payment_status: paymentStatus
      }).select().single();

      if (error) {
        console.error("Booking error:", error);
        toast.error("Failed to book room");
      } else {
        toast.success('Booking confirmed successfully!');
        navigate('/booking-confirmation', {
          state: {
            booking: {
              id: insertedBooking.id,
              hotel_name: room.hotels?.name || 'Hotel',
              hotel_address: room.hotels?.address || '',
              room_type: room.room_type || 'Room',
              room_image: resolveRoomImage(room.images?.[0]) || null,
              check_in_date: bookingDetails.checkInDate,
              check_out_date: bookingDetails.checkOutDate,
              guests: parseInt(bookingDetails.guests),
              total_price: totalPrice,
              price_per_night: room.price_per_night,
              payment_method: paymentMethod,
              is_paid: isPaid,
              payment_status: paymentStatus,
            }
          }
        });
      }
    };

    if (loading) return <div className='py-28 md:py-35 px-4 text-center'>Loading room details...</div>;
    if (!room) return <div className='py-28 md:py-35 px-4 text-center'>Room not found.</div>;

    return (
      <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32 relative'>
        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
              <h2 className="text-2xl font-playfair mb-4 text-center">Select Payment Method</h2>
              <p className="text-gray-500 mb-6 text-center text-sm">Choose how you would like to pay for your stay.</p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => confirmBooking('Credit Card (Fake)', true, 'paid')}
                  className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                  Pay Now (Mock Payment)
                </button>
                <button 
                  onClick={() => confirmBooking('Pay at Hotel', false, 'unpaid')}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Pay at Hotel
                </button>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-600">Cancel</button>
            </div>
          </div>
        )}

        {/*room details section */}
        <div className='flex flex-col md:flex-row items-center gap-2'>
            <h1 className='text-3xl md:text-4xl font-playfair'>{room.hotels?.name}<span className='font-inner text-sm ml-2'>{room.room_type}</span></h1>
            <p className='text-xs font-inner py-1.5 px-3 text-white bg-orange-500 rounded-full'>20% off</p>
        </div>

        {/* room rating*/}
        <div className='flex items-center gap-1 mt-2'>
          <StarRating/>
          <p className='ml-2'>200+ Reviews</p>
        </div>

      {/* room Address */}
      <div className='flex items-center gap-1 text-gray-500 mt-2'>
        <img src={assets.locationIcon} alt="location icon" />
        <span>{room.hotels?.address}</span>
      </div>

      {/* room images */}
      <div className='flex flex-col lg:flex-row items-start gap-6 mt-6'>
        <div className='lg:w-1/2 w-full'>
          <img src={mainImage} alt="Room image" className='w-full rounded-xl shadow-lg object-cover '/>
        </div>
        <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
          {room?.images?.length > 1 && room.images.map((image, index) => (
            <img onClick={()=>setSelectedImage(image)} 
            key={index} src={resolveRoomImage(image)} alt="Room image" className={`w-full rounded-xl shadow-lg object-cover cursor-pointer ${mainImage === resolveRoomImage(image) ? 'outline-3 outline-orange-500' : ''}`}/>))}
        </div>
      </div>
      {/*Room Highlights */}
      <div className='flex flex-col md:flex-row md:justify-between mt-10'>
        <div className='flex flex-col'>
          <h1 className='text-2xl md:text-4xl font-playfair'>Step into a completely new world of luxury</h1>
          <div className='flex items-center gap-2 mt-4'>
            {room.amenities?.map((item, index) => (
              <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
                  <img src={facilityIcons[item]} alt={item} className='w-5 h-5'/>
                <p className='text-sm '>{item}</p>
              </div>
            ))}
          </div>
        </div>
        {/* room price */}
        <p className='text-2xl md:text-4xl font-playfair'>${room.price_per_night}/night</p>
      </div>
      {/*CheckIn CheckOut Form*/}
      <form onSubmit={handleInitialBooking} className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'>
        <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500'>
            <div className='flex flex-col'>
                <label htmlFor="checkInDate" className='font-medium'>Check-In</label>
                <input type="date" id='checkInDate' name="checkInDate" placeholder='Check-In' className='w-full rounded border border-gray-300  px-3 py-2 mt-1.5 outline-none' required/>
            </div>
            <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
           <div className='flex flex-col'>
                <label htmlFor="checkOutDate" className='font-medium'>Check-Out</label>
                <input type="date" id='checkOutDate' name="checkOutDate" placeholder='Check-Out' className='w-full rounded border border-gray-300  px-3 py-2 mt-1.5 outline-none' required/>
            </div>
              <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
             <div className='flex flex-col'>
                <label htmlFor="guests" className='font-medium'>Guests</label>
                <input type="number" id='guests' name="guests" min="1" placeholder='0' className='max-w-20 rounded border border-gray-300  px-3 py-2 mt-1.5 outline-none' required/>
            </div>
        </div>
        <button type='submit' className='bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer '>
          Book Now
        </button>
      </form>
      {/*common specification*/}
      <div className='mt-25 space-y-4'>
        {roomCommonData.map((spec, index) => (
          <div key={index} className='flex items-start gap-2'>
            <img src={spec.icon} alt={`${spec.title}-icon`} className='w-6.5' />
            <div>
              <p className='text-base'>{spec.title}</p>
              <p className='text-sm text-gray-500'>{spec.description}</p>
            </div>
            </div>
       ))}
      </div>

      <div className='max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500 font-playfair'>
        <p> Enjoy a cozy two-bedroom apartment with a true city vibe. Ground-floor units are assigned based on availability. The listed price covers two guests—simply select your total number of guests to view the exact price for your stay.</p>
      </div>
       {/*hosted by */}
      <div >
        {/* Soft elegant glow effects */}
        <div className='absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl'></div>
        <div className='absolute bottom-0 left-0 w-32 h-32 bg-amber-200/5 rounded-full blur-2xl'></div>
        
        <div className='flex items-center gap-4 relative z-10'>
          <div className='h-14 w-14 md:h-16 md:w-16 bg-linear-to-tr from-amber-400 to-yellow-200 rounded-full p-0.5 border-2 border-[#111111]'>
             <img src={horizonLogo} alt="Host" className='h-full w-full rounded-full object-cover border-2 border-[#111111]' />
          </div>
          <div>
            <p className='text-xl md:text-2xl font-playfair '>Hosted by {room.hotels?.name}</p>
            <div className='flex items-center mt-1.5 gap-2 text-xs text-gray-300'>
              <div className='flex items-center bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/5'>
                <StarRating/>
                <span className='ml-1 text-white font-medium'>4.9</span>
              </div>
              <p className='font-light tracking-wide'>200+ Premium Reviews</p>
            </div>
          </div>
        </div>
        
        <div className='relative z-10 w-full md:w-auto mt-4 md:mt-0'>
           <button className='px-6 py-2.5 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white rounded-lg shadow-[0_4px_15px_rgba(245,158,11,0.3)] transition-all font-medium text-sm w-full tracking-wide group flex items-center justify-center gap-2'>
              Contact Host: {room.hotels?.contact || '+123 456 7890'}
           </button>
        </div>
      </div>
    </div>
  )
}
export default RoomDetails