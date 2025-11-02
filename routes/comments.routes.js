const express = require("express");
const router = express.Router();
const comment = require("../controller/comment.controller");
const constant = require("../utils/constant");
const { verifyToken, isAdmin } = require("../middlewares/authjwt");
const authorizeRoles = require("../middlewares/authorizeRole");

router.post("/create/comments/:ticketId", verifyToken, comment.addComment);
router.get("/get/comments/:ticketId", verifyToken, comment.getComments);
router.delete("/delete/comments/:commentId", verifyToken, comment.deleteComment);

module.exports = router;
