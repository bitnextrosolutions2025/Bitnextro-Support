import express from "express"
import Lead from "../models/Lead.js";
import fetchuer from "../middleware/fetchuser.js";

const LeadRoute = express.Router()

LeadRoute.post("/addlead", async (req, res) => {
    try {
        const { companyName, contactPerson, location, phone, email, status, followUpDate, followUpTime } = req.body;
        const newlaed = new Lead({
            Company_Name: companyName,
            Contact_Person: contactPerson,
            Location: location,
            Phone_Number: phone,
            email: email,
            status: status,
            followUpDate: followUpDate,
            followUpTime: followUpTime
        });
        await newlaed.save();
        return res.status(200).json({ "msg": "New lead added.", status: true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Server Error", status: false })
    }

})

LeadRoute.get("/fetch-all-lead", async (req, res) => {
    try {
        const alllead= await Lead.find({});
        return res.status(200).json({data:alllead,status:true})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Server Error", status: false })
    }
})

export default LeadRoute;