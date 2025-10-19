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
