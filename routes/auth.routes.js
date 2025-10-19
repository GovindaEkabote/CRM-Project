const express = require("express");
const route = express.Router();
const authController = require('../controller/auth.controller')
const validateUserRequestBody = require('../middlewares/verifyUserReqBody')


route.post('/auth/signup',[validateUserRequestBody.validateUserReqBody], authController.signUp);



module.exports = route; 