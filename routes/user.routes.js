const express = require('express')
const Users = require('../controller/user.controller')
const authjwt = require('../middlewares/authjwt')
const route = express.Router();


route.get('/users',authjwt,Users.findAll)

module.exports = route;