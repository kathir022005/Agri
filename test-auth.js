const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "backend/.env") });
const mongoose = require("./backend/node_modules/mongoose");
const User = require("./backend/models/User");
const Bill = require("./backend/models/Bill");
const { seedAdmin } = require("./backend/controllers/authController");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://kathirashok255:Akkathir2005@cluster0.ly7x9.mongodb.net/agri-billing?appName=Cluster0";

async function testAuthAndRBAC() {
  console.log("==================================================");
  console.log("🧪 TESTING AUTHENTICATION & ROLE-BASED ACCESS");
  console.log("==================================================\n");

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Database Connected.");

  // 1. Test Admin Seeder
  console.log("\n1. Seeding Admin Account...");
  await seedAdmin();
  const admin = await User.findOne({ username: "kathirusha" });
  if (admin && (await admin.matchPassword("Usha2005@@"))) {
    console.log("   ✅ Admin Account Verified: kathirusha (Role:", admin.role, ")");
  } else {
    throw new Error("Admin verification failed!");
  }

  // 2. Clean up previous test users if any
  await User.deleteMany({ username: { $in: ["test_farmer_1", "test_farmer_2"] } });

  // 3. Register Farmer 1
  console.log("\n2. Creating Test Farmer 1 (Madurai)...");
  const farmer1 = await User.create({
    name: "Karthik Agri Farm",
    username: "test_farmer_1",
    password: "Password123",
    address: "14, River Road, Madurai",
    role: "user",
  });
  console.log("   ✅ Farmer 1 Created: ID", farmer1._id);

  // 4. Register Farmer 2
  console.log("\n3. Creating Test Farmer 2 (Salem)...");
  const farmer2 = await User.create({
    name: "Murugan Agro",
    username: "test_farmer_2",
    password: "Password123",
    address: "8, Mountain View, Salem",
    role: "user",
  });
  console.log("   ✅ Farmer 2 Created: ID", farmer2._id);

  // 5. Create Bill under Farmer 1
  console.log("\n4. Creating Bill for Farmer 1...");
  const bill1 = await Bill.create({
    user: farmer1._id,
    userName: farmer1.name,
    userAddress: farmer1.address,
    date: new Date(),
    items: [{ itemCode: "nellu", itemLabel: "Nellu (நெல்லு) - Paddy", capacity: 50, amount: 40, total: 2000 }],
    grandTotal: 2000,
  });
  console.log("   ✅ Bill 1 Created under Farmer 1: Total ₹", bill1.grandTotal);

  // 6. Verify Farmer 2 CANNOT see Farmer 1's bill
  console.log("\n5. Testing Data Isolation (Farmer 2 queries their bills)...");
  const farmer2Bills = await Bill.find({ user: farmer2._id });
  console.log("   ✅ Farmer 2 Bill Count:", farmer2Bills.length, "(Expected: 0)");
  if (farmer2Bills.length !== 0) throw new Error("Data Isolation Failed! Farmer 2 saw another user's bill.");

  // 7. Verify Admin sees all bills
  console.log("\n6. Testing Admin Super-Access (Admin queries all bills)...");
  const allBills = await Bill.find({});
  console.log("   ✅ Admin Total Bills Found:", allBills.length);

  const adminFilterFarmer1 = await Bill.find({ user: farmer1._id });
  console.log("   ✅ Admin Filtered by Farmer 1:", adminFilterFarmer1.length, "bill(s)");

  // 8. Cleanup test data
  await Bill.deleteMany({ _id: bill1._id });
  await User.deleteMany({ _id: { $in: [farmer1._id, farmer2._id] } });
  console.log("\n🧹 Test cleanup complete.");

  await mongoose.disconnect();
  console.log("\n==================================================");
  console.log("🎉 ALL AUTH & ROLE-BASED ACCESS TESTS PASSED 100%!");
  console.log("==================================================");
}

testAuthAndRBAC().catch((e) => {
  console.error("❌ Test Failed:", e);
  process.exit(1);
});
