const express = require('express')
const Users = require('../controller/user.controller')
const route = express.Router();


route.get('/users',Users.findAll)

module.exports = route;