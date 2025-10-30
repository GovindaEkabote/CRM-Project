const express = require("express");
const router = express.Router();
const comment = require("../controller/comment.controller");
const constant = require("../utils/constant");
const { verifyToken, isAdmin } = require("../middlewares/authjwt");


router.post('/ticket/:ticketId', verifyToken,comment.addComment);



module.exports = router;