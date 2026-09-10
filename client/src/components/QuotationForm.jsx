import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Eye,
  Edit3,
  Printer,
  Calendar,
  Hash,
  User,
  Mail,
  MapPin,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  Building2,
  FileCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
  X
} from 'lucide-react';
import logo from '../assets/logo.jpg';
import { handleSuccess, handleError } from './ErrorMessage';
import secureLocalStorage from 'react-secure-storage';

export default function QuotationForm({ onBack }) {
  // Mode toggle: 'edit' or 'preview'
  const [viewMode, setViewMode] = useState('edit');

  // Quotation Metadata (all values blank by default)
  const [quotationDetails, setQuotationDetails] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    validUntil: '',
  });

  // Customer Details (all values blank by default)
  const [customer, setCustomer] = useState({
    name: '',
    address: '',
    email: '',
    gstNo: '',
  });

  // Line Items (all values blank by default)
  const [items, setItems] = useState([
    { id: Date.now(), name: '', hsn: '', quantity: '', rate: '' }
  ]);

  // Tax Option (matches 18% standard GST convention in Bitnextro)
  const [taxType, setTaxType] = useState('cgst_sgst'); // 'cgst_sgst' (9%+9%) or 'igst' (18%)

  // Database / State Management
  const [quotationsList, setQuotationsList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [listError, setListError] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Fetch saved quotations from backend MongoDB
  const fetchQuotations = async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const token = secureLocalStorage.getItem("auth-token") || "";
      const res = await fetch(`${backendUrl}/api/v9/quotation/fetch-all-quotations`, {
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        }
      });
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) {
        setQuotationsList(data.data);
      } else {
        setListError(data.msg || "Could not retrieve saved quotations.");
      }
    } catch (err) {
      console.error("Error fetching saved quotations:", err);
      setListError("Unable to reach backend server. Please verify backend is running on " + backendUrl);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Line Item Handlers
  const handleItemChange = (id, field, value) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now(), name: '', hsn: '', quantity: '', rate: '' }
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Calculations
  const totalTaxable = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return sum + qty * rate;
  }, 0);

  const isIgst = taxType === 'igst';
  const cgst = !isIgst ? totalTaxable * 0.09 : 0;
  const sgst = !isIgst ? totalTaxable * 0.09 : 0;
  const igst = isIgst ? totalTaxable * 0.18 : 0;
  const totalGst = cgst + sgst + igst;
  const grandTotal = totalTaxable + totalGst;

  // Validation
  const validateForm = () => {
    if (!quotationDetails.invoiceNumber.trim()) {
      handleError("Please enter a Quotation Number.");
      return false;
    }
    if (!customer.name.trim()) {
      handleError("Please enter Customer Name.");
      return false;
    }
    if (customer.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      handleError("Please provide a valid Customer Email address.");
      return false;
    }
    if (items.some(it => !it.name.trim() || Number(it.rate) <= 0)) {
      handleError("Please provide valid item names and rates for all items.");
      return false;
    }
    return true;
  };

  // Save / Update Quotation Handler (Connected to MongoDB API)
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    try {
      const token = secureLocalStorage.getItem("auth-token") || "";
      const isEditing = Boolean(editingId);
      const endpoint = isEditing
        ? `${backendUrl}/api/v9/quotation/update-quotation/${editingId}`
        : `${backendUrl}/api/v9/quotation/create-quotation`;
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        invoiceNumber: quotationDetails.invoiceNumber.trim(),
        invoiceDate: quotationDetails.invoiceDate,
        validUntil: quotationDetails.validUntil,
        customerName: customer.name.trim(),
        customerAddress: customer.address.trim(),
        customerEmail: customer.email.trim(),
        customerGstNumber: customer.gstNo.trim(),
        items: items.map(item => ({
          productName: item.name.trim(),
          hsnNumber: item.hsn.trim(),
          qty: Math.max(1, parseFloat(item.quantity) || 1),
          rate: Math.max(0, parseFloat(item.rate) || 0)
        })),
        taxType
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.status) {
        handleSuccess(result.msg || `Quotation ${quotationDetails.invoiceNumber} saved successfully!`);
        if (isEditing) {
          setEditingId(null);
        } else {
          // Reset form to blank on creation
          setQuotationDetails({ invoiceNumber: '', invoiceDate: '', validUntil: '' });
          setCustomer({ name: '', address: '', email: '', gstNo: '' });
          setItems([{ id: Date.now(), name: '', hsn: '', quantity: '', rate: '' }]);
        }
        // Refresh saved quotations list from MongoDB
        fetchQuotations();
      } else {
        handleError(result.msg || "Failed to save quotation to database.");
      }
    } catch (err) {
      console.error("Save quotation error:", err);
      handleError("Network error while communicating with backend API.");
    } finally {
      setIsSaving(false);
    }
  };

  // Load quotation into form for editing
  const handleEdit = (quote) => {
    setEditingId(quote._id);
    setQuotationDetails({
      invoiceNumber: quote.invoiceNumber || '',
      invoiceDate: quote.invoiceDate || '',
      validUntil: quote.validUntil || ''
    });
    setCustomer({
      name: quote.customerName || '',
      address: quote.customerAddress || '',
      email: quote.customerEmail || '',
      gstNo: quote.customerGstNumber || ''
    });
    if (Array.isArray(quote.items) && quote.items.length > 0) {
      setItems(
        quote.items.map(it => ({
          id: Date.now() + Math.random(),
          name: it.productName || '',
          hsn: it.hsnNumber || '',
          quantity: it.qty || 1,
          rate: it.rate || 0
        }))
      );
    }
    setTaxType(quote.taxType || 'cgst_sgst');
    setViewMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleSuccess(`Loaded quotation ${quote.invoiceNumber} into form.`);
  };

  // Load quotation directly into preview/print mode
  const handlePreviewQuote = (quote) => {
    setQuotationDetails({
      invoiceNumber: quote.invoiceNumber || '',
      invoiceDate: quote.invoiceDate || '',
      validUntil: quote.validUntil || ''
    });
    setCustomer({
      name: quote.customerName || '',
      address: quote.customerAddress || '',
      email: quote.customerEmail || '',
      gstNo: quote.customerGstNumber || ''
    });
    if (Array.isArray(quote.items) && quote.items.length > 0) {
      setItems(
        quote.items.map(it => ({
          id: Date.now() + Math.random(),
          name: it.productName || '',
          hsn: it.hsnNumber || '',
          quantity: it.qty || 1,
          rate: it.rate || 0
        }))
      );
    }
    setTaxType(quote.taxType || 'cgst_sgst');
    setViewMode('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setQuotationDetails({ invoiceNumber: '', invoiceDate: '', validUntil: '' });
    setCustomer({ name: '', address: '', email: '', gstNo: '' });
    setItems([{ id: Date.now(), name: '', hsn: '', quantity: '', rate: '' }]);
  };

  // Delete quotation from MongoDB
  const handleDelete = async (id, invNum) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete quotation "${invNum || id}"?`
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const token = secureLocalStorage.getItem("auth-token") || "";
      const res = await fetch(`${backendUrl}/api/v9/quotation/delete-quotation/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        }
      });
      const result = await res.json();
      if (result.status) {
        handleSuccess(result.msg || "Quotation deleted successfully.");
        if (editingId === id) {
          handleCancelEdit();
        }
        fetchQuotations();
      } else {
        handleError(result.msg || "Failed to delete quotation.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      handleError("Network error while deleting quotation.");
    } finally {
      setDeletingId(null);
    }
  };

  // Print Handler
  const handlePrint = () => {
    if (!validateForm()) return;
    const originalTitle = document.title;
    const qNum = (quotationDetails.invoiceNumber || '').trim().replace(/[/\\?%*:|"<>]/g, '-');
    const cName = (customer.name || '').trim().replace(/[/\\?%*:|"<>]/g, '-');
    const fileName = [qNum, cName].filter(Boolean).join(' - ') || 'Quotation';

    document.title = fileName;

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);

    window.print();

    // Fallback restore in case afterprint does not fire
    setTimeout(restoreTitle, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #quotation-printable-document, #quotation-printable-document * {
            visibility: visible;
          }
          #quotation-printable-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Active Edit Notice Banner */}
      {editingId && (
        <div className="no-print bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
            <Edit3 className="w-4 h-4 text-amber-600" />
            <span>Editing Saved Quotation: <strong>{quotationDetails.invoiceNumber || editingId}</strong></span>
          </div>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100/60 hover:bg-amber-100 px-3 py-1.5 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel Edit
          </button>
        </div>
      )}

      {/* Page Header & View Toggle (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            Quotation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, manage, preview, and print quotations for clients.
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Details
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateForm()) setViewMode('preview');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Document Preview
            </button>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Invoice
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: DATA ENTRY / EDIT MODE */}
      {/* ========================================================================= */}
      {viewMode === 'edit' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION 1: Company Header Display */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8 border-t-4 border-indigo-600">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-1 shrink-0">
                  <img src={logo} alt="Bitnextro Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    BITNEXTRO SOLUTIONS PVT. LTD.
                  </h2>
                  <p className="text-xs font-semibold text-slate-600">
                    IT & Cybersecurity Company
                  </p>
                  <p className="text-xs font-semibold text-indigo-600 tracking-wide mt-0.5">
                    GSTIN: 19AAOCB2081P1ZO
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 sm:text-right">
                <p className="font-medium text-slate-800">5, Park Lane, Parkstreet</p>
                <p>Kolkata, West Bengal, 700016</p>
                <p><span className="text-slate-400">Mobile:</span> +91 9330855877</p>
                <p><span className="text-slate-400">Email:</span> info@bitnextro.com</p>
                <p><span className="text-slate-400">Website:</span> www.bitnextro.com</p>
              </div>
            </div>

            {/* SECTION 2: Quotation Details */}
            <div className="pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-600" />
                Quotation Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    Quotation Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. QT-2026-001"
                      value={quotationDetails.invoiceNumber}
                      onChange={(e) =>
                        setQuotationDetails({ ...quotationDetails, invoiceNumber: e.target.value })
                      }
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    Quotation Date <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="date"
                      required
                      value={quotationDetails.invoiceDate}
                      onChange={(e) =>
                        setQuotationDetails({ ...quotationDetails, invoiceDate: e.target.value })
                      }
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    Valid Until Date
                  </label>
                  <div className="mt-2">
                    <input
                      type="date"
                      value={quotationDetails.validUntil}
                      onChange={(e) =>
                        setQuotationDetails({ ...quotationDetails, validUntil: e.target.value })
                      }
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Customer Details */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6 border-b pb-4">
              <User className="h-5 w-5 text-slate-400" />
              Customer Details
            </h2>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium leading-6 text-slate-900">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter client / customer name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium leading-6 text-slate-900">
                  Customer Address
                </label>
                <div className="mt-2">
                  <textarea
                    rows={2}
                    placeholder="Enter complete customer address..."
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">
                  Customer Email / Mail ID
                </label>
                <div className="mt-2">
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">
                  Customer GST Number
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="e.g. 19AAACC1234D1Z5"
                    value={customer.gstNo}
                    onChange={(e) => setCustomer({ ...customer, gstNo: e.target.value })}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Item Details (Line Items) */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6 border-b pb-4">
              <FileSpreadsheet className="h-5 w-5 text-slate-400" />
              Item Details
            </h2>

            {/* Desktop Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 mb-3 px-2 text-sm font-medium text-slate-500">
              <div className="col-span-4">Item / Product / Service Name <span className="text-red-500">*</span></div>
              <div className="col-span-2">HSN Number</div>
              <div className="col-span-2">Qty <span className="text-red-500">*</span></div>
              <div className="col-span-2">Rate (₹) <span className="text-red-500">*</span></div>
              <div className="col-span-1 text-right">Taxable (₹)</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            <div className="space-y-4">
              {items.map((item) => {
                const qty = parseFloat(item.quantity) || 0;
                const rate = parseFloat(item.rate) || 0;
                const itemTaxable = qty * rate;

                return (
                  <div
                    key={item.id}
                    className="relative flex flex-col sm:grid sm:grid-cols-12 gap-3 items-start sm:items-center bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-slate-200"
                  >
                    <div className="col-span-4 w-full">
                      <label className="block sm:hidden text-xs font-medium text-slate-500 mb-1">
                        Item / Service Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. IT Maintenance / Web Development"
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="col-span-2 w-full">
                      <label className="block sm:hidden text-xs font-medium text-slate-500 mb-1">
                        HSN Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 998313"
                        value={item.hsn}
                        onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                        className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="col-span-2 w-full">
                      <label className="block sm:hidden text-xs font-medium text-slate-500 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="col-span-2 w-full">
                      <label className="block sm:hidden text-xs font-medium text-slate-500 mb-1">
                        Rate (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                        className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="col-span-1 w-full text-left sm:text-right font-semibold text-slate-800 text-sm">
                      <span className="sm:hidden text-xs font-medium text-slate-500 mr-2">Taxable:</span>
                      {itemTaxable > 0 ? `₹${itemTaxable.toFixed(2)}` : '₹0.00'}
                    </div>

                    <div className="col-span-1 w-full flex justify-end sm:justify-center mt-2 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Another Item
              </button>
            </div>
          </div>

          {/* SECTION 5: Amount Summary & Tax */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
              <div>
                <h3 className="text-base font-semibold text-slate-900">GST Calculation Convention</h3>
                <p className="text-xs text-slate-500 mt-0.5">Standard 18% GST calculation as configured in Bitnextro billing.</p>
              </div>
              
              {/* GST Type Selector */}
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setTaxType('cgst_sgst')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    taxType === 'cgst_sgst'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  CGST (9%) + SGST (9%)
                </button>
                <button
                  type="button"
                  onClick={() => setTaxType('igst')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    taxType === 'igst'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  IGST (18%)
                </button>
              </div>
            </div>

            {/* Detailed Summary Rows */}
            <div className="pt-6 max-w-sm ml-auto space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Total Taxable Amount</span>
                <span className="font-semibold text-slate-900">₹{totalTaxable.toFixed(2)}</span>
              </div>

              {!isIgst ? (
                <>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>CGST (9%)</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>SGST (9%)</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>IGST (18%)</span>
                  <span>₹{igst.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-slate-600 pt-1 border-t border-slate-100">
                <span>GST Total (18%)</span>
                <span className="font-semibold text-slate-900">₹{totalGst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t-2 border-slate-900">
                <span>Total Amount</span>
                <span className="text-indigo-600 text-lg">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving to Database...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingId ? "Update Quotation" : "Save Quotation"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateForm()) setViewMode('preview');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              Preview Quotation Document
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: OFFICIAL DOCUMENT PREVIEW & PRINT */}
      {/* ========================================================================= */}
      {viewMode === 'preview' && (
        <div className="space-y-6">
          {/* Document Actions Bar (Hidden when printing) */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-xl shadow-md">
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold">Document View</p>
                <p className="text-xs text-slate-400">Ready to print or save as PDF</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Data
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save as PDF
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white shadow-sm transition-colors cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    {editingId ? "Update Quotation" : "Save Quotation"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Printable Document Paper (Styled like authentic A4 letterhead) */}
          <div
            id="quotation-printable-document"
            className="bg-white rounded-xl shadow-lg ring-1 ring-slate-200 p-8 sm:p-12 text-slate-800 font-sans"
          >
            {/* Letterhead Top Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b-2 border-indigo-600">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                  <img src={logo} alt="Bitnextro Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    BITNEXTRO SOLUTIONS PVT. LTD.
                  </h1>
                  <p className="text-xs font-semibold text-slate-600">
                    IT & Cybersecurity Company
                  </p>
                  <p className="text-xs font-bold text-indigo-700 tracking-wide mt-0.5">
                    GSTIN: 19AAOCB2081P1ZO
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 sm:text-right">
                <p className="font-semibold text-slate-800">5, Park Lane, Parkstreet</p>
                <p>Kolkata, West Bengal, 700016</p>
                <p><span className="text-slate-400">Mobile:</span> +91 9330855877</p>
                <p><span className="text-slate-400">Email:</span> info@bitnextro.com</p>
                <p><span className="text-slate-400">Website:</span> www.bitnextro.com</p>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 border border-slate-200 rounded-lg p-4 gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  QUOTATION
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Quotation Number:</span>
                  <p className="font-bold text-slate-800">{quotationDetails.invoiceNumber || ''}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Quotation Date:</span>
                  <p className="font-bold text-slate-800">{quotationDetails.invoiceDate || ''}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Valid Until:</span>
                  <p className="font-bold text-slate-800">{quotationDetails.validUntil || ''}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">GST Rate:</span>
                  <p className="font-bold text-slate-800">18%</p>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="mt-6 p-4 rounded-lg border border-slate-200 bg-white">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Quotation Prepared For:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-base font-bold text-slate-900">{customer.name || ''}</p>
                  <p className="text-xs text-slate-600 whitespace-pre-line mt-1">
                    {customer.address || ''}
                  </p>
                </div>
                <div className="text-xs space-y-1 sm:text-right">
                  {customer.email && (
                    <p><span className="text-slate-400">Email:</span> {customer.email}</p>
                  )}
                  {customer.gstNo && (
                    <p><span className="text-slate-400">GSTIN:</span> <strong className="text-slate-800">{customer.gstNo}</strong></p>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-3">Item / Service Description</th>
                    <th className="py-3 px-3 text-center w-24">HSN/SAC</th>
                    <th className="py-3 px-3 text-center w-16">Qty</th>
                    <th className="py-3 px-3 text-right w-28">Rate (₹)</th>
                    <th className="py-3 px-3 text-right w-32">Taxable Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const qty = parseFloat(item.quantity) || 0;
                    const rate = parseFloat(item.rate) || 0;
                    const itemTaxable = qty * rate;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 text-center font-medium text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-medium text-slate-900">{item.name || ''}</td>
                        <td className="py-3 px-3 text-center text-slate-500">{item.hsn || ''}</td>
                        <td className="py-3 px-3 text-center text-slate-800">{item.quantity || ''}</td>
                        <td className="py-3 px-3 text-right text-slate-800">{item.rate ? `₹${rate.toFixed(2)}` : ''}</td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-900">
                          {itemTaxable > 0 ? `₹${itemTaxable.toFixed(2)}` : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Breakdown */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
              {/* Payment Notes */}
              <div className="w-full sm:w-1/2 space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <p className="font-bold text-slate-800 mb-1">BITNEXTRO SOLUTIONS PVT. LTD.</p>
                  <p>5, Park Lane, Parkstreet, Kolkata, West Bengal, 700016</p>
                  <p>Mobile: +91 9330855877 | Email: info@bitnextro.com</p>
                  <p>Website: www.bitnextro.com</p>
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="w-full sm:w-1/2 max-w-sm ml-auto space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 pb-1">
                  <span>Total Taxable Amount</span>
                  <span className="font-semibold text-slate-900">₹{totalTaxable.toFixed(2)}</span>
                </div>

                {!isIgst ? (
                  <>
                    <div className="flex justify-between text-slate-500">
                      <span>CGST (9%)</span>
                      <span>₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>SGST (9%)</span>
                      <span>₹{sgst.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-slate-500">
                    <span>IGST (18%)</span>
                    <span>₹{igst.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                  <span>GST Total (18%)</span>
                  <span className="font-semibold text-slate-900">₹{totalGst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t-2 border-slate-900">
                  <span>Total Amount</span>
                  <span className="text-indigo-600 text-base">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="mt-10 pt-8 flex justify-between items-end border-t border-slate-100">
              <div className="text-xs text-slate-400">
                <p>This is a computer-generated quotation.</p>
                <p>Subject to Kolkata Jurisdiction.</p>
              </div>

              <div className="text-right flex flex-col items-end">
                <p className="text-xs font-bold text-slate-800">
                  For BITNEXTRO SOLUTIONS PVT. LTD.
                </p>
                <img
                  src="https://res.cloudinary.com/dcvejeszo/image/upload/v1772137306/user_profiles/a9siliu0rbff2z4p8o5k.png"
                  alt="Bitnextro Authorized Stamp & Signature"
                  className="w-24 h-24 object-contain my-1 opacity-90"
                />
                <p className="text-xs font-semibold text-slate-700 border-t border-slate-300 pt-1 w-36 text-center">
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: SAVED QUOTATIONS LIST (MongoDB Retrievable) */}
      {/* ========================================================================= */}
      <div className="no-print bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Saved Quotations
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                {quotationsList.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently stored in database. Click Edit to modify or View to preview/print.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchQuotations}
            disabled={isLoadingList}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {isLoadingList && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs">Loading saved quotations from database...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoadingList && listError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-700 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{listError}</span>
            </div>
            <button
              type="button"
              onClick={fetchQuotations}
              className="font-semibold underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingList && !listError && quotationsList.length === 0 && (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No saved quotations yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Fill in the quotation form above and click "Save Quotation" to store your first record permanently.
            </p>
          </div>
        )}

        {/* Table of Saved Quotations */}
        {!isLoadingList && !listError && quotationsList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-3">Quotation Number</th>
                  <th className="py-3 px-3">Quotation Date</th>
                  <th className="py-3 px-3">Customer Name</th>
                  <th className="py-3 px-3 text-right">Taxable Amount</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotationsList.map((quote) => {
                  const isDeleting = deletingId === quote._id;
                  const isCurrentEditing = editingId === quote._id;

                  return (
                    <tr
                      key={quote._id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCurrentEditing ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-indigo-700">
                        {quote.invoiceNumber}
                        {isCurrentEditing && (
                          <span className="ml-1.5 text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-medium">
                            Editing
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {quote.invoiceDate || '-'}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {quote.customerName}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        ₹{(quote.taxableAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ₹{(quote.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePreviewQuote(quote)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Preview / Print Quotation"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(quote)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Quotation"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(quote._id, quote.invoiceNumber)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                            title="Delete Quotation"
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
