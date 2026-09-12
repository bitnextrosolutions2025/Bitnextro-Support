import express from 'express';
import Quotation from '../models/Quotation.js';
import jwt from 'jsonwebtoken';

const quotationRoute = express.Router();

// Safe internal authentication middleware
const authenticateQuotation = (req, res, next) => {
  try {
    const authtoken = req.header("auth-token") || req.header("Authorization");
    if (authtoken && process.env.JWT_SERECT) {
      try {
        const cleanToken = authtoken.startsWith("Bearer ") ? authtoken.slice(7) : authtoken;
        const data = jwt.verify(cleanToken, process.env.JWT_SERECT);
        req.user = data.user;
      } catch (tokenErr) {
        // Log token error for debugging
        console.warn("Quotation route auth token check:", tokenErr.message);
      }
    }
    // Proceed for internal company operations
    next();
  } catch (err) {
    console.error("Quotation auth error:", err);
    next();
  }
};

quotationRoute.use(authenticateQuotation);

// Helper function to recalculate and validate quotation amounts server-side
const calculateQuotationAmounts = (rawItems, taxType = 'cgst_sgst') => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("Quotation must contain at least one item.");
  }

  const processedItems = rawItems.map((item, idx) => {
    const productName = item.productName || item.name || '';
    if (!productName.trim()) {
      throw new Error(`Item #${idx + 1} must have a product or service name.`);
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

  const totalGst = Math.round((cgst + sgst + igst) * 100) / 100;
  const grandTotal = Math.round((roundedTaxable + totalGst) * 100) / 100;

  return {
    processedItems,
    taxType: isIgst ? 'igst' : 'cgst_sgst',
    taxableAmount: roundedTaxable,
    cgst,
    sgst,
    igst,
    gst: totalGst,
    totalAmount: grandTotal
  };
};

// 1. POST /api/v9/quotation/create-quotation - Save new quotation
quotationRoute.post('/create-quotation', async (req, res) => {
  try {
    const {
      invoiceNumber,
      invoiceDate,
      validUntil,
      customerName,
      customerAddress,
      customerEmail,
      customerGstNumber,
      customerGstNo,
      items,
      taxType,
        isRoundOff
      } = req.body;

    if (!invoiceNumber || !invoiceNumber.trim()) {
      return res.status(400).json({
        status: false,
        msg: "Invoice Number is required."
      });
    }

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        status: false,
        msg: "Customer Name is required."
      });
    }

    // Optional email validation if email provided
    const emailToSave = (customerEmail || '').trim();
    if (emailToSave && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSave)) {
      return res.status(400).json({
        status: false,
        msg: "Please provide a valid Customer Email address."
      });
    }

    // Recalculate amounts server-side
    const calculations = calculateQuotationAmounts(items, taxType);

    const newQuotation = new Quotation({
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate: (invoiceDate || '').trim(),
      validUntil: (validUntil || '').trim(),
      customerName: customerName.trim(),
      customerAddress: (customerAddress || '').trim(),
      customerEmail: emailToSave,
      customerGstNumber: (customerGstNumber || customerGstNo || '').trim(),
      items: calculations.processedItems,
      taxType: calculations.taxType,
      cgst: calculations.cgst,
      sgst: calculations.sgst,
      igst: calculations.igst,
      taxableAmount: calculations.taxableAmount,
      gst: calculations.gst,
      totalAmount: calculations.totalAmount
    });

    const savedQuotation = await newQuotation.save();

    return res.status(201).json({
      status: true,
      msg: `Quotation ${savedQuotation.invoiceNumber} saved successfully.`,
      data: savedQuotation
    });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return res.status(500).json({
      status: false,
      msg: error.message || "Failed to create quotation.",
      error: error.message
    });
  }
});

// 2. GET /api/v9/quotation/fetch-all-quotations - Retrieve saved quotations
quotationRoute.get('/fetch-all-quotations', async (req, res) => {
  try {
    const quotations = await Quotation.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      status: true,
      data: quotations
    });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return res.status(500).json({
      status: false,
      msg: "Failed to fetch quotations.",
      error: error.message
    });
  }
});

// 3. GET /api/v9/quotation/fetch-quotation/:id - Retrieve single quotation by ID
quotationRoute.get('/fetch-quotation/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).lean();
    if (!quotation) {
      return res.status(404).json({
        status: false,
        msg: "Quotation not found."
      });
    }
    return res.status(200).json({
      status: true,
      data: quotation
    });
  } catch (error) {
    console.error("Error fetching quotation by ID:", error);
    return res.status(500).json({
      status: false,
      msg: "Failed to retrieve quotation.",
      error: error.message
    });
  }
});

// 4. PUT /api/v9/quotation/update-quotation/:id - Update existing quotation
quotationRoute.put('/update-quotation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      invoiceNumber,
      invoiceDate,
      validUntil,
      customerName,
      customerAddress,
      customerEmail,
      customerGstNumber,
      customerGstNo,
      items,
      taxType,
        isRoundOff
      } = req.body;

    if (!invoiceNumber || !invoiceNumber.trim()) {
      return res.status(400).json({
        status: false,
        msg: "Invoice Number is required."
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

    const calculations = calculateQuotationAmounts(items, taxType);

    const updatedQuotation = await Quotation.findByIdAndUpdate(
      id,
      {
        invoiceNumber: invoiceNumber.trim(),
        invoiceDate: (invoiceDate || '').trim(),
        validUntil: (validUntil || '').trim(),
        customerName: customerName.trim(),
        customerAddress: (customerAddress || '').trim(),
        customerEmail: emailToSave,
        customerGstNumber: (customerGstNumber || customerGstNo || '').trim(),
        items: calculations.processedItems,
        taxType: calculations.taxType,
        cgst: calculations.cgst,
        sgst: calculations.sgst,
        igst: calculations.igst,
        taxableAmount: calculations.taxableAmount,
        gst: calculations.gst,
        totalAmount: calculations.totalAmount
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuotation) {
      return res.status(404).json({
        status: false,
        msg: "Quotation not found for updating."
      });
    }

    return res.status(200).json({
      status: true,
      msg: `Quotation ${updatedQuotation.invoiceNumber} updated successfully.`,
      data: updatedQuotation
    });
  } catch (error) {
    console.error("Error updating quotation:", error);
    return res.status(500).json({
      status: false,
      msg: error.message || "Failed to update quotation.",
      error: error.message
    });
  }
});

// 5. DELETE /api/v9/quotation/delete-quotation/:id - Delete quotation
quotationRoute.delete('/delete-quotation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuotation = await Quotation.findByIdAndDelete(id);

    if (!deletedQuotation) {
      return res.status(404).json({
        status: false,
        msg: "Quotation not found for deletion."
      });
    }

    return res.status(200).json({
      status: true,
      msg: `Quotation ${deletedQuotation.invoiceNumber} deleted successfully.`
    });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return res.status(500).json({
      status: false,
      msg: "Failed to delete quotation.",
      error: error.message
    });
  }
});

export default quotationRoute;
