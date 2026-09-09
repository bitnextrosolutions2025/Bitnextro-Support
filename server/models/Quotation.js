import mongoose from "mongoose";

const quotationItemSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  hsnNumber: {
    type: String,
    default: "",
    trim: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  taxableAmount: {
    type: Number,
    required: true,
    default: 0,
  },
}, { _id: false });

const quotationSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    trim: true,
  },
  invoiceDate: {
    type: String,
    default: "",
    trim: true,
  },
  validUntil: {
    type: String,
    default: "",
    trim: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerAddress: {
    type: String,
    default: "",
    trim: true,
  },
  customerEmail: {
    type: String,
    default: "",
    trim: true,
  },
  customerGstNumber: {
    type: String,
    default: "",
    trim: true,
  },
  items: {
    type: [quotationItemSchema],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: "Quotation must contain at least one item",
    },
  },
  taxType: {
    type: String,
    enum: ["cgst_sgst", "igst"],
    default: "cgst_sgst",
  },
  cgst: {
    type: Number,
    default: 0,
  },
  sgst: {
    type: Number,
    default: 0,
  },
  igst: {
    type: Number,
    default: 0,
  },
  taxableAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  gst: {
    type: Number,
    required: true,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

const Quotation = mongoose.model("Quotation", quotationSchema);
export default Quotation;
