import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Search, Edit2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const SalesWorkspace = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalProfit: 0,
    totalPaidAmount: 0,
    totalUnpaidAmount: 0,
    invoiceCount: 0
  });
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7); // YYYY-MM
  });
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editPurchaseAmount, setEditPurchaseAmount] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/monthly-summary?month=${currentMonth}`);
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/all?month=${currentMonth}&status=${statusFilter}`;
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
  }, [currentMonth, statusFilter, searchTerm]);

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

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/v12/sales/toggle-status/${id}`);
      fetchSummary();
      fetchSales();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
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
          <label className="text-sm font-medium text-slate-700">Month:</label>
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
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
          <p className="text-sm font-medium text-slate-500 mb-1">Paid Amount</p>
          <p className="text-2xl font-bold text-emerald-600">₹{summary.totalPaidAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500 mb-1">Unpaid Amount</p>
          <p className="text-2xl font-bold text-orange-600">₹{summary.totalUnpaidAmount.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
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
        <div className="flex gap-2 w-full sm:w-auto">
          {['All', 'Paid', 'Unpaid'].map((status) => (
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
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold text-right">Sales Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Purchase Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Profit</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">Loading sales records...</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">No records found for this period.</td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{sale.invoiceNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{sale.invoiceDate}</td>
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
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(sale._id)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          sale.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                        }`}
                      >
                        {sale.paymentStatus}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* Placeholder for future actions like delete or view */}
                      <span className="text-slate-300 text-xs">-</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesWorkspace;

