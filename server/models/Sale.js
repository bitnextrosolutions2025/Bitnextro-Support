import mongoose from 'mongoose';

const SaleSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  invoiceType: { type: String, enum: ["tax", "cash"], default: "tax" },
  invoiceDate: { type: String, required: true, index: true },
  yearMonth: { type: String, required: true, index: true },
  customerName: { type: String, default: "", index: true },
  customerEmail: { type: String, default: "" },
  customerGstNumber: { type: String, default: "" },
  items: [{
    productName: String,
    hsnNumber: String,
    qty: Number,
    rate: Number,
    taxableAmount: Number
  }],
  salesAmount: { type: Number, required: true, default: 0 },
  purchaseAmount: { type: Number, required: true, default: 0 },
  profit: { type: Number, default: 0 },
  amountReceived: { type: Number, default: 0, min: 0 },
  balanceDue: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ["Unpaid", "Partially Paid", "Paid", "N/A"], default: "Unpaid" },
  entryType: { type: String, enum: ["sale", "purchase"], default: "sale" },
  source: { type: String, enum: ["billing_auto", "manual"], default: "billing_auto" },
  notes: { type: String, default: "" }
}, {
  timestamps: true,
  collection: 'sales'
});

// Pre-save middleware to calculate profit
SaleSchema.pre('save', function() {
  if (this.isModified('salesAmount') || this.isModified('purchaseAmount')) {
    this.profit = parseFloat((this.salesAmount - this.purchaseAmount).toFixed(2));
  }
});

export default mongoose.model('Sale', SaleSchema);


