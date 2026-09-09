import mongoose from "mongoose";

const proformaItemSchema = new mongoose.Schema({
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

const proformaInvoiceSchema = new mongoose.Schema({
  proformaNumber: {
    type: String,
    required: true,
    trim: true,
  },
  invoiceDate: {
    type: String,
    default: "",
    trim: true,
  },
  customerName: {
    type: String,
    required: true,
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
  billingAddress: {
    type: String,
    default: "",
    trim: true,
  },
  shippingAddress: {
    type: String,
    default: "",
    trim: true,
  },
  placeOfSupply: {
    type: String,
    default: "",
    trim: true,
  },
  items: {
    type: [proformaItemSchema],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: "Pro Forma Invoice must contain at least one item",
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
  totalTax: {
    type: Number,
    required: true,
    default: 0,
  },
  grandTotal: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

const ProformaInvoice = mongoose.model("ProformaInvoice", proformaInvoiceSchema, "proformainvoices");
export default ProformaInvoice;
