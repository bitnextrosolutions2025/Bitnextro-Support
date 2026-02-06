import { timeStamp } from "console";
import mongoose from "mongoose";
import { types } from "util";

const ticktSchema = new mongoose.Schema({
    t_uid:{
        type:String,
        required:true,
        unique:true
    },
    c_name_f:{
        type:String,
        required:true,
    },
    c_name_l:{
        type:String,
        required:true,
    },
    c_email:{
        type:String,
        required:true,
    },
    c_phone:{
        type:Number,
        required:true,
    },
    c_department:{
        type:String,
        required:true
    },
    t_priority:{
        type:String,
        required:true
        
    },
    t_subject:{
        type:String,
        required:true
    },
    t_disc:{
        type:String,
        required:true

    },
    t_status:{
         type:String,
    }


},{timestamps:true})
const Ticket = mongoose.model("Ticket", ticktSchema);
export default Ticket;