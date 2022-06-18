const jwt= require("jsonwebtoken");
const bcrypt= require("bcryptjs");

const config = require("../config/auth.config.js");
const db = require("../models/db.js");
const User = db.user; 

exports.signup = async (req, res) => {
    try {// check duplicate username 
        let user = await User.findOne(
            { where: { username: req.body.username} }
        );

        if (user)
            return res.status(400).json({ message: "Failed! Username is already in use!" });
            
        // save User to database
        user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8), // generates hash to password
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            user_role:req.body.user_role,
            user_banned:0
        });
        

        return res.status(201).json({ message: "User was registered successfully!" });
        
    }
    catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err.message});
    };
};

exports.signin= async (req, res) => {
    try {
        let user = await User.findOne({ where: { username: req.body.username} });
        

        if (!user) 
            return res.status(404).json({ message: `User ${req.body.username} doesn´t exist! Keep sure you register before loggin.` });
        // tests a string (password in body) against a hash (password in database)
        console.log("comparação",req.body.password, user.password)
        const passwordIsValid = bcrypt.compareSync( 
            req.body.password, user.password
        );
        console.log("valid?:", passwordIsValid)
        
        if (!passwordIsValid) {
            return res.status(401).json({
                accessToken: null, message: "Invalid Password!"
            });
        }
        // sign the given payload (user ID) into a JWT payload –builds JWT token,using secret key
        const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 // 1 day
        });
        console.log(token)
        
        
        if (user.user_banned == 0){
            return res.status(200).json({
                id: user.id, 
                username: user.username,
                password: user.password,
                accessToken: token
            });
        }else{
            return res.status(401).json({
               message: "User Banned"
            });
        }
       
    } 
    catch (err) { res.status(500).json({ message: err.message}); console.log(err);};
};

exports.verifyToken= (req, res, next) => {
    let token = req.headers.authorization;
    console.log(token)
    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }// verify request token given the JWT secret key
    
    jwt.verify(token.replace('Bearer ', ''), config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: err.toString() });
        }
        req.loggedUserId= decoded.id; // save user ID for future verifications
        console.log(req.loggedUserId)
        next();
    });
};

exports.isAdmin= async (req, res, next) => {
    let user = await User.findByPk(req.loggedUserId);


    console.log(user.user_role)
    
    if (user.user_role == 1) {
        next();
    } else {
        return res.status(403).send({ message: "Require Admin Role!" });
    }
    
    
};

exports.isClient= async (req, res, next) => {
    let user = await User.findByPk(req.loggedUserId);
    
    if (user.user_role == 0) {
        next();
    } else {
        return res.status(403).send({ message: "Require Cliente Role!" });
    }
    
    
};

exports.isFacilitatorOrAdmin= async (req, res, next) => {
    let user = await User.findByPk(req.loggedUserId);
    
    
    if (user.user_role == 1 || user.user_role == 2) {
        next();
    } else {
        return res.status(403).send({ message: "Require Admin or Facilitator Role!" });
    }
};

// exports.isAdminOrLoggedUser= async (req, res, next) => {
//     let user = await User.findByPk(req.loggedUserId);
//     let type = await user.getUserType();

//     if (type.name === "admin" || user.id == req.params.userID) 
//         next();
        
//     return res.status(403).send({ message: "Require Admin Role!" });
// };