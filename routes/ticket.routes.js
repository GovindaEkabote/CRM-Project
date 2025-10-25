const express = require("express");
const route = express.Router();
const Ticket = require("../controller/ticket.controller");
const constant = require("../utils/constant");
const { verifyToken, isAdmin } = require("../middlewares/authjwt");
const authorizeRoles = require("../middlewares/authorizeRole");

route.post(
  "/create/ticket",
  verifyToken,
  authorizeRoles(constant.userType.employee),
  Ticket.createTicket
);

route.get("/tickets", verifyToken, Ticket.getAllTickets);

module.exports = route;
