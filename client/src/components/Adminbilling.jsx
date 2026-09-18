import React, { useEffect, useState } from 'react';
import { handleError, handleSuccess } from './ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Plus, Trash2, FileText, Settings2, Receipt, Loader2, Search, User, TrendingUp } from 'lucide-react';
import QuotationForm from './QuotationForm';
import CustomerWorkspace from './CustomerWorkspace';
import ProformaWorkspace from './ProformaWorkspace';
import SalesWorkspace from './SalesWorkspace';

export default function Adminbilling() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('invoice');
  const [invoiceType, setInvoiceType] = useState('tax'); // 'tax' | 'cash'
  const [Isload1, setIsload1] = useState(false);
  const [isloadOriginal, setIsloadOriginal] = useState(false);
  const [saveloder, setSaveloder] = useState(false);
  const [isFetchingCustomer, setIsFetchingCustomer] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const naviget = useNavigate();

  useEffect(() => {
    const getoken = async () => {
      try {
        if (user.email === "bitnextrosolutions@gmail.com") {
          return;
        }
        handleError("Invalid admin");
        return naviget("/adminbitnextro");
      } catch (error) {
        handleError("Invalid admin");
        console.log(error);
        return naviget("/adminbitnextro");
      }
    };
    getoken();
  }, [user]);

  // State for general invoice details
  const [details, setDetails] = useState({
    invoiceNumber: '',
    supplyPlace: '',
    email: "",
    user: "",
    gstno: "",
    billingAddress: "",
    shippingAddress: '',
    isGstApplied: true,
    isIGstApplied: false,
    isStampApplied: true,
    isPaymentdone: true,
    isRoundOff: false
  });

  // State for dynamic products list
  const [products, setProducts] = useState([
    { id: Date.now(), name: '', hsn: '', rate: '', quantity: 1 }
  ]);

  // Handlers for general details (with GST / IGST mutual exclusion)
  const handleDetailChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'isGstApplied') {
        setDetails(prev => ({
          ...prev,
          isGstApplied: checked,
          isIGstApplied: checked ? false : prev.isIGstApplied
        }));
        return;
      }
      if (name === 'isIGstApplied') {
        setDetails(prev => ({
          ...prev,
          isIGstApplied: checked,
          isGstApplied: checked ? false : prev.isGstApplied
        }));
        return;
      }
    }
    setDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handlers for product list
  const handleProductChange = (id, field, value) => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  const addProduct = () => {
    setProducts([...products, { id: Date.now(), name: '', hsn: '', rate: '', quantity: 1 }]);
  };

  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Handle selecting customer from suggestions or fetch
  const handleSelectCustomer = (cust) => {
    setDetails(prev => ({
      ...prev,
      user: cust.customerName || prev.user,
      email: cust.emailId || cust.customerEmail || prev.email,
      gstno: invoiceType === 'cash' ? '' : (cust.gstNumber || cust.customerGstNo || prev.gstno),
      billingAddress: cust.billingAddress || cust.location || prev.billingAddress,
      shippingAddress: cust.shippingAddress || cust.billingAddress || cust.location || prev.shippingAddress,
      supplyPlace: cust.placeOfSupply || cust.customerPlaceofSupply || prev.supplyPlace,
    }));
    setShowSuggestions(false);
    handleSuccess(`Customer "${cust.customerName}" loaded.`);
  };

  // Live search suggestions as user types customer name
  useEffect(() => {
    const query = details.user.trim();
    if (!query) {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/v10/customer/search-customers?query=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status && Array.isArray(data.data)) {
          setCustomerSuggestions(data.data);
          setShowSuggestions(data.data.length > 0);
        }
      } catch (err) {
        console.error("Suggestion fetch error:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [details.user]);

  // --- Fetch Customer Data Handler (Unified billingcustomers endpoint) ---
  const fetchCustomerData = async () => {
    if (!details.user || !details.user.trim()) {
      return handleError("Please enter a customer name first.");
    }

    try {
      setIsFetchingCustomer(true);
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v10/customer/find-customer`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: details.user })
      });

      const data = await response.json();

      if (data.status && data.data) {
        handleSelectCustomer(data.data);
      } else {
        handleError(data.msg || "Customer not found. Please add the customer from the Customer tab.");
      }
    } catch (error) {
      console.log(error);
      handleError('Network Issue or Server Error');
    } finally {
      setIsFetchingCustomer(false);
    }
  };

  // Helper to get effective rate based on Round Off setting
  const getEffectiveRate = (rawRate) => {
    if (rawRate === '' || rawRate === null || rawRate === undefined) return 0;
    const num = parseFloat(rawRate);
    if (isNaN(num)) return 0;
    return details.isRoundOff ? Math.floor(num) : num;
  };

  // Helper to calculate taxable amount for a single product (avoiding floating-point issues)
  const getProductTaxable = (product) => {
    const effRate = getEffectiveRate(product.rate);
    const qty = parseInt(product.quantity, 10) || 0;
    return Math.round(effRate * qty * 100) / 100;
  };

  // Helper to calculate total taxable amount across all line items
  const calculateTotalTaxable = () => {
    return products.reduce((sum, p) => {
      return Math.round((sum + getProductTaxable(p)) * 100) / 100;
    }, 0);
  };

  // Build consistent payload for PDF generation
  const buildPayload = () => {
    return {
      ...details,
      invoiceType,
      isGstApplied: invoiceType === 'cash' ? false : details.isGstApplied,
      isIGstApplied: invoiceType === 'cash' ? false : details.isIGstApplied,
      gstno: invoiceType === 'cash' ? '' : details.gstno,
      isRoundOff: Boolean(details.isRoundOff),
      products: products.map(({ id, ...rest }) => ({
        ...rest,
        rate: getEffectiveRate(rest.rate)
      })),
      totalAmount: calculateTotalTaxable()
    };
  };



  const recordSale = async (payload) => {
    try {
      const salesPayload = {
        invoiceNumber: payload.invoiceNumber,
        invoiceType: payload.invoiceType,
        invoiceDate: payload.date,
        customerName: payload.user,
        customerEmail: payload.email,
        customerGstNumber: payload.gstno,
        items: payload.products.map(p => ({
          productName: p.name,
          hsnNumber: p.hsn,
          qty: Number(p.quantity) || 0,
          rate: Number(p.rate) || 0,
          taxableAmount: (Number(p.quantity) || 0) * (Number(p.rate) || 0)
        })),
        salesAmount: payload.totalAmount
      };
      
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/record-sale`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salesPayload)
      });
    } catch (error) {
      console.error("Error recording sale:", error);
    }
  };

  const handleofficecopy = async (e) => {
    e.preventDefault();
    setIsload1(true);
    const payload = buildPayload();

    recordSale(payload);

    const url = `${import.meta.env.VITE_BACKEND_URL}/api/v4/copybill/billing-work`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const blob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `${payload.invoiceNumber || 'Invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(pdfUrl);
      setIsload1(false);
    } catch (error) {
      setIsload1(false);
      console.error("Error generating PDF:", error);
      alert("Failed to generate invoice. Please check the console.");
    }
  }

  const handleoriginalcopy = async (e) => {
    e.preventDefault();
    setIsloadOriginal(true);
    const payload = buildPayload();

    recordSale(payload);

    const url = `${import.meta.env.VITE_BACKEND_URL}/api/v3/bill/billing-work`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const blob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `${payload.invoiceNumber || 'Invoice'}_Original.pdf`);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(pdfUrl);
      setIsloadOriginal(false);
    } catch (error) {
      setIsloadOriginal(false);
      console.error("Error generating PDF:", error);
      alert("Failed to generate invoice. Please check the console.");
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 select-none md:sticky md:top-16 md:h-[calc(100vh-4rem)]">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-800">
            <Receipt className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-sm tracking-tight text-slate-900">
              Billing Workspace
            </span>
          </div>
        </div>

        <nav className="p-3 space-y-1.5" aria-label="Billing navigation">
          <button
            type="button"
            id="sidebar-customer"
            onClick={() => setActiveTab(activeTab === 'customer' ? 'invoice' : 'customer')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
              activeTab === 'customer'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User className={`h-4 w-4 shrink-0 ${activeTab === 'customer' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Customer</span>
          </button>

          <button
            type="button"
            id="sidebar-quotation"
            onClick={() => setActiveTab(activeTab === 'quotation' ? 'invoice' : 'quotation')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
              activeTab === 'quotation'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className={`h-4 w-4 shrink-0 ${activeTab === 'quotation' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Quotation</span>
          </button>

          <button
            type="button"
            id="sidebar-proforma"
            onClick={() => setActiveTab(activeTab === 'proforma' ? 'invoice' : 'proforma')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
              activeTab === 'proforma'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Receipt className={`h-4 w-4 shrink-0 ${activeTab === 'proforma' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Pro Forma Invoice</span>
          </button>

          <button
            type="button"
            id="sidebar-sales"
            onClick={() => setActiveTab(activeTab === 'sales' ? 'invoice' : 'sales')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
              activeTab === 'sales'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <TrendingUp className={`h-4 w-4 shrink-0 ${activeTab === 'sales' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Sales</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        {activeTab === 'invoice' && (
          <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className={`h-6 w-6 ${invoiceType === 'cash' ? 'text-emerald-600' : 'text-indigo-600'}`} />
              {invoiceType === 'cash' ? 'Create New Cash Invoice' : 'Create New Invoice'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {invoiceType === 'cash'
                ? 'Generate a pure non-GST cash invoice (no GST applied, no GST numbers included).'
                : 'Fill in the details below to generate a production-ready billing PDF.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => {
                setInvoiceType('tax');
                setDetails(prev => ({ ...prev, isGstApplied: true, isIGstApplied: false }));
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                invoiceType === 'tax'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Tax Invoice
            </button>
            <button
              type="button"
              onClick={() => {
                setInvoiceType('cash');
                setDetails(prev => ({ ...prev, isGstApplied: false, isIGstApplied: false, gstno: '' }));
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                invoiceType === 'cash'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Cash Invoice
            </button>
          </div>
        </div>

        <form onSubmit={handleoriginalcopy} className="space-y-6">
          {/* Section 1: General Details */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6 border-b pb-4">
              <FileText className="h-5 w-5 text-slate-400" />
              {invoiceType === 'cash' ? 'Cash Invoice Details' : 'Invoice Details'}
            </h2>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Invoice Number</label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="invoiceNumber"
                    required
                    placeholder={invoiceType === 'cash' ? "e.g. CASH-2026-001" : "e.g. INV-2026-001"}
                    value={details.invoiceNumber}
                    onChange={handleDetailChange}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Place of Supply</label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="supplyPlace"
                    required
                    placeholder="e.g. 36-TELANGANA"
                    value={details.supplyPlace}
                    onChange={handleDetailChange}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium leading-6 text-slate-900">Customer Name</label>
                
                {/* Flex container for Input + Autocomplete + Fetch Button */}
                <div className="mt-2 flex gap-3 relative">
                  <div className="relative flex-1">
                    <input
                      name="user"
                      required
                      placeholder="Enter or search customer name..."
                      value={details.user}
                      onChange={handleDetailChange}
                      onFocus={() => {
                        if (customerSuggestions.length > 0) setShowSuggestions(true);
                      }}
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      autoComplete="off"
                    />

                    {/* Autocomplete Suggestions Dropdown */}
                    {showSuggestions && customerSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {customerSuggestions.map((cust) => (
                          <button
                            key={cust._id}
                            type="button"
                            onMouseDown={() => handleSelectCustomer(cust)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 transition-colors flex flex-col cursor-pointer"
                          >
                            <span className="font-semibold text-slate-900">{cust.customerName}</span>
                            <span className="text-[11px] text-slate-500">
                              {cust.gstNumber ? `GST: ${cust.gstNumber} | ` : ''}
                              {cust.emailId || cust.billingAddress || cust.placeOfSupply || 'Saved Customer'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={fetchCustomerData}
                    disabled={isFetchingCustomer}
                    className="inline-flex items-center justify-center rounded-md bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 min-w-[90px] transition-colors"
                  >
                    {isFetchingCustomer ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-1.5" />
                        Fetch
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium leading-6 text-slate-900">Customer Email</label>
                  <div className="mt-2">
                    <input
                      name="email"
                      placeholder="Enter email"
                      value={details.email}
                      onChange={handleDetailChange}
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                {invoiceType === 'tax' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium leading-6 text-slate-900">
                      Customer GST NO <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2">
                      <input
                        name="gstno"
                        required
                        placeholder="Enter GST NO"
                        value={details.gstno}
                        onChange={handleDetailChange}
                        className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <label className="block text-sm font-medium leading-6 text-slate-900">Billing Address</label>
                  <div className="mt-2">
                    <textarea
                      name="billingAddress"
                      rows={3}
                      required
                      placeholder="Enter complete billing address..."
                      value={details.billingAddress}
                      onChange={handleDetailChange}
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium leading-6 text-slate-900">Shipping Address</label>
                  <div className="mt-2">
                    <textarea
                      name="shippingAddress"
                      rows={3}
                      required
                      placeholder="Enter complete shipping address..."
                      value={details.shippingAddress}
                      onChange={handleDetailChange}
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Line Items (Products) */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b pb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-slate-400" />
                Line Items
              </h2>

              {/* Round Off Control for Rate */}
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                <span className="text-xs font-semibold text-slate-700">Round Off Rate:</span>
                <span className={`text-xs font-bold ${details.isRoundOff ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {details.isRoundOff ? 'ON' : 'OFF'}
                </span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isRoundOff"
                    className="sr-only peer"
                    checked={Boolean(details.isRoundOff)}
                    onChange={handleDetailChange}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>
            </div>

            {/* Desktop Header Row */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 mb-3 px-2 text-sm font-medium text-slate-500">
              <div className="col-span-5">Product / Service Name</div>
              <div className="col-span-2">HSN/SAC</div>
              <div className="col-span-2">Rate (₹)</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={product.id} className="relative flex flex-col sm:grid sm:grid-cols-12 gap-4 items-start sm:items-start bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-slate-200">
                  <div className="col-span-5 w-full">
                    <label className="block sm:hidden text-xs font-medium text-slate-500 mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tata Nexon / Car Cover"
                      value={product.name}
                      onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div className="col-span-2 w-full">
                    <label className="block sm:hidden text-xs font-medium text-slate-500 mb-1">HSN/SAC</label>
                    <input
                      type="text"
                      required
                      placeholder="87038070"
                      value={product.hsn}
                      onChange={(e) => handleProductChange(product.id, 'hsn', e.target.value)}
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div className="col-span-2 w-full">
                    <label className="block sm:hidden text-xs font-medium text-slate-500 mb-1">Rate</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={product.rate}
                      onChange={(e) => handleProductChange(product.id, 'rate', e.target.value)}
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    {details.isRoundOff && product.rate !== '' && (
                      <p className="text-[11px] text-indigo-600 font-semibold mt-1">
                        Effective: ₹{getEffectiveRate(product.rate)}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 w-full">
                    <label className="block sm:hidden text-xs font-medium text-slate-500 mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={product.quantity}
                      onChange={(e) => handleProductChange(product.id, 'quantity', e.target.value)}
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div className="col-span-1 w-full flex justify-end sm:justify-center sm:h-[38px] sm:items-center mt-2 sm:mt-0">
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      disabled={products.length === 1}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-start justify-between gap-4 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={addProduct}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Another Item
              </button>
            </div>
          </div>

          {/* Section 2.5: GST Calculation UI */}
          {invoiceType === 'tax' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">GST Calculation Convention</h3>
                  <p className="text-sm text-slate-500 mt-1">Standard 18% GST calculation as configured in Bitnextro billing.</p>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 overflow-x-auto w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setDetails(prev => ({...prev, isGstApplied: true, isIGstApplied: false}))}
                    className={`px-4 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap ${details.isGstApplied && !details.isIGstApplied ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                  >
                    CGST (9%) + SGST (9%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetails(prev => ({...prev, isGstApplied: false, isIGstApplied: true}))}
                    className={`px-4 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap ${!details.isGstApplied && details.isIGstApplied ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                  >
                    IGST (18%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetails(prev => ({...prev, isGstApplied: false, isIGstApplied: false}))}
                    className={`px-4 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap ${!details.isGstApplied && !details.isIGstApplied ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                  >
                    Without GST
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-white">
                <div className="flex flex-col ml-auto sm:w-1/2 w-full gap-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Taxable Amount</span>
                    <span className="font-medium text-slate-900">₹{calculateTotalTaxable().toFixed(2)}</span>
                  </div>
                  
                  {details.isGstApplied && !details.isIGstApplied && (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST (9%)</span>
                        <span>₹{(calculateTotalTaxable() * 0.09).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST (9%)</span>
                        <span>₹{(calculateTotalTaxable() * 0.09).toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {!details.isGstApplied && details.isIGstApplied && (
                    <div className="flex justify-between text-slate-600">
                      <span>IGST (18%)</span>
                      <span>₹{(calculateTotalTaxable() * 0.18).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-3 mb-1">
                    <span>GST Total (18%)</span>
                    <span className="font-medium text-slate-900">
                      ₹{((details.isGstApplied || details.isIGstApplied) ? (calculateTotalTaxable() * 0.18) : 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-900 text-base font-bold items-center mt-1">
                    <div className="flex items-center gap-2">
                      Total Amount
                      {details.isRoundOff && (
                        <span className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">
                          Round Off
                        </span>
                      )}
                    </div>
                    <span className="text-indigo-700 text-lg">
                      ₹{
                        (details.isRoundOff 
                          ? Math.round(calculateTotalTaxable() + ((details.isGstApplied || details.isIGstApplied) ? calculateTotalTaxable() * 0.18 : 0))
                          : (calculateTotalTaxable() + ((details.isGstApplied || details.isIGstApplied) ? calculateTotalTaxable() * 0.18 : 0))
                        ).toFixed(2)
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Configuration & Settings */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6 border-b pb-4">
              <Settings2 className="h-5 w-5 text-slate-400" />
              Document Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {invoiceType !== 'tax' && (
                <div className="sm:col-span-2 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Cash Invoice:</strong> Pure non-GST bill. GST and IGST are disabled, and no GST numbers will appear on the document.</span>
                  </div>
                </div>
              )}

              {/* Stamp Toggle */}
              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900">Include Authorized Stamp</p>
                  <p className="text-xs text-slate-500 mt-1">Append digital signature/stamp</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isStampApplied"
                    className="sr-only peer"
                    checked={details.isStampApplied}
                    onChange={handleDetailChange}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>
              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900">Payment</p>
                  <p className="text-xs text-slate-500 mt-1">Is payment done</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPaymentdone"
                    className="sr-only peer"
                    checked={details.isPaymentdone}
                    onChange={handleDetailChange}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-wrap items-center justify-end gap-4 pt-4">
            <button
              type="submit"
              disabled={isloadOriginal || Isload1}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isloadOriginal ? <div className='w-4 h-4 border-2 border-white rounded-sm animate-spin'></div> : "Original copy"}
            </button>
            <button
              type="button"
              disabled={isloadOriginal || Isload1}
              onClick={(e) => {
                if (e.currentTarget.form && !e.currentTarget.form.reportValidity()) return;
                handleofficecopy(e);
              }}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {Isload1 ? <div className='w-4 h-4 border-2 border-white rounded-sm animate-spin'></div> : "Duplicate copy"}
            </button>
          </div>
        </form>
      </div>
    )}

    {/* Customer Workspace */}
    {activeTab === 'customer' && (
      <CustomerWorkspace onBack={() => setActiveTab('invoice')} />
    )}

    {/* Quotation Form */}
    {activeTab === 'quotation' && (
      <QuotationForm onBack={() => setActiveTab('invoice')} />
    )}

    {/* Pro Forma Invoice Workspace */}
    {activeTab === 'proforma' && (
      <ProformaWorkspace onBack={() => setActiveTab('invoice')} />
    )}

    {/* Sales Workspace */}
    {activeTab === 'sales' && (
      <SalesWorkspace />
    )}
  </main>
</div>
  );
}