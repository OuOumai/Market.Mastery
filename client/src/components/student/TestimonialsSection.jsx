import React from 'react'
import {assets, dummyTestimonial } from '../../assets/assets'

const TestimonialsSection = () => {
  return (
    <div className='pb-14 px-8 md:px-0 flex flex-col items-center'>
      <div className='text-center max-w-4xl'>
        <h2 className='text-3xl font-medium text-gray-800'>Testimonials</h2>
        <p className='md:text-base text-gray-500 mt-3'>Hear from our learners as they share their journeys of transformation success,<br/> and how our platform has made a difference in their lives.</p>
      </div>
      
      {/* Compact, square-shaped testimonial cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14 justify-items-center max-w-6xl'>
        {dummyTestimonial.map((testimonial, index)=>(
          <div key={index} className='text-center border border-gray-500/30 rounded-lg bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-xs'>
            <div className='flex flex-col items-center gap-3 px-4 py-3 bg-gray-500/10'>
              <img className='h-10 w-10 rounded-full object-cover' src={testimonial.image} alt={testimonial.name}/>
              <div className='text-center'>
                <h1 className='text-base font-medium text-gray-800'>{testimonial.name}</h1>
                <p className='text-xs text-gray-800/80'>{testimonial.role}</p>
              </div>
            </div>
            <div className='p-10'>
                <div className='flex justify-center gap-1 mb-3'>
                  {[...Array(5)].map((_, i)=>(
                    <img 
                      className='h-4 w-4' 
                      key={i} 
                      src={i < Math.floor(testimonial.rating) ? assets.star : assets.star_blank} 
                      alt="star"
                    /> 
                  ))}
                </div>
                <p className='text-gray-500 leading-relaxed text-xs line-clamp-4'>{testimonial.feedback}</p>
              </div>
              <a href='#' className='text-blue-500 underline px-9 pb-4 block'>Read more</a>
            </div>
        ))}
      </div>
    </div>
  )
}

export default TestimonialsSection