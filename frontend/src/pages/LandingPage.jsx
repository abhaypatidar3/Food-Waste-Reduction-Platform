import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Users, TrendingUp, MapPin, Clock, Heart } from 'lucide-react';
import Card from '../components/Landingpage/Card';

const LandingPage = () => {
  return (
    <div className='min-h-screen'>
        <header className="bg-gradient-to-r from-[#1E7F5C] to-[#166651] text-white mx-0">
            <nav className='flex justify-between mx-0 py-4 items-center'>
              <div className='ml-5'>
                <Leaf className='inline-block w-6 mr-2'/>
                <span>FoodShare</span>
              </div>
              <div>
                <div className='flex gap-4'>
                  <Link to='/login' className='hover:bg-white/10 px-4 py-2 rounded-md'>Login</Link>
                  <Link to='/signup' className='bg-[#F4A261] text-white hover:bg-[#E89350] shadow-sm px-4 py-2 rounded-md mr-5'>Sign Up</Link>
                </div>
              </div>
            </nav>
            {/* hero section */}
            <div className='py-20 mx-0 text-center'>
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
        <div className='py-20 text-center bg-white grid grid-cols-1 gap-10 md:grid-cols-3'>
          <div className='flex pl-[10vw]'>
            <Heart className='w-[50px] text-[#1E7F5C]' />
            <p>Meals Served</p>
          </div>
          <div>
            NGOs Connected
          </div>
          <div>
            Food Waste Prevented
          </div>
        </div>
        <div className='h-[50vh] bg-slate-100 shadow-lg border border-slate-100 justify-items-center items-center'>
          <h2 className='text-3xl text-center mb-12 text-[#2E2E2E] pt-[5vh]'>How it Works?</h2>
          <div className='grid grid-cols-1 gap-10 md:grid-cols-3'>
          <Card step={"1"} icon={<Leaf className='w-12 h-12 text-[#1E7F5C] '/>} desc={"Restaurants post available food with quantity, pickup time, and location details"}/>
          <Card step={"2"} icon={<MapPin className='w-12 h-12 text-[#F4A261] '/>} desc={"Nearby NGOs get notified and can accept donations in real-time"}/>
          <Card step={"3"} icon={<Clock className='w-12 h-12 text-[#1E7F5C] '/>} desc={"Track pickup status with QR verification and build impact analytics"}/>
          </div>
        </div>
    </div>
  )
}

export default LandingPage
