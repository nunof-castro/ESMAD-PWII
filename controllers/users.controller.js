// get resource model (definition and DB operations)
const db = require("../models/db.js");
const User = db.user;
const Accommodation = db.accommodation;
const Event = db.event;
const CommentAccommodation = db.commentAccommodation;

const { Op } = require("sequelize");
const { user } = require("../models/db.js");
// const userTrophie = require("../models/db.js");

// get all users for admin
exports.findAll = (req, res) => {
  User.findAll({
    include: [
      {
        model: Accommodation,
        as: "reservations",
        attributes: ["id"],
      },
      {
        model: Accommodation,
        as: "comments_accommodation",
        attributes: ["id"],
      },
      {
        model: Accommodation,
        as: "rate",
        attributes: ["id"],
      },
      {
        model: Event,
        as: "registrations",
        attributes: ["id"],
      },
      {
        model: Event,
        as: "comments_event",
        attributes: ["id"],
      },
    ],
  })
    .then((data) => {
      if (data.length == 0) {
        res.status(404).json({
          message: "No users registered",
        });
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// get all active users
exports.findAllActives = (req, res) => {
  User.findAll(
    { where: { user_banned: 0 } },
    {
      include: [
        {
          model: Accommodation,
          as: "reservations",
          attributes: ["id"],
        },
        {
          model: Accommodation,
          as: "comments_accommodation",
          attributes: ["id"],
        },
        {
          model: Accommodation,
          as: "rate",
          attributes: ["id"],
        },
        {
          model: Event,
          as: "registrations",
          attributes: ["id"],
        },
        {
          model: Event,
          as: "comments_event",
          attributes: ["id"],
        },
      ],
    },
    
  )
    .then((data) => {
      if (data.length == 0) {
        res.status(404).json({
          message: "No active users",
        });
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// get all unactive users
exports.findAllBanned = (req, res) => {
  User.findAll(
    { where: { user_banned: 1 } },
    {
      include: [
        {
          model: Accommodation,
          as: "reservations",
          attributes: ["id"],
        },
        {
          model: Accommodation,
          as: "comments_accommodation",
          attributes: ["id"],
        },
        {
          model: Accommodation,
          as: "rate",
          attributes: ["id"],
        },
        {
          model: Event,
          as: "registrations",
          attributes: ["id"],
        },
        {
          model: Event,
          as: "comments_event",
          attributes: ["id"],
        },
      ],
    }
  )
    .then((data) => {
      if (data.length == 0) {
        res.status(404).json({
          message: "No banned users",
        });
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

exports.findOne = (req, res) => {
  User.findByPk(req.params.userID)
    .then((data) => {
      if (data === null)
        res
          .status(404)
          .json({ message: `User with id ${req.params.userID} not found!` });
      else {
        res.json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving the user!",
      });
    });
};

exports.update = (req, res) => {
  User.update(req.body, { where: { id: req.params.userID } })
    .then((num) => {
      if (num == 1) {
        res.status(200).json({
          message: `User id=${req.params.userID} was updated successfully.`,
        });
      } else {
        res.status(404).json({
          message: `User with id=${req.params.userID} not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message || "Some error occurred while updating the user!",
      });
    });
};

//Update user
exports.updateUserInfo = async (req, res) => {
  //Check if data exists in request body
  if (!req.body) {
    res.status(400).json({ message: "No changes made" });
    return;
  }

  try {
    let user = await User.findByPk(
      req.params.userID
    );

    //Check if found pretended accommodation
    if (user == null) {
      res.status(404).json({
        message: `User with id ${req.params.userID} doesn't exist.`,
      });
      return;
    }

    //Check if logged user is the same as the accommodation owner
    if (req.loggedUserId === user.id) {
      //if so, update accommodation
      let userUpdate = await User.update(
        {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          user_role: req.body.user_role,
        },
        { where: { id: req.params.userID } }
      );

      //check if update was successfully made
      if (userUpdate == 1) {
        res.status(200).json({
          message: `User ${req.params.userID} updated with success.`,
        });
      } else {
        res.status(400).json({
          message: `Can't applied changes to user with id ${req.params.userID}.`,
        });
      }
    } else {
      res.status(400).json({
        message:
          "Only facilitator who posted this accommodation can update it!",
      });
    }
  } catch (e) {
    res.status(500).json({
      message:
        e.message ||
        `Error updating Accommodation with id=${req.params.accommodationID}.`,
    });
  }
};
