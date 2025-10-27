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
route.get("/ticket/:ticketId", verifyToken, Ticket.getTicketById);
route.put("/ticket/:ticketId", verifyToken, Ticket.updateTicketById);
route.delete("/ticket/:ticketId", verifyToken, Ticket.deleteTicket);
route.put("/:ticketId/assign", verifyToken, Ticket.assignTicket);

module.exports = route;
