import React from 'react'
import {Link} from 'react-router-dom'

const Error = () => {
  return (
    <div className='flex flex-col my-auto justify-center items-center text-3xl text-white'>
      Error - 404 Not found
      <div>
      <Link to="/">
        <div className='text-yellow-25 mt-6 underline font-medium' width={160} height={42}>Back to HomePage</div>
      </Link>
      </div>
    </div>
  )
}

export default Error
