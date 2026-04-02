import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginComponent from './components/Login'
import RegisterPage from './components/RegisterPage'
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer,Flip } from 'react-toastify'
import SupportPortal from './components/Support'
import TicktSubmit from './pages/TicktSubmit'
import TickeCheck from './pages/TiecktCheck'
import Navbar from './components/Navbar'
import Adminticketcheck from './components/Adminticketcheck'
import Adminbilling from './components/Adminbilling'
import AddBlog from './components/AddBlog'
import AddMsmBlog from './components/AddMsmBlog'
function App() {
// const location=useLocation()
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
      <Route path='/adminticktcheck' element={<Adminticketcheck/>}/>
      <Route path='/billing' element={<Adminbilling/>}/>
      <Route path='/addblog' element={<AddBlog/>}/>
      <Route path='/addmsmblog' element={<AddMsmBlog/>}/>
      

    </Routes>
    </BrowserRouter>
   
    
    </>
  )
}

export default App
