import React from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Form from './Form'

function App() {
  return (
    <div id="app">
      <nav>
        {/* NavLinks here */}
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink>
        <NavLink to="/order" className={({ isActive }) => (isActive ? "active" : "")}>Order</NavLink>
      </nav>
      {/* Route and Routes here */}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/order' element={<Form />} />
      </Routes>
      <Home />
      <Form />
    </div>
  )
}

export default App
