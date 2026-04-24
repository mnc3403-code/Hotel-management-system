import React, { useState } from 'react'
import Title from '../../component/Title'
import { assets } from '../../assets/assets'

const AddRoom = () => {
  const [images, setImages] = useState({1: null, 2: null, 3: null, 4: null})
  const [input, setInput] = useState({
    roomType: "",
    pricePerNight: 0,
    amenities: {
      'free wifi': false,
      'free breakfast': false,
      'room service': false,
      'pool access': false,
      'mountain view': false,
    }
  })
  return (
    <form action="">
      <Title align="left" font="outfit" title="Add Room" subtitle="Fill in the details to add a new room to your hotel to enhance the user booking experience" />
      {/* upload area for images */}
      <p className='text-gray-800 mt-10'>Images</p>
      <div className='grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap '>
        {Object.keys(images).map((key) => (
          <label htmlFor={`roomImage${key}`} key={key}>
            <img className='max-h-13 cursor-pointer opacity-80' src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea} alt='' />
            <input type="file" accept='image/*' id={`roomImage${key}`} hidden onChange={e=>setImages({...images,[key]:e.target.files[0]})} />
          </label>
        ))}
      </div>
        <div className='w-full flex max-sm:flex-col sm:gap-4 mt-4'>
          <div className='flex-1 max-w-48'>
            <p className='text-gray-800  mt-4'> Room Type</p>
            <select onChange={e=>setInput({...input, roomType: e.target.value})} className='border opacity-70 border-gray-300 mt-1 rounded p-2 w-full' value={input.roomType}>
              <option value="">Select Room Type</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
            </select>
          </div>
          <div>
            <p className='mt-4 text-gray-800'> 
              Price  <span className='text-xs'>/night</span>
            </p>
            <input type="number" placeholder='0'  className='border border-gray-300 mt-1 rounded p-2 w-24' onChange={e=>setInput({...input, pricePerNight:e.target.value })} value={input.pricePerNight} />
          </div>
        </div>

        <p className='text-gray-800 mt-4'>Amenities</p>
            <div className='flex flex-col flex-wrap mt-1 text-gray-400 max-w-sm'>
              {Object.keys(input.amenities).map((amenity,index)=>(
           <div key={index}>
             <input type="checkbox" id={`amenities${index+1}`} checked={input.amenities[amenity]} onChange={()=>setInput({...input,amenities:{...input.amenities,[amenity]:!input.amenities[amenity]}})}/>
                <label htmlFor={`amenities${index+1}`}>{amenity}</label>
                </div>))}
          </div>
          <button className='bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer'>Add Room</button> 
    </form> 
  )
}

export default AddRoom