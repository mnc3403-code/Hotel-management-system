import React, { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useUser } from '@clerk/clerk-react'
import { jsPDF } from 'jspdf'

const BookingConfirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useUser()
  const booking = location.state?.booking
  const [showContent, setShowContent] = useState(false)
  const [showCheckmark, setShowCheckmark] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const receiptRef = useRef(null)

  useEffect(() => {
    if (!booking) {
      navigate('/my-bookings')
      return
    }
    // Stagger animations
    setTimeout(() => setShowCheckmark(true), 300)
    setTimeout(() => setShowContent(true), 800)
    setTimeout(() => setShowDetails(true), 1200)
  }, [booking, navigate])

  if (!booking) return null

  const checkIn = new Date(booking.check_in_date)
  const checkOut = new Date(booking.check_out_date)
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const bookingId = booking.id?.slice(0, 8).toUpperCase() || 'N/A'

  const handleDownloadPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Colors
    const primaryColor = [34, 139, 34]   // Forest green
    const darkColor = [33, 33, 33]
    const grayColor = [120, 120, 120]
    const lightGray = [200, 200, 200]
    
    // Header background
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 50, 'F')
    
    // Hotel name / Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Booking Confirmation', pageWidth / 2, 22, { align: 'center' })
    
    // Booking ID
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Booking ID: #${bookingId}`, pageWidth / 2, 35, { align: 'center' })
    
    // Hotel name
    doc.setTextColor(...darkColor)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(booking.hotel_name || 'Hotel', pageWidth / 2, 68, { align: 'center' })
    
    // Room type
    doc.setFontSize(11)
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'normal')
    doc.text(booking.room_type || 'Room', pageWidth / 2, 76, { align: 'center' })
    
    // Divider line
    doc.setDrawColor(...lightGray)
    doc.setLineWidth(0.5)
    doc.line(20, 84, pageWidth - 20, 84)
    
    // Guest Details Section
    let yPos = 96
    
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('Guest Details', 20, yPos)
    yPos += 12
    
    // Name
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkColor)
    doc.text('Name:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(user?.fullName || user?.firstName || 'Guest', 65, yPos)
    yPos += 10
    
    // Phone Number
    doc.setFont('helvetica', 'bold')
    doc.text('Phone Number:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(booking.phone_number || 'N/A', 65, yPos)
    yPos += 10
    
    // Email
    doc.setFont('helvetica', 'bold')
    doc.text('Email:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(user?.primaryEmailAddress?.emailAddress || 'N/A', 65, yPos)
    yPos += 16
    
    // Divider
    doc.setDrawColor(...lightGray)
    doc.line(20, yPos, pageWidth - 20, yPos)
    yPos += 14
    
    // Stay Details Section
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('Stay Details', 20, yPos)
    yPos += 12
    
    // Check-In
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkColor)
    doc.text('Check-In:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(checkIn), 65, yPos)
    yPos += 10
    
    // Check-Out
    doc.setFont('helvetica', 'bold')
    doc.text('Check-Out:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(checkOut), 65, yPos)
    yPos += 10
    
    // Duration
    doc.setFont('helvetica', 'bold')
    doc.text('Duration:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(`${nights} Night${nights > 1 ? 's' : ''}`, 65, yPos)
    yPos += 10
    
    // Guests
    doc.setFont('helvetica', 'bold')
    doc.text('Guests:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(`${booking.guests} Guest${booking.guests > 1 ? 's' : ''}`, 65, yPos)
    yPos += 16
    
    // Divider
    doc.setDrawColor(...lightGray)
    doc.line(20, yPos, pageWidth - 20, yPos)
    yPos += 14
    
    // Payment info
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('Payment Info', 20, yPos)
    yPos += 12
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkColor)
    doc.text('Total Price:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(`$${booking.total_price?.toLocaleString()}`, 65, yPos)
    yPos += 10
    
    doc.setFont('helvetica', 'bold')
    doc.text('Status:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text('Pay at Hotel', 65, yPos)
    yPos += 20
    
    // Footer
    doc.setDrawColor(...lightGray)
    doc.line(20, yPos, pageWidth - 20, yPos)
    yPos += 10
    doc.setFontSize(9)
    doc.setTextColor(...grayColor)
    doc.text('Thank you for your booking! We look forward to welcoming you.', pageWidth / 2, yPos, { align: 'center' })
    yPos += 6
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth / 2, yPos, { align: 'center' })
    
    // Save the PDF
    doc.save(`Booking_${bookingId}.pdf`)
  }

  return (
    <div className='min-h-screen py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32 relative overflow-hidden'>
      {/* Animated background decorations */}
      <div className='absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10'>
        <div className='absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-green-100 to-emerald-50 rounded-full blur-3xl opacity-60 animate-pulse' />
        <div className='absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-amber-50 to-orange-50 rounded-full blur-3xl opacity-50' />
        <div className='absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-bl from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-40' />
      </div>

      {/* Success Checkmark Animation */}
      <div className={`flex flex-col items-center mb-10 transition-all duration-700 ${showCheckmark ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
        <div className='relative mb-6'>
          {/* Animated ring */}
          <div className='w-24 h-24 rounded-full border-4 border-green-400 flex items-center justify-center relative'>
            <div className={`absolute inset-0 rounded-full bg-green-400/20 transition-transform duration-500 ${showCheckmark ? 'scale-100' : 'scale-0'}`} />
            <svg className={`w-12 h-12 text-green-500 transition-all duration-500 delay-300 ${showCheckmark ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {/* Sparkle effects */}
          <div className={`absolute -top-2 -right-2 w-4 h-4 bg-yellow-300 rounded-full transition-all duration-500 delay-500 ${showCheckmark ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
          <div className={`absolute -bottom-1 -left-3 w-3 h-3 bg-green-300 rounded-full transition-all duration-500 delay-700 ${showCheckmark ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
          <div className={`absolute top-0 -left-4 w-2 h-2 bg-amber-400 rounded-full transition-all duration-500 delay-600 ${showCheckmark ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
        </div>
        <h1 className='text-3xl md:text-4xl font-playfair text-gray-900 text-center'>Booking Confirmed!</h1>
        <p className='text-gray-500 mt-2 text-center max-w-md'>Your reservation has been successfully placed. A confirmation has been saved to your account.</p>
      </div>

      {/* Main Confirmation Card */}
      <div ref={receiptRef} className={`max-w-3xl mx-auto transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className='bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100'>
          {/* Card Header - Green gradient */}
          <div className='bg-gradient-to-r from-emerald-500 to-green-500 px-6 md:px-8 py-5 flex items-center justify-between'>
            <div>
              <p className='text-white/80 text-sm font-medium tracking-wide uppercase'>Booking Reference</p>
              <p className='text-white text-2xl font-playfair tracking-wider mt-0.5'>#{bookingId}</p>
            </div>
            <div className='flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2'>
              <div className='w-2 h-2 rounded-full bg-white animate-pulse' />
              <span className='text-white text-sm font-medium'>
                Pay at Hotel
              </span>
            </div>
          </div>

          {/* Hotel & Room Info Section */}
          <div className='px-6 md:px-8 py-6 border-b border-gray-100'>
            <div className='flex flex-col md:flex-row gap-5'>
              {/* Room Image */}
              {booking.room_image && (
                <div className='w-full md:w-48 h-36 rounded-xl overflow-hidden shadow-md flex-shrink-0'>
                  <img src={booking.room_image} alt="Room" className='w-full h-full object-cover' />
                </div>
              )}
              <div className='flex-1'>
                <h2 className='text-2xl font-playfair text-gray-900'>{booking.hotel_name}</h2>
                <span className='inline-block mt-1 text-sm text-gray-500 bg-gray-100 px-3 py-0.5 rounded-full'>{booking.room_type}</span>
                
                {booking.hotel_address && (
                  <div className='flex items-center gap-1.5 text-gray-500 mt-3 text-sm'>
                    <svg className='w-4 h-4 text-gray-400' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{booking.hotel_address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stay Details Grid */}
          <div className={`px-6 md:px-8 py-6 transition-all duration-500 ${showDetails ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className='text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4'>Stay Details</h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              {/* Check-In */}
              <div className='flex flex-col'>
                <div className='flex items-center gap-1.5 text-gray-400 mb-1'>
                  <svg className='w-4 h-4' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className='text-xs font-medium uppercase'>Check-In</span>
                </div>
                <p className='text-sm font-semibold text-gray-800'>{formatDate(checkIn)}</p>
              </div>

              {/* Check-Out */}
              <div className='flex flex-col'>
                <div className='flex items-center gap-1.5 text-gray-400 mb-1'>
                  <svg className='w-4 h-4' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className='text-xs font-medium uppercase'>Check-Out</span>
                </div>
                <p className='text-sm font-semibold text-gray-800'>{formatDate(checkOut)}</p>
              </div>

              {/* Duration */}
              <div className='flex flex-col'>
                <div className='flex items-center gap-1.5 text-gray-400 mb-1'>
                  <svg className='w-4 h-4' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className='text-xs font-medium uppercase'>Duration</span>
                </div>
                <p className='text-sm font-semibold text-gray-800'>{nights} Night{nights > 1 ? 's' : ''}</p>
              </div>

              {/* Guests */}
              <div className='flex flex-col'>
                <div className='flex items-center gap-1.5 text-gray-400 mb-1'>
                  <svg className='w-4 h-4' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className='text-xs font-medium uppercase'>Guests</span>
                </div>
                <p className='text-sm font-semibold text-gray-800'>{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Guest Info */}
          <div className={`px-6 md:px-8 py-5 bg-gray-50/50 border-t border-gray-100 transition-all duration-500 delay-200 ${showDetails ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className='text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3'>Guest Information</h3>
            <div className='flex items-center gap-3'>
              {user?.imageUrl && (
                <img src={user.imageUrl} alt="Guest" className='w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm' />
              )}
              <div>
                <p className='text-sm font-semibold text-gray-800'>{user?.fullName || user?.firstName || 'Guest'}</p>
                <p className='text-xs text-gray-400'>{user?.primaryEmailAddress?.emailAddress}</p>
                {booking.phone_number && (
                  <p className='text-xs text-gray-400'>Phone: {booking.phone_number}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className={`px-6 md:px-8 py-6 border-t border-gray-100 transition-all duration-500 delay-300 ${showDetails ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className='text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4'>Payment Summary</h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>${booking.price_per_night} × {nights} night{nights > 1 ? 's' : ''}</span>
                <span className='text-gray-700 font-medium'>${booking.total_price?.toLocaleString()}</span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>Payment Status</span>
                <span className='font-semibold text-amber-500'>
                  ⏳ Pay at Hotel
                </span>
              </div>
              <div className='border-t border-dashed border-gray-200 pt-3 mt-3 flex justify-between items-center'>
                <span className='text-lg font-playfair text-gray-800'>Total Amount</span>
                <span className='text-2xl font-playfair text-gray-900'>${booking.total_price?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className='px-6 md:px-8 py-5 bg-gradient-to-r from-gray-50 to-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row gap-3'>
            <Link
              to='/my-bookings'
              className='flex-1 text-center py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium text-sm active:scale-[0.98]'
            >
              View All Bookings
            </Link>
            <button
              onClick={handleDownloadPDF}
              className='flex-1 text-center py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer'
            >
              <svg className='w-4 h-4' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
            <Link
              to='/rooms'
              className='flex-1 text-center py-3 border border-orange-400 text-orange-600 rounded-xl hover:bg-orange-50 transition-all font-medium text-sm active:scale-[0.98]'
            >
              Browse More Rooms
            </Link>
          </div>
        </div>

        {/* Bottom Note */}
        <div className='mt-6 text-center'>
          <p className='text-gray-400 text-xs'>
            A confirmation email has been sent to <span className='font-medium text-gray-500'>{user?.primaryEmailAddress?.emailAddress}</span>
          </p>
          <p className='text-gray-300 text-xs mt-1'>
            Booking ID: #{bookingId} • {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation
