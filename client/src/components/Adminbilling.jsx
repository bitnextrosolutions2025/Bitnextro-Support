import React, { useEffect, useState } from 'react';
import { handleError, handleSuccess } from './ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Plus, Trash2, FileText, Settings2, Receipt, Loader2, Search, User, TrendingUp, FileSpreadsheet, RefreshCw, Eye, Edit2, X, Wallet, Save, Printer, ArrowLeft, FileCheck, CheckCircle2, Download, Edit3 } from 'lucide-react';
import QuotationForm from './QuotationForm';
import CustomerWorkspace from './CustomerWorkspace';
import ProformaWorkspace from './ProformaWorkspace';
import SalesWorkspace from './SalesWorkspace';
import DailyExpensesWorkspace from './DailyExpensesWorkspace';
import secureLocalStorage from 'react-secure-storage';
import { authSignature } from '../assets/authSignature';

// Official Bitnextro letterhead assets
const companyLogo = "https://res.cloudinary.com/dcvejeszo/image/upload/v1772130931/user_profiles/iasw8ry0br2wgwprakxg.jpg";
const authStamp = "https://res.cloudinary.com/dcvejeszo/image/upload/v1772137306/user_profiles/a9siliu0rbff2z4p8o5k.png";
const bankDetails = {
  bank: "HDFC Bank",
  acc: "50200098939227",
  ifsc: "HDFC0000014",
  branch: "Kolkata, Central Plaza"
};

export default function Adminbilling() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('invoice');
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'
  const [invoiceType, setInvoiceType] = useState('tax'); // 'tax' | 'cash'
  const [Isload1, setIsload1] = useState(false);
  const [isloadOriginal, setIsloadOriginal] = useState(false);
  const [saveloder, setSaveloder] = useState(false);
  const [isFetchingCustomer, setIsFetchingCustomer] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const naviget = useNavigate();
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [invoiceListError, setInvoiceListError] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);

    const fetchInvoices = async () => {
    setIsLoadingInvoices(true);
    setInvoiceListError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/all?type=Sales`);
      const data = await res.json();
      if (data && Array.isArray(data.sales)) {
        // Sort by newest first
        const autoInvoices = data.sales.filter(inv => !inv.source || inv.source === 'billing_auto');
        setSavedInvoices(autoInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        setInvoiceListError(data.msg || "Could not retrieve saved invoices.");
      }
    } catch (err) {
      console.error(err);
      setInvoiceListError("Unable to reach backend server.");
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'invoice') {
      fetchInvoices();
    }
  }, [activeTab]);

  
  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice? This will also remove it from your Sales ledger.")) return;
    try {
      const token = secureLocalStorage.getItem("auth-token") || "";
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/delete/${id}`, {
        method: "DELETE",
        headers: { "auth-token": token }
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${res.status} ${text.substring(0, 50)}`);
      }
      
      const data = await res.json();
      if (res.ok && (data.status === true || data.message === "Sale deleted successfully")) {
        setSavedInvoices(prev => prev.filter(inv => inv._id !== id));
      } else {
        alert(data.msg || data.error || data.message || "Failed to delete invoice");
      }
    } catch (err) {
      console.error(err);
      alert(`Error deleting invoice: ${err.message}`);
    }
  };

  
  const handleClearForm = () => {
    if (window.confirm("Are you sure you want to clear the form?")) {
      setEditingInvoiceId(null);
      setViewMode('edit');
      setDetails({
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
        isRoundOff: false,
        invoiceDate: '',
        advanceAmount: ''
      });
      setProducts([{ id: Date.now(), name: '', hsn: '', rate: '', quantity: 1 }]);
      setInvoiceType('tax');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const invNum = (details.invoiceNumber || '').trim().replace(/[/\\?%*:|"<>]/g, '-');
    const cName = (details.user || '').trim().replace(/[/\\?%*:|"<>]/g, '-');
    const fileName = [invNum, cName].filter(Boolean).join(' - ') || 'Invoice';

    document.title = fileName;

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);

    window.print();

    setTimeout(restoreTitle, 1500);
  };

  const handleViewInvoice = (inv, mode = 'edit') => {
    setEditingInvoiceId(inv._id);
    const totalTaxable = (inv.items || []).reduce((acc, curr) => acc + (curr.qty * curr.rate), 0);
    const hasTax = (inv.salesAmount - totalTaxable) > 1;

    setInvoiceType(inv.invoiceType || (hasTax ? 'tax' : 'cash'));
    
    setDetails({
      invoiceNumber: inv.invoiceNumber || '',
      supplyPlace: inv.supplyPlace || '',
      email: inv.customerEmail || '',
      user: inv.customerName || '',
      gstno: inv.customerGstNumber || '',
      billingAddress: inv.billingAddress || '',
      shippingAddress: inv.shippingAddress || '',
      isGstApplied: inv.isGstApplied !== undefined ? inv.isGstApplied : hasTax,
      isIGstApplied: Boolean(inv.isIGstApplied),
      isStampApplied: inv.isStampApplied !== undefined ? inv.isStampApplied : true,
      isPaymentdone: inv.paymentStatus === 'Paid',
      isRoundOff: Boolean(inv.isRoundOff),
      invoiceDate: inv.invoiceDate || (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-GB") : ''),
      advanceAmount: inv.advanceAmount !== undefined && inv.advanceAmount !== null ? inv.advanceAmount : (inv.amountReceived || '')
    });

    const mappedProducts = (inv.items || []).map((item, idx) => ({
      id: Date.now() + idx,
      name: item.productName || '',
      hsn: item.hsnNumber || '',
      rate: item.rate !== undefined && item.rate !== null ? item.rate : '',
      quantity: item.qty || 1
    }));
    
    setProducts(mappedProducts.length > 0 ? mappedProducts : [{ id: Date.now(), name: '', hsn: '', rate: '', quantity: 1 }]);
    
    if (mode === 'preview') {
      setViewMode('preview');
      handleSuccess(`Previewing invoice "${inv.invoiceNumber}".`);
    } else {
      setViewMode('edit');
      handleSuccess(`Invoice "${inv.invoiceNumber}" loaded into form for editing.`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
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
    isRoundOff: false,
    invoiceDate: '',
    advanceAmount: ''
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
    return num;
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
    const totalTaxable = calculateTotalTaxable();
    const isTax = invoiceType === 'tax';
    const gstRate = (isTax && (details.isGstApplied || details.isIGstApplied)) ? 0.18 : 0;
    const rawTotal = totalTaxable + (totalTaxable * gstRate);
    const grandTotalCalculated = details.isRoundOff ? Math.round(rawTotal) : rawTotal;
    const advancePaid = parseFloat(details.advanceAmount || 0);
    const calculatedDue = Math.max(0, parseFloat((grandTotalCalculated - advancePaid).toFixed(2)));

    return {
      ...details,
      invoiceType,
      date: details.invoiceDate || new Date().toLocaleDateString("en-GB"),
      isGstApplied: invoiceType === 'cash' ? false : details.isGstApplied,
      isIGstApplied: invoiceType === 'cash' ? false : details.isIGstApplied,
      gstno: invoiceType === 'cash' ? '' : details.gstno,
      isRoundOff: Boolean(details.isRoundOff),
      advanceAmount: advancePaid,
      amountReceived: advancePaid,
      balanceDue: calculatedDue,
      products: products.map(({ id, ...rest }) => ({
        ...rest,
        rate: getEffectiveRate(rest.rate)
      })),
      totalAmount: grandTotalCalculated
    };
  };



  const recordSale = async (payload) => {
    try {
      const salesPayload = {
        id: editingInvoiceId || undefined,
        invoiceNumber: payload.invoiceNumber,
        invoiceType: payload.invoiceType,
        invoiceDate: payload.date || new Date().toLocaleDateString("en-GB"),
        customerName: payload.user,
        customerEmail: payload.email,
        customerGstNumber: payload.gstno,
        billingAddress: payload.billingAddress || '',
        shippingAddress: payload.shippingAddress || '',
        supplyPlace: payload.supplyPlace || '',
        isGstApplied: payload.isGstApplied,
        isIGstApplied: payload.isIGstApplied,
        isStampApplied: payload.isStampApplied,
        isRoundOff: payload.isRoundOff,
        isPaymentdone: payload.isPaymentdone,
        advanceAmount: parseFloat(payload.advanceAmount || 0),
        amountReceived: parseFloat(payload.advanceAmount || 0),
        balanceDue: parseFloat(payload.balanceDue || 0),
        items: payload.products.map(p => ({
          productName: p.name,
          hsnNumber: p.hsn,
          qty: Number(p.quantity) || 0,
          rate: Number(p.rate) || 0,
          taxableAmount: (Number(p.quantity) || 0) * (Number(p.rate) || 0)
        })),
        salesAmount: payload.totalAmount
      };
      
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/record-sale`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salesPayload)
      });
      const data = await res.json();
      if (res.ok) {
        if (data.sale && data.sale._id) {
          setEditingInvoiceId(data.sale._id);
        }
        await fetchInvoices();
        return true;
      } else {
        handleError(data.error || "Failed to save invoice to database");
        return false;
      }
    } catch (error) {
      console.error("Error recording sale:", error);
      handleError("Error connecting to server to save invoice");
      return false;
    }
  };

  const handleofficecopy = async (e) => {
    e.preventDefault();
    setIsload1(true);
    const payload = buildPayload();

    await recordSale(payload);

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
      const safeCustomerName = (payload.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `${payload.invoiceNumber || 'Invoice'}_${safeCustomerName}.pdf`);
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

  // Prevent Enter key from submitting the form and instead move to the next input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault();
      const form = e.target.form;
      if (!form) return;
      const index = Array.prototype.indexOf.call(form, e.target);
      const nextElement = form.elements[index + 1];
      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  const handleoriginalcopy = async (e) => {
    e.preventDefault();
    setIsloadOriginal(true);
    const payload = buildPayload();

    await recordSale(payload);

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
      const safeCustomerNameOrig = (payload.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `${payload.invoiceNumber || 'Invoice'}_${safeCustomerNameOrig}_Original.pdf`);
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
            id="sidebar-invoice"
            onClick={() => {
              setActiveTab('invoice');
              setViewMode('edit');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
              activeTab === 'invoice'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Plus className={`h-4 w-4 shrink-0 ${activeTab === 'invoice' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Create Invoice</span>
          </button>

          <button
            type="button"
            id="sidebar-customer"
            onClick={() => setActiveTab('customer')}
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
            onClick={() => setActiveTab('quotation')}
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
            onClick={() => setActiveTab('proforma')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
              activeTab === 'proforma'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Receipt className={`h-4 w-4 shrink-0 ${activeTab === 'proforma' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Proforma Invoice</span>
          </button>

          <button
            type="button"
            id="sidebar-expenses"
            onClick={() => setActiveTab('expenses')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Wallet className={`h-4 w-4 shrink-0 ${activeTab === 'expenses' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Daily Expenses</span>
          </button>

          <button
            type="button"
            id="sidebar-sales"
            onClick={() => setActiveTab('sales')}
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
            {/* Print Stylesheet */}
            <style>{`
              .border-black { border-color: #000 !important; }
              .bg-gray-100 { background-color: #f3f4f6 !important; }
              .text-blue-600 { color: #2563eb !important; }
              @media print {
                body {
                  background: white !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body * {
                  visibility: hidden;
                }
                #billing-printable-document, #billing-printable-document * {
                  visibility: visible;
                }
                #billing-printable-document {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  margin: 0;
                  padding: 0;
                  box-shadow: none !important;
                  border: 1px solid #000 !important;
                  background: white !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            {/* Header with Mode Switcher (Hidden when printing) */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className={`h-6 w-6 ${invoiceType === 'cash' ? 'text-emerald-600' : 'text-indigo-600'}`} />
                  {viewMode === 'preview'
                    ? 'Invoice Document Preview'
                    : (invoiceType === 'cash' ? 'Create New Cash Invoice' : (editingInvoiceId ? 'Edit Invoice' : 'Create New Invoice'))}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {viewMode === 'preview'
                    ? 'Preview the official letterhead document, ready for printing or PDF export.'
                    : (invoiceType === 'cash'
                        ? 'Generate a pure non-GST cash invoice (no GST applied, no GST numbers included).'
                        : 'Fill in the details below to generate and save production-ready invoices.')}
                </p>
              </div>

              {/* Controls: Edit/Preview View Switcher + Tax/Cash Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 shrink-0">
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
                    Edit Form
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('preview');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
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

                {viewMode === 'edit' && (
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
                )}
              </div>
            </div>

            {viewMode === 'edit' && (
              <form onSubmit={(e) => e.preventDefault()} onKeyDown={handleKeyDown} className="space-y-6">
          {/* Editing Status Banner */}
          {editingInvoiceId && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-amber-800 shadow-xs">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Editing Saved Invoice: <strong className="font-semibold">{details.invoiceNumber || 'Draft'}</strong>. Updates will save directly to the database.
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearForm}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancel / New Invoice
              </button>
            </div>
          )}

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

              {/* Round Off Control for Bill */}
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                <span className="text-xs font-semibold text-slate-700">Round Off Total Bill:</span>
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
                    <textarea
                      required
                      rows={1}
                      placeholder="e.g. Tata Nexon / Car Cover"
                      value={product.name}
                      onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                      onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 resize-none overflow-hidden"
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
                    onClick={() => setDetails(prev => ({...prev, isGstApplied: true, isIGstApplied: false}))}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      details.isGstApplied && !details.isIGstApplied
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    CGST (9%) + SGST (9%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetails(prev => ({...prev, isGstApplied: false, isIGstApplied: true}))}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      !details.isGstApplied && details.isIGstApplied
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    IGST (18%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetails(prev => ({...prev, isGstApplied: false, isIGstApplied: false}))}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      !details.isGstApplied && !details.isIGstApplied
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Without GST
                  </button>
                </div>
              </div>

              {/* Detailed Summary Rows */}
              <div className="pt-6 max-w-sm ml-auto space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Total Taxable Amount</span>
                  <span className="font-semibold text-slate-900">₹{calculateTotalTaxable().toFixed(2)}</span>
                </div>

                {details.isGstApplied && !details.isIGstApplied && (
                  <>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>CGST (9%)</span>
                      <span>₹{(calculateTotalTaxable() * 0.09).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>SGST (9%)</span>
                      <span>₹{(calculateTotalTaxable() * 0.09).toFixed(2)}</span>
                    </div>
                  </>
                )}

                {!details.isGstApplied && details.isIGstApplied && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>IGST (18%)</span>
                    <span>₹{(calculateTotalTaxable() * 0.18).toFixed(2)}</span>
                  </div>
                )}

                {(details.isGstApplied || details.isIGstApplied) && (
                  <div className="flex justify-between text-sm text-slate-600 pt-1 border-t border-slate-100">
                    <span>GST Total (18%)</span>
                    <span className="font-semibold text-slate-900">₹{(calculateTotalTaxable() * 0.18).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-base font-bold text-slate-900 pt-3 border-t-2 border-slate-900">
                  <div className="flex items-center gap-2">
                    <span>Total Amount</span>
                    {details.isRoundOff && (
                      <span className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">
                        Round Off
                      </span>
                    )}
                  </div>
                  <span className="text-indigo-600 text-lg">
                    ₹{
                      (details.isRoundOff 
                        ? Math.round(calculateTotalTaxable() + ((details.isGstApplied || details.isIGstApplied) ? calculateTotalTaxable() * 0.18 : 0))
                        : (calculateTotalTaxable() + ((details.isGstApplied || details.isIGstApplied) ? calculateTotalTaxable() * 0.18 : 0))
                      ).toFixed(2)
                    }
                  </span>
                </div>

                {/* Advance Amount Paid */}
                <div className="pt-3 mt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <span>Advance Paid by Client</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative w-44">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-sm font-semibold pointer-events-none">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        name="advanceAmount"
                        value={details.advanceAmount || ''}
                        onChange={handleDetailChange}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-1.5 text-right text-sm font-semibold text-emerald-700 bg-emerald-50/50 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {parseFloat(details.advanceAmount || 0) > 0 && (
                    <div className="flex justify-between items-center text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        <span>Rest Due Amount:</span>
                      </div>
                      <span className="text-base font-extrabold">
                        ₹{Math.max(0, (
                          (details.isRoundOff 
                            ? Math.round(calculateTotalTaxable() + ((details.isGstApplied || details.isIGstApplied) ? calculateTotalTaxable() * 0.18 : 0))
                            : (calculateTotalTaxable() + ((details.isGstApplied || details.isIGstApplied) ? calculateTotalTaxable() * 0.18 : 0))
                          ) - parseFloat(details.advanceAmount || 0)
                        )).toFixed(2)}
                      </span>
                    </div>
                  )}
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
          <div className="flex flex-wrap items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleClearForm}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              Clear Form
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('preview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-white border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              Preview Document
            </button>
            <button
              type="button"
              disabled={isSavingInvoice || isloadOriginal || Isload1}
              onClick={async (e) => {
                if (e.currentTarget.form && !e.currentTarget.form.reportValidity()) return;
                setIsSavingInvoice(true);
                const payload = buildPayload();
                const ok = await recordSale(payload);
                setIsSavingInvoice(false);
                if (ok) {
                  handleSuccess(`Invoice "${payload.invoiceNumber}" saved successfully!`);
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isSavingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingInvoiceId ? "Update Invoice" : "Save Invoice"}
            </button>
            <button
              type="button"
              disabled={isSavingInvoice || isloadOriginal || Isload1}
              onClick={(e) => {
                if (e.currentTarget.form && !e.currentTarget.form.reportValidity()) return;
                handleoriginalcopy(e);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isloadOriginal ? <div className='w-4 h-4 border-2 border-white rounded-sm animate-spin'></div> : "Original copy"}
            </button>
            <button
              type="button"
              disabled={isSavingInvoice || isloadOriginal || Isload1}
              onClick={(e) => {
                if (e.currentTarget.form && !e.currentTarget.form.reportValidity()) return;
                handleofficecopy(e);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {Isload1 ? <div className='w-4 h-4 border-2 border-white rounded-sm animate-spin'></div> : "Duplicate copy"}
            </button>
          </div>
        </form>
      )}

      {/* Mode 2: Official Document Preview */}
      {viewMode === 'preview' && (() => {
        const previewTaxable = calculateTotalTaxable();
        const isCash = invoiceType === 'cash';
        const isGst = !isCash && Boolean(details.isGstApplied);
        const isIGst = !isCash && Boolean(details.isIGstApplied);

        let totalTaxAmount = 0;
        const productsWithCalc = products.map((p, index) => {
          const effRate = getEffectiveRate(p.rate);
          const qty = parseInt(p.quantity, 10) || 0;
          const taxable = Math.round(effRate * qty * 100) / 100;
          const taxVal = isGst ? (taxable * 0.18) : isIGst ? (taxable * 0.18) : 0;
          const finalItemTotal = taxable + taxVal;
          totalTaxAmount += taxVal;
          return {
            ...p,
            effRate,
            qty,
            taxable,
            taxVal,
            finalItemTotal
          };
        });

        let previewGrandTotal = previewTaxable + totalTaxAmount;
        let previewRoundOff = 0;
        if (details.isRoundOff) {
          const rounded = Math.round(previewGrandTotal);
          previewRoundOff = rounded - previewGrandTotal;
          previewGrandTotal = rounded;
        }

        const previewAdvanceAmount = parseFloat(details.advanceAmount || 0);
        const previewBalanceDue = Math.max(0, parseFloat((previewGrandTotal - previewAdvanceAmount).toFixed(2)));
        const isPaymentDone = Boolean(details.isPaymentdone) || (previewAdvanceAmount >= previewGrandTotal && previewGrandTotal > 0);

        const upiPayAmount = previewBalanceDue > 0 ? previewBalanceDue : previewGrandTotal;
        const upiString = `upi://pay?pa=81153201@ubin&pn=${encodeURIComponent("BITNEXTRO SOLUTIONS PVT. LTD.")}&am=${upiPayAmount.toFixed(2)}&cu=INR`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(upiString)}`;

        return (
          <div className="space-y-6">
            {/* Document Actions Bar (Hidden when printing) */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-xl shadow-md">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold">
                    Document Preview: {details.invoiceNumber || 'Draft Invoice'}
                  </p>
                  <p className="text-xs text-slate-400">
                    Official PDF letterhead layout • Identical to downloaded invoice PDF
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('edit');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Form
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save as PDF
                </button>
                <button
                  type="button"
                  disabled={isloadOriginal || Isload1}
                  onClick={(e) => handleoriginalcopy(e)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                >
                  {isloadOriginal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Original Copy PDF
                </button>
                <button
                  type="button"
                  disabled={isloadOriginal || Isload1}
                  onClick={(e) => handleofficecopy(e)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                >
                  {Isload1 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Duplicate Copy PDF
                </button>
              </div>
            </div>

            {/* Exactly matching downloaded PDF invoice layout */}
            <div
              id="billing-printable-document"
              className="border border-black max-w-4xl mx-auto flex flex-col bg-white text-black font-sans shadow-lg"
            >
              {/* Header Row */}
              <div className="flex justify-between items-center border-b border-black px-2 py-1 text-xs font-bold uppercase tracking-wider">
                <div className="w-1/3"></div>
                <div className="w-1/3 text-center text-blue-600 text-sm font-bold">
                  {isCash ? 'CASH INVOICE' : 'TAX INVOICE'}
                </div>
                <div className="w-1/3 text-right">ORIGINAL FOR RECIPIENT</div>
              </div>

              {/* Top Details Grid */}
              <div className="flex border-b border-black">
                {/* Company Info */}
                <div className="w-1/2 border-r border-black p-3 flex items-start gap-3">
                  <img src={companyLogo} alt="Logo" className="w-16 h-16 object-contain" />
                  <div className="text-[11px] leading-tight">
                    <h2 className="font-bold text-sm mb-0.5">BITNEXTRO SOLUTIONS PVT. LTD.</h2>
                    <p className="text-[10px] text-gray-600 font-medium mb-1">IT & Cybersecurity Company</p>
                    {!isCash && (
                      <p><strong>GSTIN: 19AAOCB2081P1ZO</strong></p>
                    )}
                    <p>5, Park Lane, Parkstreet, Kolkata, West Bengal, 700016</p>
                    <p>Mobile: +91 9330855877</p>
                    <p>Email: info@bitnextro.com</p>
                    <p>Website: www.bitnextro.com</p>
                  </div>
                </div>

                {/* Invoice Info & Dates */}
                <div className="w-1/2 flex flex-col">
                  <div className="flex border-b border-black h-1/2">
                    <div className="w-1/2 border-r border-black p-2 text-[11px]">
                      <p className="text-gray-600 mb-1">Invoice #:</p>
                      <p className="text-sm font-bold">{details.invoiceNumber || 'N/A'}</p>
                    </div>
                    <div className="w-1/2 p-2 text-[11px]">
                      <p className="text-gray-600 mb-1">Invoice Date:</p>
                      <p className="">{details.invoiceDate || new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                  <div className="flex h-1/2">
                    <div className="w-1/2 border-r border-black p-2 text-[11px]">
                      <p className="text-gray-600 mb-1">Place of Supply:</p>
                      <p className="uppercase font-semibold">{details.supplyPlace || 'WEST BENGAL'}</p>
                    </div>
                    <div className="w-1/2 p-2 text-[11px]">
                      <p className="text-gray-600 mb-1">Due Date:</p>
                      <p className="">{details.invoiceDate || new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details Row */}
              <div className="flex border-b border-black">
                <div className="w-1/2 border-r border-black p-2 text-[11px] leading-tight">
                  <p className="font-bold mb-1">CUSTOMER DETAILS:</p>
                  <p>Name: {details.user || 'N/A'}</p>
                  <p>Email: {details.email || 'N/A'}</p>
                  {!isCash && details.gstno && <p>GSTIN: {details.gstno}</p>}
                  <p className="font-bold mt-1">BILLING ADDRESS:</p>
                  <p className="whitespace-pre-line">{details.billingAddress || 'N/A'}</p>
                </div>
                <div className="w-1/2 p-2 text-[11px] leading-tight">
                  <p className="font-bold mb-1">SHIPPING ADDRESS</p>
                  <p className="whitespace-pre-line">{details.shippingAddress || 'N/A'}</p>
                </div>
              </div>

              {/* Products Table */}
              <table className="w-full border-b border-black border-collapse">
                <thead>
                  <tr className="border-b border-black text-[11px] font-bold">
                    <th className="border-r border-black p-1 w-8">#</th>
                    <th className="border-r border-black p-1 text-left w-64">Item</th>
                    <th className="border-r border-black p-1">HSN/SAC</th>
                    <th className="border-r border-black p-1 text-right">Rate/Item</th>
                    <th className="border-r border-black p-1">Qty</th>
                    <th className="border-r border-black p-1 text-right">Taxable Value</th>
                    <th className="border-r border-black p-1 text-right">Tax Amount</th>
                    <th className="p-1 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {productsWithCalc.map((p, index) => (
                    <tr key={p.id || index} className="border-b border-black text-xs text-center h-8">
                      <td className="border-r border-black p-1">{index + 1}</td>
                      <td className="border-r border-black p-1 text-left font-semibold whitespace-pre-line break-words">{p.name}</td>
                      <td className="border-r border-black p-1">{p.hsn || '-'}</td>
                      <td className="border-r border-black p-1 text-right">{p.effRate.toFixed(2)}</td>
                      <td className="border-r border-black p-1">{p.qty}</td>
                      <td className="border-r border-black p-1 text-right">{p.taxable.toFixed(2)}</td>
                      <td className="border-r border-black p-1 text-right">
                        {isGst ? (
                          <>
                            {p.taxVal.toFixed(2)}
                            <br /><span className="text-[10px]">(18%)</span>
                          </>
                        ) : isIGst ? (
                          <>
                            {p.taxVal.toFixed(2)}
                            <br /><span className="text-[10px]">(18%)</span>
                          </>
                        ) : '0.00'}
                      </td>
                      <td className="p-1 text-right font-medium">{p.finalItemTotal.toFixed(2)}</td>
                    </tr>
                  ))}

                  {/* Empty filler space to match the PDF height style */}
                  <tr className="h-32">
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td></td>
                  </tr>

                  {/* Totals Section */}
                  <tr className="border-t border-black text-xs">
                    <td colSpan={5} className="border-r border-black p-1 px-2 font-medium text-left">
                      Total Items / Qty : {products.length} / {products.reduce((acc, p) => acc + (parseInt(p.quantity, 10) || 0), 0)}
                    </td>
                    <td colSpan={2} className="border-r border-black p-1 font-bold text-right">
                      {isCash ? 'Sub Total' : 'Taxable Amount'}
                    </td>
                    <td className="p-1 font-bold text-right">₹{previewTaxable.toFixed(2)}</td>
                  </tr>

                  {isGst && (
                    <>
                      <tr className="border-t border-black text-xs">
                        <td colSpan={7} className="border-r border-black p-1 text-right">SGST 9.0%</td>
                        <td className="p-1 text-right">₹{(totalTaxAmount / 2).toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-black text-xs">
                        <td colSpan={7} className="border-r border-black p-1 text-right">CGST 9.0%</td>
                        <td className="p-1 text-right">₹{(totalTaxAmount / 2).toFixed(2)}</td>
                      </tr>
                    </>
                  )}

                  {isIGst && (
                    <tr className="border-t border-black text-xs">
                      <td colSpan={7} className="border-r border-black p-1 text-right">IGST 18%</td>
                      <td className="p-1 text-right">₹{totalTaxAmount.toFixed(2)}</td>
                    </tr>
                  )}

                  <tr className="border-t border-black font-bold text-sm bg-gray-100">
                    <td colSpan={7} className="border-r border-black p-1 text-right uppercase">Total</td>
                    <td className="p-1 text-right text-base">₹{previewGrandTotal.toFixed(2)}</td>
                  </tr>

                  {previewAdvanceAmount > 0 && (
                    <>
                      <tr className="border-t border-black text-xs font-semibold">
                        <td colSpan={7} className="border-r border-black p-1 text-right text-emerald-700">Advance Paid</td>
                        <td className="p-1 text-right font-bold text-emerald-700">₹{previewAdvanceAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-black text-xs font-bold bg-amber-50">
                        <td colSpan={7} className="border-r border-black p-1 text-right uppercase text-rose-700">Balance Due Amount</td>
                        <td className="p-1 text-right text-sm text-rose-700 font-extrabold">₹{previewBalanceDue.toFixed(2)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              {/* Footer Grid (Bank, QR, Sign) */}
              <div className="flex border-b border-black">
                <div className="w-1/3 border-r border-black p-2 text-[11px] leading-relaxed">
                  <p className="font-bold mb-1">Bank Details:</p>
                  <div className="flex"><span className="w-20">Bank:</span><strong>{bankDetails.bank}</strong></div>
                  <div className="flex"><span className="w-20">Account #:</span><strong>{bankDetails.acc}</strong></div>
                  <div className="flex"><span className="w-20">IFSC:</span><strong>{bankDetails.ifsc}</strong></div>
                  <div className="flex"><span className="w-20">Branch:</span><strong>{bankDetails.branch}</strong></div>
                </div>
                <div className="w-1/3 border-r border-black p-2 flex flex-col items-center justify-center">
                  <p className="text-[11px] w-full text-left font-bold mb-1">{previewBalanceDue > 0 ? 'Pay Due using UPI:' : 'Pay using UPI:'}</p>
                  <img src={qrUrl} alt="UPI QR" className="w-20 h-20 object-contain mix-blend-multiply" />
                </div>
                <div className="w-1/3 p-2 flex flex-col items-end justify-between text-[11px]">
                  <p className="font-bold text-gray-600">For BITNEXTRO SOLUTIONS PVT. LTD.</p>
                  <div className="flex items-center justify-end gap-2 mt-1 mb-0">
                    {details.isStampApplied !== false && (
                      <img src={authStamp} alt="Stamp" className="w-16 h-16 object-contain opacity-90" />
                    )}
                    <div className="w-24 h-16 flex items-end justify-center pb-1">
                      {authSignature ? (
                        <img src={authSignature} alt="Signature" className="max-h-14 max-w-full object-contain" />
                      ) : (
                        <div className="w-24 h-16"></div>
                      )}
                    </div>
                  </div>
                  <p className="font-medium text-gray-500 border-t border-gray-400 pt-1 w-24 text-center">Authorized Signatory</p>
                </div>
              </div>

              {/* Terms and Notes */}
              <div className="flex text-[10px] h-28">
                <div className="w-1/3 border-r border-black p-2">
                  <p className="font-bold mb-1">Notes:</p>
                  <p>Thank you for the Business</p>
                </div>
                <div className="p-2">
                  <p className="font-bold mb-1">Terms and Conditions:</p>
                  <ol className="list-decimal pl-4 leading-relaxed">
                    <li>All services will be provided as per the scope mentioned in this invoice.</li>
                    <li>Work delivery and credential handover will be completed after full payment.</li>
                    <li>No refunds will be applicable once services are activated.</li>
                    <li>Any additional requirements beyond the invoice scope will be charged separately.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Page End */}
            <div className="max-w-4xl mx-auto mt-2 text-[10px] flex justify-between text-gray-600 font-medium">
              <span>Page 1 / 1</span>
              <span>This is a digitally signed document.</span>
            </div>
          </div>
        );
      })()}

      {/* Saved Invoices Section */}
      <div className="no-print bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8 space-y-4 mb-10 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Saved Invoices
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                {savedInvoices.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click View to preview the official document, or Edit to load into the form for modification.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchInvoices}
            disabled={isLoadingInvoices}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInvoices ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {isLoadingInvoices && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs">Loading saved invoices...</p>
          </div>
        )}

        {invoiceListError && !isLoadingInvoices && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {invoiceListError}
          </div>
        )}

        {!isLoadingInvoices && !invoiceListError && savedInvoices.length === 0 && (
          <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p className="text-sm">No saved invoices found in the database.</p>
          </div>
        )}

        {!isLoadingInvoices && !invoiceListError && savedInvoices.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Invoice #</th>
                  <th className="px-4 py-3 whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 whitespace-nowrap">Customer</th>
                  <th className="px-4 py-3 whitespace-nowrap">Billing Address</th>
                  <th className="px-4 py-3 whitespace-nowrap">Shipping Address</th>
                  <th className="px-4 py-3 whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {savedInvoices.slice(0, 15).map(inv => (
                  <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{inv.invoiceDate || new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap max-w-[150px] truncate">{inv.customerName}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate" title={inv.billingAddress || '—'}>{inv.billingAddress || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate" title={inv.shippingAddress || '—'}>{inv.shippingAddress || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      <div>₹{inv.salesAmount?.toFixed(2)}</div>
                      {inv.advanceAmount > 0 ? (
                        <div className="text-[11px] font-normal text-slate-500">
                          <span className="text-emerald-700 font-medium">Adv: ₹{inv.advanceAmount?.toFixed(2)}</span>
                          {inv.balanceDue > 0 && (
                            <span className="text-rose-600 font-semibold ml-1.5">• Due: ₹{inv.balanceDue?.toFixed(2)}</span>
                          )}
                        </div>
                      ) : inv.paymentStatus ? (
                        <div className={`text-[10px] font-medium ${inv.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {inv.paymentStatus}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewInvoice(inv, 'preview')}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleViewInvoice(inv, 'edit')}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInvoice(inv._id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {savedInvoices.length > 15 && (
              <div className="p-3 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-200">
                Showing most recent 15 invoices. View all in the Sales tab.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    )}
      
    
        {/* Daily Expenses Workspace */}
        {activeTab === 'expenses' && <DailyExpensesWorkspace />}

        {/* Customer Workspace */}
    {activeTab === 'customer' && (
      <CustomerWorkspace onBack={() => setActiveTab('invoice')} />
    )}

    {/* Quotation Form */}
    {activeTab === 'quotation' && (
      <QuotationForm onBack={() => setActiveTab('invoice')} />
    )}

    {/* Proforma Invoice Workspace */}
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
