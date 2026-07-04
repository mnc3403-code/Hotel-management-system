import React, { useState, useEffect } from 'react'
import Title from '../../component/Title'
import { supabase } from '../../supabase'
import { useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const ListRoom = () => {
  const { user } = useUser()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  useEffect(() => {
    if (user) fetchRooms()
  }, [user])

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const email = user?.primaryEmailAddress?.emailAddress
      if (!email) return

      const { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (!dbUser) return

      const { data: hotel } = await supabase
        .from('hotels')
        .select('id')
        .eq('owner_id', dbUser.id)
        .single()

      if (!hotel) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', hotel.id)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to load rooms')
        console.error(error)
      } else {
        setRooms(data || [])
      }
    } catch (err) {
      console.error('Fetch rooms error:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (roomId, current) => {
    setToggling(roomId)
    const { error } = await supabase
      .from('rooms')
      .update({ is_available: !current })
      .eq('id', roomId)

    if (error) {
      toast.error('Failed to update room status')
      console.error(error)
    } else {
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, is_available: !current } : r))
      )
      toast.success(`Room marked as ${!current ? 'Available' : 'Unavailable'}`)
    }
    setToggling(null)
  }

  if (loading) {
    return (
      <div>
        <Title align="left" font="outfit" title="Room List" subtitle="View, edit or manage all available rooms." />
        <div className='flex items-center justify-center py-24'>
          <div className='flex flex-col items-center gap-3'>
            <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin' />
            <p className='text-gray-400 text-sm'>Loading rooms...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Room List"
        subtitle="View, edit or manage all available rooms. Keep the information up to date to provide the best experience for users."
      />

      <p className='text-gray-500 mt-8 mb-3'>
        All Rooms <span className='text-xs text-gray-400 ml-1'>({rooms.length} total)</span>
      </p>

      {rooms.length === 0 ? (
        <div className='text-center py-16 border border-dashed border-gray-300 rounded-xl max-w-3xl'>
          <p className='text-5xl mb-3'>🛏️</p>
          <p className='font-medium text-lg text-gray-600'>No rooms added yet</p>
          <p className='text-sm text-gray-400 mt-1'>Add rooms using the "Add Room" page.</p>
        </div>
      ) : (
        <div className='w-full max-w-3xl text-left border border-gray-200 rounded-xl shadow-sm overflow-hidden max-h-96 overflow-y-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 sticky top-0'>
              <tr>
                <th className='py-3 px-4 text-gray-600 font-semibold text-sm text-left'>Room</th>
                <th className='py-3 px-4 text-gray-600 font-semibold text-sm max-sm:hidden text-left'>Facilities</th>
                <th className='py-3 px-4 text-gray-600 font-semibold text-sm text-left'>Price/Night</th>
                <th className='py-3 px-4 text-gray-600 font-semibold text-sm text-center'>Available</th>
              </tr>
            </thead>
            <tbody className='text-sm divide-y divide-gray-100'>
              {rooms.map((item) => {
                // Get first image
                let firstImage = null
                if (item.images) {
                  const imgs = Array.isArray(item.images) ? item.images : JSON.parse(item.images || '[]')
                  firstImage = imgs[0] || null
                }

                return (
                  <tr key={item.id} className='hover:bg-gray-50 transition-colors'>
                    {/* Room name + preview */}
                    <td className='py-3 px-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100'>
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={item.room_type}
                              className='w-full h-full object-cover'
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-gray-300 text-lg'>🛏</div>
                          )}
                        </div>
                        <span className='font-medium text-gray-800'>{item.room_type}</span>
                      </div>
                    </td>

                    {/* Facilities */}
                    <td className='py-3 px-4 text-gray-500 max-sm:hidden text-sm'>
                      {item.amenities?.join(', ') || '—'}
                    </td>

                    {/* Price */}
                    <td className='py-3 px-4 font-medium text-gray-800'>
                      ${item.price_per_night}
                    </td>

                    {/* Toggle availability */}
                    <td className='py-3 px-4 text-center'>
                      <label className='relative inline-flex items-center cursor-pointer'>
                        <input
                          type='checkbox'
                          className='sr-only peer'
                          checked={item.is_available ?? true}
                          disabled={toggling === item.id}
                          onChange={() => toggleAvailability(item.id, item.is_available ?? true)}
                        />
                        <div className={`w-12 h-7 rounded-full transition-colors duration-200 ${
                          toggling === item.id ? 'bg-gray-300' : 'bg-slate-300 peer-checked:bg-blue-500'
                        }`} />
                        <span className='absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out peer-checked:translate-x-5' />
                      </label>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ListRoom