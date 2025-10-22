const User = require("../models/user.model");
const { userResp } = require("../utils/objectConverter");

exports.findAll = async (req, res) => {
  try {
    const users = await User.find(); // MongoDB uses find(), not findAll()
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
