import React, { useState } from 'react'
import Title from '../../component/Title'
import { assets } from '../../assets/assets'
import { supabase } from '../../supabase'
import { useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const AddRoom = () => {
  const { user } = useUser()
  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
  const [submitting, setSubmitting] = useState(false)
  const [input, setInput] = useState({
    roomType: '',
    pricePerNight: 0,
    amenities: {
      'Free WiFi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Pool Access': false,
      'Mountain View': false,
    },
  })

  const uploadImage = async (file, roomId, index) => {
    if (!file) return null
    const ext = file.name.split('.').pop()
    const filePath = `rooms/${roomId}/image_${index}.${ext}`
    const { error } = await supabase.storage
      .from('room-images')
      .upload(filePath, file, { upsert: true })
    if (error) {
      console.error('Image upload error:', error)
      return null
    }
    const { data: urlData } = supabase.storage
      .from('room-images')
      .getPublicUrl(filePath)
    return urlData?.publicUrl || null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!input.roomType) return toast.error('Please select a room type')
    if (!input.pricePerNight || input.pricePerNight <= 0)
      return toast.error('Please enter a valid price per night')

    const hasImage = Object.values(images).some(Boolean)
    if (!hasImage) return toast.error('Please upload at least one room image')

    setSubmitting(true)
    try {
      const email = user?.primaryEmailAddress?.emailAddress
      if (!email) throw new Error('Not authenticated')

      // Get the Supabase user
      const { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (!dbUser) throw new Error('User profile not found')

      // Get the hotel owned by this user
      const { data: hotel } = await supabase
        .from('hotels')
        .select('id')
        .eq('owner_id', dbUser.id)
        .single()

      if (!hotel) {
        toast.error('No hotel found. Please register your hotel first.')
        setSubmitting(false)
        return
      }

      // Prepare amenities array from checkboxes
      const selectedAmenities = Object.entries(input.amenities)
        .filter(([, checked]) => checked)
        .map(([name]) => name)

      // Insert the room first to get its ID for image paths
      const { data: newRoom, error: roomError } = await supabase
        .from('rooms')
        .insert({
          hotel_id: hotel.id,
          room_type: input.roomType,
          price_per_night: parseFloat(input.pricePerNight),
          amenities: selectedAmenities,
          is_available: true,
        })
        .select()
        .single()

      if (roomError || !newRoom) {
        throw new Error(roomError?.message || 'Failed to create room')
      }

      // Upload images and get public URLs
      const imageUrls = []
      for (const [key, file] of Object.entries(images)) {
        if (file) {
          const url = await uploadImage(file, newRoom.id, key)
          if (url) imageUrls.push(url)
        }
      }

      // Update room with image URLs
      if (imageUrls.length > 0) {
        await supabase
          .from('rooms')
          .update({ images: imageUrls })
          .eq('id', newRoom.id)
      }

      toast.success('Room added successfully! 🎉')

      // Reset form
      setImages({ 1: null, 2: null, 3: null, 4: null })
      setInput({
        roomType: '',
        pricePerNight: 0,
        amenities: {
          'Free WiFi': false,
          'Free Breakfast': false,
          'Room Service': false,
          'Pool Access': false,
          'Mountain View': false,
        },
      })
    } catch (err) {
      console.error('Add room error:', err)
      toast.error(err.message || 'Failed to add room')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Title
        align="left"
        font="outfit"
        title="Add Room"
        subtitle="Fill in the details to add a new room to your hotel to enhance the user booking experience"
      />

      {/* Image Upload Area */}
      <p className='text-gray-800 mt-10 font-medium'>Room Images</p>
      <p className='text-xs text-gray-400 mb-2'>Upload up to 4 images. At least 1 required.</p>
      <div className='grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap'>
        {Object.keys(images).map((key) => (
          <label htmlFor={`roomImage${key}`} key={key} className='cursor-pointer group relative'>
            <div className={`w-28 h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              images[key]
                ? 'border-blue-400 shadow-md'
                : 'border-dashed border-gray-300 hover:border-blue-300'
            }`}>
              {images[key] ? (
                <img
                  src={URL.createObjectURL(images[key])}
                  alt={`room preview ${key}`}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 transition-colors'>
                  <img src={assets.uploadArea} alt='upload' className='h-8 opacity-50' />
                  <span className='text-xs text-gray-400 mt-1'>Image {key}</span>
                </div>
              )}
            </div>
            {images[key] && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setImages({ ...images, [key]: null }) }}
                className='absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors z-10'
              >
                ×
              </button>
            )}
            <input
              type="file"
              accept='image/*'
              id={`roomImage${key}`}
              hidden
              onChange={(e) => setImages({ ...images, [key]: e.target.files[0] })}
            />
          </label>
        ))}
      </div>

      {/* Room Type & Price */}
      <div className='w-full flex max-sm:flex-col sm:gap-6 mt-6'>
        <div className='flex-1 max-w-52'>
          <p className='text-gray-800 font-medium mb-1'>Room Type</p>
          <select
            onChange={(e) => setInput({ ...input, roomType: e.target.value })}
            className='border border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 bg-white'
            value={input.roomType}
          >
            <option value=''>Select Room Type</option>
            <option value='Single Bed'>Single Bed</option>
            <option value='Double Bed'>Double Bed</option>
            <option value='Suite'>Suite</option>
            <option value='Family Suite'>Family Suite</option>
            <option value='Presidential Suite'>Presidential Suite</option>
          </select>
        </div>

        <div>
          <p className='text-gray-800 font-medium mb-1'>
            Price <span className='text-xs font-normal text-gray-400'>/night (USD)</span>
          </p>
          <div className='relative'>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium'>$</span>
            <input
              type='number'
              min='1'
              placeholder='0'
              className='border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 w-32 focus:outline-none focus:ring-2 focus:ring-blue-300'
              onChange={(e) => setInput({ ...input, pricePerNight: e.target.value })}
              value={input.pricePerNight || ''}
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className='mt-6'>
        <p className='text-gray-800 font-medium mb-2'>Amenities</p>
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-sm'>
          {Object.keys(input.amenities).map((amenity, index) => (
            <label key={index} className='flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800'>
              <input
                type='checkbox'
                id={`amenities${index + 1}`}
                checked={input.amenities[amenity]}
                className='w-4 h-4 accent-blue-500'
                onChange={() =>
                  setInput({
                    ...input,
                    amenities: { ...input.amenities, [amenity]: !input.amenities[amenity] },
                  })
                }
              />
              <span>{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type='submit'
        disabled={submitting}
        className={`mt-8 px-10 py-3 rounded-lg text-white font-medium transition-all duration-200 cursor-pointer ${
          submitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg'
        }`}
      >
        {submitting ? (
          <span className='flex items-center gap-2'>
            <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
            Adding Room...
          </span>
        ) : (
          '+ Add Room'
        )}
      </button>
    </form>
  )
}

export default AddRoom