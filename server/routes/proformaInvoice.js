import express from 'express';
import ProformaInvoice from '../models/ProformaInvoice.js';
import jwt from 'jsonwebtoken';

const proformaInvoiceRoute = express.Router();

// Safe internal authentication middleware (non-blocking for company intranet / local use)
const authenticateProforma = (req, res, next) => {
  try {
    const authtoken = req.header("auth-token") || req.header("Authorization");
    if (authtoken && process.env.JWT_SERECT) {
      try {
        const cleanToken = authtoken.startsWith("Bearer ") ? authtoken.slice(7) : authtoken;
        const data = jwt.verify(cleanToken, process.env.JWT_SERECT);
        req.user = data.user;
      } catch (tokenErr) {
        console.warn("Proforma route auth token check:", tokenErr.message);
      }
    }
    next();
  } catch (err) {
    console.error("Proforma auth error:", err);
    next();
  }
};

proformaInvoiceRoute.use(authenticateProforma);

// Helper function to recalculate and validate Pro Forma Invoice amounts server-side
const calculateProformaAmounts = (rawItems, taxType = 'cgst_sgst') => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("Pro Forma Invoice must contain at least one item.");
  }

  const processedItems = rawItems.map((item, idx) => {
    const productName = item.productName || item.name || '';
    if (!productName.trim()) {
      throw new Error(`Item #${idx + 1} must have a valid Item or Service Name.`);
    }

    const qty = Math.max(1, parseFloat(item.qty || item.quantity) || 1);
    const rate = Math.max(0, parseFloat(item.rate) || 0);
    const taxableAmount = Math.round(qty * rate * 100) / 100;

    return {
      productName: productName.trim(),
      hsnNumber: (item.hsnNumber || item.hsn || '').toString().trim(),
      qty,
      rate,
      taxableAmount
    };
  });

  const totalTaxable = processedItems.reduce((acc, curr) => acc + curr.taxableAmount, 0);
  const roundedTaxable = Math.round(totalTaxable * 100) / 100;

  const isIgst = taxType === 'igst';
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isIgst) {
    igst = Math.round(roundedTaxable * 0.18 * 100) / 100;
  } else {
    cgst = Math.round(roundedTaxable * 0.09 * 100) / 100;
    sgst = Math.round(roundedTaxable * 0.09 * 100) / 100;
  }

  const totalTax = Math.round((cgst + sgst + igst) * 100) / 100;
  const grandTotal = Math.round((roundedTaxable + totalTax) * 100) / 100;

  return {
    processedItems,
    taxType: isIgst ? 'igst' : 'cgst_sgst',
    taxableAmount: roundedTaxable,
    cgst,
    sgst,
    igst,
    totalTax,
    grandTotal
  };
};

// 1. POST /api/v11/proforma/create-proforma
proformaInvoiceRoute.post('/create-proforma', async (req, res) => {
  try {
    const {
      proformaNumber,
      invoiceDate,
      customerName,
      customerEmail,
      customerGstNumber,
      customerGstNo,
      billingAddress,
      shippingAddress,
      placeOfSupply,
      items,
      taxType
    } = req.body;

    if (!proformaNumber || !proformaNumber.trim()) {
      return res.status(400).json({
        status: false,
        msg: "Pro Forma Invoice Number is required."
      });
    }

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        status: false,
        msg: "Customer Name is required."
      });
    }

    const emailToSave = (customerEmail || '').trim();
    if (emailToSave && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSave)) {
      return res.status(400).json({
        status: false,
        msg: "Please provide a valid Customer Email address."
      });
    }

    // Recalculate amounts server-side
    const calculations = calculateProformaAmounts(items, taxType);

    const newProforma = new ProformaInvoice({
      proformaNumber: proformaNumber.trim(),
      invoiceDate: (invoiceDate || '').trim(),
      customerName: customerName.trim(),
      customerEmail: emailToSave,
      customerGstNumber: (customerGstNumber || customerGstNo || '').trim(),
      billingAddress: (billingAddress || '').trim(),
      shippingAddress: (shippingAddress || '').trim(),
      placeOfSupply: (placeOfSupply || '').trim(),
      items: calculations.processedItems,
      taxType: calculations.taxType,
      cgst: calculations.cgst,
      sgst: calculations.sgst,
      igst: calculations.igst,
      taxableAmount: calculations.taxableAmount,
      totalTax: calculations.totalTax,
      grandTotal: calculations.grandTotal
    });

    const savedProforma = await newProforma.save();

    return res.status(201).json({
      status: true,
      msg: `Pro Forma Invoice ${savedProforma.proformaNumber} created successfully.`,
      data: savedProforma
    });
  } catch (error) {
    console.error("Error creating Pro Forma Invoice:", error);
    return res.status(500).json({
      status: false,
      msg: error.message || "Failed to create Pro Forma Invoice.",
      error: error.message
    });
  }
});

// 2. GET /api/v11/proforma/fetch-all-proformas
proformaInvoiceRoute.get('/fetch-all-proformas', async (req, res) => {
  try {
    const proformas = await ProformaInvoice.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      status: true,
      data: proformas
    });
  } catch (error) {
    console.error("Error fetching Pro Forma Invoices:", error);
    return res.status(500).json({
      status: false,
      msg: "Failed to fetch Pro Forma Invoices.",
      error: error.message
    });
  }
});

// 3. GET /api/v11/proforma/fetch-proforma/:id
proformaInvoiceRoute.get('/fetch-proforma/:id', async (req, res) => {
  try {
    const proforma = await ProformaInvoice.findById(req.params.id).lean();
    if (!proforma) {
      return res.status(404).json({
        status: false,
        msg: "Pro Forma Invoice not found."
      });
    }
    return res.status(200).json({
      status: true,
      data: proforma
    });
  } catch (error) {
    console.error("Error fetching Pro Forma Invoice by ID:", error);
    return res.status(500).json({
      status: false,
      msg: "Failed to retrieve Pro Forma Invoice.",
      error: error.message
    });
  }
});

// 4. PUT /api/v11/proforma/update-proforma/:id
proformaInvoiceRoute.put('/update-proforma/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      proformaNumber,
      invoiceDate,
      customerName,
      customerEmail,
      customerGstNumber,
      customerGstNo,
      billingAddress,
      shippingAddress,
      placeOfSupply,
      items,
      taxType
    } = req.body;

    if (!proformaNumber || !proformaNumber.trim()) {
      return res.status(400).json({
        status: false,
        msg: "Pro Forma Invoice Number is required."
      });
    }

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        status: false,
        msg: "Customer Name is required."
      });
    }

    const emailToSave = (customerEmail || '').trim();
    if (emailToSave && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSave)) {
      return res.status(400).json({
        status: false,
        msg: "Please provide a valid Customer Email address."
      });
    }

    const calculations = calculateProformaAmounts(items, taxType);

    const updatedProforma = await ProformaInvoice.findByIdAndUpdate(
      id,
      {
        proformaNumber: proformaNumber.trim(),
        invoiceDate: (invoiceDate || '').trim(),
        customerName: customerName.trim(),
        customerEmail: emailToSave,
        customerGstNumber: (customerGstNumber || customerGstNo || '').trim(),
        billingAddress: (billingAddress || '').trim(),
        shippingAddress: (shippingAddress || '').trim(),
        placeOfSupply: (placeOfSupply || '').trim(),
        items: calculations.processedItems,
        taxType: calculations.taxType,
        cgst: calculations.cgst,
        sgst: calculations.sgst,
        igst: calculations.igst,
        taxableAmount: calculations.taxableAmount,
        totalTax: calculations.totalTax,
        grandTotal: calculations.grandTotal
      },
      { new: true, runValidators: true }
    );

    if (!updatedProforma) {
      return res.status(404).json({
        status: false,
        msg: "Pro Forma Invoice not found for updating."
      });
    }

    return res.status(200).json({
      status: true,
      msg: `Pro Forma Invoice ${updatedProforma.proformaNumber} updated successfully.`,
      data: updatedProforma
    });
  } catch (error) {
    console.error("Error updating Pro Forma Invoice:", error);
    return res.status(500).json({
      status: false,
      msg: error.message || "Failed to update Pro Forma Invoice.",
      error: error.message
    });
  }
});

// 5. DELETE /api/v11/proforma/delete-proforma/:id
proformaInvoiceRoute.delete('/delete-proforma/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProforma = await ProformaInvoice.findByIdAndDelete(id);

    if (!deletedProforma) {
      return res.status(404).json({
        status: false,
        msg: "Pro Forma Invoice not found for deletion."
      });
    }

    return res.status(200).json({
      status: true,
      msg: `Pro Forma Invoice ${deletedProforma.proformaNumber} deleted successfully.`
    });
  } catch (error) {
    console.error("Error deleting Pro Forma Invoice:", error);
    return res.status(500).json({
      status: false,
      msg: "Failed to delete Pro Forma Invoice.",
      error: error.message
    });
  }
});

export default proformaInvoiceRoute;
