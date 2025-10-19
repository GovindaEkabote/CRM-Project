const User = require("../models/user.model");
const constant = require("../utils/constant");
const bcrypt = require("bcryptjs");

// SignUp : EMPLOYEE = Approved by default | ADMIN/IT_SUPPORT = Pending
exports.signUp = async (req, res) => {
  try {
    const { name, empId, email, password, userType } = req.body;

    // Determine role & status
    const finalUserType = userType || constant.userType.employee;
    const userStatus =
      finalUserType === constant.userType.employee
        ? constant.userStatus.approved
        : constant.userStatus.pending;

    // Hash password
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

    // Handle duplicate key error (MongoDB unique constraint)
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `User with this ${duplicateField} already exists.`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while creating the user",
    });
  }
};
