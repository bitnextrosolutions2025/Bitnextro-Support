import { FileText } from 'lucide-react'
import React from 'react'
import logo from "../assets/logo.jpg"
import { Link } from 'react-router'
export default function Navbar() {
    return (
        <div>
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                       <Link to="/"> <div className="flex items-center gap-2">
                            <div className="bg-emerald-600 p-1.5 rounded-lg">
                                <img src={logo} alt="" className='h-12'/>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-800">
                                Bitnextro<span className="text-emerald-600"> Support</span>
                            </span>
                        </div></Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
                            <a href="#" className="hover:text-emerald-600 transition-colors">Dashboard</a>
                            <a href="#" className="text-emerald-600">Track Ticket</a>
                            <a href="#" className="hover:text-emerald-600 transition-colors">Knowledge Base</a>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}
