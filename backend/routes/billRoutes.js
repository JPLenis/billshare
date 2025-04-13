const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createBill, getMyBills } = require("../controllers/billController");
const Bill = require("../models/Bill");

// Create a new bill
router.post("/", auth, createBill);

// Get all bills for the logged-in user
router.get("/", auth, getMyBills);

// Delete a bill by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: "Bill deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete bill" });
  }
});

// Mark a bill as paid/unpaid
router.patch("/:id/paid", auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    bill.paid = req.body.paid;
    await bill.save();

    res.json({ message: "Bill updated", bill });
  } catch (err) {
    res.status(500).json({ error: "Failed to update bill" });
  }
});

//
module.exports = router;
