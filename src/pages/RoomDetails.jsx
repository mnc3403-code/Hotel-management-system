import React from 'react'
import { useParams } from 'react-router-dom';
import { assets, roomsDummyData, facilityIcons, roomCommonData } from '../assets/assets';
import horizonLogo from '../assets/horizonLogo.png';
import StarRating from '../component/StarRating';

const RoomDetails  = () => {
    const { id } = useParams();
    const room = roomsDummyData.find((room) => room._id === id);
    const [selectedImage, setSelectedImage] = React.useState(null);
    
    const mainImage = selectedImage || (room ? room.images[0] : null);

    return room && (
      <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
        {/*room details section */}
        <div className='flex flex-col md:flex-row items-center gap-2'>
            <h1 className='text-3xl md:text-4xl font-playfair'>{room.hotel.name}<span className='font-inner text-sm'>{room.roomType}</span></h1>
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
        <span>{room.hotel.address}</span>
      </div>

      {/* room images */}
      <div className='flex flex-col lg:flex-row items-start gap-6 mt-6'>
        <div className='lg:w-1/2 w-full'>
          <img src={mainImage} alt="Room image" className='w-full rounded-xl shadow-lg object-cover '/>
        </div>
        <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
          {room?.images.length > 1 && room.images.map((image, index) => (
            <img onClick={()=>setSelectedImage(image)} 
            key={index} src={image} alt="Room image" className={`w-full rounded-xl shadow-lg object-cover cursor-pointer ${mainImage === image ? 'outline-3 outline-orange-500' : ''}`}/>))}
        </div>
      </div>
      {/*Room Highlights */}
      <div className='flex flex-col md:flex-row md:justify-between mt-10'>
        <div className='flex flex-col'>
          <h1 className='text-2xl md:text-4xl font-playfair'>Step into a completely new world of luxury</h1>
          <div className='flex items-center gap-2 mt-4'>
            {room.amenities.map((item, index) => (
              <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
                  <img src={facilityIcons[item]} alt={item} className='w-5 h-5'/>
                <p className='text-sm '>{item}</p>
              </div>
            ))}
          </div>
        </div>
        {/* room price */}
        <p className='text-2xl md:text-4xl font-playfair'>${room.pricePerNight}/night</p>
      </div>
      {/*CheckIn CheckOut Form*/}
      <form className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'>
        <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500'>
            <div className='flex flex-col'>
                <label htmlFor="checkInDate" className='font-medium'>Check-In</label>
                <input type="date" id='checkInDate' placeholder='Check-In' className='w-full rounded border border-gray-300  px-3 py-2 mt-1.5 outline-none'required/>
            </div>
            <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
           <div className='flex flex-col'>
                <label htmlFor="checkOutDate" className='font-medium'>Check-Out</label>
                <input type="date" id='checkOutDate' placeholder='Check-Out' className='w-full rounded border border-gray-300  px-3 py-2 mt-1.5 outline-none'required/>
            </div>
              <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
             <div className='flex flex-col'>
                <label htmlFor="guests" className='font-medium'>Guests</label>
                <input type="number" id='guests' placeholder='0' className='max-w-20 rounded border border-gray-300  px-3 py-2 mt-1.5 outline-none'required/>
            </div>
        </div>
        <button type='submit' className='bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer '>
          Check Availability
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
            <p className='text-xl md:text-2xl font-playfair '>Hosted by {room.hotel.name}</p>
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
              Contact Host
           </button>
        </div>
      </div>
    </div>
  )
}
export default RoomDetails