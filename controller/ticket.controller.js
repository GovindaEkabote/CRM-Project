const Ticket = require("../models/ticket.model");
const constant = require("../utils/constant");
const User = require("../models/user.model");

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
/*
 1. update title and description
*/
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

exports.deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const empId = req.user._id || req.user.id;
    const role = req.user.userType;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket Not Found",
      });
    }
    if (role === constant.userType.ADMIN) {
      await Ticket.findByIdAndDelete(ticketId);
      return res.status(200).json({
        success: true,
        message: "Ticket deleted successfully by Admin.",
      });
    }
    if (role === constant.userType.employee) {
      if (ticket.reporter.toString() === empId.toString()) {
        if (ticket.assignee) {
          return res.status(400).json({
            success: false,
            message: "Cannot delete ticket once it is assigned to IT_SUPPORT.",
          });
        }
        await Ticket.findByIdAndDelete(ticketId);
        return res.status(200).json({
          success: true,
          message: "Your ticket has been deleted successfully.",
        });
      }
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own tickets.",
      });
    }
    // IT_SUPPORT or others
    return res.status(403).json({
      success: false,
      message: "Access denied. You are not allowed to delete tickets.",
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ADMIN to assign any IT_SUPPORT staff || IT_SUPPORT to self-assign a ticket if it’s unassigned. || Prevent EMPLOYEE from assigning.
exports.assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const assignId = req.body?.assignId; // safe optional chaining
    const empId = req.user._id || req.user.id;
    const role = req.user.userType;

    // 1. Find ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // 2. ADMIN assigns to IT_SUPPORT
    if (role === constant.userType.ADMIN) {
      if (!assignId) {
        return res.status(400).json({
          success: false,
          message: "Admin must provide 'assignId' to assign a ticket.",
        });
      }

      const itSupportUser = await User.findOne({
        _id: assignId, // 🔥 use _id (not id)
        userType: constant.userType.IT_SUPPORT,
      });

      if (!itSupportUser) {
        return res.status(400).json({
          success: false,
          message: "Provided user is not a valid IT_SUPPORT staff.",
        });
      }

      ticket.assignee = assignId;
      await ticket.save();

      return res.status(200).json({
        success: true,
        message: `Ticket assigned to ${
          itSupportUser.fullName || itSupportUser.name
        }`,
        data: ticket,
      });
    }

    // 3. IT_SUPPORT self-assign
    if (role === constant.userType.IT_SUPPORT) {
      if (ticket.assignee) {
        return res.status(400).json({
          success: false,
          message: "Ticket is already assigned.",
        });
      }

      ticket.assignee = empId;
      await ticket.save();

      return res.status(200).json({
        success: true,
        message: "Ticket successfully self-assigned.",
        data: ticket,
      });
    }

    // 4. EMPLOYEE access denied
    return res.status(403).json({
      success: false,
      message: "Access denied. Only ADMIN or IT_SUPPORT can assign tickets.",
    });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const empId = req.user._id || req.user.id;
    const role = req.user.userType;

    // Validate incoming status
    const validStatuses = [
      constant.ticketStatus.OPEN,
      constant.ticketStatus.IN_PROGRESS,
      constant.ticketStatus.RESOLVED,
      constant.ticketStatus.CLOSED,
    ];
    if (!validStatuses) {
      return res.status(400).json({
        success: false,
        message: `Invalid status value. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    // Find Ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }
    if (role === constant.userType.IT_SUPPORT) {
      if (!ticket.assignee || ticket.assignee.toString() !== empId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only update your assigned tickets.",
        });
      }
    } else if (role !== constant.userType.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only ADMIN or IT_SUPPORT can change status.",
      });
    }
    // If resolving, mark resolvedAt
    if (status === constant.ticketStatus.RESOLVED) {
      ticket.resolvedAt = new Date();
    }

    // Update and save
    ticket.status = status;
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: `Ticket status updated to ${status}`,
      data: ticket,
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Add comments on tickets..

