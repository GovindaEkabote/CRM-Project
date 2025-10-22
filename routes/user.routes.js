const express = require('express')
const Users = require('../controller/user.controller')
const {verifyToken,isAdmin} = require('../middlewares/authjwt')
const route = express.Router();


route.get('/users',verifyToken,isAdmin,Users.findAll)

module.exports = route;