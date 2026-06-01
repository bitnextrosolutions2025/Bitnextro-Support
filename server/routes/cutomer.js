import express from 'express'
import Customer from '../models/Customer.js';

const custometRoute = express.Router();

custometRoute.post('/save-customer-data', async (req, res) => {
    try {
        const { customerName, customerEmail, customerGstNo, customerShpAddress , customerPlaceofSupply} = req.body;

        if (!customerName || !customerName.trim()) {
            return res.status(400).json({
                msg: 'Customer name is required',
                status: false
            });
        }

        const isFristCustomer = await Customer.findOne({
            customerName: customerName.trim()
        }).lean();
        if (isFristCustomer) {
            return res.status(400).json({ error: 'Cutomer name is already exist', status: false })
        }
        const newCustomer = new Customer({
            customerName,
            customerEmail,
            customerGstNo,
            customerShpAddress,
            customerPlaceofSupply
        });
        newCustomer.save();
        return res.status(200).json({ msg: 'Register done', status: true })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message,
            status: false
        });
    }

})

custometRoute.post('/find-customer-data', async (req, res) => {
    try {
        const { customerName } = req.body;

        if (!customerName || !customerName.trim()) {
            return res.status(400).json({
                msg: 'Customer name is required',
                status: false
            });
        }

        // Find customer (lean() improves performance)
        const customer = await Customer.findOne({
            customerName: customerName.trim()
        }).lean();

        if (!customer) {
            return res.status(404).json({
                msg: 'Customer not found',
                status: false
            });
        }

        return res.status(200).json({
            data: customer,
            status: true
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            msg: 'Internal Server Error',
            error: error.message,
            status: false
        });
    }
});

export default custometRoute;