const Ticket = require("../models/ticket.model");
const TicketComment = require("../models/comment.model");
const constant = require("../utils/constant");

exports.addComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const userId = req.user._id || req.user.id;
    const role = req.user.userType.toUpperCase();

    // ✅ Access rules
    const isAllowed =
      role === constant.userType.ADMIN ||
      role === constant.userType.IT_SUPPORT ||
      ticket.reporter.toString() === userId.toString();

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to comment",
      });
    }

    const newComment = await TicketComment.create({
      ticket: ticketId,
      user: userId,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Comment added",
      data: newComment,
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user._id || req.user.id;
    const role = req.user.userType;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const comments = await TicketComment.find({ ticket: ticketId })
      .populate("user", "fullName email userType")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    console.log("Get Comments Error", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
