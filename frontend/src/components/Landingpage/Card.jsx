import React from 'react'

const card = (props) => {
  return (
    <div className='border border-slate-100 rounded-lg bg-white h-[25vh] w-[85vw] md:w-[25vw] flex flex-col justify-center align-top gap-3'>
        <div className='flex gap-3 justify-center'>
            {props.icon}
            <p className='mt-3 bg-green-800 h-6 px-2 rounded-lg text-white '>Step {props.step}</p>
        </div>
        <h2 className='text-center text-2xl'>{props.head}</h2>
        <div className='text-center text-slate-600 px-[3vw]'>
          {props.desc}
        </div>
        
    </div>
  )
}

export default card