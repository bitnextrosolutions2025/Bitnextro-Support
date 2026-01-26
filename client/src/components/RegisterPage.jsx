import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import {  
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import logo from "../assets/f_logo.jpg"
import { handleError, handleSuccess } from './ErrorMessage';
// import AdminLogin from './AdminLogin';
const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userdata,setUserdata]=useState({name:"",gmail:"",password:""})
  const [loder,setLoder]=useState(false)
  const [adminCheck,setadminCheck]=useState(false)
    const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log(formData)
    if(formData.username===import.meta.env.VITE_USERNAME && formData.password===import.meta.env.VITE_PASSWORD ){
      handleSuccess("Welcome to admin portal.")
      return setadminCheck(true)
    }
    handleError("Invalid credential")
    setIsLoading(false)
  };
  const onChange=(e)=>{
    setUserdata({...userdata,[e.target.name]:e.target.value})
  }
  const handlesubmit=async(e)=>{
    e.preventDefault();
    
        const url=`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/register`
        setLoder(true)
        const responce= await fetch(url,{
            method:'POST',
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({name:userdata.name,password:userdata.password,email:userdata.gmail})
        })
        const resdata= await responce.json()
        
        console.log(resdata);
        if(!resdata.status){
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
  if(!adminCheck){
    return(
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

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username Input */}
            <div className="space-y-2">
              <label 
                htmlFor="username" 
                className={`text-sm font-semibold transition-colors duration-200 ${focusedField === 'username' ? 'text-blue-600' : 'text-slate-700'}`}
              >
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 transition-colors duration-200 ${focusedField === 'username' ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-slate-300"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="password" 
                  className={`text-sm font-semibold transition-colors duration-200 ${focusedField === 'password' ? 'text-blue-600' : 'text-slate-700'}`}
                >
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors duration-200 ${focusedField === 'password' ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-slate-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Terms */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
                Keep me logged in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              <div className="absolute inset-0 w-full h-full bg-linear-to-r from-blue-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-4">
             <p className="text-sm text-slate-500">
               Not an administrator?{' '}
               <a href="#" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline">
                 Return to Customer Support
               </a>
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
            {loder?<div className="loader mr-3.5"></div>:"Register"}
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