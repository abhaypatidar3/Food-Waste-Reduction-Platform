import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Users, TrendingUp, MapPin, Clock, Heart } from 'lucide-react';
const LandingPage = () => {
  return (
    <div className='min-h-screen'>
        <header className="bg-gradient-to-r from-[#1E7F5C] to-[#166651] text-white w-[100vw]">
            <nav className='flex justify-between mx-2 px-6 py-4 items-center w-[100vw]'>
              <div>
                <span>FoodShare</span>
              </div>
              <div>
                <div className='flex gap-4'>
                  <Link to='/login' className='hover:bg-white/10 px-4 py-2 rounded-md'>Login</Link>
                  <Link to='/signup' className='bg-[#F4A261] text-white hover:bg-[#E89350] shadow-sm px-4 py-2 rounded-md'>Sign Up</Link>
                </div>
              </div>
            </nav>

            <div className='py-20 px-6 text-center'>
                <h1 className="text-5xl mb-6 max-w-4xl mx-auto">
                  Transform Surplus Food into Hope
                </h1>
                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Connect restaurants and food businesses with NGOs and shelters to reduce waste and feed communities in need
                </p>
              <div className='flex justify-center gap-4'>
                <button className='border border-white hover:bg-white/10 px-6 py-3 rounded-md'>Donate food</button>
                <button className='border border-white hover:bg-white/10 px-6 py-3 rounded-md'>Receive Food</button>
              </div>
            </div>
        </header>
        <div className='py-20 text-center bg-slate-300 grid grid-cols-1 gap-10 md:grid-cols-3'>
          <div className='flex pl-[10vw]'>
            <Heart className='w-[50px] text-[#1E7F5C]' />
            <p>Meals Saved</p>
          </div>
          <div>
            NGOs Connected
          </div>
          <div>
            Food Waste Prevented
          </div>
        </div>
    </div>
  )
}

export default LandingPage
