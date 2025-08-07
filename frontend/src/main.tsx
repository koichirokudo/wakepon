import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import Categories from './pages/Categories.tsx'
import SignUp from './pages/SignUp.tsx'
import SignIn from './pages/SignIn.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/signin' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/categories' element={<Categories />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)