const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [2, "Name must be at least 2 characters long"],
      maxLength: [100, "Name cannot exceed 100 characters"],
    },
    empId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z0-9]{3,20}$/,
        "Employee ID must be 3-20 alphanumeric characters",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
      maxLength: [254, "Email cannot exceed 254 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters long"],
    },
    userType: {
      type: String,
      enum: ["EMPLOYEE", "ADMIN", "IT_SUPPORT"],
      required: true,
      default: "EMPLOYEE",
    },
    userStatus: {
      type: String,
      enum: ["APPROVED", "PENDING", "BLOCKED"],
      required: true,
      default: "APPROVED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
