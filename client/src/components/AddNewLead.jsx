import React, { useEffect, useState } from 'react';
import {
    Building2,
    User,
    MapPin,
    Phone,
    Mail,
    Activity,
    Calendar,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { handleError, handleSuccess } from './ErrorMessage';
import secureLocalStorage from 'react-secure-storage';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
export default function AddNewLead() {
      const { user } = useAuth();
      const naviget=useNavigate();
    useEffect(() => {
        const getoken = async () => {

            try {
                const token = secureLocalStorage.getItem("auth-token");
                // console.log(token)
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
                // console.log(finaldata.email);
                const blockedEmails = [
                    "bitnextrosolutions@gmail.com",
                    "rijwansk329@gmail.com",
                ];

                if (
                    blockedEmails.includes(user?.email) ||
                    blockedEmails.includes(finaldata?.email)
                ) {
                    return;
                }
                handleError("Invalid admin")
                return naviget("/adminbitnextro")
            } catch (error) {
                handleError("Invalid admin")
                console.log(error)
                return naviget("/adminbitnextro")

            }
        }
        getoken();
    },[user])
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        location: '',
        phone: '',
        email: '',
        status: 'interested',
        followUpDate: '',
        followUpTime: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            setIsSubmitted(true);
            const url = `${import.meta.env.VITE_BACKEND_URL}/api/v7/lead/addlead`
            const responce = await fetch(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ companyName: formData.companyName, contactPerson: formData.contactPerson, location: formData.location, phone: formData.phone, email: formData.email, status: formData.status, followUpDate: formData.followUpDate, followUpTime: formData.followUpTime })
            })
            const resdata = await responce.json()
            console.log(resdata)
            if (resdata.status) {
                setIsSubmitted(false)
                setFormData({
                    companyName: '',
                    contactPerson: '',
                    location: '',
                    phone: '',
                    email: '',
                    status: 'interested',
                    followUpDate: '',
                    followUpTime: ''
                });
                return handleSuccess("Lead added")
            }
        } catch (error) {
            console.log(error)
            handleError("Server error try again")
            return setIsSubmitted(false)
        }

    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 sm:p-6 md:p-8 flex items-center justify-center font-sans">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-blue-600">

                {/* Header */}
                <div className="bg-white px-6 py-8 border-b border-gray-100 sm:px-10">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="bg-blue-100 p-2 rounded-lg">
                            <Building2 className="text-blue-600 w-8 h-8" />
                        </span>
                        Create New Lead
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Fill in the details below to add a new lead to your pipeline.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-8 sm:px-10 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Company Name */}
                        <div className="space-y-2">
                            <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="h-5 w-5 text-blue-400" />
                                </div>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    required
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-gray-50 hover:bg-white"
                                    placeholder="Acme Corp"
                                />
                            </div>
                        </div>

                        {/* 2. Contact Person */}
                        <div className="space-y-2">
                            <label htmlFor="contactPerson" className="block text-sm font-semibold text-gray-700">
                                Contact Person <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-blue-400" />
                                </div>
                                <input
                                    type="text"
                                    id="contactPerson"
                                    name="contactPerson"
                                    required
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-gray-50 hover:bg-white"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* 3. Location */}
                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="location" className="block text-sm font-semibold text-gray-700">
                                Location
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-blue-400" />
                                </div>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-gray-50 hover:bg-white"
                                    placeholder="New York, USA"
                                />
                            </div>
                        </div>

                        {/* 4. Phone Number */}
                        <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-blue-400" />
                                </div>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-gray-50 hover:bg-white"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        {/* 5. Email ID */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-blue-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-gray-50 hover:bg-white"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        {/* 6. Status */}
                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="status" className="block text-sm font-semibold text-gray-700">
                                Lead Status <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Activity className="h-5 w-5 text-blue-400" />
                                </div>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-gray-50 hover:bg-white appearance-none"
                                >
                                    <option value="interested">Interested</option>
                                    <option value="not-interested">Not Interested</option>
                                    <option value="need-follow-up">Need Follow Up</option>
                                </select>
                                {/* Custom dropdown arrow */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Conditional Follow Up Date and Time */}
                        {formData.status === 'need-follow-up' && (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-blue-50/50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">

                                <div className="space-y-2">
                                    <label htmlFor="followUpDate" className="block text-sm font-semibold text-gray-700">
                                        Follow-up Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <input
                                            type="date"
                                            id="followUpDate"
                                            name="followUpDate"
                                            required={formData.status === 'need-follow-up'}
                                            value={formData.followUpDate}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="followUpTime" className="block text-sm font-semibold text-gray-700">
                                        Follow-up Time <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <input
                                            type="time"
                                            id="followUpTime"
                                            name="followUpTime"
                                            required={formData.status === 'need-follow-up'}
                                            value={formData.followUpTime}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
                                        />
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitted ? true : false}
                            className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-100 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            {isSubmitted ? (
                                <>
                                    Processing...
                                </>
                            ) : (
                                'Save New Lead'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}