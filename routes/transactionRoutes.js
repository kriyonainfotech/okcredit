const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Customer = require("../models/Customer");
const mongoose = require("mongoose")

// Add transaction with atomic session
router.post("/add-transaction", async (req, res) => {
  const { customerId, type, amount, description } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log(
      "💬 Request received to add transaction for customerId:",
      customerId
    );

    // Validation
    if (!customerId || !type || !amount) {
      console.log("❌ Missing required fields (customerId, type, amount).");
      return res.status(400).json({
        message: "⚠️ Missing required fields (customerId, type, amount).",
      });
    }

    // Find customer
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      console.log(`❌ Customer with ID ${customerId} not found.`);
      return res.status(404).json({ message: "❌ Customer not found" });
    }

    // Create transaction
    const newTransaction = new Transaction({
      userId: customer.userId,
      customerId,
      type,
      amount,
      description,
    });

    await newTransaction.save({ session });

    // Update balance
    if (type === "given") {
      // Owner gave money to client → client owes owner more
      if (customer.advanceAmount >= amount) {
        customer.advanceAmount -= amount;
      } else {
        const remaining = amount - customer.advanceAmount;
        customer.advanceAmount = 0;
        customer.dueAmount += remaining;
      }
    } else if (type === "received") {
      // Owner received money from client → reduces due first
      if (customer.dueAmount >= amount) {
        customer.dueAmount -= amount;
      } else {
        const remaining = amount - customer.dueAmount;
        customer.dueAmount = 0;
        customer.advanceAmount += remaining;
      }
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "⚠️ Invalid transaction type." });
    }

    // ✅ Recalculate netBalance here
    customer.netBalance = customer.advanceAmount - customer.dueAmount;
    await customer.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    console.log("✅ Transaction added & customer updated.");
    return res.status(201).json({
      success: true,
      message: "✅ Transaction added & customer updated.",
      newTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ Error in transaction:", error);
    return res.status(500).json({
      message:
        "🛠 Server error while adding transaction. Please try again later.",
    });
  }
});

// Get transactions for a customer
router.post("/transactionsByCustomerId", async (req, res) => {
  const { customerId } = req.body;

  try {
    console.log(
      "💬 Request received to fetch transactions for customerId:",
      customerId
    );

    // Check if customerId is provided
    if (!customerId) {
      console.log("❌ Missing customerId parameter.");
      return res
        .status(400)
        .json({ message: "⚠️ Missing customerId parameter." });
    }

    // Check if the customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      console.log(`❌ Customer with ID ${customerId} not found.`);
      return res.status(404).json({ message: "❌ Customer not found." });
    }

    // Fetch transactions for the existing customer
    const transactions = await Transaction.find({ customerId });
    if (!transactions.length) {
      console.log(`❌ No transactions found for customerId: ${customerId}`);
      return res
        .status(404)
        .json({ message: "❌ No transactions found for this customer." });
    }

    console.log(
      `✅ Found ${transactions.length} transaction(s) for customerId: ${customerId}`
    );
    return res.status(200).json({
      success: true,
      message: "✅ Transactions fetched successfully.",
      transactions,
      netBalance: customer.netBalance
    })
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    return res.status(500).json({
      message:
        "🛠 Server error while fetching transactions. Please try again later. 😕",
    });
  }
});

module.exports = router;
