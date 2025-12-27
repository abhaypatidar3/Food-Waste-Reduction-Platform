import React from 'react'

const card = (props) => {
  return (
    <div className='border border-slate-100 rounded-lg bg-white h-[25vh] w-[25vw] flex item-center justify-center'>
        <div className='pt-5 flex gap-3'>
            {props.icon}
            <p className='mt-3 bg-green-800 h-6 px-2 rounded-lg text-white '>Step {props.step}</p>
        </div>
        
    </div>
  )
}

export default card