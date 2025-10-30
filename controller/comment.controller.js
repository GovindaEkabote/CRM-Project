const Ticket = require("../models/ticket.model");
const TicketComment = require("../models/ticket.model");
const constant = require("../utils/constant");

exports.addComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id || req.user.id;
    const role = req.user.userType;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty.",
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (
      !role === constant.userType.ADMIN ||
      role === constant.userType.IT_SUPPORT ||
      ticket.reporter.toString() === userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to comment on this ticket.",
      });
    }
    const newComment = await TicketComment.create({
      ticket: ticketId,
      user: userId,
      comment,
    });
    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: newComment,
    });
  } catch (error) {
    console.error("Add Comment Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
