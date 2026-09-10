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
  X,
  Truck,
  Globe
} from 'lucide-react';
import logo from '../assets/logo.jpg';
import { handleSuccess, handleError } from './ErrorMessage';
import secureLocalStorage from 'react-secure-storage';

// Official Bitnextro seal and signature assets
const authStamp = 'https://res.cloudinary.com/dcvejeszo/image/upload/v1772137306/user_profiles/a9siliu0rbff2z4p8o5k.png';
const authSignature = ''; // Reserved space for signature image to be added later

export default function ProformaWorkspace({ onBack }) {
  // Mode toggle: 'edit' or 'preview'
  const [viewMode, setViewMode] = useState('edit');

  // 1. Pro Forma Invoice Details
  const [invoiceDetails, setInvoiceDetails] = useState({
    proformaNumber: '',
    invoiceDate: '',
  });

  // 2. Customer Details
  const [customer, setCustomer] = useState({
    customerName: '',
    customerEmail: '',
    customerGstNumber: '',
    billingAddress: '',
    shippingAddress: '',
    placeOfSupply: '',
  });

  // 3. Line Items
  const [items, setItems] = useState([
    { id: Date.now(), productName: '', hsnNumber: '', qty: '', rate: '' }
  ]);

  // 4. Tax Option: 'cgst_sgst' (9%+9%) or 'igst' (18%)
  const [taxType, setTaxType] = useState('cgst_sgst');

  // Database / State Management
  const [proformaList, setProformaList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [listError, setListError] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Fetch saved Pro Forma Invoices from backend MongoDB
  const fetchProformas = async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const token = secureLocalStorage.getItem("auth-token") || "";
      const res = await fetch(`${backendUrl}/api/v11/proforma/fetch-all-proformas`, {
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        }
      });
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) {
        setProformaList(data.data);
      } else {
        setListError(data.msg || "Could not retrieve saved Pro Forma Invoices.");
      }
    } catch (err) {
      console.error("Error fetching saved Pro Forma Invoices:", err);
      setListError("Unable to reach backend server. Please verify backend is running on " + backendUrl);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchProformas();
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
      { id: Date.now(), productName: '', hsnNumber: '', qty: '', rate: '' }
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Calculations
  const totalTaxable = items.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    return sum + qty * rate;
  }, 0);

  const isIgst = taxType === 'igst';
  const cgst = !isIgst ? totalTaxable * 0.09 : 0;
  const sgst = !isIgst ? totalTaxable * 0.09 : 0;
  const igst = isIgst ? totalTaxable * 0.18 : 0;
  const totalTax = cgst + sgst + igst;
  const grandTotal = totalTaxable + totalTax;

  // Validation
  const validateForm = () => {
    if (!invoiceDetails.proformaNumber.trim()) {
      handleError("Please enter a Pro Forma Invoice Number.");
      return false;
    }
    if (!customer.customerName.trim()) {
      handleError("Please enter Customer Name.");
      return false;
    }
    if (customer.customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.customerEmail.trim())) {
      handleError("Please provide a valid Customer Email address.");
      return false;
    }
    if (items.some(it => !it.productName.trim() || Number(it.rate) < 0 || Number(it.qty) <= 0)) {
      handleError("Please provide valid item names, quantities, and rates for all items.");
      return false;
    }
    return true;
  };

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setInvoiceDetails({ proformaNumber: '', invoiceDate: '' });
    setCustomer({
      customerName: '',
      customerEmail: '',
      customerGstNumber: '',
      billingAddress: '',
      shippingAddress: '',
      placeOfSupply: ''
    });
    setItems([{ id: Date.now(), productName: '', hsnNumber: '', qty: '', rate: '' }]);
    setTaxType('cgst_sgst');
  };

  // Save / Update Handler
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);
    try {
      const token = secureLocalStorage.getItem("auth-token") || "";
      const isEditing = Boolean(editingId);
      const endpoint = isEditing
        ? `${backendUrl}/api/v11/proforma/update-proforma/${editingId}`
        : `${backendUrl}/api/v11/proforma/create-proforma`;
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        proformaNumber: invoiceDetails.proformaNumber.trim(),
        invoiceDate: invoiceDetails.invoiceDate,
        customerName: customer.customerName.trim(),
        customerEmail: customer.customerEmail.trim(),
        customerGstNumber: customer.customerGstNumber.trim(),
        billingAddress: customer.billingAddress.trim(),
        shippingAddress: customer.shippingAddress.trim(),
        placeOfSupply: customer.placeOfSupply.trim(),
        items: items.map(item => ({
          productName: item.productName.trim(),
          hsnNumber: item.hsnNumber.trim(),
          qty: Math.max(1, parseFloat(item.qty) || 1),
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
        handleSuccess(result.msg || `Pro Forma Invoice ${invoiceDetails.proformaNumber} saved successfully!`);
        if (isEditing) {
          setEditingId(null);
        } else {
          resetForm();
        }
        // Refresh saved list immediately
        fetchProformas();
      } else {
        handleError(result.msg || "Failed to save Pro Forma Invoice to database.");
      }
    } catch (err) {
      console.error("Save Pro Forma error:", err);
      handleError("Network error while communicating with backend API.");
    } finally {
      setIsSaving(false);
    }
  };

  // Load Pro Forma into form for editing
  const handleEdit = (proforma) => {
    setEditingId(proforma._id);
    setInvoiceDetails({
      proformaNumber: proforma.proformaNumber || '',
      invoiceDate: proforma.invoiceDate || '',
    });
    setCustomer({
      customerName: proforma.customerName || '',
      customerEmail: proforma.customerEmail || '',
      customerGstNumber: proforma.customerGstNumber || '',
      billingAddress: proforma.billingAddress || '',
      shippingAddress: proforma.shippingAddress || '',
      placeOfSupply: proforma.placeOfSupply || '',
    });
    if (Array.isArray(proforma.items) && proforma.items.length > 0) {
      setItems(
        proforma.items.map(it => ({
          id: Date.now() + Math.random(),
          productName: it.productName || '',
          hsnNumber: it.hsnNumber || '',
          qty: it.qty || 1,
          rate: it.rate || 0
        }))
      );
    }
    setTaxType(proforma.taxType || 'cgst_sgst');
    setViewMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleSuccess(`Loaded Pro Forma ${proforma.proformaNumber} into form.`);
  };

  // Load Pro Forma directly into preview mode
  const handlePreviewProforma = (proforma) => {
    handleEdit(proforma);
    setViewMode('preview');
  };

  // Delete Pro Forma from MongoDB
  const handleDelete = async (id, pNum) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete Pro Forma Invoice "${pNum || id}"?`
    );
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const token = secureLocalStorage.getItem("auth-token") || "";
      const res = await fetch(`${backendUrl}/api/v11/proforma/delete-proforma/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "auth-token": token
        }
      });
      const result = await res.json();
      if (result.status) {
        handleSuccess(result.msg || "Pro Forma Invoice deleted successfully.");
        if (editingId === id) {
          resetForm();
        }
        fetchProformas();
      } else {
        handleError(result.msg || "Failed to delete Pro Forma Invoice.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      handleError("Network error while deleting Pro Forma Invoice.");
    } finally {
      setDeletingId(null);
    }
  };

  // Print Handler
  const handlePrint = () => {
    if (!validateForm()) return;
    const originalTitle = document.title;
    const pNum = (invoiceDetails.proformaNumber || '').trim().replace(/[/\\?%*:|"<>]/g, '-');
    const cName = (customer.customerName || '').trim().replace(/[/\\?%*:|"<>]/g, '-');
    const fileName = [pNum, cName].filter(Boolean).join(' - ') || 'Proforma_Invoice';

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
          #proforma-printable-document, #proforma-printable-document * {
            visibility: visible;
          }
          #proforma-printable-document {
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
            <span>Editing Saved Pro Forma Invoice: <strong>{invoiceDetails.proformaNumber || editingId}</strong></span>
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

      {/* Top Header & Workspace Nav */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            Pro Forma Invoice
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, manage, and print official Pro Forma Invoices with database storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Invoices
            </button>
          )}

          {/* Mode Switcher */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 ring-1 ring-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Form
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateForm()) setViewMode('preview');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Document View
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: PRO FORMA INVOICE EDIT FORM */}
      {/* ========================================================================= */}
      {viewMode === 'edit' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION 1: Company Header & Pro Forma Invoice Details */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center p-1">
                  <img src={logo} alt="Bitnextro Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">BITNEXTRO SOLUTIONS PVT. LTD.</h2>
                  <p className="text-xs font-semibold text-slate-600">IT & Cybersecurity Company</p>
                  <p className="text-xs text-slate-500">GSTIN: 19AAOCB2081P1ZO</p>
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

            {/* Pro Forma Invoice Details */}
            <div className="pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-600" />
                Pro Forma Invoice Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    Pro Forma Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. PI-2026-001"
                      value={invoiceDetails.proformaNumber}
                      onChange={(e) =>
                        setInvoiceDetails({ ...invoiceDetails, proformaNumber: e.target.value })
                      }
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    Invoice Date <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="date"
                      required
                      value={invoiceDetails.invoiceDate}
                      onChange={(e) =>
                        setInvoiceDetails({ ...invoiceDetails, invoiceDate: e.target.value })
                      }
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Customer Details */}
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
                    placeholder="Enter customer / client name"
                    value={customer.customerName}
                    onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">
                  Customer Email
                </label>
                <div className="mt-2">
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={customer.customerEmail}
                    onChange={(e) => setCustomer({ ...customer, customerEmail: e.target.value })}
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
                    value={customer.customerGstNumber}
                    onChange={(e) => setCustomer({ ...customer, customerGstNumber: e.target.value })}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">
                  Billing Address
                </label>
                <div className="mt-2">
                  <textarea
                    rows={2}
                    placeholder="Enter billing address..."
                    value={customer.billingAddress}
                    onChange={(e) => setCustomer({ ...customer, billingAddress: e.target.value })}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">
                  Shipping Address
                </label>
                <div className="mt-2">
                  <textarea
                    rows={2}
                    placeholder="Enter shipping address..."
                    value={customer.shippingAddress}
                    onChange={(e) => setCustomer({ ...customer, shippingAddress: e.target.value })}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium leading-6 text-slate-900">
                  Place of Supply
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="e.g. 19-WEST BENGAL or 36-TELANGANA"
                    value={customer.placeOfSupply}
                    onChange={(e) => setCustomer({ ...customer, placeOfSupply: e.target.value })}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Line Items */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6 border-b pb-4">
              <FileSpreadsheet className="h-5 w-5 text-slate-400" />
              Line Items
            </h2>

            {/* Desktop Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 mb-3 px-2 text-sm font-medium text-slate-500">
              <div className="sm:col-span-5">Item / Service Name</div>
              <div className="sm:col-span-2">HSN/SAC</div>
              <div className="sm:col-span-1 text-center">Qty</div>
              <div className="sm:col-span-2 text-right">Rate (₹)</div>
              <div className="sm:col-span-2 text-right">Taxable Amount (₹)</div>
            </div>

            {/* Items Rows */}
            <div className="space-y-3">
              {items.map((item, index) => {
                const qtyVal = parseFloat(item.qty) || 0;
                const rateVal = parseFloat(item.rate) || 0;
                const itemTaxable = qtyVal * rateVal;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:grid sm:grid-cols-12 gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 items-center hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-full sm:col-span-5">
                      <label className="block text-xs font-medium text-slate-500 sm:hidden mb-1">
                        Item / Service Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Web Development / Cloud Hosting"
                        value={item.productName}
                        onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      />
                    </div>

                    <div className="w-full sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 sm:hidden mb-1">HSN/SAC</label>
                      <input
                        type="text"
                        placeholder="e.g. 998314"
                        value={item.hsnNumber}
                        onChange={(e) => handleItemChange(item.id, 'hsnNumber', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      />
                    </div>

                    <div className="w-full sm:col-span-1">
                      <label className="block text-xs font-medium text-slate-500 sm:hidden mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 px-2 text-center text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      />
                    </div>

                    <div className="w-full sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 sm:hidden mb-1">Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 px-3 text-right text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      />
                    </div>

                    <div className="w-full sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                      <span className="text-xs font-medium text-slate-500 sm:hidden">Taxable Amount:</span>
                      <span className="text-sm font-semibold text-slate-900">
                        ₹{itemTaxable.toFixed(2)}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Another Item
              </button>
            </div>
          </div>

          {/* SECTION 4: Tax Selection & Amount Summary */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6 border-b pb-4">
              <CheckCircle2 className="h-5 w-5 text-slate-400" />
              Tax & Amount Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Tax Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-900">
                  Applicable GST Tax Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="taxType"
                      value="cgst_sgst"
                      checked={taxType === 'cgst_sgst'}
                      onChange={() => setTaxType('cgst_sgst')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-slate-300"
                    />
                    <div>
                      <span className="block text-sm font-medium text-slate-900">
                        GST 18% (Intra-State: CGST 9% + SGST 9%)
                      </span>
                      <span className="block text-xs text-slate-500">
                        Applicable when client is in West Bengal
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="taxType"
                      value="igst"
                      checked={taxType === 'igst'}
                      onChange={() => setTaxType('igst')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-slate-300"
                    />
                    <div>
                      <span className="block text-sm font-medium text-slate-900">
                        IGST 18% (Inter-State: Integrated GST 18%)
                      </span>
                      <span className="block text-xs text-slate-500">
                        Applicable when client is outside West Bengal
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary Calculations */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                  Calculation Summary
                </h3>

                <div className="flex justify-between text-sm text-slate-600">
                  <span>Total Taxable Amount</span>
                  <span className="font-semibold text-slate-900">₹{totalTaxable.toFixed(2)}</span>
                </div>

                {!isIgst ? (
                  <>
                    <div className="flex justify-between text-sm text-slate-500 pl-2">
                      <span>CGST (9%)</span>
                      <span>₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 pl-2">
                      <span>SGST (9%)</span>
                      <span>₹{sgst.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm text-slate-500 pl-2">
                    <span>IGST (18%)</span>
                    <span>₹{igst.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-slate-600 pt-2 border-t border-slate-200">
                  <span>Total Tax</span>
                  <span className="font-semibold text-slate-900">₹{totalTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t-2 border-slate-900">
                  <span>Grand Total</span>
                  <span className="text-indigo-600 text-lg">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (validateForm()) setViewMode('preview');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              Preview Document
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingId ? "Update Pro Forma Invoice" : "Save Pro Forma Invoice"}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: OFFICIAL PRO FORMA INVOICE DOCUMENT VIEW & PRINT */}
      {/* ========================================================================= */}
      {viewMode === 'preview' && (
        <div className="space-y-6">
          {/* Action Bar (Hidden in print) */}
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
                    {editingId ? "Update Pro Forma" : "Save Pro Forma"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Printable Document Paper */}
          <div
            id="proforma-printable-document"
            className="bg-white rounded-xl shadow-lg ring-1 ring-slate-200 p-8 sm:p-12 text-slate-800 font-sans"
          >
            {/* Letterhead Header */}
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
                  PRO FORMA INVOICE
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Pro Forma No:</span>
                  <p className="font-bold text-slate-800">{invoiceDetails.proformaNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Invoice Date:</span>
                  <p className="font-bold text-slate-800">{invoiceDetails.invoiceDate || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Place of Supply:</span>
                  <p className="font-bold text-slate-800">{customer.placeOfSupply || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">GST Rate:</span>
                  <p className="font-bold text-slate-800">18%</p>
                </div>
              </div>
            </div>

            {/* Customer Details Block */}
            <div className="mt-6 p-4 rounded-lg border border-slate-200 bg-white">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Customer Details:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-base font-bold text-slate-900">{customer.customerName || '-'}</p>
                  {customer.billingAddress && (
                    <div className="mt-1">
                      <span className="text-xs font-semibold text-slate-500">Billing Address:</span>
                      <p className="text-xs text-slate-600 whitespace-pre-line">{customer.billingAddress}</p>
                    </div>
                  )}
                  {customer.shippingAddress && (
                    <div className="mt-2">
                      <span className="text-xs font-semibold text-slate-500">Shipping Address:</span>
                      <p className="text-xs text-slate-600 whitespace-pre-line">{customer.shippingAddress}</p>
                    </div>
                  )}
                </div>
                <div className="text-xs space-y-1 sm:text-right">
                  {customer.customerEmail && (
                    <p><span className="text-slate-400">Email:</span> {customer.customerEmail}</p>
                  )}
                  {customer.customerGstNumber && (
                    <p><span className="text-slate-400">GSTIN:</span> <strong className="text-slate-800">{customer.customerGstNumber}</strong></p>
                  )}
                  {customer.placeOfSupply && (
                    <p><span className="text-slate-400">Place of Supply:</span> <strong className="text-slate-800">{customer.placeOfSupply}</strong></p>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
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
                    const qty = parseFloat(item.qty) || 0;
                    const rate = parseFloat(item.rate) || 0;
                    const itemTaxable = qty * rate;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 text-center font-medium text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-medium text-slate-900">{item.productName || '-'}</td>
                        <td className="py-3 px-3 text-center text-slate-500">{item.hsnNumber || '-'}</td>
                        <td className="py-3 px-3 text-center text-slate-800">{item.qty || '1'}</td>
                        <td className="py-3 px-3 text-right text-slate-800">{item.rate ? `₹${rate.toFixed(2)}` : '₹0.00'}</td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-900">
                          ₹{itemTaxable.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Breakdown */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
              <div className="w-full sm:w-1/2 space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <p className="font-bold text-slate-800 mb-1">BITNEXTRO SOLUTIONS PVT. LTD.</p>
                  <p>5, Park Lane, Parkstreet, Kolkata, West Bengal, 700016</p>
                  <p>Mobile: +91 9330855877 | Email: info@bitnextro.com</p>
                  <p>Website: www.bitnextro.com</p>
                </div>
              </div>

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
                  <span>Total Tax</span>
                  <span className="font-semibold text-slate-900">₹{totalTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t-2 border-slate-900">
                  <span>Grand Total</span>
                  <span className="text-indigo-600 text-base">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="mt-10 pt-8 flex justify-between items-end border-t border-slate-100">
              <div className="text-xs text-slate-400">
                <p>This is a computer-generated Pro Forma Invoice.</p>
                <p>Subject to Kolkata Jurisdiction.</p>
              </div>

              <div className="text-right flex flex-col items-end">
                <p className="text-xs font-bold text-slate-800">
                  For BITNEXTRO SOLUTIONS PVT. LTD.
                </p>
                <div className="flex items-center justify-end gap-3 my-2">
                  <img
                    src={authStamp}
                    alt="Bitnextro Official Stamp"
                    className="w-20 h-20 object-contain opacity-90"
                  />
                  <div className="w-32 h-16 flex items-center justify-center">
                    {/* Dedicated Signature Space - ready for signature image when provided */}
                    {authSignature ? (
                      <img
                        src={authSignature}
                        alt="Authorized Signature"
                        className="max-h-16 max-w-full object-contain"
                      />
                    ) : (
                      <div className="w-32 h-16" />
                    )}
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-700 border-t border-slate-400 pt-1 w-32 text-center">
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: SAVED PRO FORMA INVOICES LIST (MongoDB Retrievable) */}
      {/* ========================================================================= */}
      <div className="no-print bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Saved Pro Forma Invoices
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                {proformaList.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently stored in database. Click View to preview/print, Edit to update, or Delete to remove.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchProformas}
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
            <p className="text-xs">Loading saved Pro Forma Invoices from database...</p>
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
              onClick={fetchProformas}
              className="font-semibold underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingList && !listError && proformaList.length === 0 && (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No saved Pro Forma Invoices yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Fill in the form above and click "Save Pro Forma Invoice" to store your first record permanently.
            </p>
          </div>
        )}

        {/* Table of Saved Pro Forma Invoices */}
        {!isLoadingList && !listError && proformaList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-3">Pro Forma Number</th>
                  <th className="py-3 px-3">Customer Name</th>
                  <th className="py-3 px-3">Invoice Date</th>
                  <th className="py-3 px-3 text-right">Taxable Amount</th>
                  <th className="py-3 px-3 text-right">Grand Total</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proformaList.map((pi) => {
                  const isDeleting = deletingId === pi._id;
                  const isCurrentEditing = editingId === pi._id;

                  return (
                    <tr
                      key={pi._id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCurrentEditing ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-indigo-700">
                        {pi.proformaNumber}
                        {isCurrentEditing && (
                          <span className="ml-1.5 text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-medium">
                            Editing
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {pi.customerName}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {pi.invoiceDate || '-'}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        ₹{(pi.taxableAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ₹{(pi.grandTotal || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePreviewProforma(pi)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View / Print Pro Forma"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(pi)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Pro Forma"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(pi._id, pi.proformaNumber)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                            title="Delete Pro Forma"
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
