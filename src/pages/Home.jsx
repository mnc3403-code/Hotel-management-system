import React from 'react'
import Hero from '../component/Hero'
import FeaturedDestination from '../component/FeaturedDestination'
import ExclusiveOffer from '../component/ExclusiveOffer'
import Testimonial from '../component/Testimonial'
import { NewsLetter } from '../component/NewsLetter'


const Home = () => {
  return (
    <>
        <Hero />
        <FeaturedDestination/>
        <ExclusiveOffer />
        <Testimonial />
        <NewsLetter/>
  
    </>
  )
}

export default Home