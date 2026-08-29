const Bill = require("../models/Bill");
const User = require("../models/User");
const ExcelJS = require("exceljs");

// POST /api/bills — Create a new bill
const createBill = async (req, res) => {
  try {
    const { date, items, grandTotal, targetUserId } = req.body;

    if (!date || !items || items.length === 0) {
      return res.status(400).json({ message: "Date and at least one item are required." });
    }

    let billUser = req.user;

    // If admin is creating a bill on behalf of a specific user
    if (req.user.role === "admin" && targetUserId) {
      const foundUser = await User.findById(targetUserId);
      if (foundUser) {
        billUser = foundUser;
      }
    }

    const bill = new Bill({
      user: billUser._id,
      userName: billUser.name,
      userAddress: billUser.address || "",
      date,
      items,
      grandTotal,
    });

    const saved = await bill.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("createBill error:", error);
    res.status(500).json({ message: "Server error while creating bill.", error: error.message });
  }
};

// GET /api/bills — List bills (Isolated per user, or filterable for admin)
const getBills = async (req, res) => {
  try {
    const { from, to, userId } = req.query;
    const filter = {};

    // User data isolation: regular users only see their own bills
    if (req.user.role !== "admin") {
      filter.user = req.user._id;
    } else if (userId && userId !== "all") {
      // Admin filtering by specific user
      filter.user = userId;
    }

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) {
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

// GET /api/bills/export — Export bills to Excel (.xlsx)
const exportBills = async (req, res) => {
  try {
    const { from, to, userId } = req.query;
    const filter = {};

    // User data isolation: regular users only export their own bills
    if (req.user.role !== "admin") {
      filter.user = req.user._id;
    } else if (userId && userId !== "all") {
      filter.user = userId;
    }

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

    const isAdmin = req.user.role === "admin";

    // Define columns
    const columns = [
      { header: "Bill Date", key: "date", width: 14 },
    ];

    if (isAdmin) {
      columns.push(
        { header: "Farmer / User", key: "userName", width: 22 },
        { header: "Address", key: "userAddress", width: 25 }
      );
    }

    columns.push(
      { header: "Item (Tanglish)", key: "itemLabel", width: 38 },
      { header: "Capacity", key: "capacity", width: 12 },
      { header: "Amount (₹)", key: "amount", width: 14 },
      { header: "Row Total (₹)", key: "total", width: 14 },
      { header: "Bill Grand Total (₹)", key: "grandTotal", width: 20 }
    );

    sheet.columns = columns;

    // Bold & styled header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E5339" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 24;

    // Populate rows
    bills.forEach((bill) => {
      const dateStr = new Date(bill.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      bill.items.forEach((item, idx) => {
        const rowData = {
          date: dateStr,
          itemLabel: item.itemLabel,
          capacity: item.capacity,
          amount: item.amount,
          total: item.total,
          grandTotal: idx === 0 ? bill.grandTotal : "",
        };

        if (isAdmin) {
          rowData.userName = bill.userName || "";
          rowData.userAddress = bill.userAddress || "";
        }

        const row = sheet.addRow(rowData);

        // Alternating row colour
        if (sheet.rowCount % 2 === 0) {
          row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFDF3E3" } };
        }

        // Right-align numeric cells
        ["capacity", "amount", "total", "grandTotal"].forEach((key) => {
          const cell = row.getCell(key);
          if (cell) {
            cell.alignment = { horizontal: "right" };
            if (typeof cell.value === "number") {
              cell.numFmt = "#,##0.00";
            }
          }
        });
      });
    });

    // Summary row
    const allGrandTotals = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
    sheet.addRow({});
    const summaryRowData = {
      date: "GRAND TOTAL",
      grandTotal: allGrandTotals,
    };
    const summaryRow = sheet.addRow(summaryRowData);
    summaryRow.font = { bold: true };
    const gtCell = summaryRow.getCell("grandTotal");
    if (gtCell) gtCell.numFmt = "#,##0.00";

    const filename = isAdmin && userId && userId !== "all"
      ? `agri-bills-user-${userId}.xlsx`
      : `agri-bills.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("exportBills error:", error);
    res.status(500).json({ message: "Server error during Excel export.", error: error.message });
  }
};

// GET /api/bills/:id — Get single bill (with authorization check)
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found." });

    // Authorization check
    if (req.user.role !== "admin" && bill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. You can only view your own bills." });
    }

    res.json(bill);
  } catch (error) {
    console.error("getBillById error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PUT /api/bills/:id — Update a bill (user can edit own, admin can edit any)
const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found." });

    if (req.user.role !== "admin" && bill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. You can only edit your own bills." });
    }

    const { date, items, grandTotal } = req.body;
    bill.date = date || bill.date;
    bill.items = items || bill.items;
    bill.grandTotal = grandTotal !== undefined ? grandTotal : bill.grandTotal;

    const updated = await bill.save();
    res.json(updated);
  } catch (error) {
    console.error("updateBill error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// DELETE /api/bills/:id — Delete a bill (user can delete own, admin can delete any)
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found." });

    if (req.user.role !== "admin" && bill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. You can only delete your own bills." });
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: "Bill deleted successfully." });
  } catch (error) {
    console.error("deleteBill error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = { createBill, getBills, getBillById, updateBill, deleteBill, exportBills };
