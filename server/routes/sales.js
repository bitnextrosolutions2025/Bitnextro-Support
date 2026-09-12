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
            profit
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
    let totalPaidAmount = 0;
    let totalUnpaidAmount = 0;
    
    sales.forEach(sale => {
      totalSales += sale.salesAmount;
      totalPurchases += sale.purchaseAmount;
      const profit = sale.salesAmount - sale.purchaseAmount;
      totalProfit += profit;
      
      if (sale.paymentStatus === 'Paid') {
        totalPaidAmount += sale.salesAmount;
      } else {
        totalUnpaidAmount += sale.salesAmount;
      }
    });
    
    res.status(200).json({
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalPurchases: parseFloat(totalPurchases.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalPaidAmount: parseFloat(totalPaidAmount.toFixed(2)),
      totalUnpaidAmount: parseFloat(totalUnpaidAmount.toFixed(2)),
      invoiceCount: sales.length
    });
  } catch (error) {
    console.error("Error fetching monthly summary:", error);
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

export default router;
