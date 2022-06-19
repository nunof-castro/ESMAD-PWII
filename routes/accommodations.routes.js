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



router.get('/', accommodationController.findAll); //correta
router.get('/reservations/active',authController.verifyToken,authController.isAdmin, accommodationController.findReservations)//correta
router.get('/comments',authController.verifyToken, authController.isAdmin, accommodationController.findAllComments)//correta
router.get('/:accommodationID', accommodationController.findOne);//correta
router.post('/',authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.create) //correta
router.put('/:accommodationID',authController.verifyToken,authController.isFacilitatorOrAdmin, accommodationController.updateAccommodation) //correta
router.delete('/:accommodationID', authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.remove) //correta

router.post('/:accommodationID/reservations',authController.verifyToken,authController.isClient, accommodationController.createReservation) //correta
router.get('/reservations/:userAccommodationID', authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.findOneReservation) //correta
router.get('/:accommodationID/reservations', authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.findReservationByAccommodation) //correta
// router.get('/:accommodationID/reservations', authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.findActiveReservationByAccommodation)
// router.get('/:accommodationID/reservations', authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.findUnactiveReservationByAccommodation)
router.put('/reservations/:userAccommodationID', authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.validateReservation) //correta
router.delete('/reservations/:userAccommodationID', authController.verifyToken, authController.isFacilitatorOrAdmin, accommodationController.deleteReservation) //correta

router.post('/:accommodationID/comments',authController.verifyToken, authController.isClient, accommodationController.createComment) //correta
router.get('/:accommodationID/comments',authController.verifyToken, accommodationController.findCommentsbyAccommodationId) //correta
router.get('/comments/:commentID',authController.verifyToken, accommodationController.findCommentById) //correta
router.delete('/comments/:commentID', authController.verifyToken, authController.isAdmin, accommodationController.deleteComment) //correta
router.put('/comments/:commentID', authController.verifyToken, accommodationController.updateComment) //correta

router.post('/:accommodationID/ratings', authController.verifyToken, authController.isClient, accommodationController.createRating) //INCORRETA


//rota para as reservas ativas e inativas por accommodation

//send a predefined error message for invalid routes on Accommodations
router.all('*', function (req, res) {
    res.status(404).json({ message: 'Accommodation: what???' });
})
// EXPORT ROUTES (required by APP)
module.exports = router;