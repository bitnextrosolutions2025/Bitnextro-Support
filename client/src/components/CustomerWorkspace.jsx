import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Plus,
  Save,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  MapPin,
  Mail,
  Hash,
  ArrowLeft,
  Edit3,
  X,
  Search,
  CheckCircle2,
  Building2,
  Truck
} from 'lucide-react';
import { handleSuccess, handleError } from './ErrorMessage';
import secureLocalStorage from 'react-secure-storage';

export default function CustomerWorkspace({ onBack }) {
  const [formData, setFormData] = useState({
    customerName: '',
    gstNumber: '',
    emailId: '',
    billingAddress: '',
    shippingAddress: '',
    placeOfSupply: ''
  });

  const [customersList, setCustomersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [listError, setListError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Fetch all saved customers from backend
  const fetchCustomers = async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const token = secureLocalStorage.getItem("auth-token") || "";
      const res = await fetch(`${backendUrl}/api/v10/customer/fetch-all-customers`, {
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        }
      });
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) {
        setCustomersList(data.data);
      } else {
        setListError(data.msg || "Failed to load customers.");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setListError("Unable to reach backend server. Please verify backend is running on " + backendUrl);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      handleError("Please enter Customer Name.");
      return false;
    }
    if (formData.emailId.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId.trim())) {
      handleError("Please enter a valid Email ID.");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      customerName: '',
      gstNumber: '',
      emailId: '',
      billingAddress: '',
      shippingAddress: '',
      placeOfSupply: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    try {
      const token = secureLocalStorage.getItem("auth-token") || "";
      const isEditing = Boolean(editingId);
      const url = isEditing
        ? `${backendUrl}/api/v10/customer/update-customer/${editingId}`
        : `${backendUrl}/api/v10/customer/add-customer`;
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        customerName: formData.customerName.trim(),
        gstNumber: formData.gstNumber.trim(),
        emailId: formData.emailId.trim(),
        billingAddress: formData.billingAddress.trim(),
        shippingAddress: formData.shippingAddress.trim(),
        placeOfSupply: formData.placeOfSupply.trim(),
        location: formData.billingAddress.trim()
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.status) {
        handleSuccess(result.msg || (isEditing ? "Customer updated successfully." : `Customer "${formData.customerName}" added successfully.`));
        resetForm();
        fetchCustomers();
      } else {
        handleError(result.msg || "Failed to save customer.");
      }
    } catch (err) {
      console.error("Save customer error:", err);
      handleError("Network error while connecting to backend API.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id);
    setFormData({
      customerName: customer.customerName || '',
      gstNumber: customer.gstNumber || customer.customerGstNo || '',
      emailId: customer.emailId || customer.customerEmail || '',
      billingAddress: customer.billingAddress || customer.location || customer.customerShpAddress || '',
      shippingAddress: customer.shippingAddress || customer.billingAddress || customer.customerShpAddress || '',
      placeOfSupply: customer.placeOfSupply || customer.customerPlaceofSupply || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete customer "${name || id}"?`);
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const token = secureLocalStorage.getItem("auth-token") || "";
      const res = await fetch(`${backendUrl}/api/v10/customer/delete-customer/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        }
      });

      const result = await res.json();
      if (result.status) {
        handleSuccess(result.msg || "Customer deleted successfully.");
        if (editingId === id) {
          resetForm();
        }
        fetchCustomers();
      } else {
        handleError(result.msg || "Failed to delete customer.");
      }
    } catch (err) {
      console.error("Delete customer error:", err);
      handleError("Network error while deleting customer.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter customers by search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customersList;
    const term = searchTerm.toLowerCase().trim();
    return customersList.filter(c =>
      (c.customerName && c.customerName.toLowerCase().includes(term)) ||
      (c.gstNumber && c.gstNumber.toLowerCase().includes(term)) ||
      (c.emailId && c.emailId.toLowerCase().includes(term)) ||
      (c.billingAddress && c.billingAddress.toLowerCase().includes(term)) ||
      (c.placeOfSupply && c.placeOfSupply.toLowerCase().includes(term))
    );
  }, [customersList, searchTerm]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <User className="h-6 w-6 text-indigo-600" />
            Customer Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Single source of truth for customer records. Saved customers will auto-populate during invoice creation.
          </p>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Invoice
          </button>
        )}
      </div>

      {/* Editing Notification Banner */}
      {editingId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
            <Edit3 className="w-4 h-4 text-amber-600" />
            <span>Editing Customer: <strong>{formData.customerName || editingId}</strong></span>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100/60 hover:bg-amber-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Cancel Edit
          </button>
        </div>
      )}

      {/* Form Card: Add / Edit Customer */}
      <div className={`bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8 border-t-4 ${editingId ? 'border-amber-500' : 'border-indigo-600'}`}>
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {editingId ? <Edit3 className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
            <h2 className="text-base font-bold text-slate-900">
              {editingId ? "Update Customer Details" : "Add New Customer"}
            </h2>
          </div>
          {editingId && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-medium">
              Edit Mode
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Customer Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium leading-6 text-slate-900">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="customerName"
                  required
                  placeholder="Enter customer or company name"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">
                GST Number
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="gstNumber"
                  placeholder="e.g. 19AAACC1234D1Z5"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Email ID */}
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">
                Email ID
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  name="emailId"
                  placeholder="client@example.com"
                  value={formData.emailId}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Location / Billing Address */}
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">
                Billing Address / Location
              </label>
              <div className="mt-2">
                <textarea
                  rows={2}
                  name="billingAddress"
                  placeholder="Enter billing address or location..."
                  value={formData.billingAddress}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">
                Shipping Address
              </label>
              <div className="mt-2">
                <textarea
                  rows={2}
                  name="shippingAddress"
                  placeholder="Enter shipping address (leave blank if same as billing)..."
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Place of Supply */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium leading-6 text-slate-900">
                Place of Supply
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="placeOfSupply"
                  placeholder="e.g. 19-WEST BENGAL or 36-TELANGANA"
                  value={formData.placeOfSupply}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editingId ? "Updating Customer..." : "Saving Customer..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingId ? "Update Customer" : "Save Customer"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Saved Customers List Table on the SAME page */}
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Saved Customers
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                {customersList.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Single customer collection (<code className="text-indigo-600 font-mono">billingcustomers</code>).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none w-48 sm:w-60"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={fetchCustomers}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs">Loading customer records from database...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && listError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-700 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{listError}</span>
            </div>
            <button
              type="button"
              onClick={fetchCustomers}
              className="font-semibold underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !listError && customersList.length === 0 && (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <User className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No customers added yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Use the form above to add your first customer. Records will appear here immediately and become available in Create New Invoice.
            </p>
          </div>
        )}

        {/* No Search Results State */}
        {!isLoading && !listError && customersList.length > 0 && filteredCustomers.length === 0 && (
          <div className="py-8 text-center text-slate-500 space-y-1">
            <p className="text-sm font-semibold text-slate-700">No customers match "{searchTerm}"</p>
            <p className="text-xs text-slate-400">Try searching by a different name, GST number, or email.</p>
          </div>
        )}

        {/* Customers Table */}
        {!isLoading && !listError && filteredCustomers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Customer Name</th>
                  <th className="py-3 px-3">GST Number</th>
                  <th className="py-3 px-3">Email ID</th>
                  <th className="py-3 px-3">Billing Address</th>
                  <th className="py-3 px-3">Place of Supply</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust, idx) => {
                  const isDeleting = deletingId === cust._id;
                  const isCurrentEditing = editingId === cust._id;

                  return (
                    <tr
                      key={cust._id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCurrentEditing ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {cust.customerName}
                        {isCurrentEditing && (
                          <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                            Editing
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {cust.gstNumber || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {cust.emailId || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={cust.billingAddress || cust.location || ''}>
                        {cust.billingAddress || cust.location || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {cust.placeOfSupply || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(cust)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Customer"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cust._id, cust.customerName)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                            title="Delete Customer"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
