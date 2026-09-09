import mongoose from "mongoose";

const billingCustomerSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  gstNumber: {
    type: String,
    default: "",
    trim: true,
  },
  emailId: {
    type: String,
    default: "",
    trim: true,
  },
  location: {
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
}, { timestamps: true });

const BillingCustomer = mongoose.model("BillingCustomer", billingCustomerSchema, "billingcustomers");
export default BillingCustomer;
