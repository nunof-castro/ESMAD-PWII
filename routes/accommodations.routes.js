const express = require('express');
let router = express.Router();
const authController = require('../controllers/auth.controller')
const accommodationController = require('../controllers/accommodations.controller.js');
// middleware for all routes related with teams
router.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => { //finish event is emitted once the response is sent to the client
        const diffSeconds = (Date.now() - start) / 1000; //figure out how many seconds elapsed
        console.log(`${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
})



router.get('/', accommodationController.findAll);
router.get('/reservations', accommodationController.findReservations) //retribuir só as validadas
router.get('/comments',authController.verifyToken, authController.isAdmin, accommodationController.findAllComments)
router.get('/:accommodationID', accommodationController.findOne);
router.post('/',authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.create) //Verificar se os campos estão vazios
router.put('/:accommodationID',authController.verifyToken,authController.isFacilitatorOrAdmin, accommodationController.updateAccommodation)
router.delete('/:accommodationID', authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.remove)

router.post('/:accommodationID/reservations',authController.verifyToken, accommodationController.createReservation)
router.get('/reservations/:userAccommodationID', authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.findOneReservation) //Verificação do facilitador
router.get('/:accommodationID/reservations', authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.findReservationByAccommodation) //Verificação do facilitador
router.put('/reservations/:userAccommodationID', authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.validateReservation)
router.delete('/reservations/:userAccommodationID', authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.deleteReservation)

router.post('/:accommodationID/comments',authController.verifyToken, authController.isClient, accommodationController.createComment)
router.get('/:accommodationID/comments',authController.verifyToken,authController.isAdmin, accommodationController.findCommentsbyAccommodationId)
router.get('/comments/:commentID',authController.verifyToken,authController.isAdmin, accommodationController.findCommentById)
router.delete('/comments/:commentID', authController.verifyToken, authController.isAdmin, accommodationController.deleteComment)
router.put('/comments/:commentID', authController.verifyToken, accommodationController.updateComment)

//send a predefined error message for invalid routes on Accommodations
router.all('*', function (req, res) {
    res.status(404).json({ message: 'Accommodation: what???' });
})
// EXPORT ROUTES (required by APP)
module.exports = router;