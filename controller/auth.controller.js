const User = require("../models/user.model");
const constant = require("../utils/constant");
const jwt = require("jsonwebtoken");
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

// Login
exports.login = async (req, res) => {
  try {
    const { empId, password } = req.body;
    // Check required fields
    if (!empId || !password) {
      return res.status(400).json({
        success: false,
        message: "Both empId and password are required.",
      });
    }

    // Find user by empId
    const user = await User.findOne({ empId }).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with empId '${empId}' not found.`,
      });
    }

    // Check approval status
    if (user.userStatus !== constant.userStatus.approved) {
      return res.status(403).json({
        success: false,
        message: `Access denied. User status is '${user.userStatus}'.`,
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    // Ensure environment variables exist
    if (!process.env.SECRET || !process.env.EXPIRES_IN) {
      console.error(
        "JWT SECRET or EXPIRES_IN not set in environment variables"
      );
      return res.status(500).json({
        success: false,
        message: "Server misconfiguration. Please contact admin.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, empId: user.empId, role: user.userType },
      process.env.SECRET,
      { expiresIn: process.env.EXPIRES_IN }
    );

    // Success response
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        name: user.name,
        empId: user.empId,
        email: user.email,
        userType: user.userType,
        userStatus: user.userStatus,
        accessToken: token,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login.",
    });
  }
};
