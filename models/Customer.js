const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    address: { type: String },
    dueAmount: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    netBalance: { type: Number, default: 0 }, // NEW FIELD
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
