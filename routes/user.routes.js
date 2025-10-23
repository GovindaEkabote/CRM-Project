const express = require('express')
const Users = require('../controller/user.controller')
const {verifyToken,isAdmin} = require('../middlewares/authjwt')
const route = express.Router();


route.get('/users',verifyToken,isAdmin,Users.findAll)
route.get('/me',verifyToken,Users.user)
route.get('/employee/:empId',verifyToken,isAdmin,Users.user)
route.get('/employee/update/:userId',verifyToken,isAdmin,Users.updateUser)

module.exports = route;