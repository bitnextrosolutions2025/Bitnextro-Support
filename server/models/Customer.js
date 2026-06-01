import mongoose from "mongoose";
const CustomerShem = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
        trim:true,
        unique:true
    },
    customerEmail: {
        type: String,
    },
    customerGstNo: {
        type: String,
    },
    customerShpAddress:{
        type:String
    }
}, { timestamps: true })
const Customer = mongoose.model("Customer", CustomerShem);
export default Customer;