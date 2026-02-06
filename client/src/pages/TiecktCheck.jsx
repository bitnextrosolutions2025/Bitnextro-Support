import React, { useEffect, useState } from 'react';
import {
    FileText,
    ArrowRight,
    Search,
    CheckCircle2,
    Clock,
    AlertCircle,
    Menu,
    X,
    Plus,
    HelpCircle
} from 'lucide-react';
import { handleError } from '../components/ErrorMessage';
import secureLocalStorage from 'react-secure-storage';
import { useNavigate } from 'react-router';

// --- Components ---

/**
 * ServiceCard: The specific component requested in the image.
 * replicates the visual style: Green left border, icon container, typography.
 */

/**
 * TicketResult: Displays a mock ticket result with a timeline.
 */
const TicketResult = ({ ticketdata }) => {
    // Mock data simulation based on ID
    const formatted = new Date(ticketdata.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    // console.log(formatted);
     const f2=formatted.split(" ").slice(0,2).join(" ")
    const steps = [
        { title: 'Ticket Created', date: formatted, status: 'completed' },
        { title: 'Forword to admin Panel', date: f2, status: 'completed' },
        { title: 'Check by admin', date: 'NA', status: 'pending' },
        // { title: 'Resolved', date: 'Estimated Oct 28', status: 'pending' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up">
            <div className="bg-emerald-600 p-6 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-block px-3 py-1 bg-emerald-500/50 rounded-full text-xs font-semibold mb-2 backdrop-blur-sm border border-emerald-400/30">
                            Priority {ticketdata.t_priority}
                        </span>
                        <h2 className="text-2xl font-bold">Ticket #{ticketdata.t_uid}</h2>
                        <p className="text-emerald-100 mt-1"></p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                        <Clock className="text-white" size={24} />
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8">
                <h4 className="text-slate-800 font-bold mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    Current Status
                </h4>

                {/* Timeline */}
                <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative pl-6">
                            {/* Timeline Dot */}
                            <div className={`
                absolute -left-2.25 top-1 w-4 h-4 rounded-full border-2 
                ${step.status === 'completed' ? 'bg-emerald-500 border-emerald-500' :
                                    step.status === 'current' ? 'bg-white border-emerald-500 ring-4 ring-emerald-100' :
                                        'bg-slate-100 border-slate-300'}
              `}>
                                {step.status === 'completed' && <CheckCircle2 size={12} className="text-white mx-auto mt-px" />}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                <span className={`font-semibold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                                    {step.title}
                                </span>
                                <span className="text-xs font-medium text-slate-400 mt-1 sm:mt-0">{step.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function TickeCheck() {
    const [searchTerm, setSearchTerm] = useState('');
    const [ticketResult, setTicketResult] = useState(null);
    const [activeTab, setActiveTab] = useState('search');
    const [loading, setLoading] = useState(false);
    const [ticktalldata, setticketdata] = useState({})
    const naviget=useNavigate()
 useEffect(()=>{
     const fecthuser=()=>{
        const token=secureLocalStorage.getItem("auth-token");
        if(!token){
          handleError("Login frist!!")
           return naviget("/")
        }
     }
     fecthuser()
 },[])
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;
        // console.log(searchTerm)
        setLoading(true);
        setTicketResult(null);
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/v2/tickt/findtikctstatus`
        const responce = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ticket: searchTerm })
        })
        const data = await responce.json();
        // console.log(data)
        setticketdata(data.ticketdata)
        // Simulate API call
        if(!data.status){
            setLoading(false);
            return handleError("Ticket no is not find.")

        }
        setTicketResult(searchTerm);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">

            {/* Navigation */}
         

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Action Grid */}

                {/* Dynamic Content Area */}
                <div className="transition-all duration-500 ease-in-out">

                    {activeTab === 'search' && (
                        <div className="max-w-2xl mx-auto">
                            {/* Search Box */}
                            <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100 flex items-center mb-8 focus-within:ring-4 focus-within:ring-emerald-100 transition-shadow">
                                <div className="pl-4 text-slate-400">
                                    <Search size={24} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter your Ticket ID (e.g. #88349)"
                                    className="flex-1 p-4 bg-transparent outline-none text-lg text-slate-700 placeholder:text-slate-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 m-1 shadow-sm hover:shadow-md"
                                >
                                    {loading ? 'Searching...' : 'Check Status'}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-500">Retrieving ticket details...</p>
                                </div>
                            )}

                            {/* Result State */}
                            {!loading && ticketResult && (
                                <TicketResult ticketdata={ticktalldata} />
                            )}

                            {/* Empty State / Hint */}
                            {!loading && !ticketResult && (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4 text-slate-400">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">Locate your Ticket ID</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">
                                        You can find your 8-digit Ticket ID in the confirmation email sent when you created the request.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}



                </div>

            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
                    <p>&copy; 2024 TicketFlow Support. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}