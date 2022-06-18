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
