const User = require("../models/user.model");
const { userResp } = require("../utils/objectConverter");
const constant = require("../utils/constant");

exports.findAll = async (req, res) => {
  try {
    let userTypeReq = req.query.userType;
    let userStatusReq = req.query.userStatus;
    const queryObj = {};

    if(userStatusReq){
      queryObj.userStatus = userStatusReq
    }

    if(userTypeReq){
      queryObj.userType = userTypeReq
    }
    const users = await User.find(queryObj);

    return res.status(200).json({
      success: true,
      data: userResp(users),
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
