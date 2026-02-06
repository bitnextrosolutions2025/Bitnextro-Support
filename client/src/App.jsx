import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginComponent from './components/Login'
import RegisterPage from './components/RegisterPage'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { ToastContainer,Flip } from 'react-toastify'
import SupportPortal from './components/Support'
import TicktSubmit from './pages/TicktSubmit'
import TickeCheck from './pages/TiecktCheck'
import Navbar from './components/Navbar'
function App() {

  return (
    <>
    <BrowserRouter>
    <ToastContainer transition={Flip}/>
    <Navbar/>
    <Routes>
      <Route path='/' element={<LoginComponent/>}/>
      <Route path='/adminbitnextro' element={<RegisterPage/>}/>
      <Route path='/support' element={<SupportPortal/>}/>
      <Route path='/ticket' element={<TicktSubmit/>}/>
      <Route path='/checkticket' element={<TickeCheck/>}/>
      

    </Routes>
    </BrowserRouter>
   
    
    </>
  )
}

export default App
