import React, { useEffect,useState } from 'react'
import { handleError, handleSuccess } from './ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Plus, Trash2, FileText, Settings2, Receipt } from 'lucide-react';
export default function Adminbilling() {
        const { user } = useAuth();
        const [Isload,setIsload]=useState(false)
    const naviget=useNavigate();
  useEffect(() => {
    const getoken = async () => {
      console.log("Helloo")
      try {
        if (user.email === "bitnextrosolutions@gmail.com") {
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
  }, [user]);
  // State for general invoice details
  const [details, setDetails] = useState({
    invoiceNumber: '',
    supplyPlace: '',
    email:"",
    user:"",
    shippingAddress: '',
    isGstApplied: true,
    isStampApplied: true,
    isPaymentdone:true
  });

  // State for dynamic products list
  const [products, setProducts] = useState([
    { id: Date.now(), name: '', hsn: '', rate: '', quantity: 1 }
  ]);

  // Handlers for general details
  const handleDetailChange = (e) => {
    const { name, value, type, checked } = e.target;
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

  // Submit Handler
  const handleSubmit = async(e) => {
    e.preventDefault();
    setIsload(true);
    // This is the structured payload ready to be sent to your MERN backend
    const payload = {
      ...details,
      products: products.map(({ id, ...rest }) => rest), // Remove internal UI id
      totalAmount: products.reduce((sum, p) => sum + (Number(p.rate) * Number(p.quantity) || 0), 0)
    };

    // console.log("Data ready for backend:", payload);
    // alert("Invoice data logged to console! Ready to send to backend.");
const url = `${import.meta.env.VITE_BACKEND_URL}/api/v3/bill/billing-work`;

try {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        // FIX: Send the payload directly instead of wrapping it in an 'alldata' object
        // This matches 'const alldata = req.body;' in your backend
        body: JSON.stringify(payload) 
    });

    if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
    }

    // 1. Convert the response to a Blob (Binary Data) instead of JSON
    const blob = await response.blob();

    // 2. Create a temporary local URL for this file
    const pdfUrl = window.URL.createObjectURL(blob);

    // ---------------------------------------------------------
    // OPTION A: Open the PDF in a new browser tab to view it
    // ---------------------------------------------------------
    window.open(pdfUrl, '_blank');

    // ---------------------------------------------------------
    // OPTION B: Automatically download the PDF to the user's PC
    // ---------------------------------------------------------
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', `${payload.invoiceNumber || 'Invoice'}.pdf`); // Sets the file name
    document.body.appendChild(link);
    link.click(); // Simulates a click to start the download
    
    // 3. Clean up the DOM and memory
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(pdfUrl);
    setIsload(false)

} catch (error) {
  setIsload(false)
    console.error("Error generating PDF:", error);
    alert("Failed to generate invoice. Please check the console.");
}
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="h-6 w-6 text-indigo-600" />
              Create New Invoice
            </h1>
            <p className="text-sm text-slate-500 mt-1">Fill in the details below to generate a production-ready billing PDF.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: General Details */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6 border-b pb-4">
              <FileText className="h-5 w-5 text-slate-400" />
              Invoice Details
            </h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Invoice Number</label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="invoiceNumber"
                    required
                    placeholder="e.g. INV-2026-001"
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
                <label className="block text-sm font-medium leading-6 text-slate-900">Customar Name</label>
                <div className="mt-2">
                  <input
                    name="user"
                    required
                    placeholder="Enter Customar name"
                    value={details.user}
                    onChange={handleDetailChange}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Customar email</label>
                <div className="mt-2">
                  <input
                    name="email"
                    required
                    placeholder="Enter email"
                    value={details.email}
                    onChange={handleDetailChange}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Shipping Address</label>
                <div className="mt-2">
                  <textarea
                    name="shippingAddress"
                    rows={3}
                    required
                    placeholder="Enter complete customer address..."
                    value={details.shippingAddress}
                    onChange={handleDetailChange}
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Line Items (Products) */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6 border-b pb-4">
              <Receipt className="h-5 w-5 text-slate-400" />
              Line Items
            </h2>

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
                <div key={product.id} className="relative flex flex-col sm:grid sm:grid-cols-12 gap-4 items-start sm:items-center bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-slate-200">
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
                  <div className="col-span-1 w-full flex justify-end sm:justify-center mt-2 sm:mt-0">
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

            <div className="mt-6">
              <button
                type="button"
                onClick={addProduct}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Another Item
              </button>
            </div>
          </div>

          {/* Section 3: Configuration & Settings */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6 border-b pb-4">
              <Settings2 className="h-5 w-5 text-slate-400" />
              Document Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* GST Toggle */}
              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900">Apply GST</p>
                  <p className="text-xs text-slate-500 mt-1">Calculate IGST/CGST/SGST on PDF</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="isGstApplied"
                    className="sr-only peer" 
                    checked={details.isGstApplied}
                    onChange={handleDetailChange}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>

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
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              {Isload?<div className='w-4 h-4 border-2 border-white rounded-sm animate-spin'></div>:"Generate Billing PDF"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}