import React, { useState, useEffect } from 'react';
import {   TrendingUp, DollarSign, Search, Edit2, CheckCircle, XCircle , Plus, Trash2 , ShoppingCart, FileText, X } from 'lucide-react';
import axios from 'axios';

const SalesWorkspace = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalProfit: 0,
    totalReceived: 0,
      totalOutstanding: 0,
      unpaidInvoiceCount: 0,
      partiallyPaidInvoiceCount: 0,
      paidInvoiceCount: 0,
    invoiceCount: 0
  });
  
const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7); // YYYY-MM
  });
  
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'year'
  const [currentYear, setCurrentYear] = useState(() => {
    return new Date().getFullYear().toString(); // YYYY
  });
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editPurchaseAmount, setEditPurchaseAmount] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editAmountReceived, setEditAmountReceived] = useState('');

  
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    id: null,
    entryType: 'sale',
    invoiceDate: new Date().toISOString().substring(0, 10),
    customerName: '',
    invoiceNumber: '',
    salesAmount: '',
    amountReceived: '',
    purchaseAmount: '',
    notes: ''
  });

  const handleOpenManualModal = (sale = null) => {
    if (sale) {
      setManualForm({
        id: sale._id,
        entryType: sale.entryType || 'sale',
        invoiceDate: sale.invoiceDate || new Date().toISOString().substring(0, 10),
        customerName: sale.customerName || '',
        invoiceNumber: sale.invoiceNumber.startsWith('MANUAL-') ? '' : sale.invoiceNumber,
        salesAmount: sale.salesAmount || '',
        amountReceived: sale.amountReceived || '',
        purchaseAmount: sale.purchaseAmount || '',
        notes: sale.notes || ''
      });
    } else {
      setManualForm({
        id: null,
        entryType: 'sale',
        invoiceDate: new Date().toISOString().substring(0, 10),
        customerName: '',
        invoiceNumber: '',
        salesAmount: '',
        amountReceived: '',
        purchaseAmount: '',
        notes: ''
      });
    }
    setIsManualModalOpen(true);
  };

  const handleSaveManualEntry = async (e) => {
    e.preventDefault();
    try {
      if (manualForm.id) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/manual-entry/${manualForm.id}`, manualForm);
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/manual-entry`, manualForm);
      }
      setIsManualModalOpen(false);
      
      // Auto-navigate to the month of the newly added entry
      const entryMonth = manualForm.invoiceDate.substring(0, 7);
      if (entryMonth !== currentMonth) {
        setCurrentMonth(entryMonth);
      } else {
        fetchSummary();
        fetchSales();
      }
    } catch (error) {
      console.error('Error saving manual entry:', error);
      alert(error.response?.data?.error || 'Failed to save manual entry.');
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry? This action cannot be undone.")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/delete/${id}`);
      fetchSummary();
      fetchSales();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry.');
    }
  };

  const renderBadge = (sale) => {
    if (sale.entryType === 'purchase') {
      return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap">Manual Purchase</span>;
    }
    if (sale.source === 'manual') {
      return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap">Manual Sale</span>;
    }
    return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap">Billing</span>;
  };

  const fetchSummary = async () => {
    try {
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/monthly-summary?month=${currentMonth}`;
      if (viewMode === 'year') {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/yearly-summary?year=${currentYear}`;
      }
      const res = await axios.get(url);
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/all?${viewMode === 'year' ? 'year=' + currentYear : 'month=' + currentMonth}&status=${statusFilter}&type=${typeFilter}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const res = await axios.get(url);
      setSales(res.data.sales || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchSales();
  }, [currentMonth, currentYear, viewMode, statusFilter, searchTerm, typeFilter]);

  const handleUpdatePurchase = async (id) => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/update-purchase/${id}`, {
        purchaseAmount: Number(editPurchaseAmount)
      });
      setEditingId(null);
      fetchSummary();
      fetchSales();
    } catch (error) {
      console.error('Error updating purchase:', error);
    }
  };

  
  const handleUpdatePayment = async (id) => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/update-payment/${id}`, {
        amountReceived: Number(editAmountReceived)
      });
      setEditingPaymentId(null);
      fetchSummary();
      fetchSales();
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };


  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    // If it's already DD/MM/YYYY, return as is
    if (dateString.includes('/')) return dateString;
    // If it's YYYY-MM-DD, convert to DD/MM/YYYY
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateString;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
            Sales & Profit
          </h1>
          <p className="text-slate-500 mt-1">Track monthly sales, purchase costs, and calculated profits.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenManualModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Manual Entry
          </button>

          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 shadow-sm ml-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'month' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'year' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Yearly
            </button>
          </div>

          <label className="text-sm font-medium text-slate-700 ml-2">{viewMode === 'month' ? 'Month:' : 'Year:'}</label>
          {viewMode === 'month' ? (
              <input 
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            ) : (
              <input 
                type="number"
                min="2000"
                max="2100"
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
                className="rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-24"
              />
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-slate-900">₹{summary.totalSales.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Purchases</p>
          <p className="text-2xl font-bold text-red-600">₹{summary.totalPurchases.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Profit</p>
          <p className="text-2xl font-bold text-green-600">₹{summary.totalProfit.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Received</p>
          <p className="text-2xl font-bold text-emerald-600">₹{(summary.totalReceived || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-orange-600">₹{(summary.totalOutstanding || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>
      <div className="flex gap-4 text-sm font-medium text-slate-600 mb-4 px-1 mt-2">
        <span>Paid Invoices: <span className="text-emerald-600">{summary.paidInvoiceCount || 0}</span></span>
        <span>Partially Paid: <span className="text-indigo-600">{summary.partiallyPaidInvoiceCount || 0}</span></span>
        <span>Unpaid: <span className="text-orange-600">{summary.unpaidInvoiceCount || 0}</span></span>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        
        {/* Entry Type Toggle */}
        <div className="flex bg-slate-100/80 p-1 rounded-lg">
          {[{label: 'Both', value: 'All'}, {label: 'Sales', value: 'Sales'}, {label: 'Purchases', value: 'Purchases'}].map((t) => (
            <button
              key={t.value}
              onClick={() => { setTypeFilter(t.value); if(t.value === 'Purchases') setStatusFilter('All'); }}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${typeFilter === t.value ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className={`flex gap-2 w-full sm:w-auto ${typeFilter === 'Purchases' ? 'opacity-50 pointer-events-none' : ''}`}>
          {['All', 'Unpaid', 'Partially Paid', 'Paid'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Invoice Number</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Customer / Supplier</th>
                <th className="px-6 py-4 font-semibold text-right">Sales Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Purchase Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Profit</th>
                <th className="px-6 py-4 font-semibold text-right">Amount Received</th>
                <th className="px-6 py-4 font-semibold text-right">Balance Due</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-slate-500">Loading sales records...</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-slate-500">No records found for this period.</td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex flex-col gap-1">
                        <span>{sale.invoiceNumber.startsWith('MANUAL-') ? 'N/A' : sale.invoiceNumber}</span>
                        {renderBadge(sale)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDateForDisplay(sale.invoiceDate)}</td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">{sale.customerName}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">₹{sale.salesAmount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right">
                      {editingId === sale._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            value={editPurchaseAmount}
                            onChange={(e) => setEditPurchaseAmount(e.target.value)}
                            className="w-24 text-right p-1 text-sm border rounded"
                            autoFocus
                          />
                          <button onClick={() => handleUpdatePurchase(sale._id)} className="text-green-600 hover:text-green-700">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-600">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 text-slate-600">
                          ₹{sale.purchaseAmount.toLocaleString('en-IN')}
                          <button
                            onClick={() => {
                              setEditingId(sale._id);
                              setEditPurchaseAmount(sale.purchaseAmount);
                            }}
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-right font-medium text-green-600">₹{sale.profit.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right">
                      {sale.entryType === 'purchase' ? '-' : editingPaymentId === sale._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            value={editAmountReceived}
                            onChange={(e) => setEditAmountReceived(e.target.value)}
                            className="w-24 text-right p-1 text-sm border rounded"
                            autoFocus
                          />
                          <button onClick={() => handleUpdatePayment(sale._id)} className="text-green-600 hover:text-green-700">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditingPaymentId(null)} className="text-red-500 hover:text-red-600">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 text-slate-600">
                          ₹{(sale.amountReceived || 0).toLocaleString('en-IN')}
                          <button
                            onClick={() => {
                              setEditingPaymentId(sale._id);
                              setEditAmountReceived(sale.amountReceived || 0);
                            }}
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 font-medium">₹{(sale.balanceDue || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-center">
                      {sale.entryType === 'purchase' ? '-' : <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          sale.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sale.paymentStatus === 'Partially Paid'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >{sale.paymentStatus}</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteEntry(sale._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      
      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {manualForm.id ? 'Edit Entry' : 'New Manual Entry'}
                </h3>
              </div>
              <button onClick={() => setIsManualModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="overflow-y-auto custom-scrollbar">
              <form id="manualEntryForm" onSubmit={handleSaveManualEntry} className="p-6">
                
                {/* Segmented Control */}
                <div className="flex bg-slate-100/80 p-1.5 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setManualForm({ ...manualForm, entryType: 'sale' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${manualForm.entryType === 'sale' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                  >
                    <TrendingUp className="h-4 w-4" /> Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualForm({ ...manualForm, entryType: 'purchase' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${manualForm.entryType === 'purchase' ? 'bg-white text-orange-700 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                  >
                    <ShoppingCart className="h-4 w-4" /> Purchase
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={manualForm.invoiceDate}
                        onChange={(e) => setManualForm({ ...manualForm, invoiceDate: e.target.value })}
                        className="w-full rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium text-slate-900 transition-all px-4 py-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">
                        Invoice Number
                      </label>
                      <input
                        type="text"
                        placeholder="Optional (e.g. INV-100)"
                        value={manualForm.invoiceNumber}
                        onChange={(e) => setManualForm({ ...manualForm, invoiceNumber: e.target.value })}
                        className="w-full rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium text-slate-900 transition-all px-4 py-2.5 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">
                      {manualForm.entryType === 'purchase' ? 'Supplier Name' : 'Customer Name'}
                    </label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={manualForm.customerName}
                      onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium text-slate-900 transition-all px-4 py-2.5 placeholder:font-normal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    {manualForm.entryType === 'sale' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">
                            Sales Amount (₹) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={manualForm.salesAmount}
                            onChange={(e) => setManualForm({ ...manualForm, salesAmount: e.target.value })}
                            className="w-full rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium text-slate-900 transition-all px-4 py-2.5"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">
                            Amount Received (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            max={manualForm.salesAmount || ""}
                            value={manualForm.amountReceived}
                            onChange={(e) => setManualForm({ ...manualForm, amountReceived: e.target.value })}
                            className="w-full rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium text-slate-900 transition-all px-4 py-2.5"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2">
                        <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">
                          Purchase Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={manualForm.purchaseAmount}
                          onChange={(e) => setManualForm({ ...manualForm, purchaseAmount: e.target.value })}
                          className="w-full rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-sm font-medium text-slate-900 transition-all px-4 py-2.5"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-1.5">
                      Notes
                    </label>
                    <textarea
                      rows="2"
                      value={manualForm.notes}
                      onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium text-slate-900 transition-all px-4 py-3 placeholder:font-normal"
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 flex justify-end gap-3 bg-slate-50/80 border-t border-slate-100 mt-auto">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="manualEntryForm"
                className={`px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all rounded-xl ${manualForm.entryType === 'purchase' ? 'bg-orange-600 hover:bg-orange-700 hover:shadow-orange-500/20' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20'}`}
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalesWorkspace;

