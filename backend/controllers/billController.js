const Bill = require("../models/Bill");

exports.createBill = async (req, res) => {
  const { totalAmount, splitBetween, description } = req.body;
  try {
    const bill = new Bill({
      owner: req.user.id,
      totalAmount,
      splitBetween,
      description,
    });
    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: "Failed to create bill" });
  }
};

exports.getMyBills = async (req, res) => {
  try {
    const bills = await Bill.find({ owner: req.user.id });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bills" });
  }
};
