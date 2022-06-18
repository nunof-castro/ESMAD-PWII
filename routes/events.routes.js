const express = require('express');
let router = express.Router();
const authController = require('../controllers/auth.controller')
const eventController = require('../controllers/events.controller.js');
// middleware for all routes related with teams
router.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => { //finish event is emitted once the response is sent to the client
        const diffSeconds = (Date.now() - start) / 1000; //figure out how many seconds elapsed
        console.log(`${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`);
    });
    next()
})

router.post('/', authController.verifyToken, authController.isFacilitatorOrAdmin, eventController.create) //Verificar se os campos estão vazios
router.get('/', eventController.findAll);
router.get('/:eventID', eventController.findOne);
router.put('/:eventID', authController.verifyToken, authController.isFacilitatorOrAdmin, eventController.updateEvent);
router.delete('/:eventID', authController.verifyToken, authController.isFacilitatorOrAdmin, eventController.deleteEvent);
router.post('/:eventID/register', authController.verifyToken, eventController.createRegistration)
router.get('/registrations/active', authController.verifyToken, authController.isFacilitatorOrAdmin, eventController.findActiveRegistrations) //Verificação do facilitador
router.get('/registrations/unactive', authController.verifyToken, authController.isFacilitatorOrAdmin, eventController.findUnactiveRegistrations) //Verificação do facilitador
router.get('/registrations/:userEventID', authController.verifyToken, authController.isFacilitatorOrAdmin, eventController.findOneRegistration) //Verificação do facilitador
router.get('/:eventID/registrations', authController.verifyToken, authController.isFacilitatorOrAdmin, eventController.findRegistrationByEvent) //Verificação do facilitador
router.delete('/registrations/:userEventID', authController.verifyToken, authController.isFacilitatorOrAdmin, eventController.deleteRegistration)

//send a predefined error message for invalid routes on Accommodations
router.all('*', function (req, res) {
    res.status(404).json({ message: 'Events: what???' });
})
// EXPORT ROUTES (required by APP)
module.exports = router;