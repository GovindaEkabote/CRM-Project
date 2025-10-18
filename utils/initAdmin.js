const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

async function initAdmin() {
  const adminEmpId = "ADMIN001";
  const adminExists = await User.findOne({ empId: adminEmpId });

  if (!adminExists) {
    await User.create({
      name: "System Admin",
      empId: adminEmpId,
      email: "admin@crm.com",
      password: bcrypt.hashSync("Admin@123", 10),
      userType: "ADMIN",
    });
    console.log("✅ Admin user created successfully");
  } else {
    console.log("✅ Admin user already exists");
  }
}

module.exports = initAdmin;