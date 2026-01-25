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
function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<LoginComponent/>}/>
      <Route path='/adminbitnextro' element={<RegisterPage/>}/>
    </Routes>
    </BrowserRouter>
   
    
    </>
  )
}

export default App
