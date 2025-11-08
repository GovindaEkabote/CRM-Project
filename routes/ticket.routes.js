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
route.patch("/:ticketId/status", verifyToken, Ticket.updateTicketStatus);
route.get("/filter/ticket", verifyToken, Ticket.filterTickets);
route.get("/status",verifyToken,Ticket.ticketStatistics)
/*
GET /api/v1/tickets/status
GET /api/v1/tickets/status?startDate=2025-10-01&endDate=2025-10-31
GET /api/v1/tickets/status?category=Access%20Issue
GET /api/v1/tickets/status?assignee=68fcf0e63242bdeca819884c
GET /api/v1/tickets/status?status=RESOLVED
*/

route.patch("/tickets/:ticketId/reassign",verifyToken, Ticket.reassignTicket)
route.patch("/:ticketId/close",verifyToken, Ticket.forceCloseTicket)


module.exports = route;

