const User = require("../models/user.model");
const constant = require("../utils/constant");

const validateUserRequestBody = async (req, res, next) => {
  const { name, empId, email, password, userType } = req.body;

  // Validate required fields
  if (!name || name.trim() === "") {
    return res.status(400).send({
      message: "Failed! Bad Request — 'name' field is required.",
    });
  }

  if (!empId || empId.trim() === "") {
    return res.status(400).send({
      message: "Failed! Bad Request — 'empId' field is required.",
    });
  }

  const existingUserByEmpId = await User.findOne({ empId });
  if (existingUserByEmpId) {
    return res.status(400).send({
      message: "Failed! Bad Request — 'empId' already exists.",
    });
  }

  if (!email || email.trim() === "") {
    return res.status(400).send({
      message: "Failed! Bad Request — 'email' field is required.",
    });
  }

  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    return res.status(400).send({
      message: "Failed! Bad Request — 'email' already exists.",
    });
  }

  if (!password || password.trim() === "") {
    return res.status(400).send({
      message: "Failed! Bad Request — 'password' field is required.",
    });
  }

  // Validate userType (optional but must be valid if present)
  const validUserTypes = [
    constant.userType.employee,
    constant.userType.ADMIN,
    constant.userType.IT_SUPPORT,
  ];

  if (userType && !validUserTypes.includes(userType)) {
    return res.status(400).send({
      message: "Invalid 'userType' value. Please provide a valid one.",
    });
  }

  next();
};

module.exports = {
  validateUserReqBody: validateUserRequestBody,
};
