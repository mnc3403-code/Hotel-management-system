import React, { useEffect, useState } from 'react'
import { assets, facilityIcons } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import StarRating from '../component/StarRating'
import { supabase } from '../supabase'

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
      <input
        type='checkbox'
        checked={selected}
        onChange={(e) => onChange(e.target.checked, label)}
      />
      <span className='font-light select-none'>{label}</span>
    </label>
  )
}

const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
      <input
        type='radio'
        name='sortOption'
        checked={selected}
        onChange={() => onChange(label)}
      />
      <span className='font-light select-none'>{label}</span>
    </label>
  )
}

const AllRoom = () => {
  const navigate = useNavigate()
  const [openFilters, setOpenFilters] = useState(false)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedSort, setSelectedSort] = useState('')

  const roomtypes = [
    'Single Bed',
    'Double Bed',
    'Suite',
    'Family Suite',
    'Presidential Suite',
  ]

  const priceRanges = [
    '0 to 500',
    '500 to 1000',
    '1000 to 2000',
    '2000 to 3000',
    '3000+',
  ]

  const sortOptions = ['Price: Low to High', 'Price: High to Low', 'Newest First']

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rooms')
      .select('*, hotels(*)')
      .eq('is_available', true)
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      setRooms(data)
    } else {
      // Fallback to dummy data when Supabase has no rooms
      console.warn("No rooms in Supabase, falling back to dummy data.")
      const { roomsDummyData } = await import('../assets/assets')
      const normalizedRooms = roomsDummyData.map(r => ({
        ...r,
        id: r._id,
        room_type: r.roomType,
        price_per_night: r.pricePerNight,
        is_available: r.isAvailable,
        hotel_id: r.hotel?._id,
        hotels: r.hotel ? {
          ...r.hotel,
          id: r.hotel._id,
        } : null,
      }))
      setRooms(normalizedRooms)
    }
    setLoading(false)
  }

  // Apply filters & sort
  const filteredRooms = rooms
    .filter((r) => {
      if (selectedTypes.length === 0) return true
      return selectedTypes.includes(r.room_type)
    })
    .sort((a, b) => {
      if (selectedSort === 'Price: Low to High') return a.price_per_night - b.price_per_night
      if (selectedSort === 'Price: High to Low') return b.price_per_night - a.price_per_night
      return 0 // newest first (already ordered by DB)
    })

  const toggleType = (checked, label) => {
    setSelectedTypes((prev) =>
      checked ? [...prev, label] : prev.filter((t) => t !== label)
    )
  }

  return (
    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>
      {/* Rooms list */}
      <div className='flex-1'>
        <div className='flex flex-col items-start text-left'>
          <h1 className='font-playfair text-4xl md:text-[40px]'>Hotel Rooms</h1>
          <p className='text-base text-gray-500/90 mt-2 max-w-xl'>
            Explore our variety of comfortable and well-appointed hotel rooms designed to provide you with a perfect stay.
          </p>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-24'>
            <div className='flex flex-col items-center gap-3'>
              <div className='w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin' />
              <p className='text-gray-400 text-sm'>Loading rooms...</p>
            </div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className='text-center py-20 mt-8'>
            <p className='text-5xl mb-4'>🏨</p>
            <p className='text-xl text-gray-500'>No rooms available right now.</p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            // Get images
            let images = []
            if (room.images) {
              images = Array.isArray(room.images)
                ? room.images
                : (() => { try { return JSON.parse(room.images) } catch { return [] } })()
            }
            const firstImage = images[0] || null

            return (
              <div
                key={room.id}
                className='flex flex-col md:flex-row items-start justify-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0'
              >
                {/* Room image */}
                <div
                  className='max-h-65 md:w-1/2 rounded-xl shadow-lg overflow-hidden cursor-pointer flex-shrink-0 bg-gray-100'
                  onClick={() => { navigate(`/rooms/${room.id}`); window.scrollTo(0, 0) }}
                >
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={room.room_type}
                      className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                      onError={(e) => {
                        e.target.parentNode.innerHTML = `<div class="w-full h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"><span class="text-6xl">🏨</span></div>`
                      }}
                    />
                  ) : (
                    <div className='w-full h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
                      <span className='text-6xl'>🏨</span>
                    </div>
                  )}
                </div>

                {/* Room info */}
                <div className='md:w-1/2 flex flex-col gap-2'>
                  <p className='text-gray-500'>{room.hotels?.city}</p>
                  <p
                    onClick={() => { navigate(`/rooms/${room.id}`); window.scrollTo(0, 0) }}
                    className='text-gray-800 text-3xl font-playfair cursor-pointer hover:text-orange-600 transition-colors'
                  >
                    {room.hotels?.name}
                  </p>
                  <div className='flex items-center'>
                    <StarRating />
                    <p className='ml-2 text-sm text-gray-500'>200+ Reviews</p>
                  </div>
                  <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                    <img src={assets.locationIcon} alt='location icon' className='w-4 h-4' />
                    <span className='text-gray-500 ml-1'>{room.hotels?.address}</span>
                  </div>

                  {/* Room type badge */}
                  <span className='inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full w-fit border border-blue-100'>
                    {room.room_type}
                  </span>

                  {/* Amenities */}
                  <div className='flex flex-wrap items-center mt-3 mb-6 gap-2'>
                    {(room.amenities || []).map((item, index) => (
                      <div key={index} className='flex items-center gap-2 py-2 px-3 rounded-lg bg-[#f5f5ff]/70'>
                        {facilityIcons[item] && (
                          <img src={facilityIcons[item]} alt={item} className='w-5 h-5' />
                        )}
                        <p className='text-xs'>{item}</p>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <p className='text-xl font-medium text-gray-700'>
                    ${room.price_per_night}
                    <span className='text-sm font-normal text-gray-400'>/night</span>
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Filter sidebar */}
      <div className='bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 lg:mt-16 sticky top-28 flex-shrink-0'>
        <div className={`flex items-center justify-between px-5 py-2.5 lg:border-b border-gray-300 ${openFilters ? 'border-b' : ''}`}>
          <p className='font-semibold'>FILTERS</p>
          <div className='text-xs cursor-pointer'>
            <span onClick={() => setOpenFilters(!openFilters)} className='lg:hidden'>
              {openFilters ? 'HIDE' : 'SHOW'}
            </span>
            <span
              className='hidden lg:block text-red-400 hover:text-red-600'
              onClick={() => { setSelectedTypes([]); setSelectedSort('') }}
            >
              CLEAR ALL
            </span>
          </div>
        </div>

        <div className={`${openFilters ? 'h-auto' : 'h-0 lg:h-auto'} overflow-hidden transition-all duration-700`}>
          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>Room Type</p>
            {roomtypes.map((type, index) => (
              <CheckBox
                key={index}
                label={type}
                selected={selectedTypes.includes(type)}
                onChange={toggleType}
              />
            ))}
          </div>

          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>Price Range</p>
            {priceRanges.map((range, index) => (
              <CheckBox key={index} label={`$${range}`} />
            ))}
          </div>

          <div className='px-5 pt-5 pb-7'>
            <p className='font-medium text-gray-800 pb-2'>Sort By</p>
            {sortOptions.map((option, index) => (
              <RadioButton
                key={index}
                label={option}
                selected={selectedSort === option}
                onChange={setSelectedSort}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllRoom
