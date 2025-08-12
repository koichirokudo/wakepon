import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import Categories from './pages/Categories.tsx'
import Expenses from './pages/Expenses.tsx'
import SignUp from './pages/SignUp.tsx'
import SignIn from './pages/SignIn.tsx'
import Invite from './pages/Invite.tsx'
import Profile from './pages/Profile.tsx'
import VerifyOtp from './pages/VerifyOtp.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/signin' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/verify-otp' element={<VerifyOtp />} />
          <Route path='/categories' element={<Categories />} />
          <Route path='/invite' element={<Invite />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/expenses' element={<Expenses />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)