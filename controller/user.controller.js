const User = require("../models/user.model");
const { userResp } = require("../utils/objectConverter");
const paginate = require("../utils/pagination");
const constant = require("../utils/constant");

exports.findAll = async (req, res) => {
  try {
    const { userType, userStatus, search, page, limit } = req.query;
    const queryObj = {};
    if (userType) {
      queryObj.userType = userType;
    }
    if (userStatus) {
      queryObj.userStatus = userStatus;
    }
    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { empId: { $regex: search, $options: "i" } },
      ];
    }
    const result = await paginate(User, queryObj, {
      page,
      limit,
      select: "-password -__v",
      sort: { createdAt: -1 },
    });
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      pagination: result.pagination,
      data: userResp(result.data),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in findAll controller file",
    });
  }
};

exports.user = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Token not verified.",
      });
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Logged-in user profile fetched successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in findAll controller file",
    });
  }
};

exports.getSingleEmployee = async (req, res) => {
  try {
    if (!req.user || !req.user.userType !== constant.userType.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { empId } = req.params;
    if (!empId) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }
    const employee = await User.findOne().select("-password");
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: `No employee found with ID ${empId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee profile fetched successfully.",
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching employee.",
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Prepare update object safely
    const updateFields = {};
    const allowedFields = ["name", "email", "userType", "userStatus"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateFields[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true, // return updated document
      runValidators: true, // enforce schema validation
      select: "-password", // exclude password field from response
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating employee.",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { empId } = req.params;
    if (!empId) {
      return res.status(404).json({
        success: false,
        message: "Employee ID Not Found",
      });
    }
    const deleteUser = await User.findByIdAndDelete(empId);
    if (!deleteUser) {
      return res.status(404).json({
        success: false,
        message: "Employee Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting employee", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting user.",
    });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { empId } = req.params;

    // Validate empId
    if (!empId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required.",
      });
    }

    // Find user by ID
    const user = await User.findById(empId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Already approved?
    if (user.userStatus === constant.userStatus.approved) {
      return res.status(400).json({
        success: false,
        message: "Employee already approved.",
      });
    }

    // Approve user
    user.userStatus = constant.userStatus.approved;
    await user.save();

    // Response
    return res.status(200).json({
      success: true,
      message: "User approved successfully.",
      data: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        userStatus: user.userStatus,
      },
    });
  } catch (error) {
    console.error("Error approving user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while approving user.",
      error: error.message,
    });
  }
};
