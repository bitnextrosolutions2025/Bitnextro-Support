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
  CheckCircle2,
  Calendar,
  MessageSquare,
  Search
} from 'lucide-react';
import { handleError, handleSuccess } from './ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

export default function AdminTicketCheck() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [adminCheck, setAdminCheck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [doneUser, setDoneUser] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  
  const [resolveModal, setResolveModal] = useState(false);
  const [resolveDate, setResolveDate] = useState(new Date().toISOString().split('T')[0]);
  const [resolveMessage, setResolveMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      try {
        if (user?.email === "bitnextrosolutions@gmail.com") {
          setDoneUser(true);
          return;
        }
        handleError("Unauthorized access.");
        return navigate("/adminbitnextro");
      } catch (error) {
        handleError("Authentication error.");
        return navigate("/adminbitnextro");
      }
    };
    getToken();
  }, [user, navigate]);

  useEffect(() => {
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
          const newTickets = [];
          const adminCheckTickets = [];
          
          for (const ticket of data.allticket) {
            if (ticket.t_status === "Tickt is forword to Admin panel.") {
              newTickets.push(ticket);
            }
            if (ticket.t_status === "Checked by admin and work in Process if need our team get you soon") {
              adminCheckTickets.push(ticket);
            }
          }
          setTickets(newTickets);
          setAdminCheck(adminCheckTickets);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
        return handleError("Unable to load tickets. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    
    if (doneUser) {
      fetchTickets();
    }
  }, [doneUser]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const adminUpdate = async (e, id) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v2/tickt/updateticket/${id}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      
      if (data.status) {
        handleSuccess("Ticket status updated successfully.");
        // Re-fetch or locally update state here if needed
      } else {
        handleError("Failed to update ticket status.");
      }
    } catch (error) {
      console.error(error);
      handleError("Server Connection Error");
    } finally {
      setIsUpdating(false);
    }
  };

  const adminUpdateResolve = async (e, id) => {
    e.preventDefault();
    setResolveModal(true);
  };

  const handleFinalResolve = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v2/tickt/update-resolve`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTicket._id, date: resolveDate, message: resolveMessage })
      });
      const data = await res.json();
      
      handleSuccess("Ticket resolved successfully!");
      setResolveModal(false);
      setResolveMessage('');
      setSelectedTicket(null);
    } catch (error) {
      handleError("Failed to resolve ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const p = priority?.toLowerCase();
    const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-md border uppercase tracking-wide";
    
    switch (p) {
      case 'high': return `${baseClasses} bg-red-50 text-red-700 border-red-200`;
      case 'medium': return `${baseClasses} bg-amber-50 text-amber-700 border-amber-200`;
      case 'low': return `${baseClasses} bg-green-50 text-green-700 border-green-200`;
      default: return `${baseClasses} bg-gray-50 text-gray-700 border-gray-200`;
    }
  };

  const TicketSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse h-56 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-gray-50 rounded-lg w-full"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      
      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Support Desk</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center px-3 py-1.5 bg-gray-100 rounded-md text-sm text-gray-600">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              System Operational
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-12">
        
        {/* Section: New Tickets */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Requires Action</h2>
            <p className="text-sm text-gray-500 mt-1">New tickets awaiting initial administrative review.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              [1, 2, 3].map((i) => <TicketSkeleton key={i} />)
            ) : tickets.length === 0 ? (
              <div className="col-span-full py-12 bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500">
                <CheckCircle2 className="w-10 h-10 text-gray-300 mb-3" />
                <p>No new tickets requires action.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket._id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-medium text-gray-500 tracking-wider">
                        #{ticket.t_uid}
                      </span>
                      <span className={getPriorityBadge(ticket.t_priority)}>
                        {ticket.t_priority}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {ticket.t_subject}
                    </h3>

                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium capitalize truncate">
                        {ticket.c_name_f} {ticket.c_name_l}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {ticket.t_disc}
                    </p>
                  </div>

                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 py-1.5 transition-colors"
                    >
                      Review Ticket <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200"></div>
          </div>
        </div>

        {/* Section: Admin Checked / In Progress */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">In Progress</h2>
            <p className="text-sm text-gray-500 mt-1">Tickets currently being processed by the team.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              [1, 2, 3].map((i) => <TicketSkeleton key={i} />)
            ) : adminCheck.length === 0 ? (
               <div className="col-span-full py-12 bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500">
               <Briefcase className="w-10 h-10 text-gray-300 mb-3" />
               <p>No tickets currently in progress.</p>
             </div>
            ) : (
              adminCheck.map((ticket) => (
                <div key={ticket._id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between opacity-90">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-medium text-gray-500 tracking-wider">
                        #{ticket.t_uid}
                      </span>
                      <span className={getPriorityBadge(ticket.t_priority)}>
                        {ticket.t_priority}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {ticket.t_subject}
                    </h3>

                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium capitalize truncate">
                        {ticket.c_name_f} {ticket.c_name_l}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {ticket.t_disc}
                    </p>
                  </div>

                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 py-1.5 transition-colors"
                    >
                      Manage Resolution <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      {/* Primary Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !resolveModal && setSelectedTicket(null)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-start bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">Ticket Details</h2>
                  <span className={getPriorityBadge(selectedTicket.t_priority)}>
                    {selectedTicket.t_priority}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-mono">ID: {selectedTicket.t_uid}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Issue Description</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{selectedTicket.t_subject}</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {selectedTicket.t_disc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Client Info Card */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Client Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">{selectedTicket.c_name_f} {selectedTicket.c_name_l}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{selectedTicket.c_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">+{selectedTicket.c_phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata Card */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">System Metadata</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="text-sm font-medium text-gray-900 uppercase">{selectedTicket.c_department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current Status</p>
                        <p className="text-sm font-medium text-gray-900">{selectedTicket.t_status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Submitted On</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(selectedTicket.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Close
              </button>
              
              {selectedTicket.t_status === "Checked by admin and work in Process if need our team get you soon" ? (
                <button
                  onClick={(e) => adminUpdateResolve(e, selectedTicket._id)}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm min-w-30"
                >
                  Mark Resolved
                </button>
              ) : (
                <button
                  onClick={(e) => adminUpdate(e, selectedTicket._id)}
                  disabled={isUpdating}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm min-w-40 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Acknowledge & Process"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resolution Dialog / Secondary Modal */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Finalize Resolution</h3>
              <button
                onClick={() => setResolveModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFinalResolve} className="p-6 space-y-5">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Resolution Date
                </label>
                <input
                  type="date"
                  required
                  value={resolveDate}
                  onChange={(e) => setResolveDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                  <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                  Closing Remarks
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the steps taken to resolve this issue..."
                  value={resolveMessage}
                  onChange={(e) => setResolveMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none text-gray-900"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResolveModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm min-w-32.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : null}
                  {isSubmitting ? "Resolving..." : "Submit Resolution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}