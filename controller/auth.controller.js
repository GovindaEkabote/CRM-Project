const User = require("../models/user.model");
const constant = require("../utils/constant");
const bcrypt = require("bcryptjs");

// SignUp : EMPLOYEE = Approved by default | ADMIN/IT_SUPPORT = Pending
exports.signUp = async (req, res) => {
  try {
    let { name, empId, email, password, userType } = req.body;

    // Validate required fields
    if (!name || !empId || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { empId }] });
    if (existingUser) {
      return res.status(409).json({ message: "User with given email or empId already exists" });
    }

    // Determine role & status
    const finalUserType = userType || constant.userType.employee;
    const userStatus =
      finalUserType === constant.userType.employee
        ? constant.userStatus.approved
        : constant.userStatus.pending;

    // Hash password asynchronously
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      empId,
      email,
      password: hashedPassword,
      userType: finalUserType,
      userStatus,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        name: newUser.name,
        empId: newUser.empId,
        email: newUser.email,
        userType: newUser.userType,
        userStatus: newUser.userStatus,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error while creating user:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "User with given email or empId already exists" });
    }
    res.status(500).json({ message: "Internal server error while creating the user" });
  }
};
