// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import Categories from './pages/Categories.tsx'
import Expenses from './pages/Expenses.tsx'
import SignIn from './pages/SignIn.tsx'
import Invite from './pages/Invite.tsx'
import Profile from './pages/Profile.tsx'
import VerifyOtp from './pages/VerifyOtp.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import Layout from './Layout.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 誰でも見れる */}
          <Route path='/signin' element={<SignIn />} />
          <Route path='/verify-otp' element={<VerifyOtp />} />

          {/* ログイン必須ページは ProtectedRoute で守る */}
          <Route element={<Layout>
          </Layout>}>
            <Route path='/' element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            } />
            <Route path='/categories' element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            } />
            <Route path='/invite' element={
              <ProtectedRoute>
                <Invite />
              </ProtectedRoute>
            } />
            <Route path='/profile' element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path='/expenses' element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)