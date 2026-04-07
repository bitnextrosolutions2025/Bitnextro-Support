import React, { useEffect, useState } from 'react';
import {
    Building2,
    User,
    MapPin,
    Phone,
    Mail,
    Clock,
    Edit,
    Trash2,
    ClipboardList,
    Loader2 // Imported Loader2 for the spinning icon
} from 'lucide-react';
import secureLocalStorage from 'react-secure-storage';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

export default function AllLead() {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Added loading state
    const { user } = useAuth();
    const naviget = useNavigate();
    const [IsAllowUser, setIsAllowUser] = useState(false);

    useEffect(() => {
        const getoken = async () => {
            try {
                const token = secureLocalStorage.getItem("auth-token");
                let finaldata;
                if (token) {
                    const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/getuser`;
                    const response = await fetch(url, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "auth-token": token
                        },
                    });
                    const data = await response.json();
                    finaldata = data.message;
                }
                
                const blockedEmails = [
                    "bitnextrosolutions@gmail.com",
                    "rijwansk329@gmail.com",
                ];

                if (
                    blockedEmails.includes(user?.email) ||
                    blockedEmails.includes(finaldata?.email)
                ) {
                    return setIsAllowUser(true);
                }
                
                // If not allowed, stop loading and redirect
                setIsLoading(false);
                // handleError("Invalid admin") // Assuming handleError is defined elsewhere
                return naviget("/adminbitnextro");
            } catch (error) {
                // handleError("Invalid admin")
                console.log(error);
                setIsLoading(false);
                return naviget("/adminbitnextro");
            }
        };
        getoken();
    }, [user, naviget]);

    useEffect(() => {
        const fecthalllead = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/api/v7/lead/fetch-all-lead`;
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const leaddata = await response.json();
                setLeads(leaddata.data);
            } catch (error) {
                console.error("Error fetching leads:", error);
            } finally {
                // Always set loading to false when the fetch is done (success or fail)
                setIsLoading(false);
            }
        };

        if (IsAllowUser) {
            fecthalllead();
        }
    }, [IsAllowUser]);

    const handleDelete = (id) => {
        setLeads(leads.filter(lead => lead.id !== id));
    };

    const handleEdit = (lead) => {
        console.log("Editing lead:", lead);
    };

    const formatStatus = (status) => {
        if (!status) return "";
        return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="min-h-screen bg-green-50 p-4 sm:p-6 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-green-900 flex items-center gap-3">
                            <span className="bg-white p-2 rounded-lg shadow-sm text-green-600">
                                <ClipboardList className="w-7 h-7" />
                            </span>
                            Leads Directory
                        </h1>
                        <p className="text-green-700 mt-2">Manage and track your active leads.</p>
                    </div>
                    <Link to='/addlead'>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-colors flex items-center gap-2">
                            + Add New Lead
                        </button>
                    </Link>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-green-600 text-white text-sm uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold rounded-tl-2xl">Company & Contact</th>
                                    <th className="px-6 py-4 font-semibold">Location</th>
                                    <th className="px-6 py-4 font-semibold">Contact Info</th>
                                    <th className="px-6 py-4 font-semibold">Status & Follow-up</th>
                                    <th className="px-6 py-4 font-semibold text-center rounded-tr-2xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-green-50 text-gray-700">
                                {isLoading ? (
                                    /* Loading State */
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : leads.length > 0 ? (
                                    /* Data State */
                                    leads.map((lead) => (
                                        <tr key={lead._id || lead.id} className="hover:bg-green-50/50 transition-colors group">
                                            {/* Company & Contact Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-green-500" />
                                                        {lead.Company_Name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                                        <User className="w-4 h-4 text-green-400" />
                                                        {lead.Contact_Person}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Location Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MapPin className="w-4 h-4 text-green-500" />
                                                    {lead.Location}
                                                </div>
                                            </td>

                                            {/* Contact Info Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone className="w-4 h-4 text-green-500" />
                                                        +{lead.Phone_Number}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Mail className="w-4 h-4 text-green-500" />
                                                        {lead.email}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status & Follow-up Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-start gap-2">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                        {formatStatus(lead.status)}
                                                    </span>
                                                    {(lead.followUpDate || lead.followUpTime) && (
                                                        <div className="text-xs text-green-600 flex items-center gap-1.5 font-medium bg-green-50 px-2 py-1 rounded-md">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {lead.followUpDate} @ {lead.followUpTime}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions Column */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3 ">
                                                    <button
                                                        onClick={() => handleEdit(lead)}
                                                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-transparent hover:border-green-200"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(lead.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    /* Empty State */
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ClipboardList className="w-12 h-12 text-green-200" />
                                                <p className="text-lg font-medium text-green-800">No leads found</p>
                                                <p className="text-sm">Click "Add New Lead" to get started.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}