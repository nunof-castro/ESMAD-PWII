const express = require('express');
const authController= require("../controllers/auth.controller");
const userController = require("../controllers/users.controller")
let router = express.Router();

router.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers","x-access-token, Origin, Content-Type, Accept");
    next()
})
router.post('/register', authController.signup);

router.post('/login', authController.signin);


router.all('*', function (req, res) {   
    //send an predefined error message 
    res.status(404).json({ message: 'AUTHENTICATION: what???' });
})



module.exports = router;