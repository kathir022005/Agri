const express = require("express");
const router = express.Router();
const {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
  exportBills,
} = require("../controllers/billController");
const { protect } = require("../middleware/auth");

// All bill routes require authentication
router.use(protect);

// IMPORTANT: /export must be declared before /:id to avoid Express
// treating "export" as a MongoDB ObjectId parameter.
router.get("/export", exportBills);

router.post("/", createBill);
router.get("/", getBills);
router.get("/:id", getBillById);
router.put("/:id", updateBill);
router.delete("/:id", deleteBill);

module.exports = router;
