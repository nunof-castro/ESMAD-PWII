const express = require('express');
let router = express.Router();
const userController = require('../controllers/users.controller');
const authController = require('../controllers/auth.controller')
// middleware for all routes related with teams
router.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => { //finish event is emitted once the response is sent to the client
        const diffSeconds = (Date.now() - start) / 1000; //figure out how many seconds elapsed
        console.log(`${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
})



router.get('/',authController.verifyToken,authController.isAdmin, userController.findAll);
router.get('/active',authController.verifyToken,authController.isAdmin, userController.findAllActives);
router.get('/banned',authController.verifyToken,authController.isAdmin, userController.findAllBanned);
router.get('/:userID',authController.verifyToken,authController.isAdmin, userController.findOne);
router.put('/ban/:userID',authController.verifyToken, authController.isAdmin, userController.update);
router.put('/:userID',authController.verifyToken, userController.updateUserInfo);

//send a predefined error message for invalid routes on USERS
router.all('*', function (req, res) {
    res.status(404).json({ message: 'USERS: what???' });
})
// EXPORT ROUTES (required by APP)
module.exports = router;