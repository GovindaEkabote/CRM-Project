const express = require("express");
const router = express.Router();
const comment = require("../controller/comment.controller");
const constant = require("../utils/constant");
const { verifyToken, isAdmin } = require("../middlewares/authjwt");
const authorizeRoles = require("../middlewares/authorizeRole");

router.post("/ticket/comments/:ticketId", verifyToken, comment.addComment);
router.get(
  "/ticket/comments/:ticketId",
  verifyToken,
  authorizeRoles(
    constant.userType.IT_SUPPORT ||
    constant.userType.ADMIN ||
    constant.userType.employee
  ),
  comment.getComments
);

module.exports = router;
