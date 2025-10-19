const User = require("../models/user.model");
const 

validateUserRequestBody = async (req, res, next) => {
  if (req.body.name) {
    res.status(400).send({
      message: "Failed ! Bad Request, UserName field is not passed or empty",
    });
    return;
  }
// ------------------------------------------------------------------------
  if (req.body.empId) {
    res.status(400).send({
      message: "Failed ! Bad Request, empId field is not passed or empty",
    });
    return;
  }
  const user = await User.findOne({ empId: req.body.empId });
  if (user != null) {
    res.status(400).send({
      message: "Failed ! Bad Request, empId field is already present",
    });
    return;
  }
// ------------------------------------------------------------------------
   if (req.body.email) {
    res.status(400).send({
      message: "Failed ! Bad Request, email field is not passed or empty",
    });
    return;
  }
  const userEmail = await User.findOne({ email: req.body.email });
  if (userEmail != null) {
    res.status(400).send({
      message: "Failed ! Bad Request, email field is already present",
    });
    return;
  }
// ------------------------------------------------------------------------
const possibleUserTypes = []
};
