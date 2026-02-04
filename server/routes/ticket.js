import express from "express";
const ticketRouter = express.Router();
ticketRouter.post("/gen-ticket",async(req,res)=>{
    const {firstName,lastName,phone,priority,subject,department,description,email}=req.body;
    
})
