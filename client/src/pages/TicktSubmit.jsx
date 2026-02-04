import React, { useEffect, useState } from 'react';
import {
    Send,
    Paperclip,
    HelpCircle,
    CheckCircle,
    AlertCircle,
    Loader2,
    LifeBuoy,
    Phone,
    Mail,
    Clock,
    ChevronDown,
    X
} from 'lucide-react';
import secureLocalStorage from 'react-secure-storage';

export default function TicktSubmit() {
    useEffect(() => {
        const token = secureLocalStorage.getItem("auth-token");
        if (!token) {
            naviget("/")
        }
    }, [])
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: 'technical',
        priority: 'medium',
        subject: '',
        description: '',
        files: []
    });

    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [ticketId, setTicketId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // const handleFileChange = (e) => {
    //     const newFiles = Array.from(e.target.files);
    //     setFormData(prev => ({
    //         ...prev,
    //         files: [...prev.files, ...newFiles]
    //     }));
    // };

    // const removeFile = (index) => {
    //     setFormData(prev => ({
    //         ...prev,
    //         files: prev.files.filter((_, i) => i !== index)
    //     }));
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        console.log(formData)
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/v2/tickt/gen-ticket`
        const responce = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone, priority: formData.priority, subject: formData.subject, department: formData.department, description: formData.description, email: formData.email })
        })
        const data = await responce.json();
        const urlmail = `${import.meta.env.VITE_BACKEND_URL}/api/v2/tickt/sendemail`
        const responcemail = await fetch(urlmail, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: formData.email, ticketNO:data.Ticket_No, username: formData.firstName })
        })
        const datamail = await responcemail.json();
        console.log(datamail)
        setStatus('success');
        setTicketId(`Ticket_No - ${data.Ticket_No}`);

    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            department: 'technical',
            priority: 'medium',
            subject: '',
            description: '',
            files: []
        });
        setStatus('idle');
        setTicketId(null);
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Submitted!</h2>
                    <p className="text-gray-500 mb-6">
                        Your ticket has been successfully created. We've sent a confirmation email to <span className="font-medium text-gray-900">{formData.email}</span>.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-100">
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Ticket ID</p>
                        <p className="text-3xl font-mono font-bold text-indigo-600">{ticketId}</p>
                    </div>
                    <button
                        onClick={resetForm}
                        className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-100"
                    >
                        Submit Another Ticket
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12 font-sans">
            <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row">

                {/* Left Panel - Context & Info */}
                <div className="lg:w-1/3 bg-indigo-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-600 rounded-full opacity-30 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                                <LifeBuoy className="w-6 h-6 text-indigo-200" />
                            </div>
                            <span className="font-bold text-lg tracking-wide">ServiceDesk Pro</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                            Let's get your issue resolved.
                        </h1>
                        <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
                            Submit a support ticket and our dedicated team will get back to you within 24 hours.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6 mt-8 lg:mt-0">
                        <div className="flex items-start space-x-4">
                            <Mail className="w-6 h-6 text-indigo-300 mt-1" />
                            <div>
                                <h3 className="font-semibold text-indigo-100">Email Us</h3>
                                <p className="text-indigo-300">support@servicedesk.com</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <Phone className="w-6 h-6 text-indigo-300 mt-1" />
                            <div>
                                <h3 className="font-semibold text-indigo-100">Call Us</h3>
                                <p className="text-indigo-300">+1 (555) 123-4567</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <Clock className="w-6 h-6 text-indigo-300 mt-1" />
                            <div>
                                <h3 className="font-semibold text-indigo-100">Operating Hours</h3>
                                <p className="text-indigo-300">Mon-Fri: 9AM - 6PM EST</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - The Form */}
                <div className="lg:w-2/3 p-8 md:p-12 bg-white">
                    <div className="mb-8 pb-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">New Support Ticket</h2>
                        <span className="text-sm text-gray-400 hidden sm:block">* Required Fields</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Info Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">First Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50 focus:bg-white"
                                        placeholder="Jane"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Last Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50 focus:bg-white"
                                        placeholder="Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Email Address <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50 focus:bg-white"
                                        placeholder="jane@company.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50 focus:bg-white"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ticket Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                                Ticket Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Department <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                        >
                                            <option value="technical">Technical Support</option>
                                            <option value="billing">Billing & Accounts</option>
                                            <option value="sales">Sales Inquiry</option>
                                            <option value="general">General Question</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Priority <span className="text-red-500">*</span></label>
                                    <div className="flex gap-4">
                                        {['low', 'medium', 'high'].map((p) => (
                                            <label key={p} className={`
                        flex-1 relative cursor-pointer rounded-lg border p-3 flex items-center justify-center text-sm font-medium capitalize transition-all
                        ${formData.priority === p
                                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                                                    : 'border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-gray-50'}
                      `}>
                                                <input
                                                    type="radio"
                                                    name="priority"
                                                    value={p}
                                                    checked={formData.priority === p}
                                                    onChange={handleInputChange}
                                                    className="sr-only"
                                                />
                                                {p}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <label className="text-sm font-medium text-gray-700 block">Subject <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50 focus:bg-white"
                                    placeholder="Brief summary of the issue..."
                                />
                            </div>

                            <div className="space-y-2 mb-6">
                                <label className="text-sm font-medium text-gray-700 block">Detailed Description <span className="text-red-500">*</span></label>
                                <textarea
                                    name="description"
                                    required
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50 focus:bg-white resize-none"
                                    placeholder="Please describe the issue in detail. Include any error messages..."
                                ></textarea>
                            </div>

                            {/* <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Attachments (Optional)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative group">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <div className="p-3 bg-indigo-50 rounded-full group-hover:bg-indigo-100 transition-colors">
                                            <Paperclip className="w-6 h-6 text-indigo-500" />
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
                                        </div>
                                        <p className="text-xs text-gray-400">SVG, PNG, JPG or PDF (max. 10MB)</p>
                                    </div>
                                </div>
                                {formData.files.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {formData.files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="flex items-center space-x-3 overflow-hidden">
                                                    <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                                    <span className="text-xs text-gray-400 shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div> */}
                        </div>

                        {/* Submit Action */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <button
                                type="button"
                                className="hidden md:flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <HelpCircle className="w-4 h-4 mr-2" />
                                Read FAQ
                            </button>

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className={`
                  w-full md:w-auto px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5
                  ${status === 'submitting' ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300'}
                  flex items-center justify-center
                `}
                            >
                                {status === 'submitting' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Submit Ticket
                                        <Send className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer / Copyright */}
            <div className="max-w-6xl mx-auto mt-8 text-center">
                <p className="text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} ServiceDesk Pro Inc. All rights reserved.
                    <span className="mx-2">•</span>
                    <a href="#" className="hover:text-indigo-500 transition-colors">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
}