const express = require("express");
const Users = require("../controller/user.controller");
const { verifyToken, isAdmin } = require("../middlewares/authjwt");
const verifyUserReqBody = require("../middlewares/verifyUserReqBody");
const route = express.Router();

/*
GET /hrm/api/v1/users?page=2&limit=5
GET /hrm/api/v1/users?userType=EMPLOYEE&userStatus=APPROVED&page=1&limit=10
GET /hrm/api/v1/users?search=ravis
*/
route.get("/users", verifyToken, isAdmin, Users.findAll);
route.get("/me", verifyToken, Users.user);
route.get("/employee/:empId", verifyToken, isAdmin, Users.user);
route.put(
  "/employee/update/:userId",
  verifyToken,
  isAdmin,
  verifyUserReqBody.validateUserStatusAndUserType,
  Users.updateUser
);

route.delete("/delete/:empId", verifyToken, isAdmin, Users.deleteUser);

module.exports = route;
