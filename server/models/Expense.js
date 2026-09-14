import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  date: { type: String, required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  spender: { type: String, required: true, index: true }
}, {
  timestamps: true,
  collection: 'expenses'
});

export default mongoose.model('Expense', ExpenseSchema);
