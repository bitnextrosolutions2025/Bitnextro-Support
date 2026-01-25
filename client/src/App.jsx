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
function App() {

  return (
    <>
    <BrowserRouter>
    <ToastContainer transition={Flip}/>
    <Routes>
      <Route path='/' element={<LoginComponent/>}/>
      <Route path='/adminbitnextro' element={<RegisterPage/>}/>
      <Route path='/support' element={<SupportPortal/>}/>

    </Routes>
    </BrowserRouter>
   
    
    </>
  )
}

export default App
