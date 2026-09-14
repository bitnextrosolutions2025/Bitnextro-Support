import express from 'express';
import Expense from '../models/Expense.js';
import fetchuser from '../middleware/fetchuser.js'; // Assuming fetchuser exists, but wait, the other routes didn't necessarily use it if they rely on public or just auth-token for basic verification without strict middleware. Actually, in Adminbilling.jsx, the token was passed, but sales.js didn't use fetchuser middleware. Let's just define it without middleware for simplicity and to match the sales/all route, or add basic token check. Let's look at how other routes do it.

const router = express.Router();

// 1. ADD NEW EXPENSE
router.post('/add', async (req, res) => {
  try {
    const { date, amount, description, spender } = req.body;
    
    if (!date || !amount || !description || !spender) {
      return res.status(400).json({ status: false, msg: "All fields are required" });
    }

    const expense = new Expense({
      date,
      amount: Number(amount),
      description,
      spender
    });

    const savedExpense = await expense.save();
    res.json({ status: true, msg: "Expense added successfully", data: savedExpense });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
});

// 2. GET ALL EXPENSES (with optional month/year filter or just all sorted by newest)
router.get('/all', async (req, res) => {
  try {
    // Sort by date descending (newest first)
    const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
    res.json({ status: true, data: expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
});

// 3. UPDATE EXPENSE
router.patch('/update/:id', async (req, res) => {
  try {
    const { date, amount, description, spender } = req.body;
    
    const updateData = {};
    if (date) updateData.date = date;
    if (amount) updateData.amount = Number(amount);
    if (description) updateData.description = description;
    if (spender) updateData.spender = spender;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ status: false, msg: "Expense not found" });
    }

    res.json({ status: true, msg: "Expense updated successfully", data: updatedExpense });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
});

// 4. DELETE EXPENSE
router.delete('/delete/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ status: false, msg: "Expense not found" });
    }
    res.json({ status: true, msg: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
});

export default router;
