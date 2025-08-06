import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import Categories from './pages/Categories.tsx'
import SingUp from './pages/SingUp.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/singup' element={<SingUp />} />
        <Route path='/categories' element={<Categories />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)