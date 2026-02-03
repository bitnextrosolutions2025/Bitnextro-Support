import React, { useEffect } from 'react';
import  secureLocalStorage  from  "react-secure-storage";
import { 
  LifeBuoy, 
  MessageCircle, 
  FileText, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Zap,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';

const SupportPortal = () => {
  const naviget=useNavigate()
  useEffect(()=>{
    const token=secureLocalStorage.getItem("auth-token");
    if(!token){
      naviget("/")
    }
},[])
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">
      
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] bg-linear-to-br from-blue-100/40 to-emerald-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[40vw] h-[40vw] bg-linear-to-tr from-emerald-100/30 to-blue-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 z-10 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-4 animate-fade-in-up">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600">System Operational</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            How can we <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-emerald-500">help you</span> today?
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Welcome to the Service Best Support Portal. Browse our knowledge base, check ticket status, or connect with our expert team instantly.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group mt-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xl shadow-slate-200/50 transition-all duration-300"
              placeholder="Search for articles, error codes, or topics..."
            />
            <button className="absolute right-2 top-2 bottom-2 bg-linear-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white px-6 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg">
              Search
            </button>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: Submit Ticket */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 border border-slate-100 transition-all duration-300 cursor-pointer overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <LifeBuoy className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Submit a Ticket</h3>
            <p className="text-slate-500 mb-6">Facing a technical issue? Create a support request and track its progress.</p>
            <Link to="/ticket"><div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Open Request <ArrowRight className="h-4 w-4 ml-2" />
            </div></Link>
          </div>

          {/* Card 2: Knowledge Base */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 border border-slate-100 transition-all duration-300 cursor-pointer overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Knowledge Base</h3>
            <p className="text-slate-500 mb-6">Browse guides, tutorials, and FAQs to find answers quickly on your own.</p>
            <div className="flex items-center text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              View Articles <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </div>

          {/* Card 3: Live Chat */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 border border-slate-100 transition-all duration-300 cursor-pointer overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="h-7 w-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">Live Chat</h3>
            <p className="text-slate-500 mb-6">Need immediate assistance? Chat with one of our support agents now.</p>
            <div className="flex items-center text-indigo-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Start Chat <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </div>
        </div>

        {/* Quick Links / Featured Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <ShieldCheck size={120} />
            </div>
            <div className="relative z-10">
              <div className="bg-white/20 w-fit p-3 rounded-xl mb-4 backdrop-blur-sm">
                <ShieldCheck className="text-white h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Admin Portal Login</h3>
              <p className="text-blue-100 mb-6 max-w-sm">Manage your organization's settings, users, and billing details securely.</p>
              <button className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2">
                Sign In Securely <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden group">
             <div className="flex flex-col h-full justify-between">
                <div>
                   <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <Zap className="text-amber-500 fill-current" /> Recent Updates
                   </h3>
                   <div className="space-y-4">
                     <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <p className="text-slate-800 font-medium text-sm">New Dashboard Features Released</p>
                          <p className="text-slate-400 text-xs mt-1">Today, 9:00 AM</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        <div>
                          <p className="text-slate-800 font-medium text-sm">Scheduled Maintenance Notice</p>
                          <p className="text-slate-400 text-xs mt-1">Yesterday, 4:30 PM</p>
                        </div>
                     </div>
                   </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                   <span className="text-sm text-slate-500">System Version 2.4.0</span>
                   <button className="text-blue-600 text-sm font-semibold hover:underline">View Changelog</button>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupportPortal;