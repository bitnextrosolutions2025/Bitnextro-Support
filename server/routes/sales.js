import express from 'express';
import Sale from '../models/Sale.js';

const router = express.Router();

// POST /record-sale
router.post('/record-sale', async (req, res) => {
  try {
    const {
      invoiceNumber,
      invoiceType,
      invoiceDate,
      customerName,
      customerEmail,
      customerGstNumber,
      items,
      salesAmount
    } = req.body;

    if (!invoiceNumber || !invoiceDate || !customerName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let yearMonth = "";
    if (invoiceDate.includes('/')) {
      const parts = invoiceDate.split('/');
      if (parts.length === 3) {
        yearMonth = `${parts[2]}-${parts[1]}`;
      } else {
        yearMonth = invoiceDate.substring(0, 7);
      }
    } else if (invoiceDate.includes('-')) {
      const parts = invoiceDate.split('-');
      if (parts[0].length === 4) { 
        yearMonth = `${parts[0]}-${parts[1]}`;
      } else if (parts[2].length === 4) { 
        yearMonth = `${parts[2]}-${parts[1]}`;
      } else {
        yearMonth = invoiceDate.substring(0, 7);
      }
    } else {
      yearMonth = new Date().toISOString().substring(0, 7);
    }

    const existingSale = await Sale.findOne({ invoiceNumber });

    if (existingSale) {
      const profit = parseFloat((salesAmount - existingSale.purchaseAmount).toFixed(2));
      
      const updatedSale = await Sale.findOneAndUpdate(
        { invoiceNumber },
        {
          $set: {
            invoiceType: invoiceType || "tax",
            invoiceDate,
            yearMonth,
            customerName,
            customerEmail: customerEmail || "",
            customerGstNumber: customerGstNumber || "",
            items: items || [],
            salesAmount: salesAmount || 0,
            profit,
            // Payment tracking logic
            balanceDue: Math.max(0, (salesAmount || 0) - (existingSale.amountReceived || 0)),
            paymentStatus: (existingSale.amountReceived || 0) === 0 ? "Unpaid" : (existingSale.amountReceived || 0) >= (salesAmount || 0) ? "Paid" : "Partially Paid"
          }
        },
        { new: true }
      );
      return res.status(200).json({ message: "Sale updated successfully", sale: updatedSale });
    } else {
      const purchaseAmount = 0;
      const profit = parseFloat((salesAmount - purchaseAmount).toFixed(2));
      
      const newSale = new Sale({
        invoiceNumber,
        invoiceType: invoiceType || "tax",
        invoiceDate,
        yearMonth,
        customerName,
        customerEmail: customerEmail || "",
        customerGstNumber: customerGstNumber || "",
        items: items || [],
        salesAmount: salesAmount || 0,
        purchaseAmount,
        profit,
        amountReceived: 0,
        balanceDue: salesAmount || 0,
        paymentStatus: "Unpaid",
        source: "billing_auto",
        notes: ""
      });
      
      await newSale.save();
      return res.status(201).json({ message: "Sale created successfully", sale: newSale });
    }
  } catch (error) {
    console.error("Error recording sale:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /all
router.get('/all', async (req, res) => {
  try {
    const { month, status, search, page = 1, limit = 50 } = req.query;
    
    let query = {};
    
    if (month) {
      query.yearMonth = month;
    }
    
    
    const type = req.query.type || 'All';
    
    if (type === 'Sales') {
      query.entryType = { $ne: 'purchase' };
    } else if (type === 'Purchases') {
      query.entryType = 'purchase';
    } else {
      if (status && status !== 'All') {
        query.entryType = { $ne: 'purchase' };
      }
    }

    if (status && status !== 'All') {
      query.paymentStatus = status;
    }
    
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Sale.countDocuments(query);
    
    res.status(200).json({
      sales,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /monthly-summary
router.get('/monthly-summary', async (req, res) => {
  try {
    const { month } = req.query;
    
    let query = {};
    if (month) {
      query.yearMonth = month;
    }
    
    const sales = await Sale.find(query);
    
    let totalSales = 0;
    let totalPurchases = 0;
    let totalProfit = 0;
    let totalReceived = 0;
    let totalOutstanding = 0;
    let unpaidInvoiceCount = 0;
    let partiallyPaidInvoiceCount = 0;
    let paidInvoiceCount = 0;
    
    sales.forEach(sale => {
      totalSales += sale.salesAmount;
      totalPurchases += sale.purchaseAmount;
      const profit = sale.salesAmount - sale.purchaseAmount;
      totalProfit += profit;
      
      totalReceived += (sale.amountReceived || 0);
      totalOutstanding += (sale.balanceDue || 0);
      
      if (sale.entryType !== 'purchase') {
        if (sale.paymentStatus === 'Paid') {
          paidInvoiceCount++;
        } else if (sale.paymentStatus === 'Partially Paid') {
          partiallyPaidInvoiceCount++;
        } else {
          unpaidInvoiceCount++;
        }
      }
    });
    
    res.status(200).json({
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalPurchases: parseFloat(totalPurchases.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalReceived: parseFloat(totalReceived.toFixed(2)),
      totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
      unpaidInvoiceCount,
      partiallyPaidInvoiceCount,
      paidInvoiceCount,
      invoiceCount: sales.length
    });
  } catch (error) {
    console.error("Error fetching monthly summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// PATCH /update-payment/:id
router.patch('/update-payment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let { amountReceived } = req.body;
    
    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    
    if (amountReceived === undefined || amountReceived === null || isNaN(amountReceived) || amountReceived < 0) {
       return res.status(400).json({ error: "Invalid amountReceived" });
    }
    
    amountReceived = parseFloat(parseFloat(amountReceived).toFixed(2));
    if (amountReceived > sale.salesAmount) {
      amountReceived = sale.salesAmount;
    }
    
    sale.amountReceived = amountReceived;
    sale.balanceDue = parseFloat(Math.max(0, sale.salesAmount - amountReceived).toFixed(2));
    
    if (amountReceived === 0) {
      sale.paymentStatus = "Unpaid";
    } else if (amountReceived >= sale.salesAmount) {
      sale.paymentStatus = "N/A";
    } else {
      sale.paymentStatus = "Partially Paid";
    }
    
    await sale.save();
    
    res.status(200).json({ message: "Payment updated successfully", sale });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /update-purchase/:id
router.patch('/update-purchase/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { purchaseAmount, notes } = req.body;
    
    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    
    if (purchaseAmount !== undefined) {
      sale.purchaseAmount = parseFloat(purchaseAmount);
      sale.profit = parseFloat((sale.salesAmount - sale.purchaseAmount).toFixed(2));
    }
    
    if (notes !== undefined) {
      sale.notes = notes;
    }
    
    await sale.save();
    
    res.status(200).json({ message: "Purchase updated successfully", sale });
  } catch (error) {
    console.error("Error updating purchase:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /toggle-status/:id
router.patch('/toggle-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    
    sale.paymentStatus = sale.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    await sale.save();
    
    res.status(200).json({ message: "Status toggled successfully", sale });
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedSale = await Sale.findByIdAndDelete(id);
    if (!deletedSale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    
    res.status(200).json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// POST /manual-entry
router.post('/manual-entry', async (req, res) => {
  try {
    const { entryType, invoiceDate, customerName, salesAmount, amountReceived, purchaseAmount, notes } = req.body;
    let { invoiceNumber } = req.body;

    if (!invoiceDate) {
      return res.status(400).json({ error: "Date is required" });
    }

    if (!invoiceNumber || !invoiceNumber.trim()) {
      invoiceNumber = `MANUAL-${Date.now()}`;
    }

    if (entryType === 'purchase' && (purchaseAmount === undefined || purchaseAmount === null || purchaseAmount === '')) {
      return res.status(400).json({ error: "Purchase Amount is required" });
    }
    if (entryType === 'sale' && (salesAmount === undefined || salesAmount === null || salesAmount === '')) {
      return res.status(400).json({ error: "Sales Amount is required" });
    }
    let yearMonth = invoiceDate.substring(0, 7);
    
    let saleData = {
      invoiceNumber,
      invoiceType: "tax",
      invoiceDate,
      yearMonth,
      customerName,
      customerEmail: "",
      customerGstNumber: "",
      items: [],
      source: "manual",
      notes: notes || "",
      entryType
    };

    if (entryType === "purchase") {
      const pAmount = parseFloat(purchaseAmount) || 0;
      saleData.salesAmount = 0;
      saleData.purchaseAmount = pAmount;
      saleData.profit = -pAmount;
      saleData.amountReceived = 0;
      saleData.balanceDue = 0;
      saleData.paymentStatus = "N/A";
    } else {
      const sAmount = parseFloat(salesAmount) || 0;
      const rAmount = parseFloat(amountReceived) || 0;
      
      saleData.salesAmount = sAmount;
      saleData.purchaseAmount = 0;
      saleData.profit = sAmount;
      saleData.amountReceived = rAmount;
      saleData.balanceDue = Math.max(0, sAmount - rAmount);
      
      if (rAmount === 0) saleData.paymentStatus = "Unpaid";
      else if (rAmount >= sAmount) saleData.paymentStatus = "Paid";
      else saleData.paymentStatus = "Partially Paid";
    }

    const newSale = new Sale(saleData);
    await newSale.save();
    
    res.status(201).json({ message: "Manual entry created successfully", sale: newSale });
  } catch (error) {
    console.error("Error creating manual entry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /manual-entry/:id
router.put('/manual-entry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { entryType, invoiceDate, customerName, salesAmount, amountReceived, purchaseAmount, notes } = req.body;
    let { invoiceNumber } = req.body;

    const sale = await Sale.findById(id);
    if (!sale || sale.source !== "manual") {
      return res.status(404).json({ error: "Manual entry not found or restricted" });
    }

    if (!invoiceDate) {
      return res.status(400).json({ error: "Date is required" });
    }

    if (!invoiceNumber || !invoiceNumber.trim()) {
      invoiceNumber = sale.invoiceNumber.startsWith('MANUAL-') ? sale.invoiceNumber : `MANUAL-${Date.now()}`;
    }

    sale.invoiceNumber = invoiceNumber;
    sale.invoiceDate = invoiceDate;
    sale.yearMonth = invoiceDate.substring(0, 7);
    sale.customerName = customerName;
    sale.notes = notes || "";

    // We do not allow changing entryType of an existing record for safety, but if requested we can.
    // Assuming entryType is fixed or we can change it:
    sale.entryType = entryType;

    if (entryType === "purchase") {
      const pAmount = parseFloat(purchaseAmount) || 0;
      sale.salesAmount = 0;
      sale.purchaseAmount = pAmount;
      sale.profit = -pAmount;
      sale.amountReceived = 0;
      sale.balanceDue = 0;
      sale.paymentStatus = "N/A";
    } else {
      const sAmount = parseFloat(salesAmount) || 0;
      const rAmount = parseFloat(amountReceived) || 0;
      sale.salesAmount = sAmount;
      sale.purchaseAmount = 0;
      sale.profit = sAmount;
      sale.amountReceived = rAmount;
      sale.balanceDue = Math.max(0, sAmount - rAmount);
      if (rAmount === 0) sale.paymentStatus = "Unpaid";
      else if (rAmount >= sAmount) sale.paymentStatus = "N/A";
      else sale.paymentStatus = "Partially Paid";
    }

    await sale.save();
    res.status(200).json({ message: "Manual entry updated successfully", sale });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "An entry with this Invoice Number already exists." });
    }
    console.error("Error updating manual entry:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// DELETE /manual-entry/:id
router.delete('/manual-entry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id);
    if (!sale || sale.source !== "manual") {
      return res.status(403).json({ error: "Only manual records can be deleted via this endpoint" });
    }
    await Sale.findByIdAndDelete(id);
    res.status(200).json({ message: "Manual entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting manual entry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
