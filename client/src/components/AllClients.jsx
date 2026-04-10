import React, { useEffect, useState } from 'react';
import {
    Building2,
    User,
    MapPin,
    Phone,
    Mail,
    Edit,
    Trash2,
    Users,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import secureLocalStorage from 'react-secure-storage';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

export default function AllClients() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);
    const [editLoadingId, setEditLoadingId] = useState(null);
    const [editingClient, setEditingClient] = useState(null);
    const [editForm, setEditForm] = useState({
        companyName: "",
        contactPerson: "",
        location: "",
        phone: "",
        email: "",
    });
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
                
                setIsLoading(false);
                return naviget("/adminbitnextro");
            } catch (error) {
                console.log(error);
                setIsLoading(false);
                return naviget("/adminbitnextro");
            }
        };
        getoken();
    }, [user, naviget]);

    useEffect(() => {
        const fetchAllClients = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/api/v7/lead/fetch-all-clients`;
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const clientdata = await response.json();
                setClients(clientdata.data || []);
            } catch (error) {
                console.error("Error fetching clients:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (IsAllowUser) {
            fetchAllClients();
        }
    }, [IsAllowUser]);

    const handleDelete = async (id) => {
        if (!id) return;

        const confirmDelete = window.confirm("Are you sure you want to delete this client?");
        if (!confirmDelete) return;

        try {
            setDeleteLoadingId(id);
            const url = `${import.meta.env.VITE_BACKEND_URL}/api/v7/lead/deletelead/${id}`;
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete client.");
            }

            setClients((prevClients) => prevClients.filter((client) => client._id !== id));
        } catch (error) {
            console.error("Error deleting client:", error);
            window.alert("Could not delete client. Please try again.");
        } finally {
            setDeleteLoadingId(null);
        }
    };

    const openEditModal = (client) => {
        if (!client?._id) return;
        setEditingClient(client);
        setEditForm({
            companyName: client.Company_Name || "",
            contactPerson: client.Contact_Person || "",
            location: client.Location || "",
            phone: client.Phone_Number || "",
            email: client.email || "",
        });
    };

    const closeEditModal = () => {
        setEditingClient(null);
        setEditForm({
            companyName: "",
            contactPerson: "",
            location: "",
            phone: "",
            email: "",
        });
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditForm((prevForm) => ({ ...prevForm, [name]: value }));
    };

    const handleEditSubmit = async () => {
        if (!editingClient?._id) return;

        try {
            setEditLoadingId(editingClient._id);
            const url = `${import.meta.env.VITE_BACKEND_URL}/api/v7/lead/editlead/${editingClient._id}`;
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    companyName: editForm.companyName,
                    contactPerson: editForm.contactPerson,
                    location: editForm.location,
                    phone: Number(editForm.phone),
                    email: editForm.email,
                    status: editingClient.status,
                    followUpDate: editingClient.followUpDate,
                    followUpTime: editingClient.followUpTime,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to update client.");
            }

            setClients((prevClients) => prevClients.map((item) => item._id === editingClient._id ? data.data : item));
            closeEditModal();
        } catch (error) {
            console.error("Error editing client:", error);
            window.alert("Could not update client. Please try again.");
        } finally {
            setEditLoadingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 p-4 sm:p-6 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
                            <span className="bg-white p-2 rounded-lg shadow-sm text-blue-600">
                                <Users className="w-7 h-7" />
                            </span>
                            Clients Directory
                        </h1>
                        <p className="text-blue-700 mt-2">Manage and track your active clients.</p>
                    </div>
                    <Link to='/alllead'>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-colors flex items-center gap-2">
                            <ArrowLeft className="w-5 h-5" />
                            Back to Leads
                        </button>
                    </Link>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-blue-600 text-white text-sm uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold rounded-tl-2xl">Company & Contact</th>
                                    <th className="px-6 py-4 font-semibold">Location</th>
                                    <th className="px-6 py-4 font-semibold">Contact Info</th>
                                    <th className="px-6 py-4 font-semibold text-center rounded-tr-2xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-50 text-gray-700">
                                {isLoading ? (
                                    /* Loading State */
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : clients.length > 0 ? (
                                    /* Data State */
                                    clients.map((client) => (
                                        <tr key={client._id} className="hover:bg-blue-50/50 transition-colors group">
                                            {/* Company & Contact Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-blue-500" />
                                                        {client.Company_Name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                                        <User className="w-4 h-4 text-blue-400" />
                                                        {client.Contact_Person}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Location Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MapPin className="w-4 h-4 text-blue-500" />
                                                    {client.Location}
                                                </div>
                                            </td>

                                            {/* Contact Info Column */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone className="w-4 h-4 text-blue-500" />
                                                        +{client.Phone_Number}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Mail className="w-4 h-4 text-blue-500" />
                                                        {client.email}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Actions Column */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3 ">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(client)}
                                                        disabled={editLoadingId === client._id}
                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-transparent hover:border-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                                                        title="Edit"
                                                    >
                                                        {editLoadingId === client._id ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <Edit className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(client._id)}
                                                        disabled={deleteLoadingId === client._id}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {deleteLoadingId === client._id ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    /* Empty State */
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Users className="w-12 h-12 text-blue-200" />
                                                <p className="text-lg font-medium text-blue-800">No clients found</p>
                                                <p className="text-sm">Convert leads to clients to see them here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Edit Modal */}
            {editingClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/10">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-blue-900">Edit Client</h2>
                                <p className="text-sm text-gray-500">Update the client details and submit.</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="rounded-full bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2 text-sm text-gray-700">
                                Company Name
                                <input
                                    name="companyName"
                                    value={editForm.companyName}
                                    onChange={handleEditChange}
                                    className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500"
                                />
                            </label>
                            <label className="space-y-2 text-sm text-gray-700">
                                Contact Person
                                <input
                                    name="contactPerson"
                                    value={editForm.contactPerson}
                                    onChange={handleEditChange}
                                    className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500"
                                />
                            </label>
                            <label className="space-y-2 text-sm text-gray-700 sm:col-span-2">
                                Location
                                <input
                                    name="location"
                                    value={editForm.location}
                                    onChange={handleEditChange}
                                    className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500"
                                />
                            </label>
                            <label className="space-y-2 text-sm text-gray-700">
                                Phone Number
                                <input
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500"
                                />
                            </label>
                            <label className="space-y-2 text-sm text-gray-700">
                                Email
                                <input
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleEditChange}
                                    className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500"
                                />
                            </label>
                        </div>
                        <div className="mt-6 flex flex-wrap items-center gap-3 justify-end">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="rounded-full border border-blue-200 bg-white px-5 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleEditSubmit}
                                disabled={editLoadingId === editingClient._id}
                                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {editLoadingId === editingClient._id ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
