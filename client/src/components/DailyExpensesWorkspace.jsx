import React, { useState, useEffect } from "react";
import { Wallet, Trash2, Edit2, RefreshCw, X } from "lucide-react";
import secureLocalStorage from "react-secure-storage";

export default function DailyExpensesWorkspace() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    spender: ''
  });

  const fetchExpenses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v12/expenses/all`);
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) {
        setExpenses(data.data);
      } else {
        setError(data.msg || "Could not retrieve expenses.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to reach backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      spender: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const token = secureLocalStorage.getItem("auth-token") || "";
      const url = editingId 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/v12/expenses/update/${editingId}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/v12/expenses/add`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "auth-token": token },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.status) {
        handleClear();
        fetchExpenses();
        alert(data.msg || "Expense saved successfully!");
      } else {
        alert(data.msg || "Failed to save expense.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving expense.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setFormData({
      date: expense.date,
      amount: expense.amount,
      description: expense.description,
      spender: expense.spender
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const token = secureLocalStorage.getItem("auth-token") || "";
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v12/expenses/delete/${id}`, {
        method: "DELETE",
        headers: { "auth-token": token }
      });
      const data = await res.json();
      if (data.status) {
        setExpenses(prev => prev.filter(exp => exp._id !== id));
      } else {
        alert(data.msg || "Failed to delete expense.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting expense.");
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-indigo-600" />
            Daily Expenses
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage your company's daily expenses and who made them.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          {editingId ? "Edit Expense" : "Add New Expense"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Amount (₹) *</label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                className="w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Spender (Who?) *</label>
              <input
                type="text"
                name="spender"
                required
                placeholder="e.g. John Doe"
                value={formData.spender}
                onChange={handleChange}
                className="w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
              <input
                type="text"
                name="description"
                required
                placeholder="e.g. Office Supplies"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {editingId && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 transition-colors"
            >
              {submitLoading ? "Saving..." : (editingId ? "Update Expense" : "Save Expense")}
            </button>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Expense History
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                {expenses.length}
              </span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">Total Expenses: <span className="font-bold text-indigo-700">₹{totalAmount.toFixed(2)}</span></p>
          </div>
          <button
            onClick={fetchExpenses}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-rose-600 bg-rose-50 rounded-lg border border-rose-100">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-3 px-3 rounded-tl-lg">Date</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Spender</th>
                <th className="py-3 px-3">Amount (₹)</th>
                <th className="py-3 px-3 rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">Loading expenses...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">No expenses recorded yet.</td>
                </tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {new Date(exp.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-3 text-slate-800">{exp.description}</td>
                    <td className="py-3 px-3 text-slate-600">{exp.spender}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">₹{exp.amount?.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(exp)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exp._id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
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
}
