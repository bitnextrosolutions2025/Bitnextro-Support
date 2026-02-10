import React, { useEffect, useState } from 'react';
import {
  Ticket,
  User,
  Mail,
  Phone,
  Briefcase,
  Clock,
  AlertCircle,
  X,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { handleError } from './ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

export default function AdminTicketCheck() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const naviget = useNavigate()
  useEffect(() => {
    const getoken = async () => {
      if (user.email === "bitnextrosolutions@gmail.com") {
        return;
      }
      handleError("Invalid admin")
      return naviget("/adminbitnextro")
    }
    getoken();
    const fetchTickets = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/v2/tickt/allticket`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json"
          },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        if (data.allticket) {
          setTickets(data.allticket);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);// Fallback for demo purposes
        return handleError("Some error happen !! refresh again")
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  // Format Date Helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Priority Color Helper
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-50 text-red-600 border-red-100';
      case 'medium': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'low': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-emerald-400 to-sky-500 rounded-xl shadow-lg shadow-sky-200">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          Admin Ticket Dashboard
        </h1>
        <p className="mt-2 text-slate-500 ml-16">Overview of all active support tickets currently in the system.</p>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white rounded-2xl shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-sky-100 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 pb-4 border-b border-slate-50">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                      ID: {ticket.t_uid}
                    </span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase ${getPriorityColor(ticket.t_priority)}`}>
                      {ticket.t_priority}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-sky-600 transition-colors">
                    {ticket.t_subject}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                    <User className="w-4 h-4 text-sky-400" />
                    <span className="font-medium capitalize">
                      {ticket.c_name_f} {ticket.c_name_l}
                    </span>
                  </div>

                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {ticket.t_disc}
                  </p>
                </div>

                {/* Card Footer / Action */}
                <div className="p-4 bg-slate-50/50 mt-auto">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="w-full flex items-center justify-center gap-2 bg-white text-sky-600 font-semibold py-3 rounded-xl border border-sky-100 hover:bg-sky-500 hover:text-white hover:border-transparent transition-all duration-200 group-focus:ring-2 ring-sky-200"
                  >
                    Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedTicket(null)}
          ></div>

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 border border-slate-100">

            {/* Modal Header */}
            <div className="bg-linear-to-r from-slate-50 to-white px-8 py-6 border-b border-slate-100 sticky top-0 flex justify-between items-start z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-800">Ticket Details</h2>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase ${getPriorityColor(selectedTicket.t_priority)}`}>
                    {selectedTicket.t_priority} Priority
                  </span>
                </div>
                <p className="text-slate-500 text-sm flex items-center gap-2">
                  Ticket ID: <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{selectedTicket.t_uid}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 bg-white rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8">

              {/* Subject & Description */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Subject</label>
                  <h3 className="text-xl font-semibold text-slate-800 mt-1">{selectedTicket.t_subject}</h3>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Description</label>
                  <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 leading-relaxed">
                    {selectedTicket.t_disc}
                  </div>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Column: User Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-sky-600 flex items-center gap-2 pb-2 border-b border-sky-100">
                    <User className="w-4 h-4" /> Client Information
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Full Name</p>
                        <p className="text-slate-700 font-medium capitalize">{selectedTicket.c_name_f} {selectedTicket.c_name_l}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Email Address</p>
                        <p className="text-slate-700 font-medium">{selectedTicket.c_email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Phone Number</p>
                        <p className="text-slate-700 font-medium">+{selectedTicket.c_phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Ticket Metadata */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-emerald-600 flex items-center gap-2 pb-2 border-b border-emerald-100">
                    <Briefcase className="w-4 h-4" /> Status & Metadata
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Department</p>
                        <p className="text-slate-700 font-medium uppercase">{selectedTicket.c_department}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Current Status</p>
                        <p className="text-slate-700 font-medium">{selectedTicket.t_status}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Created At</p>
                        <p className="text-slate-700 font-medium">{formatDate(selectedTicket.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-6 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors shadow-lg shadow-slate-200"
              >
                Close Details
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-6 py-2.5 ml-3 bg-green-800 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-slate-200"
              >
                Checked by admin
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}