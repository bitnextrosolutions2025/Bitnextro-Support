import mongoose from "mongoose";
const leadSchema = new mongoose.Schema({
    Company_Name : {
        type: String,
        required: true,
    },
    Contact_Person: {
        type: String,
        required: true,
    },
    Location: {
        type: String,
        required: true,
    },
    Phone_Number: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    status:{
        type:String,
        require:true
    },
    followUpDate:{
        type:String,
    },
    followUpTime:{
        type:String,
    },
    IsclientOrLead:{
        type:String,
    }

}, { timestamps: true })
const Lead = mongoose.model("Lead", leadSchema);
export default Lead;