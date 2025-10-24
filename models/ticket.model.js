const mongoose = require("mongoose");
const constant = require("../utils/constant");

const TicketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ticketPriority: {
      type: String,
      enum: [
        constant.ticketPriority.LOW,
        constant.ticketPriority.MEDIUM,
        constant.ticketPriority.HIGH,
        constant.ticketPriority.CRITICAL,
      ],
      default: constant.ticketPriority.LOW,
      required: true,
    },
    status: {
      type: String,
      enum: [
        constant.ticketStatus.OPEN,
        constant.ticketStatus.IN_PROGRESS,
        constant.ticketStatus.RESOLVED,
        constant.ticketStatus.CLOSED,
      ],
      default: constant.ticketStatus.OPEN,
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", TicketSchema);
