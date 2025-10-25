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
