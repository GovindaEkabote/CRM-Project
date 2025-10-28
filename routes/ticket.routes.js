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


// https://chatgpt.com/c/68f6ccca-4290-8320-a20a-6820e5c643a0
// https://chatgpt.com/c/68fc9e7c-f8fc-8322-8a43-4a3281bf6bed

// https://chatgpt.com/c/68ff1f8c-1ecc-8323-9f6b-9e1b614c7770