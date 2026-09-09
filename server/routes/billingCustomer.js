import express from 'express';
import BillingCustomer from '../models/BillingCustomer.js';
import jwt from 'jsonwebtoken';

const billingCustomerRoute = express.Router();

// Helper to escape regex special characters safely
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper to format normalized customer with compatibility aliases
const formatCustomerData = (customer) => {
  if (!customer) return null;
  const billingAddr = customer.billingAddress || customer.location || '';
  const shippingAddr = customer.shippingAddress || customer.billingAddress || customer.location || '';
  const location = customer.location || customer.billingAddress || '';

  return {
    _id: customer._id,
    customerName: customer.customerName,
    gstNumber: customer.gstNumber || '',
    emailId: customer.emailId || '',
    location,
    billingAddress: billingAddr,
    shippingAddress: shippingAddr,
    placeOfSupply: customer.placeOfSupply || '',
    // Legacy compatibility aliases
    customerEmail: customer.emailId || '',
    customerGstNo: customer.gstNumber || '',
    customerShpAddress: shippingAddr,
    customerPlaceofSupply: customer.placeOfSupply || '',
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt
  };
};

// Safe internal authentication middleware
const authenticateCustomer = (req, res, next) => {
  try {
    const authtoken = req.header("auth-token") || req.header("Authorization");
    if (authtoken && process.env.JWT_SERECT) {
      try {
        const cleanToken = authtoken.startsWith("Bearer ") ? authtoken.slice(7) : authtoken;
        const data = jwt.verify(cleanToken, process.env.JWT_SERECT);
        req.user = data.user;
      } catch (tokenErr) {
        console.warn("Customer route auth token check:", tokenErr.message);
      }
    }
    next();
  } catch (err) {
    console.error("Customer auth error:", err);
    next();
  }
};

billingCustomerRoute.use(authenticateCustomer);

// 1. POST /api/v10/customer/add-customer - Add new customer
billingCustomerRoute.post('/add-customer', async (req, res) => {
  try {
    const {
      customerName,
      gstNumber,
      emailId,
      location,
      billingAddress,
      shippingAddress,
      placeOfSupply
    } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        status: false,
        msg: "Customer Name is required."
      });
    }

    const emailToSave = (emailId || '').trim();
    if (emailToSave && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSave)) {
      return res.status(400).json({
        status: false,
        msg: "Please enter a valid Email ID."
      });
    }

    const newCustomer = new BillingCustomer({
      customerName: customerName.trim(),
      gstNumber: (gstNumber || '').trim(),
      emailId: emailToSave,
      location: (location || billingAddress || '').trim(),
      billingAddress: (billingAddress || location || '').trim(),
      shippingAddress: (shippingAddress || billingAddress || location || '').trim(),
      placeOfSupply: (placeOfSupply || '').trim()
    });

    const savedCustomer = await newCustomer.save();

    return res.status(201).json({
      status: true,
      msg: `Customer "${savedCustomer.customerName}" added successfully.`,
      data: formatCustomerData(savedCustomer)
    });
  } catch (error) {
    console.error("Error adding customer:", error);
    return res.status(500).json({
      status: false,
      msg: error.message || "Failed to add customer.",
      error: error.message
    });
  }
});

// 2. GET /api/v10/customer/fetch-all-customers - Retrieve all saved customers
billingCustomerRoute.get('/fetch-all-customers', async (req, res) => {
  try {
    const customers = await BillingCustomer.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      status: true,
      data: customers.map(formatCustomerData)
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({
      status: false,
      msg: "Failed to retrieve customers.",
      error: error.message
    });
  }
});

// 3. POST /api/v10/customer/find-customer - Find customer by exact/case-insensitive name
billingCustomerRoute.post('/find-customer', async (req, res) => {
  try {
    const { customerName } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        status: false,
        msg: "Customer Name is required."
      });
    }

    const trimmed = customerName.trim();
    // Case-insensitive exact match
    const customer = await BillingCustomer.findOne({
      customerName: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') }
    }).lean();

    if (!customer) {
      return res.status(404).json({
        status: false,
        msg: "Customer not found. Please add the customer from the Customer tab."
      });
    }

    return res.status(200).json({
      status: true,
      data: formatCustomerData(customer)
    });
  } catch (error) {
    console.error("Error finding customer:", error);
    return res.status(500).json({
      status: false,
      msg: "Failed to find customer.",
      error: error.message
    });
  }
});

// 4. GET /api/v10/customer/search-customers?query= - Search customers by substring
billingCustomerRoute.get('/search-customers', async (req, res) => {
  try {
    const query = (req.query.query || '').trim();
    let filter = {};
    if (query) {
      filter = { customerName: { $regex: new RegExp(escapeRegex(query), 'i') } };
    }

    const customers = await BillingCustomer.find(filter)
      .sort({ customerName: 1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      status: true,
      data: customers.map(formatCustomerData)
    });
  } catch (error) {
    console.error("Error searching customers:", error);
    return res.status(500).json({
      status: false,
      msg: "Failed to search customers.",
      error: error.message
    });
  }
});

// 5. PUT /api/v10/customer/update-customer/:id - Update existing customer
billingCustomerRoute.put('/update-customer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      gstNumber,
      emailId,
      location,
      billingAddress,
      shippingAddress,
      placeOfSupply
    } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        status: false,
        msg: "Customer Name is required."
      });
    }

    const emailToSave = (emailId || '').trim();
    if (emailToSave && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSave)) {
      return res.status(400).json({
        status: false,
        msg: "Please enter a valid Email ID."
      });
    }

    const updatedCustomer = await BillingCustomer.findByIdAndUpdate(
      id,
      {
        customerName: customerName.trim(),
        gstNumber: (gstNumber || '').trim(),
        emailId: emailToSave,
        location: (location || billingAddress || '').trim(),
        billingAddress: (billingAddress || location || '').trim(),
        shippingAddress: (shippingAddress || billingAddress || location || '').trim(),
        placeOfSupply: (placeOfSupply || '').trim()
      },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({
        status: false,
        msg: "Customer not found for updating."
      });
    }

    return res.status(200).json({
      status: true,
      msg: `Customer "${updatedCustomer.customerName}" updated successfully.`,
      data: formatCustomerData(updatedCustomer)
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.status(500).json({
      status: false,
      msg: error.message || "Failed to update customer.",
      error: error.message
    });
  }
});

// 6. DELETE /api/v10/customer/delete-customer/:id - Delete customer
billingCustomerRoute.delete('/delete-customer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCustomer = await BillingCustomer.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return res.status(404).json({
        status: false,
        msg: "Customer record not found for deletion."
      });
    }

    return res.status(200).json({
      status: true,
      msg: `Customer "${deletedCustomer.customerName}" deleted successfully.`
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return res.status(500).json({
      status: false,
      msg: "Failed to delete customer.",
      error: error.message
    });
  }
});

export default billingCustomerRoute;
