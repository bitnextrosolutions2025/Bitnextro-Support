import React, { useState } from 'react';
import { Menu, X, FileText } from 'lucide-react';
import logo from "../assets/logo.jpg";
import { Link, useLocation } from 'react-router'; // or 'react-router-dom' depending on your version

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation()
    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                        <div className="bg-emerald-600 p-1.5 rounded-lg shrink-0">
                            <img src={logo} alt="Logo" className='h-8 w-auto' /> {/* Adjusted height for consistency */}
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-800">
                            Bitnextro<span className="text-emerald-600"> Support</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation (Hidden on mobile) */}
                    {location.pathname==="/adminbitnextro"?
                    <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
                        <Link to="/adminbitnextro" className="hover:text-emerald-600 transition-colors">
                            Creat user
                        </Link>
                        <Link to="/checkticket" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                            Check new Ticket
                        </Link>
                    </div>
                    :<div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
                        <Link to="/" className="hover:text-emerald-600 transition-colors">
                            Dashboard
                        </Link>
                        <Link to="/checkticket" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                            Track Ticket
                        </Link>
                        <Link to="/" className="hover:text-emerald-600 transition-colors">
                            Knowledge Base
                        </Link>
                    </div>}

                    {/* Mobile Menu Button (Visible only on mobile) */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Icon toggles between Menu and X */}
                            {isOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown (Conditionally rendered) */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link 
                            to="/" 
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link 
                            to="/checkticket" 
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                        >
                            Track Ticket
                        </Link>
                        <Link 
                            to="/" 
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                            Knowledge Base
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}