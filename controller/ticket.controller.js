const Ticket = require("../models/ticket.model");
const constant = require("../utils/constant");

// Employee raises a new ticket..
exports.createTicket = async (req, res) => {
  try {
    const { title, description, ticketPriority, category } = req.body;
    if (!title?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required." });
    }
    const newTicket = await Ticket.create({
      title: title.trim(),
      description: description?.trim(),
      ticketPriority: ticketPriority || constant.ticketPriority.LOW,
      reporter: req.user.id,
      category: category?.trim(),
      status: constant.ticketStatus.OPEN,
      assignee: null,
    });
    const populated = await Ticket.findById(newTicket._id).populate(
      "reporter",
      "name email"
    );
    return res.status(201).json({
      success: true,
      message: "Ticket raised successfully.",
      data: populated,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating ticket.",
    });
  }
};

/**
 * Get all tickets - role based behavior
 * ADMIN      → all tickets
 * IT_SUPPORT → assigned to them OR unassigned
 * USER       → tickets created by them
 */
exports.getAllTickets = async (req, res) => {
  try {
    const empId = req.user._id || req.user.id;
    const role = req.user.userType;
    let filter = {};
    if (role === constant.userType.ADMIN) {
      filter = {};
    } else if (role === constant.userType.IT_SUPPORT) {
      filter = {
        $or: [{ assignee: empId }],
      };
    } else if (role === constant.userType.employee) {
      filter = { reporter: empId };
    } else {
      return res.status(403).json({ message: "Invalid role access." });
    }
    console.log("DEBUG ROLE:", role);
    console.log("DEBUG EMPLOYEE ID:", empId);
    console.log("APPLIED FILTER:", filter);

    const tickets = await Ticket.find(filter)
      .populate("reporter", "fullName email")
      .populate("assignee", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    onsole.error("Error fetching tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Ticket by ID..
exports.getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const empId = req.user.id || req.user._id;
    const role = req.user.userType;
    const ticket = await Ticket.findById(ticketId)
      .populate("reporter", "fullName email empId")
      .populate("assignee", "fullName email empId");
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket Not found",
      });
    }
    if (role === constant.userType.ADMIN) {
      return res.status(200).json({ success: true, data: ticket });
    }
    if (role === constant.userType.IT_SUPPORT) {
      if (
        ticket.assignee &&
        ticket.assignee._id.toString() === empId.toString()
      ) {
        return res.status(200).json({ success: true, data: ticket });
      }
      return res.status(403).json({
        success: false,
        message: "Access denied. Ticket not assigned to you.",
      });
    }
    if (role === constant.userType.employee) {
      if (
        ticket.reporter &&
        ticket.reporter._id.toString() === empId.toString()
      ) {
        return res.status(200).json({ success: true, data: ticket });
      }
      return res.status(403).json({
        success: false,
        message: "Access denied. You can view only your own tickets.",
      });
    }
    return res.status(403).json({
      success: false,
      message: "Invalid user role.",
    });
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// update ticket by id..
exports.updateTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const empId = req.user._id || req.user.id;
    const role = req.user.userType;

    // Get the existing ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }
    if (role === constant.userType.ADMIN) {
      // ADMIN can update anything
      Object.assign(ticket, req.body);
    } else if (role === constant.userType.IT_SUPPORT) {
      if (!ticket.assignee || ticket.assignee.toString() !== empId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Ticket not assigned to you",
        });
      }
      // Allow only specific fields
      const allowedFields = ["status", "ticketPriority"];
      for (let key of Object.keys(req.body)) {
        if (allowedFields.includes(key)) {
          ticket[key] = req.body[key];
        }
      }
    } else if (role === constant.userType.employee) {
      // Only reporter can edit and only if ticket is still open
      if (ticket.reporter.toString() !== empId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only update your own tickets.",
        });
      }
      if (ticket.status !== constant.ticketStatus.OPEN) {
        return res.status(400).json({
          success: false,
          message: "You can edit only OPEN tickets.",
        });
      }
      // Allow employees to update only title & description
      const allowedFields = ["title", "description"];
      for (let key of Object.keys(req.body)) {
        if (allowedFields.includes(key)) {
          ticket[key] = req.body[key];
        }
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid role access.",
      });
    }
    const updatedTicket = await ticket.save();
    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully.",
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// https://chatgpt.com/c/68f6ccca-4290-8320-a20a-6820e5c643a0
