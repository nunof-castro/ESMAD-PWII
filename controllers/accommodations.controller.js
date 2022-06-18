// get resource model (definition and DB operations)
const db = require("../models/db.js");
const Accommodation = db.accommodation;
const User = db.user;
const UserAccommodation = db.userAccommodation;
const CommentAccommodation = db.commentAccommodation;
const { Op } = require("sequelize");

//Get all accommodations
exports.findAll = (req, res) => {
  Accommodation.findAll()
    .then((data) => {
      if (data.length == 0) {
        res.status(404).json({
          message: "No accommodations registered",
        });
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving accommodations.",
      });
    });
};

//Get accommodation by id
exports.findOne = (req, res) => {
  Accommodation.findByPk(req.params.accommodationID)
    .then((data) => {
      if (data === null)
        res.status(404).json({
          message: `Accommodation with id ${req.params.accommodationID} not found!`,
        });
      else {
        res.json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message ||
          "Some error occurred while retrieving the accommodation!",
      });
    });
};

//Create an accommodation
exports.create = (req, res) => {
  const newAccommodation = {
    userId: req.loggedUserId,
    address: req.body.address,
    time_available: req.body.time_available,
    price_range: req.body.price_range,
    beds_number: req.body.beds_number,
    people_number: req.body.people_number,
    room_type: req.body.room_type,
  };

  Accommodation.create(newAccommodation)
    .then((data) => {
      res.status(201).json({
        message: "New accommodation created",
        location: "/accommodations" + data.id,
      });
    })
    .catch((err) => {
      if (err.name === "SequelizeValidationError")
        res.status(404).json({ message: err.errors[0].message });
      else
        res.status(500).json({
          message:
            err.message ||
            "Some error occurred while creating the accommodation!",
        });
    });
};

//Update accommodation
exports.updateAccommodation = async (req, res) => {
  //Check if data exists in request body
  if (!req.body) {
    res.status(400).json({ message: "No changes made" });
    return;
  }

  try {
    let accommodation = await Accommodation.findByPk(
      req.params.accommodationID
    );

    //Check if found pretended accommodation
    if (accommodation == null) {
      res.status(404).json({
        message: `Accommodation with id ${req.params.accommodationID} doesn't exist.`,
      });
      return;
    }
    //Check if logged user is the same as the accommodation owner
    if (req.loggedUserId === accommodation.userId) {
      //if so, update accommodation
      let updateAccommodation = await Accommodation.update(
        {
          address: req.body.address,
          time_available: req.body.time_available,
          price_range: req.body.price_range,
          beds_number: req.body.beds_number,
          people_number: req.body.people_number,
          date_time_event: req.body.date + " " + req.body.time,
          room_type: req.body.room_type,
        },
        { where: { id: req.params.accommodationID } }
      );

      //check if update was successfully made
      if (updateAccommodation == 1) {
        res.status(200).json({
          message: `Accommodation ${req.params.accommodationID} updated with success.`,
        });
      } else {
        res.status(400).json({
          message: `Can't applied changes to accommodation with id ${req.params.accommodationID}.`,
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

//Delete accommodation
exports.remove = (req, res) => {
  Accommodation.findOne({ where: { id: req.params.accommodationID } })
    .then((accommodation) => {
      if (accommodation === null) {
        res.status(404).json({
          message: `Accommodation with id ${req.params.accommodationID} not found!`,
        });
      } else {
        if (req.loggedUserId === accommodation.userId) {
          Accommodation.destroy({ where: { id: req.params.accommodationID } })
            .then((num) => {
              if (num == 1) {
                res.status(200).json({
                  message: `Accommodation with id ${req.params.accommodationID} deleted with success`,
                });
              } else {
                res.status(404).json({
                  message: `Accommodation with id ${req.params.accommodationID} not found!`,
                });
              }
            })
            .catch((err) => {
              res.status(500).json({
                message:
                  err.message ||
                  "Some error occurred while deleting the accommodation!",
              });
            });
        } else {
          res.status(400).json({
            message:
              "Only facilitator who posted this accommodation can delete it!",
          });
        }
      }
    })
    .catch((error) => {
      res.status(500).json(error.toString());
    });
};

//Create a reservation
exports.createReservation = async (req, res) => {
  try {
    let accommodation = await Accommodation.findByPk(
      req.params.accommodationID
    );
    console.log(accommodation);

    let reservations = await UserAccommodation.findAll({
      where: { accommodation_id: req.params.accommodationID, validation: 1 },
    });
    console.log(reservations.length);

    if (reservations.length >= accommodation.people_number) {
      return res
        .status(400)
        .json({ message: "Accommodation has reached the limit of people." });
    }

    let hasReservation = await UserAccommodation.findOne({
      where: {
        user_id: req.loggedUserId,
        accommodation_id: req.params.accommodationID,
      },
    });
    if (hasReservation) {
      return res
        .status(400)
        .json({ message: "User already made a reservation" });
    }

    if (accommodation === null) {
      return res.status(404).json({
        message: `Not found Accommodation with id ${req.body.accommodation_id}.`,
      });
    }

    //Create reservation object
    let newReservation = {
      user_id: req.loggedUserId,
      accommodation_id: req.params.accommodationID,
      validation: 0,
      // rating : req.body.rating,
      // comments: req.body.comments
    };

    UserAccommodation.create(newReservation);

    res.status(201).json({ message: "New reservation created." });
  } catch (err) {
    if (err.name === "SequelizeValidationError")
      return res.status(400).json({ message: err.errors[0].message });
    else
      return res.status(500).json({
        message:
          err.message || "Some error occurred while creating the reservation.",
      });
  }
};

//Get all reservations
exports.findReservations = (req, res) => {
  UserAccommodation.findAll()
    .then((data) => {
      if (data.length == 0) {
        res.status(404).json({
          message: "No reservations active",
        });
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving reservations.",
      });
    });
};

//Get reservation by user_reservation id
exports.findOneReservation = (req, res) => {
  UserAccommodation.findOne({ where: { id: req.params.userAccommodationID } })
    .then((data) => {
      if (data === null)
        res.status(404).json({
          message: `Reservation with id ${req.params.userAccommodationID} not found!`,
        });
      else {
        res.json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message ||
          "Some error occurred while retrieving the reservations!",
      });
    });
};

//Get Reservations by accommodation id
exports.findReservationByAccommodation = (req, res) => {
  UserAccommodation.findAll({
    where: { accommodation_id: req.params.accommodationID },
  })
    .then((data) => {
      if (data === null)
        res.status(404).json({
          message: `Reservation with id_accommodation ${req.params.userAccommodationID} not found!`,
        });
      else {
        res.json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message ||
          "Some error occurred while retrieving the accommodation!",
      });
    });
};

//Update Reservation (validate reservation)
exports.validateReservation = async (req, res) => {
  if (!req.body) {
    res.status(400).json({ message: "No changes made" });
    return;
  }

  try {
    let user_accommodation = await UserAccommodation.findOne({
      where: { id: req.params.userAccommodationID },
    });

    if (user_accommodation == null) {
      res.status(404).json({
        message: `Reservation with id ${req.params.userAccommodationID} doesn't exist.`,
      });
      return;
    }
    if (req.loggedUserId === user_accommodation.user_id) {
      let updateReservation = await UserAccommodation.update(
        {
          validation: req.body.validation,
        },
        { where: { id: req.params.userAccommodationID } }
      );

      //Check if update was done successfully
      if (updateReservation == 1) {
        res.status(200).json({
          message: `Reservation ${req.params.userAccommodationID} updated with success.`,
        });
      } else {
        res.status(400).json({
          message: `Can't applied changes to reservation with id ${req.params.userAccommodationID}.`,
        });
      }
    } else {
      res.status(400).json({
        message:
          "Only facilitator who posted this accommodation can validate the reservation!",
      });
    }
  } catch (e) {
    res.status(500).json({
      message:
        e.message ||
        `Error updating Reservation with id=${req.params.userAccommodationID}.`,
    });
  }
};

//Delete reservation
exports.deleteReservation = (req, res) => {
  UserAccommodation.findOne({ where: { id: req.params.userAccommodationID } })
    .then((userAccommodation) => {
      if (userAccommodation === null) {
        res.status(404).json({
          message: `Reservation with id ${req.params.userAccommodationID} not found!`,
        });
      } else {
        if (req.loggedUserId === userAccommodation.user_id) {
          UserAccommodation.destroy({
            where: { id: req.params.userAccommodationID },
          })
            .then((num) => {
              if (num == 1) {
                res.status(200).json({
                  message: `Reservation with id ${req.params.userAccommodationID} deleted with success`,
                });
              } else {
                res.status(404).json({
                  message: `Reservation with id ${req.params.userAccommodationID} not found!`,
                });
              }
            })
            .catch((err) => {
              8;
              res.status(500).json({
                message:
                  err.message ||
                  "Some error occurred while deleting the resrevation!",
              });
            });
        } else {
          res.status(400).json({
            message:
              "Only facilitator who posted this accommodation can delete this reservation!",
          });
        }
      }
    })
    .catch((error) => {
      res.status(500).json(error.toString());
    });
};

//Create a comment
exports.createComment = async (req, res) => {
  try {
    let accommodation = await Accommodation.findByPk(
      req.params.accommodationID
    );
    console.log(accommodation);

    if (accommodation === null) {
      return res.status(404).json({
        message: `Not found Accommodation with id ${req.params.accommodationID}.`,
      });
    }

    //Create comment object
    let newComment = {
      user_id: req.loggedUserId,
      accommodation_id: req.params.accommodationID,
      comment: req.body.comment,
    };

    CommentAccommodation.create(newComment);

    res.status(201).json({
      message: `New comment posted on accommodation with id ${req.params.accommodationID}.`,
    });
  } catch (err) {
    if (err.name === "SequelizeValidationError")
      return res.status(400).json({ message: err.errors[0].message });
    else
      return res.status(500).json({
        message:
          err.message || "Some error occurred while creating the comment.",
      });
  }
};

//Get all accommodation comments
exports.findAllComments = (req, res) => {
  CommentAccommodation.findAll()
    .then((data) => {
      if (data.length == 0) {
        res.status(404).json({
          message: "No comments posted!",
        });
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving comments.",
      });
    });
};

//Get Comments by accommodation id
exports.findCommentsbyAccommodationId = (req, res) => {
  CommentAccommodation.findAll({
    where: { accommodation_id: req.params.accommodationID },
  })
    .then((data) => {
      if (data === null)
        res.status(404).json({
          message: `No comments posted in this accommodation!`,
        });
      else {
        res.json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving the comments!",
      });
    });
};

//Get comment by id
exports.findCommentById = (req, res) => {
  CommentAccommodation.findOne({ where: { id: req.params.commentID } })
    .then((data) => {
      if (data === null)
        res.status(404).json({
          message: `Comment with id ${req.params.commentID} not found!`,
        });
      else {
        res.json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving the comment!",
      });
    });
};

//Delete comment
exports.deleteComment = (req, res) => {
  CommentAccommodation.findOne({
    where: { id: req.params.commentID },
  })
    .then((comment) => {
      if (comment === null) {
        res.status(404).json({
          message: `Comment with id ${req.params.commentID} not found!`,
        });
      } else {
        CommentAccommodation.destroy({
          where: { id: req.params.commentID },
        })
          .then((num) => {
            if (num == 1) {
              res.status(200).json({
                message: `Comment with id ${req.params.commentID} deleted with success`,
              });
            } else {
              res.status(404).json({
                message: `Comment with id ${req.params.commentID} not found!`,
              });
            }
          })
          .catch((err) => {
            8;
            res.status(500).json({
              message:
                err.message ||
                "Some error occurred while deleting the comment!",
            });
          });
      }
    })
    .catch((error) => {
      res.status(500).json(error.toString());
    });
};

//Update comment
exports.updateComment = async (req, res) => {
  //Check if data exists in request body
  if (!req.body) {
    res.status(400).json({ message: "No changes made" });
    return;
  }

  try {
    let comment = await CommentAccommodation.findByPk(
      req.params.commentID
    );

    //Check if found pretended comment
    if (comment == null) {
      res.status(404).json({
        message: `Comment with id ${req.params.commentID} doesn't exist.`,
      });
      return;
    }
    //Check if logged user is the same as the comment's user
    if (req.loggedUserId === comment.user_id) {
      //if so, update comment
      let updateComment = await CommentAccommodation.update(
        {
          comment: req.body.comment
        },
        { where: { id: req.params.commentID } }
      );

      //check if update was successfully made
      if (updateComment == 1) {
        res.status(200).json({
          message: `Comment ${req.params.commentID} updated with success.`,
        });
      } else {
        res.status(400).json({
          message: `Can't applied changes to comment with id ${req.params.commentID}.`,
        });
      }
    } else {
      res.status(400).json({
        message:
          "Only user who posted this comment can change it!",
      });
    }
  } catch (e) {
    res.status(500).json({
      message:
        e.message ||
        `Error updating comment with id=${req.params.commentID}.`,
    });
  }
};
