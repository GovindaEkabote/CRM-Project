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

    if (
      !(
        role === constant.userType.ADMIN ||
        role === constant.userType.IT_SUPPORT ||
        ticket.reporter.toString() === userId.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view comments.",
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

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { id: userId, userType } = req.user;

    console.log(commentId);

    const comment = await TicketComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "comments not found",
      });
    }
    if (
      comment.user.toString() !== userId.toString() &&
      userType !== constant.userType.ADMIN
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Yoc can only delete your own comments unless you are an Admin",
      });
    }

    await comment.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.log("Delete Comments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateComments = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { id: userId, userType } = req.user;
    const { text } = req.body;

    if (!text || !text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment text cannot be empty",
      });
    }
    const comment = await TicketComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comments not found",
      });
    }
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments",
      });
    }
    if (comment.text === text) {
      return res.status(400).json({
        success: false,
        message: "New text is same as old text — nothing to update",
      });
    }
    comment.text = text;
    await comment.save();
    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Update Comment Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
