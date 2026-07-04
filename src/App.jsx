import React, { useEffect } from 'react'
import Navbar from './component/Navbar'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Home from './pages/Home';
import { Footer } from './component/Footer';
import AllRooms from './pages/AllRooms';
import RoomDetails from './pages/RoomDetails';
import MyBookings from './pages/MyBookings';
import HotelReg from './component/HotelReg';
import Layout from './pages/hotelOwner.jsx/Layout';
import Dashboard from './pages/hotelOwner.jsx/Dashboard';
import AddRoom from './pages/hotelOwner.jsx/AddRoom';
import ListRoom from './pages/hotelOwner.jsx/ListRoom';
import ExclusiveOffers from './pages/ExclusiveOffers';
import About from './pages/About';
import Experiences from './pages/Experiences';
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase } from './supabase';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/');
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded || !isSignedIn) return null;
  return children;
};

export const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner");
  const { user } = useUser();
  
  // Sync Clerk User to Supabase
  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) return;
        
        await supabase.from('users').upsert({
          // we use the clerk user.id as string but our schema uses UUID.
          // For simplicity without modifying schema, we can match by email since email is unique,
          // but we actually need to ensure the Supabase schema accepts clerk IDs if they are not UUIDs,
          // OR we just use email to find/update the user.
          // Wait, we defined `id UUID DEFAULT uuid_generate_v4()` in Supabase.
          // So let's just insert if they don't exist, using email.
          username: user.fullName || user.firstName || 'User',
          email: email,
          image: user.imageUrl,
          role: 'User' // default role
        }, { onConflict: 'email', ignoreDuplicates: true });
      }
    };
    syncUser();
  }, [user]);

  // Set this to true whenever you want to render the registration component
  const shouldShowHotelReg = false;

  return (
    <div>
      {!isOwnerPath && <Navbar />}
      
      {shouldShowHotelReg && <HotelReg />}
      
      <div className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/rooms" element={<AllRooms/>} />
          <Route path="/rooms/:id" element={<RoomDetails/>} />
          <Route path="/offers" element={<ExclusiveOffers/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/experiences" element={<Experiences/>} />
          
          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <MyBookings/>
            </ProtectedRoute>
          } />
          
          <Route path="/owner" element={
            <ProtectedRoute>
              <Layout/>
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard/>} />
            <Route path='add-room' element={<AddRoom/>} />
            <Route path='list-room' element={<ListRoom/>} />
          </Route>
        </Routes>
      </div>
      
      {!isOwnerPath && <Footer />}
    </div>
  )
}

export default App;