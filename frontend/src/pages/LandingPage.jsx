import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Users, TrendingUp, MapPin, Clock, Heart, Mail, Phone, MapPinIcon, Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';
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
              <p className='text-4xl'>{analytics?.totalfoodServed || 0}</p>
              <p className='text-slate-600'>Food Waste Prevented</p>
            </div>
          </div>
        </div>
        <div className='h-[100vh] md:h-[50vh] bg-slate-100 shadow-lg border border-slate-100 justify-items-center items-center'>
          <h2 className='text-3xl text-center mb-12 text-[#2E2E2E] pt-[5vh]'>How it Works? </h2>
          <div className='grid grid-cols-1 md: mx-[5vw] md:grid-cols-3 place-items-center gap-5 md:gap-5'>
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

        {/* Footer */}
        <footer className="bg-gradient-to-br from-[#1E7F5C] to-[#0D5A43] text-white">
          {/* Main Footer Content */}
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* About Section */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Leaf className="w-8 h-8" />
                  <span className="text-2xl font-bold">FoodShare</span>
                </div>
                <p className="text-white/80 mb-6 leading-relaxed">
                  Bridging the gap between food surplus and hunger.  Together, we're building a sustainable future where no meal goes to waste.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                    <Twitter size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>

              {/* Contact Info */}
              <div className="md:w-[50vw]">
                <h3 className="text-lg font-bold mb-6">Get In Touch</h3>
                <ul className="space-y-4 sm:space-y-0 md:flex gap-4">
                  <p className="flex gap-3">
                    <Mail className="w-5 h-5 text-[#F4A261] flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white/60 text-sm mb-1">Email</p>
                      <a href="mailto:support@foodshare.com" className="text-white hover:text-[#F4A261] transition-colors">
                        abhay@foodshare.com
                      </a>
                    </div>
                  </p>
                  <p className="flex mt-0 mb-4 gap-3">
                    <Phone className="w-5 h-5 text-[#F4A261] flex-shrink-0 " />
                    <div>
                      <p className="text-white/60 text-sm mb-1">Phone</p>
                      <a href="tel: +911234567890" className="text-white hover:text-[#F4A261] transition-colors">
                        +91 123-456-7890
                      </a>
                    </div>
                  </p>
                  <p className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-[#F4A261] flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white/60 text-sm mb-1">Address</p>
                      <p className="text-white">
                        123 Green Street<br />
                        Mumbai, Maharashtra 400001
                      </p>
                    </div>
                  </p>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 bg-[#0D5A43]">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-white/60 text-sm text-center md:text-left">
                  © 2025 FoodShare. All rights reserved.  | Making a difference, one meal at a time 🌱
                </p>
                <div className="flex gap-6 text-sm">
                  <Link to="/privacy" className="text-white/60 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to="/terms" className="text-white/60 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                  <Link to="/cookies" className="text-white/60 hover: text-white transition-colors">
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
    </div>
  )
}

export default LandingPage