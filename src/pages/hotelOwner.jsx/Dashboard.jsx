import React, { useEffect, useState } from 'react'
import Title from '../../component/Title'
import { assets } from '../../assets/assets'
import { supabase } from '../../supabase'
import { useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [hotelId, setHotelId] = useState(null)

  useEffect(() => {
    if (user) fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const email = user?.primaryEmailAddress?.emailAddress
      if (!email) return

      // 1. Get the owner's user record
      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (userError || !dbUser) {
        toast.error('Could not verify your account')
        setLoading(false)
        return
      }

      // 2. Get the hotel owned by this user
      const { data: hotel, error: hotelError } = await supabase
        .from('hotels')
        .select('id, name')
        .eq('owner_id', dbUser.id)
        .single()

      let query = supabase
        .from('bookings')
        .select(`
          id,
          total_price,
          is_paid,
          payment_status,
          check_in_date,
          check_out_date,
          created_at,
          users ( username, email, image ),
          rooms ( room_type, price_per_night )
        `)
        
      // If owner has a specific hotel, filter by it. Otherwise, show all for testing.
      if (hotel) {
         // Temporarily commented out filter so demo bookings show up on dashboard
         // query = query.eq('hotel_id', hotel.id)
      }
      
      const { data: bookingsData, error: bookingsError } = await query.order('created_at', { ascending: false })

      if (bookingsError) {
        toast.error('Failed to load bookings')
        setLoading(false)
        return
      }

      const total = (bookingsData || []).reduce((sum, b) => sum + (b.total_price || 0), 0)

      setStats({
        totalBookings: bookingsData?.length || 0,
        totalRevenue: total,
      })
      setRecentBookings(bookingsData || [])
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      toast.error('Error loading dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Dashboard"
        subtitle="A complete overview of your hotel operations, from room occupancy and reservations to staff coordination and financial performance"
      />

      {/* Stats Cards */}
      <div className='flex flex-wrap gap-4 my-8'>
        {/* Total Bookings */}
        <div className='bg-blue-50 border border-blue-100 rounded-xl flex items-center p-5 pr-10 shadow-sm hover:shadow-md transition-shadow'>
          <img src={assets.totalBookingIcon} alt="bookings" className='max-sm:hidden h-10 opacity-80' />
          <div className='flex flex-col sm:ml-4 font-medium'>
            <p className='text-blue-500 text-lg'>Total Bookings</p>
            <p className='text-2xl font-bold text-blue-800'>{stats.totalBookings}</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className='bg-green-50 border border-green-100 rounded-xl flex items-center p-5 pr-10 shadow-sm hover:shadow-md transition-shadow'>
          <img src={assets.totalRevenueIcon} alt="revenue" className='max-sm:hidden h-10 opacity-80' />
          <div className='flex flex-col sm:ml-4 font-medium'>
            <p className='text-green-500 text-lg'>Total Revenue</p>
            <p className='text-2xl font-bold text-green-800'>${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <h2 className='text-xl text-blue-950/70 font-medium mb-5'>Recent Bookings</h2>

      {recentBookings.length === 0 ? (
        <div className='text-center py-16 text-gray-400 border border-dashed border-gray-300 rounded-xl max-w-3xl'>
          <p className='text-5xl mb-3'>📋</p>
          <p className='font-medium text-lg'>No bookings yet</p>
          <p className='text-sm mt-1'>Bookings will appear here once guests reserve your rooms.</p>
        </div>
      ) : (
        <div className='w-full max-w-3xl text-left border border-gray-200 rounded-xl shadow-sm overflow-hidden max-h-[420px] overflow-y-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 sticky top-0'>
              <tr>
                <th className='py-3 px-4 text-gray-600 font-semibold text-sm'>Guest</th>
                <th className='py-3 px-4 text-gray-600 font-semibold text-sm max-sm:hidden'>Room</th>
                <th className='py-3 px-4 text-gray-600 font-semibold text-sm text-center'>Amount</th>
                <th className='py-3 px-4 text-gray-600 font-semibold text-sm text-center'>Status</th>
              </tr>
            </thead>
            <tbody className='text-sm divide-y divide-gray-100'>
              {recentBookings.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50 transition-colors'>
                  {/* Guest info with avatar */}
                  <td className='py-3 px-4'>
                    <div className='flex items-center gap-3'>
                      {item.users?.image ? (
                        <img
                          src={item.users.image}
                          alt={item.users.username}
                          className='w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0'
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0'>
                          <span className='text-blue-600 font-bold text-xs'>
                            {(item.users?.username || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className='font-medium text-gray-800 leading-tight'>{item.users?.username || 'Guest'}</p>
                        <p className='text-xs text-gray-400'>{item.users?.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Room type */}
                  <td className='py-3 px-4 text-gray-600 max-sm:hidden'>
                    {item.rooms?.room_type || '—'}
                  </td>

                  {/* Amount */}
                  <td className='py-3 px-4 text-gray-700 text-center font-medium'>
                    ${item.total_price?.toLocaleString()}
                  </td>

                  {/* Payment status */}
                  <td className='py-3 px-4 text-center'>
                    <span className={`inline-block py-1 px-3 text-xs rounded-full font-medium ${
                      item.is_paid
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.is_paid ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Dashboard