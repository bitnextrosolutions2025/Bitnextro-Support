import React, { useEffect, useState } from 'react';
import {
    ArrowRight,
    Search,
    CheckCircle2,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { handleError } from '../components/ErrorMessage'; // Ensure this path is correct
import secureLocalStorage from 'react-secure-storage';
import { useNavigate } from 'react-router';

// --- Components ---

const TicketResult = ({ ticketdata }) => {
    // Safe date formatting
    let formattedDate = "N/A";
    let shortDate = "N/A";

    if (ticketdata?.createdAt) {
        formattedDate = new Date(ticketdata.createdAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        // safely extract first two parts for short date
        shortDate = formattedDate.split(" ").slice(0, 2).join(" ");
    }

    const steps = [
        { title: 'Ticket Created', date: formattedDate, status: 'completed' },
        { title: 'Forward to Admin Panel', date: shortDate, status: 'completed' },
        { title: 'Check by Admin', date: 'Pending', status: 'pending' },
        // { title: 'Resolved', date: 'Estimated Oct 28', status: 'pending' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up w-full max-w-3xl mx-auto">
            {/* Header Section */}
            <div className="bg-emerald-600 p-4 sm:p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-emerald-500/50 rounded-full text-xs font-semibold mb-2 backdrop-blur-sm border border-emerald-400/30">
                            Priority {ticketdata.t_priority || 'Normal'}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold break-all">
                            Ticket #{ticketdata.t_uid}
                        </h2>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md self-start sm:self-auto">
                        <Clock className="text-white" size={24} />
                    </div>
                </div>
            </div>

            {/* Body Section */}
            <div className="p-4 sm:p-6 md:p-8">
                <h4 className="text-slate-800 font-bold mb-6 flex items-center gap-2 text-lg">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    Current Status
                </h4>

                {/* Timeline */}
                <div className="relative pl-2 sm:pl-4">
                    <div className="border-l-2 border-slate-100 space-y-8 ml-2">
                        {steps.map((step, idx) => (
                            <div key={idx} className="relative pl-6 sm:pl-8">
                                {/* Timeline Dot */}
                                <div className={`
                                    absolute -left-2.25 top-1 w-4 h-4 rounded-full border-2 z-10 box-content
                                    ${step.status === 'completed' ? 'bg-emerald-500 border-emerald-500' :
                                        step.status === 'current' ? 'bg-white border-emerald-500 ring-4 ring-emerald-100' :
                                            'bg-slate-100 border-slate-300'}
                                `}>
                                    {step.status === 'completed' && <CheckCircle2 size={12} className="text-white mx-auto mt-px" />}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-4">
                                    <span className={`font-semibold text-sm sm:text-base ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                                        {step.title}
                                    </span>
                                    <span className="text-xs sm:text-sm font-medium text-slate-400">
                                        {step.date}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function TicketCheck() {
    const [searchTerm, setSearchTerm] = useState('');
    const [ticketResult, setTicketResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ticketAllData, setTicketData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = () => {
            const token = secureLocalStorage.getItem("auth-token");
            if (!token) {
                // Check if handleError exists, otherwise generic alert
                try { handleError("Login first!!"); } catch (e) { alert("Login first!!"); }
                return navigate("/");
            }
        }
        fetchUser();
    }, [navigate]);

    const handleSearch = async (e) => {
        if(e) e.preventDefault();
        if (!searchTerm) return;

        setLoading(true);
        setTicketResult(null);

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/api/v2/tickt/findtikctstatus`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ticket: searchTerm })
            });
            const data = await response.json();

            setTicketData(data.ticketdata);

            if (!data.status) {
                setLoading(false);
                try { handleError("Ticket number not found."); } catch(e) { alert("Ticket number not found."); }
                return;
            }
            setTicketResult(searchTerm);
        } catch (error) {
            console.error(error);
            try { handleError("Network Error"); } catch(e) { alert("Network Error"); }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
            
            {/* Main Content */}
            <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                
                {/* Dynamic Content Area */}
                <div className="transition-all duration-500 ease-in-out">
                    <div className="max-w-2xl mx-auto w-full">
                        
                        {/* Search Box */}
                        <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center mb-8 focus-within:ring-4 focus-within:ring-emerald-100 transition-shadow">
                            <div className="pl-4 py-3 sm:py-0 text-slate-400 hidden sm:block">
                                <Search size={24} />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter Ticket ID (e.g. #88349)"
                                className="flex-1 p-3 sm:p-4 bg-transparent outline-none text-base sm:text-lg text-slate-700 placeholder:text-slate-400 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 m-1 shadow-sm hover:shadow-md active:scale-95"
                            >
                                {loading ? (
                                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Check</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Loading State - Desktop Only (Button shows spinner on mobile) */}
                        {loading && (
                            <div className="text-center py-12 hidden sm:block">
                                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-500">Retrieving ticket details...</p>
                            </div>
                        )}

                        {/* Result State */}
                        {!loading && ticketResult && (
                            <div className="w-full flex justify-center">
                                <TicketResult ticketdata={ticketAllData} />
                            </div>
                        )}

                        {/* Empty State / Hint */}
                        {!loading && !ticketResult && (
                            <div className="text-center py-8 px-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4 text-slate-400">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">Locate your Ticket ID</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm leading-relaxed">
                                    You can find your Ticket ID in the confirmation email sent when you created the request.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-8 sm:py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} TicketFlow Support. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}