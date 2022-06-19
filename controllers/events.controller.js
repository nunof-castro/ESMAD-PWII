const db = require("../models/db.js");
const Event = db.event;
const User = db.user;
const UserEvent = db.userEvent;
const CommentEvent = db.commentEvent;
const { Op } = require("sequelize");

//Create an event
exports.create = (req, res) => {
  //Define new event object
  const newEvent = {
    userId: req.loggedUserId,
    address: req.body.address,
    date: req.body.date,
    event_type: req.body.event_type,
    price: req.body.price,
  };

  if (req.body.event_type == "") {
    return res.status(400).json({
      message: "Event Type cant be empty",
    });
  } else if (req.body.address == "") {
    return res.status(400).json({
      message: "Address cant be empty",
    });
  } else if (req.body.date == "") {
    return res.status(400).json({
      message: "Date cant be empty",
    });
  }

  Event.create(newEvent)
    .then((data) => {
      res.status(201).json({
        message: "New event created",
        location: "/events" + data.id,
      });
    })
    .catch((err) => {
      if (err.name === "SequelizeValidationError")
        res.status(404).json({ message: err.errors[0].message });
      else
        res.status(500).json({
          message:
            err.message || "Some error occurred while creating the event!",
        });
    });
};

//Get all Events
exports.findAll = (req, res) => {
  Event.findAll()
    .then((data) => {
      if (data.length == 0) {
        res.status(404).json({
          message: "No events registered",
        });
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message || "Some error occurred while retrieving events.",
      });
    });
};

//Get event by id
exports.findOne = (req, res) => {
  Event.findByPk(req.params.eventID)
    .then((data) => {
      if (data === null)
        res.status(404).json({
          message: `Event with id ${req.params.eventID} not found!`,
        });
      else {
        res.json(data);
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving the event!",
      });
    });
};

//Update Event
exports.updateEvent = async (req, res) => {
  //Check if data exists in request body
  if (!req.body) {
    res.status(400).json({ message: "No changes made" });
    return;
  }

  try {
    let event = await Event.findByPk(req.params.eventID);

    //Check if found pretended accommodation
    if (event == null) {
      res.status(404).json({
        message: `Event with id ${req.params.eventID} doesn't exist.`,
      });
      return;
    }
    //Check if logged user is the same as the event organizer
    if (req.loggedUserId === event.userId) {
      //if so, update event
      let updateEvent = await Event.update(
        {
          address: req.body.address,
          date: req.body.date,
          event_type: req.body.event_type,
          price: req.body.price,
        },
        { where: { id: req.params.eventID } }
      );

      //check if update was successfully made
      if (updateEvent == 1) {
        res.status(200).json({
          message: `Event ${req.params.eventID} updated with success.`,
        });
      } else {
        res.status(400).json({
          message: `Can't applied changes to event with id ${req.params.eventID}.`,
        });
      }
    } else {
      res.status(400).json({
        message: "Only facilitator who posted this event can update it!",
      });
    }
  } catch (e) {
    res.status(500).json({
      message:
        e.message || `Error updating Event with id=${req.params.eventID}.`,
    });
  }
};

//Delete event
exports.deleteEvent = (req, res) => {
  Event.findOne({ where: { id: req.params.eventID } })
    .then((event) => {
      if (event === null) {
        res.status(404).json({
          message: `Event with id ${req.params.eventID} not found!`,
        });
      } else {
        if (req.loggedUserId === event.userId) {
          Event.destroy({ where: { id: req.params.eventID } })
            .then((num) => {
              if (num == 1) {
                res.status(200).json({
                  message: `Event with id ${req.params.eventID} deleted with success`,
                });
              } else {
                res.status(404).json({
                  message: `Event with id ${req.params.eventID} not found!`,
                });
              }
            })
            .catch((err) => {
              res.status(500).json({
                message:
                  err.message ||
                  "Some error occurred while deleting the event!",
              });
            });
        } else {
          res.status(400).json({
            message: "Only facilitator who organized this event can delete it!",
          });
        }
      }
    })
    .catch((error) => {
      res.status(500).json(error.toString());
    });
};

//Create a registration
exports.createRegistration = async (req, res) => {
  try {
    let event = await Event.findByPk(req.params.eventID);

    let registered = await UserEvent.findOne({
      where: { user_id: req.loggedUserId, event_id: req.params.eventID },
    });
    if (registered) {
      return res.status(400).json({
        message: `User already registered in event with id ${req.params.eventID}`,
      });
    }

    if (event === null) {
      return res.status(404).json({
        message: `Not found Event with id ${req.params.eventID}.`,
      });
    }

    //Create registration object
    let newRegistration = {
      user_id: req.loggedUserId,
      event_id: req.params.eventID,
      validation: 0,
      // rating : req.body.rating,
      // comments: req.body.comments
    };

    UserEvent.create(newRegistration);

    res.status(201).json({ message: "New registration created." });
  } catch (err) {
    if (err.name === "SequelizeValidationError")
      return res.status(400).json({ message: err.errors[0].message });
    else
      return res.status(500).json({
        message: err.message || "Some error occurred while register the user.",
      });
  }
};

//Get registration by user_event id
exports.findOneRegistration = (req, res) => {
  UserEvent.findOne({ where: { id: req.params.userEventID } })
    .then((data) => {
      if (data === null)
        res.status(404).json({
          message: `Registration with id ${req.params.userEventID} not found!`,
        });
      else {
        if (req.loggedUserId === data.user_id) {
          res.json(data);
        } else {
          res.status(400).json({
            message: "Only facilitator who posted this event can delete it!",
          });
        }
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving registrations!",
      });
    });
};

//Get registrations by event_id
exports.findRegistrationByEvent = (req, res) => {
  UserEvent.findAll({
    where: { event_id: req.params.eventID },
  })
    .then((data) => {
      if (data === null)
        res.status(404).json({
          message: `Registration with id_event ${req.params.userEventID} not found!`,
        });
      else {
        if (req.loggedUserId === data.user_id) {
          res.json(data);
        } else {
          res.status(400).json({
            message: "Only facilitator who posted this event can delete it!",
          });
        }
      }
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving registration!",
      });
    });
};

//Delete registration by id
exports.deleteRegistration = (req, res) => {
  UserEvent.findOne({ where: { id: req.params.userEventID } })
    .then((userEvent) => {
      if (userEvent === null) {
        res.status(404).json({
          message: `Registration with id ${req.params.userEventID} not found!`,
        });
      } else {
        if (req.loggedUserId === userEvent.user_id) {
          UserEvent.destroy({ where: { id: req.params.userEventID } })
            .then((num) => {
              if (num == 1) {
                res.status(200).json({
                  message: `Registration with id ${req.params.userEventID} deleted with success`,
                });
              } else {
                res.status(404).json({
                  message: `Registration with id ${req.params.userEventID} not found!`,
                });
              }
            })
            .catch((err) => {
              8;
              res.status(500).json({
                message:
                  err.message ||
                  "Some error occurred while deleting the registration!",
              });
            });
        } else {
          res.status(400).json({
            message:
              "Only facilitator who posted this event can delete this registration!",
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
    let event = await Event.findByPk(req.params.eventID);

    if (event === null) {
      return res.status(404).json({
        message: `Not found Event with id ${req.params.eventID}.`,
      });
    }

    //Create comment object
    let newComment = {
      user_id: req.loggedUserId,
      event_id: req.params.eventID,
      comment: req.body.comment,
    };

    CommentEvent.create(newComment);

    res.status(201).json({
      message: `New comment posted on event with id ${req.params.eventID}.`,
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

//Get all events comments
exports.findAllComments = (req, res) => {
  CommentEvent.findAll()
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

//Get Comments by event id
exports.findCommentsbyEventId = (req, res) => {
  CommentEvent.findAll({
    where: { event_id: req.params.eventID },
  })
    .then((data) => {
      if (data === null)
        res.status(404).json({
          message: `No comments posted in this event!`,
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
  CommentEvent.findOne({ where: { id: req.params.commentID } })
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
  CommentEvent.findOne({
    where: { id: req.params.commentID },
  })
    .then((comment) => {
      if (comment === null) {
        res.status(404).json({
          message: `Comment with id ${req.params.commentID} not found!`,
        });
      } else {
        CommentEvent.destroy({
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
    let comment = await CommentEvent.findByPk(req.params.commentID);

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
      let updateComment = await CommentEvent.update(
        {
          comment: req.body.comment,
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
        message: "Only user who posted this comment can change it!",
      });
    }
  } catch (e) {
    res.status(500).json({
      message:
        e.message || `Error updating comment with id=${req.params.commentID}.`,
    });
  }
};
