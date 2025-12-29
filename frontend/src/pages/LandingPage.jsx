import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Users, TrendingUp, MapPin, Clock, Heart } from 'lucide-react';
import Card from '../components/Landingpage/Card';
import { landingPageAPI } from '../services/api';

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(()=>{
    fetchAnalytics();
  },[]);

  const fetchAnalytics = async ()=>{
    setLoading(true);
    try{
      const response = await landingPageAPI.getAnalytics();
      if(response.success){
        setAnalytics(response.analytics);
      }
    }catch (error){
      console.error('Error fetching landing page analytics:', error);
    } finally{
      setLoading(false);
    };
  };

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
                <Link to='/login' className='border border-white hover:bg-white/10 px-6 py-3 rounded-md'>Donate food</Link>
                <Link to='/login' className='border border-white hover:bg-white/10 px-6 py-3 rounded-md'>Receive Food</Link>
              </div>
            </div>
        </header>
        <div className='py-20 text-center bg-white grid grid-cols-1 gap-10 md:grid-cols-3'>
          <div className='flex md:pl-[10vw] gap-3 text-left justify-center md:justify-normal'>
            <Heart className='w-[50px] h-[50px] mt-1 text-[#1E7F5C]' />
            <div>
              <p className='text-4xl'>{analytics?.totalPeopleFed || 0}</p>
              <p className='text-slate-600'>Meals Saved </p>
            </div>
          </div>
          <div className='flex md:pl-[10vw] gap-3 text-left justify-center md:justify-normal'>
            <Users className='w-[50px] h-[50px] mt-1 text-[#1E7F5C]' />
            <div>
              <p className='text-4xl'>{analytics?.totalNGOs || 0}</p>
              <p className='text-slate-600'>NGOs Connected</p>
            </div>
          </div>
          <div className='flex md:pl-[10vw] gap-3 text-left justify-center md:justify-normal'>
            <TrendingUp className='w-[50px] h-[50px] mt-1 text-[#1E7F5C]' />
            <div>
              <p className='text-4xl'>{analytics?.totalfoodServed || 0} Kg</p>
              <p className='text-slate-600'>Food Waste Prevented</p>
            </div>
          </div>
        </div>
        <div className='h-[100vh] md:h-[50vh] bg-slate-100 shadow-lg border border-slate-100 justify-items-center items-center'>
          <h2 className='text-3xl text-center mb-12 text-[#2E2E2E] pt-[5vh]'>How it Works?</h2>
          <div className='grid grid-cols-1 md:mx-[5vw] md:grid-cols-3 place-items-center gap-5 md:gap-8'>
          <Card 
              step={"1"} 
              icon={<Leaf className='w-12 h-12 text-[#1E7F5C] '/>} 
              desc={"Restaurants post available food with quantity, pickup time, and location details"}
              head={"List Surplus Food"}
          />
          <Card 
              step={"2"} 
              icon={<MapPin className='w-12 h-12 text-[#F4A261] '/>} 
              desc={"Nearby NGOs get notified and can accept donations in real-time"}
              head={"NGOs Find & Accept"}
          />
          <Card 
              step={"3"} 
              icon={<Clock className='w-12 h-12 text-[#1E7F5C] '/>} 
              desc={"Track pickup status with QR verification and build impact analytics"}
              head={"Track & Confirm"}
          />
          </div>
        </div>
    </div>
  )
}

export default LandingPage
