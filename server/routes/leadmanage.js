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
        const alllead = await Lead.find({});
        return res.status(200).json({ data: alllead, status: true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Server Error", status: false })
    }
})
LeadRoute.delete("/deletelead/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedLead = await Lead.findByIdAndDelete(id);

        if (!deletedLead) {
            return res.status(404).json({ error: "Lead not found", status: false });
        }

        return res.status(200).json({ msg: "Lead deleted successfully", status: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server Error", status: false });
    }
});

LeadRoute.put("/editlead/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            companyName,
            contactPerson,
            location,
            phone,
            email,
            status,
            followUpDate,
            followUpTime
        } = req.body;
        console.log(status);
        const updateFields = {};
        if (companyName !== undefined) updateFields.Company_Name = companyName;
        if (contactPerson !== undefined) updateFields.Contact_Person = contactPerson;
        if (location !== undefined) updateFields.Location = location;
        if (phone !== undefined) updateFields.Phone_Number = phone;
        if (email !== undefined) updateFields.email = email;
        if (status !== undefined) updateFields.status = status;
        if (status == "interested" || status == "not-interested") {
            updateFields.followUpDate = "";
            updateFields.followUpTime = "";
        } else {
            if (followUpDate !== undefined) updateFields.followUpDate = followUpDate;
            if (followUpTime !== undefined) updateFields.followUpTime = followUpTime;
        }


        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: "No update data provided", status: false });
        }

        const updatedLead = await Lead.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

        if (!updatedLead) {
            return res.status(404).json({ error: "Lead not found", status: false });
        }

        return res.status(200).json({ msg: "Lead updated successfully", status: true, data: updatedLead });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server Error", status: false });
    }
});

export default LeadRoute;