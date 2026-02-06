import React, { useState } from 'react';
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

// --- Components ---

/**
 * ServiceCard: The specific component requested in the image.
 * replicates the visual style: Green left border, icon container, typography.
 */
const ServiceCard = ({ icon: Icon, title, subtitle, linkText, active, onClick }) => (
    <div
        onClick={onClick}
        className={`
      relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300
      border-l-[6px] shadow-sm hover:shadow-xl group
      ${active ? 'border-emerald-600 ring-2 ring-emerald-100 shadow-md' : 'border-emerald-500/30 hover:border-emerald-500'}
    `}
    >
        <div className="flex flex-col h-full justify-between space-y-4">
            <div>
                <div className={`
          w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors
          ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}
        `}>
                    <Icon size={28} strokeWidth={2} />
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    {subtitle}
                </p>
            </div>

            <div className="flex items-center text-emerald-600 font-bold text-sm mt-2 group-hover:translate-x-1 transition-transform">
                {linkText} <ArrowRight size={16} className="ml-2" />
            </div>
        </div>
    </div>
);

/**
 * TicketResult: Displays a mock ticket result with a timeline.
 */
const TicketResult = ({ ticketdata }) => {
    // Mock data simulation based on ID
    const steps = [
        { title: 'Ticket Created', date: 'Oct 24, 2025', status: 'completed' },
        { title: 'Assigned to Agent', date: 'Oct 25, 2025', status: 'completed' },
        { title: 'In Progress', date: 'Oct 26, 2025', status: 'current' },
        { title: 'Resolved', date: 'Estimated Oct 28', status: 'pending' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up">
            <div className="bg-emerald-600 p-6 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-block px-3 py-1 bg-emerald-500/50 rounded-full text-xs font-semibold mb-2 backdrop-blur-sm border border-emerald-400/30">
                            High Priority
                        </span>
                        <h2 className="text-2xl font-bold">Ticket #{ticketdata.t_uid}</h2>
                        <p className="text-emerald-100 mt-1">Login Issue on Mobile App</p>
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
    const [activeTab, setActiveTab] = useState('search'); // 'search', 'create', 'faq'
    const [ticketResult, setTicketResult] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ticktalldata,setticketdata]=useState({})

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;
         console.log(searchTerm)
        setLoading(true);
        setTicketResult(null);
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/v2/tickt/findtikctstatus`
        const responce = await fetch(url,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ticket: searchTerm })
        })
        const data= await responce.json();
        console.log(data)
        setticketdata(data.ticketdata)
        // Simulate API call

            setTicketResult(searchTerm);
            setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">

            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-600 p-1.5 rounded-lg">
                                <FileText className="text-white" size={20} />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-800">
                                Ticket<span className="text-emerald-600">Flow</span>
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
                            <a href="#" className="hover:text-emerald-600 transition-colors">Dashboard</a>
                            <a href="#" className="text-emerald-600">Track Ticket</a>
                            <a href="#" className="hover:text-emerald-600 transition-colors">Knowledge Base</a>
                            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all">
                                Sign In
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-lg">
                        <a href="#" className="block py-2 px-3 hover:bg-slate-50 rounded-lg font-medium">Dashboard</a>
                        <a href="#" className="block py-2 px-3 bg-emerald-50 text-emerald-700 rounded-lg font-medium">Track Ticket</a>
                        <a href="#" className="block py-2 px-3 hover:bg-slate-50 rounded-lg font-medium">Knowledge Base</a>
                        <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium">Sign In</button>
                    </div>
                )}
            </nav>

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