const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createBill, getMyBills } = require("../controllers/billController");

router.post("/", auth, createBill);
router.get("/", auth, getMyBills);

module.exports = router;
