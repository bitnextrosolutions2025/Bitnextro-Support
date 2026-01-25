import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logo from "../assets/f_logo.jpg"
const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userdata,setUserdata]=useState({name:"",gmail:"",password:""})
  const onChange=(e)=>{
    setUserdata({...userdata,[e.target.value]:e.target.name})
  }
  const handlesubmit=(e)=>{
    e.preventDefault();
     console.log(userdata)
  }
  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -left-[10%] top-[20%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute -right-[10%] bottom-[20%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]"></div>
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
            className="w-full bg-[#00A651] hover:bg-[#009247] text-white font-bold py-3.5 rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all duration-200 transform hover:-translate-y-0.5 mt-4"
          >
            Register
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