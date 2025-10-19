const mongoose = require("mongoose");
const constant = require("../utils/constant");

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
      match: [/^[A-Z0-9]{3,20}$/, "Employee ID must be 3-20 alphanumeric characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"],
      maxLength: [254, "Email cannot exceed 254 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters long"],
      select: false, // Hide password from queries by default
    },
    userType: {
      type: String,
      enum: [
        constant.userType.employee,
        constant.userType.ADMIN,
        constant.userType.IT_SUPPORT,
      ],
      required: true,
      default: constant.userType.employee,
    },
    userStatus: {
      type: String,
      enum: [
        constant.userStatus.approved,
        constant.userStatus.pending,
        constant.userStatus.blocked,
      ],
      required: true,
      default: constant.userStatus.approved,
    },
  },
  { timestamps: true }
);

// Pre-save normalization
userSchema.pre("save", function (next) {
  if (this.email) this.email = this.email.toLowerCase().trim();
  if (this.name) this.name = this.name.trim();
  if (this.empId) this.empId = this.empId.trim().toUpperCase();
  next();
});

// Static method for login lookup
userSchema.statics.findByLogin = async function (identifier) {
  return this.findOne({
    $or: [{ email: identifier.toLowerCase() }, { empId: identifier.toUpperCase() }],
  });
};

// Remove sensitive fields in JSON
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

// Compound index
userSchema.index({ email: 1, empId: 1 }, { unique: true });
userSchema.index({ userType: 1, userStatus: 1 });

module.exports = mongoose.model("User", userSchema);
