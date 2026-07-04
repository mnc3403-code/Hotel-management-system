import React, { useEffect, useState } from 'react'
import Title from '../component/Title'
import { assets, resolveRoomImage } from '../assets/assets'
import { supabase } from '../supabase'
import { useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const { user } = useUser()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const email = user?.primaryEmailAddress?.emailAddress
      if (!email) return

      // Get the Supabase user record
      const { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (!dbUser) {
        setLoading(false)
        return
      }

      // Fetch bookings with room + hotel joined
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          check_in_date,
          check_out_date,
          total_price,
          guests,
          is_paid,
          payment_status,
          payment_method,
          created_at,
          rooms (
            id,
            room_type,
            price_per_night,
            images,
            amenities
          ),
          hotels (
            id,
            name,
            address,
            city,
            contact
          )
        `)
        .eq('user_id', dbUser.id)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to load bookings')
        console.error(error)
      } else {
        setBookings(data || [])
      }
    } catch (err) {
      console.error('Booking fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
        <Title title='My Bookings' subtitle='View and manage your upcoming, current and past bookings.' align="left" />
        <div className='flex items-center justify-center py-24'>
          <div className='flex flex-col items-center gap-3'>
            <div className='w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin' />
            <p className='text-gray-400 text-sm'>Loading your bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='py-28 md:pb-35 mb:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
      <Title title='My Bookings' subtitle='View and manage your upcoming, current and past bookings.' align="left" />

      {bookings.length === 0 ? (
        <div className='text-center py-20 mt-8'>
          <p className='text-6xl mb-4'>🏨</p>
          <p className='text-2xl font-playfair text-gray-700 mb-2'>No bookings yet</p>
          <p className='text-gray-400'>Your future bookings will appear here.</p>
        </div>
      ) : (
        <div>
          {/* Table header */}
          <div className='hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3'>
            <div>HOTELS</div>
            <div>Date &amp; timings</div>
            <div>Payment</div>
          </div>

          {bookings.map((booking) => {
            // Get room images from Supabase (stored as array or JSON array string)
            let roomImages = []
            if (booking.rooms?.images) {
              if (Array.isArray(booking.rooms.images)) {
                roomImages = booking.rooms.images
              } else if (typeof booking.rooms.images === 'string') {
                try { roomImages = JSON.parse(booking.rooms.images) } catch { roomImages = [] }
              }
            }
            const firstImage = resolveRoomImage(roomImages[0]) || null

            return (
              <div
                key={booking.id}
                className='grid grid-cols-1 md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6'
              >
                {/* Hotel + Room details */}
                <div className='flex flex-col md:flex-row gap-4'>
                  {/* Room Image */}
                  <div className='w-full md:w-44 h-36 md:h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-md bg-gray-100'>
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={booking.hotels?.name || 'Room'}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"><span class="text-4xl">🏨</span></div>`
                        }}
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
                        <span className='text-4xl'>🏨</span>
                      </div>
                    )}
                  </div>

                  {/* Hotel info */}
                  <div className='flex flex-col gap-1.5'>
                    <p className='font-playfair text-2xl text-gray-900'>
                      {booking.hotels?.name || 'Hotel'}
                      <span className='font-inter text-sm text-gray-500 ml-1'>
                        ({booking.rooms?.room_type || 'Room'})
                      </span>
                    </p>

                    {booking.hotels?.address && (
                      <div className='flex items-center gap-1 text-sm text-gray-500'>
                        <img src={assets.locationIcon} alt="location" className='w-4 h-4' />
                        <span>{booking.hotels.address}</span>
                      </div>
                    )}

                    <div className='flex items-center gap-1 text-sm text-gray-500'>
                      <img src={assets.guestsIcon} alt="guests" className='w-4 h-4' />
                      <span>{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
                    </div>

                    <p className='font-medium text-gray-800 mt-1'>
                      Total: <span className='text-orange-600'>${booking.total_price?.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* Date & time details */}
                <div className='flex flex-row md:items-center md:gap-12 mt-3 gap-8'>
                  <div>
                    <p className='font-medium text-gray-700'>Check-In</p>
                    <p className='text-sm text-gray-500 mt-0.5'>
                      {new Date(booking.check_in_date).toDateString()}
                    </p>
                  </div>
                  <div>
                    <p className='font-medium text-gray-700'>Check-Out</p>
                    <p className='text-sm text-gray-500 mt-0.5'>
                      {new Date(booking.check_out_date).toDateString()}
                    </p>
                  </div>
                </div>

                {/* Payment details */}
                <div className='flex flex-col items-start justify-center pt-3'>
                  <div className='flex items-center gap-2'>
                    <div className={`h-3 w-3 rounded-full ${booking.is_paid ? 'bg-green-500' : 'bg-amber-400'}`} />
                    <p className={`text-sm font-medium ${booking.is_paid ? 'text-green-600' : 'text-amber-600'}`}>
                      {booking.is_paid ? 'Paid' : 'Unpaid'}
                    </p>
                  </div>

                  {booking.payment_method && (
                    <p className='text-xs text-gray-400 mt-1'>{booking.payment_method}</p>
                  )}

                  {!booking.is_paid && (
                    <button className='px-4 py-1.5 mt-4 text-xs border border-gray-400 rounded-full hover:bg-gray-50 transition-all cursor-pointer'>
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyBookings