import React, { useEffect, useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import logo from "../assets/f_logo.jpg"
import { handleError, handleSuccess } from './ErrorMessage';
import { useNavigate } from 'react-router';
import  secureLocalStorage  from  "react-secure-storage";
import { useAuth } from "../context/AuthContext";
export default function LoginComponent() {
    const [showPassword, setShowPassword] = useState(false);
     const { user } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        remember: false
    });
 const [loder,setLoder]=useState(false)
 const naviget=useNavigate()
//    useEffect(() => {
//      const fecthuser = async () => {
//        // const user1 = await user; 
//        const token = await user
//      //    const token = await auth.currentUser.getIdToken();
//      // console.log(token)
//        console.log(token)
//        // if (user) {
//        //   const email = user.email;
//        //   console.log(email);
//        // }
//      }
//      fecthuser()
 
//    }, [])
 useEffect(()=>{
     const fecthuser=()=>{
        const token=secureLocalStorage.getItem("auth-token");
        if(token){
            
           return naviget("/support")
        }
     }
     fecthuser()
 },[])
    const handleSubmit = async(e) => {
        e.preventDefault();
          setLoder(true)
         const url=`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/login`
        const responce= await fetch(url,{
            method:'POST',
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({name:formData.username,password:formData.password})
        })
        const resdata= await responce.json()
        if(!resdata.status){
             handleError("Invalid credential. Try again!")
            return setLoder(false);
        }
        handleSuccess("Login Successful");
       let h_token=resdata.hased_token;
       let removeSfromtoken=h_token.replace(import.meta.env.VITE_SECRET_CODE,"")
        let index_arrya=resdata.array
        let s_token=removeSfromtoken.split("")
        for (let index = 0; index <10; index++) {
            let i=index_arrya[index]-index
            s_token.splice(i,1)
            
        }
        const final=s_token.join("")
        secureLocalStorage.setItem("auth-token", final)
        return naviget("/support");
    };
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-gray-600 via-gray-700 to-gray-800 p-4 sm:p-6 lg:p-8">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md top-17.5 mb-17.5">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                    {/* Header Section */}
                    <div className="bg-white px-2 py-2 text-center flex items-center justify-center">
                        <img src={logo} alt="Logo" className='h-24' />
                                            </div>

                    {/* Form Section */}
                    <div className="px-8 py-8 space-y-6">
                        {/* Username Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Username
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Options Row */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">
                                    Remember me
                                </span>
                            </label>
                            <a
                                href="#"
                                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                Forgot Password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-linear-to-r from-green-600 to-green-700 text-white py-3.5 rounded-3xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex justify-center"
                        >
                            {loder?<div className="loader mr-3.5"></div>:'LogIn'}
                        </button>

                        {/* Divider */}
                    </div>
                </div>

                {/* Footer Text */}
                <p className="text-center text-sm text-white/80 mt-6">
                    Protected by industry-standard encryption
                </p>
            </div>

            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
}