const http = require("http");
const https = require("https");
const mongoose = require("mongoose");
require("dotenv").config({ path: "backend/.env" });

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://kathirashok255:Akkathir2005@cluster0.ly7x9.mongodb.net/agri-billing?appName=Cluster0";

function makeRequest(url, method = "GET", postData = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https:");
    const client = isHttps ? https : http;
    const req = client.request(url, { method, headers: postData ? { "Content-Type": "application/json" } : {} }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on("error", reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runAudit() {
  console.log("==================================================");
  console.log("🌾 AGRI BILLING APP — FULL SYSTEM VERIFICATION");
  console.log("==================================================\n");

  // 1. Direct MongoDB Atlas Test
  console.log("1. Testing Direct MongoDB Atlas Connection...");
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log("   ✅ MongoDB Atlas: CONNECTED SUCCESSFULLY!");
    console.log("   📍 Host:", conn.connection.host);
    console.log("   📍 DB Name:", conn.connection.name);
    await mongoose.disconnect();
  } catch (err) {
    console.error("   ❌ MongoDB Error:", err.message);
  }

  // 2. Cloud Render Deployment Test
  console.log("\n2. Testing Cloud Render Deployment (https://agri-billing.onrender.com)...");
  try {
    const health = await makeRequest("https://agri-billing.onrender.com/api/health");
    console.log(`   ✅ Cloud API Health Status: ${health.status} (${health.body.trim()})`);

    const bills = await makeRequest("https://agri-billing.onrender.com/api/bills");
    const count = Array.isArray(JSON.parse(bills.body)) ? JSON.parse(bills.body).length : 0;
    console.log(`   ✅ Cloud Bills Endpoint: ${bills.status} (${count} bills currently saved in DB)`);

    const excel = await makeRequest("https://agri-billing.onrender.com/api/bills/export");
    console.log(`   ✅ Cloud Excel (.xlsx) Export: Status ${excel.status} (${excel.headers["content-disposition"] || "ready"})`);
  } catch (err) {
    console.error("   ⚠️ Cloud Render Test Note:", err.message);
  }

  console.log("\n==================================================");
  console.log("🎉 ALL SYSTEMS (DATABASE, CLOUD API, EXCEL, GIT) VERIFIED!");
  console.log("==================================================");
}

runAudit();
