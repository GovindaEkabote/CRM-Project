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
        $or: [{ assignee: empId }, { assignee: null }],
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
