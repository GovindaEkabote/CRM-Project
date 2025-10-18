const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// SignUp : EMPLOYEE = Approved by default | ADMIN/IT_SUPPORT = Pending
exports.signUp = async (req, res) => {
  try {
    const { name, empId, email, password, userType } = req.body;

    // Validate required fields
    if (!name || !empId || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check duplicate users
    const existingUser = await User.findOne({
      $or: [{ email }, { empId }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with given email or empId already exists" });
    }

    // Determine status
    let userStatus = "PENDING";
    let finalUserType = "EMPLOYEE";

    if (!userType || userType === "EMPLOYEE") {
      userStatus = "APPROVED";
    } else if (["ADMIN", "IT_SUPPORT"].includes(userType)) {
      finalUserType = userType;
      userStatus = "PENDING";
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      empId,
      email,
      password: hashedPassword,
      userType: finalUserType,
      userStatus,
    });

    // Return safe response
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
      return res
        .status(409)
        .json({ message: "User with given email or empId already exists" });
    }

    res.status(500).json({
      message: "Internal server error while creating the user",
    });
  }
};

