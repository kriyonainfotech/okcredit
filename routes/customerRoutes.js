const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const User = require("../models/user");
// const { validationResult } = require("express-validator"); // Optional: For request validation

// Create customer
router.post("/add-customer", async (req, res) => {
  const { name, mobile, address, userId } = req.body;

  // Basic validation (could be extended with express-validator)
  if (!userId) {
    return res.status(400).json({
      message: "🔴 Missing userId",
    });
  }

  if (!name || !mobile || !userId) {
    return res.status(400).json({
      message: "🔴 Missing required fields: name, mobile, or address",
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: `User with ID ${userId} not found`,
      });
    }

    const newCustomer = new Customer({ name, mobile, address, userId });
    await newCustomer.save();
    console.log("✅ New customer added:", newCustomer._id);
    res.status(201).json({
      success: true,
      message: "Customer created successfully 🎉",
      customer: newCustomer,
    });
  } catch (error) {
    console.error("❌ Error creating customer:", error.message);
    res
      .status(500)
      .json({ message: "⚠️ Error creating customer, please try again later" });
  }
});

// Get customer by ID
router.post("/getCustomerById", async (req, res) => {
  const customerId = req.body.customerId;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      console.log(`🔍 Customer with ID ${customerId} not found`);
      return res
        .status(404)
        .json({ message: `🔴 Customer not found with ID ${customerId}` });
    }

    console.log(`✅ Customer fetched with ID: ${customerId}`);
    res.json({
      success: true,
      message: "Customer details fetched successfully 📝",
      customer,
    });
  } catch (error) {
    console.error(
      `❌ Error fetching customer with ID ${customerId}:`,
      error.message
    );
    res.status(500).json({
      success: false,
      message: "⚠️ Error fetching customer, please try again later",
    });
  }
});

// Update customer info
router.put("/updatecustomer", async (req, res) => {
  const customerId = req.body.customerId;

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      req.body,
      { new: true }
    );
    if (!updatedCustomer) {
      console.log(`🔴 Customer with ID ${customerId} not found for update`);
      return res.status(404).json({
        success: false,
        message: `🔴 Customer not found with ID ${customerId}`,
      });
    }

    console.log(`✅ Customer updated with ID: ${customerId}`);
    res.json({
      success: true,
      message: "Customer updated successfully ✨",
      updatedCustomer,
    });
  } catch (error) {
    console.error(
      `❌ Error updating customer with ID ${customerId}:`,
      error.message
    );
    res
      .status(500)
      .json({
        success: false,
        message: "⚠️ Error updating customer, please try again later",
      });
  }
});

// Delete customer
router.delete("/deletecustomer", async (req, res) => {
  const customerId = req.body.customerId;

  try {
    const deletedCustomer = await Customer.findByIdAndDelete(customerId);
    if (!deletedCustomer) {
      console.log(`🔴 Customer with ID ${customerId} not found for deletion`);
      return res
        .status(404)
        .json({ message: `🔴 Customer not found with ID ${customerId}` });
    }

    console.log(`✅ Customer deleted with ID: ${customerId}`);
    res.json({
      success: true,
      message: "Customer deleted successfully 🗑️",
      customerId,
    });
  } catch (error) {
    console.error(
      `❌ Error deleting customer with ID ${customerId}:`,
      error.message
    );
    res
      .status(500)
      .json({
        success: false,
        message: "⚠️ Error deleting customer, please try again later",
      });
  }
});

// Get all customers by userId
router.post("/getAllCustomersByUserId", async (req, res) => {
  const userId = req.body.userId;

  try {
    const customers = await Customer.find({ userId });
    if (customers.length === 0) {
      console.log(`🔍 No customers found for user ID ${userId}`);
      return res.status(404).json({
        success: false,
        message: `🔴 No customers found for user ID ${userId}`,
      });
    }

    console.log(`✅ Customers fetched for user ID: ${userId}`);
    res.json({
      success: true,
      message: "Customers fetched successfully 📝",
      customers,
    });
  } catch (error) {
    console.error(
      `❌ Error fetching customers for user ID ${userId}:`,
      error.message
    );
    res.status(500).json({
      success: false,
      message: "⚠️ Error fetching customers, please try again later",
    });
  }
});

module.exports = router;
