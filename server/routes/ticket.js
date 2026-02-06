import express from "express";
import crypto from "crypto"
import Ticket from "../models/Ticket.js";
import sendeticketmail from "../middleware/ticktmail.js";
const ticketRouter = express.Router();
ticketRouter.post("/gen-ticket", async (req, res) => {
    try {
        const { firstName, lastName, phone, priority, subject, department, description, email } = req.body;
        function generateReadableTicket(length = 8) {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ1234567890';
            let ticket = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = crypto.randomInt(0, chars.length);
                ticket += chars[randomIndex];
            }

            return ticket;
        }
        const ticket =generateReadableTicket(7);
        const newTickt = new Ticket({
            t_uid: ticket ,
            c_name_f: firstName,
            c_name_l: lastName,
            c_email: email,
            c_phone: phone,
            c_department: department,
            t_priority: priority,
            t_subject: subject,
            t_disc: description,
            t_status:"Tickt is forword to Admin panel."
        })
        newTickt.save();
     return res.status(200).json({"status":true,"message":"Ticket is done","Ticket_No":ticket})
    } catch (error) {
         console.log(error)
        return res.status(505).json({"status":false, "error": "Internal server error" })
    }

});
ticketRouter.post("/sendemail", async (req, res) => {
    try {
        const { email, ticketNO,username} = req.body;
        const send = await sendeticketmail(email,ticketNO,username)
        console.log("✅ Email Response:", send);

        return res.status(200).json({ "message": "send was mail", "status": true })

    } catch (error) {
        console.log(error)
        return res.status(505).json({ "error": "Internal server error" })
    }
});
ticketRouter.post("/findtikctstatus",async(req,res)=>{
    try {
        const {ticket}=req.body;
        const findticket=await Ticket.findOne({t_uid:ticket})
        if(!findticket){
            return res.status(404).json({"status":false})
        }
        return res.status(200).json({"status":true,"ticketdata":findticket});
        
    } catch (error) {
        console.log(error)
        return res.status(505).json({ "error": "Internal server error" })
    }
})
export default ticketRouter;