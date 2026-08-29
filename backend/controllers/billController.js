const Bill = require("../models/Bill");
const ExcelJS = require("exceljs");

// POST /api/bills — Create a new bill
const createBill = async (req, res) => {
  try {
    const { date, items, grandTotal } = req.body;

    if (!date || !items || items.length === 0) {
      return res.status(400).json({ message: "Date and at least one item are required." });
    }

    const bill = new Bill({ date, items, grandTotal });
    const saved = await bill.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("createBill error:", error);
    res.status(500).json({ message: "Server error while creating bill.", error: error.message });
  }
};

// GET /api/bills — List all bills (supports ?from=YYYY-MM-DD&to=YYYY-MM-DD)
const getBills = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) {
        // Include the full "to" day
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.date.$lte = toDate;
      }
    }

    const bills = await Bill.find(filter).sort({ date: -1 });
    res.json(bills);
  } catch (error) {
    console.error("getBills error:", error);
    res.status(500).json({ message: "Server error while fetching bills.", error: error.message });
  }
};

// GET /api/bills/export — Export all bills to Excel (.xlsx)
// NOTE: This route MUST be registered before /:id in the router to avoid collision
const exportBills = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.date.$lte = toDate;
      }
    }

    const bills = await Bill.find(filter).sort({ date: 1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Agri Billing App";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Agri Bills");

    // Define columns
    sheet.columns = [
      { header: "Bill Date",       key: "date",          width: 14 },
      { header: "Item (Tanglish)", key: "itemLabel",     width: 38 },
      { header: "Capacity",        key: "capacity",      width: 12 },
      { header: "Amount (₹)",      key: "amount",        width: 14 },
      { header: "Row Total (₹)",   key: "total",         width: 14 },
      { header: "Bill Grand Total (₹)", key: "grandTotal", width: 20 },
    ];

    // Bold & styled header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E5339" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 22;

    // Populate rows — one row per line item
    bills.forEach((bill) => {
      const dateStr = new Date(bill.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      bill.items.forEach((item, idx) => {
        const row = sheet.addRow({
          date: dateStr,
          itemLabel: item.itemLabel,
          capacity: item.capacity,
          amount: item.amount,
          total: item.total,
          // Only show grand total on the first line of each bill
          grandTotal: idx === 0 ? bill.grandTotal : "",
        });

        // Alternating row colour
        if (sheet.rowCount % 2 === 0) {
          row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDF3E3" } };
        }

        // Right-align numeric cells
        ["capacity", "amount", "total", "grandTotal"].forEach((key) => {
          const cell = row.getCell(key);
          cell.alignment = { horizontal: "right" };
          if (typeof cell.value === "number") {
            cell.numFmt = '#,##0.00';
          }
        });
      });
    });

    // Auto-fit already handled by column widths above
    // Add a totals summary row at the bottom
    const allGrandTotals = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
    sheet.addRow({});
    const summaryRow = sheet.addRow({
      date: "GRAND TOTAL",
      grandTotal: allGrandTotals,
    });
    summaryRow.font = { bold: true };
    summaryRow.getCell("grandTotal").numFmt = '#,##0.00';

    // Stream response
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=agri-bills.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("exportBills error:", error);
    res.status(500).json({ message: "Server error during Excel export.", error: error.message });
  }
};

// GET /api/bills/:id — Get single bill
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found." });
    res.json(bill);
  } catch (error) {
    console.error("getBillById error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PUT /api/bills/:id — Update a bill
const updateBill = async (req, res) => {
  try {
    const { date, items, grandTotal } = req.body;
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { date, items, grandTotal },
      { new: true, runValidators: true }
    );
    if (!bill) return res.status(404).json({ message: "Bill not found." });
    res.json(bill);
  } catch (error) {
    console.error("updateBill error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// DELETE /api/bills/:id — Delete a bill
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found." });
    res.json({ message: "Bill deleted successfully." });
  } catch (error) {
    console.error("deleteBill error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = { createBill, getBills, getBillById, updateBill, deleteBill, exportBills };
