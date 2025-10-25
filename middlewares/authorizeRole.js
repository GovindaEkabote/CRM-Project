const { model } = require("mongoose");

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.userType) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Token verification failed.",
        });
      }
      if (!allowedRoles.includes(req.user.userType)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Requires one of: ${allowedRoles.join(
            ", "
          )}.`,
        });
      }
      next();
    } catch (error) {
      console.error("Error in authorizeRoles middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error in role authorization.",
      });
    }
  };
};


module.exports =authorizeRoles;