import React, { useEffect, useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import {
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import logo from "../assets/f_logo.jpg"
import { handleError, handleSuccess } from './ErrorMessage';
import { Link } from 'react-router';
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";
// import AdminLogin from './AdminLogin';
const RegisterPage = () => {
  const { user, googleSignIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [userdata, setUserdata] = useState({ name: "", gmail: "", password: "" })
  const [loder, setLoder] = useState(false)
  const [adminCheck, setadminCheck] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  useEffect(() => {
    const getoken = async () => {
      if(user.email==="bitnextrosolutions@gmail.com"){
         handleSuccess("Welcome to admin portal.")
         return setadminCheck(true)
      }
      handleError("Invalid admin")
    }
    getoken()
  }, [user])

  const handlelogin = async () => {
    const data = await googleSignIn();
    console.log(data.user)
    console.log(data.user.email)
    if (data.user.email === 'bitnextrosolutions@gmail.com') {
      handleSuccess("Welcome to admin portal.")
      return setadminCheck(true)

    }
    handleError("Invalid admin")
  }
  const onChange = (e) => {
    setUserdata({ ...userdata, [e.target.name]: e.target.value })
  }
  const handlesubmit = async (e) => {
    e.preventDefault();
    setLoder(true)

    const urlmail = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/sendemail`
    const responcemail = await fetch(urlmail, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: userdata.gmail, username: userdata.name, password: userdata.password })
    })
    const datamail = await responcemail.json();
    console.log(datamail)

    const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/register`
    const responce = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: userdata.name, password: userdata.password, email: userdata.gmail })
    })
    const resdata = await responce.json()
    if (!resdata.status) {
      handleError("Some Error occured. Try again!")
      return setLoder(false);
    }
    handleSuccess("Account register is Successfull");

    setUserdata({
      name: "",
      gmail: "",
      password: ""
    });
    return setLoder(false)
  }
  if (!adminCheck) {
    return (
      <div className="min-h-screen flex bg-slate-50 relative overflow-hidden font-sans">

        {/* Left Side - Visual / Brand Area (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-12 text-white">
          {/* Abstract Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/20 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
          </div>

          {/* Brand Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-linear-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">ServiceBest<span className="text-emerald-400">Admin</span></span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Manage your<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
                digital ecosystem
              </span>
              <br />securely.
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Access the centralized dashboard to monitor tickets, manage users, and configure system settings with enterprise-grade security.
            </p>
          </div>

          {/* Feature List */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>Real-time Analytics Dashboard</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>Role-Based Access Control</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>256-bit Encrypted Session</span>
            </div>
          </div>

          <div className="relative z-10 text-xs text-slate-500">
            © 2024 Service Best Solutions. All rights reserved.
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
          <div className="w-full max-w-md space-y-8">

            {/* Mobile Header (Only visible on small screens) */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex h-12 w-12 bg-linear-to-br from-blue-500 to-emerald-500 rounded-xl items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Admin Portal</h2>
              <p className="text-slate-500 mt-2">Sign in to access the dashboard</p>
            </div>

            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
            </div>

            <button
              className="flex items-center justify-center gap-3 px-5 py-2.5 bg-white text-gray-800 border border-gray-200 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:hover:-translate-y-pxactive:scale-95 transition-all duration-200 ease-in-out"
              onClick={handlelogin}
            >
              <FcGoogle className="text-xl" />
              <span className="text-sm md:text-base">Continue with Google</span>
            </button>
            <div className="text-center pt-4">
              <p className="text-sm text-slate-500">
                Not an administrator?{' '}
                <Link to="/" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">
                  Return to Customer Support
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4 relative overflow-hidden flex-col">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -left-[10%] top-[20%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute -right-[10%] bottom-[20%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]"></div>
      </div>
      <div className="z-10 text-center mb-8 animate-fade-in-down">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm text-emerald-400 text-sm font-medium">
          <ShieldCheck size={16} /> Secure Registration
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 drop-shadow-2xl">
          Welcome to <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">Admin Portal</span>
        </h1>
        <p className="text-slate-400 text-lg">Initialize a new administrator account</p>
      </div>
      <div className="bg-white w-full max-w-112.5 rounded-2xl shadow-2xl z-10 p-8">

        {/* Logo Area */}
        <div className="flex flex-col items-center mb-8">
          {/* Placeholder for the Logo - Replace src with your actual logo */}
          <img src={logo} alt="Logo" className='h-24' />
        </div>

        <form className="space-y-5" onSubmit={handlesubmit}>
          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="name"
                onChange={onChange}
                value={userdata.name}
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                placeholder="Enter username"
              />
            </div>
          </div>

          {/* Gmail/Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Gmail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                name='gmail'
                value={userdata.gmail}
                required
                onChange={onChange}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                placeholder="Enter your gmail"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name='password'
                value={userdata.password}
                required
                onChange={onChange}
                className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-[#00A651] hover:bg-[#009247] text-white font-bold py-3.5 rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all duration-200 transform hover:-translate-y-0.5 mt-4 flex justify-center"
          >
            {loder ? <div className="loader mr-3.5"></div> : "Register"}
          </button>
        </form>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-6 w-full text-center">
        <p className="text-slate-400 text-xs">Protected by industry standard encryption</p>
      </div>
    </div>
  );
};

export default RegisterPage;