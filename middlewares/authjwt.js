const jwt = require("jsonwebtoken");
const constant = require("../utils/constant");

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.accessToken; // token stored in cookies

    if (!token) {
      return res.status(403).json({
        success: false,
        message: "No access token provided. Please login",
      });
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token.",
        });
      }

      req.user = decoded; // attach decoded payload to request
      next(); // proceed to next middleware
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Token is not verified",
      });
    }

    if (req.user.userType !== constant.userType.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};



module.exports = { verifyToken, isAdmin };
