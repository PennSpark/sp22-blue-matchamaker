var passport = require('passport')
var LocalStrategy = require('passport-local')
var bcrypt = require('bcryptjs')
var Login = require('../models/login')
var User = require('../models/user')
var Image = require('../models/image')
var FormSend = require('../models/formSend')
var FormResponses = require('../models/formResponses')
const fs = require("fs");
var calendarAlgorithm = require('./calendar.js')
var imageMiddleware = require('./imageController.js')

//import {generateAvailability} from './calendar.js'

const { body,validationResult } = require('express-validator')
  passport.use(new LocalStrategy(function verify(username, password, done) {
    Login.findOne({ username: username }, (err, user) => {
        if (err) { 
          return done(err)
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username" })
        }
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
              // passwords match! log user in
              return done(null, user)
            } else {
              // passwords do not match!
              return done(null, false, { message: "Incorrect password" })
            }
          })
      });
  }));
  
  passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });
  
/*
    sign up for an account
*/
exports.post_sign_up = function(req, res, next) {
    Login.find({username : req.body.username})
    .exec(function (err, u_list) {
      if (err) { return next(err); }
      if (u_list.length > 0) {
        res.status(406).json({message: "User already exists. You cannot create an account!"});
      } else { 
        const user = new Login();
        user.username = req.body.username;
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            user.password = hash;
            user.save(err => {
              if (err) { 
                return next(err);
              }
              res.status(200).json({message: "Success. User created."});
            });
        })
      }
    })
  };

exports.get_log_in = function(req, res, next) {
    if (req.user) {
        User.findOne({'userLogin': req.user.username}).exec(function (err, user_list) {
        if (err) { return next(err); }
        //Successful, so render
        if (user_list) {
            res.status(200).json({ user: req.user, userDetail: user_list});
        } else {
            res.status(200).json({ user: req.user });
        }
        });
    } else {
        res.status(404).json({message: "User account doesn't exist."});
    }
}; 
  
exports.get_username = function(req, res) {
    if (req.user) {
        res.json(req.user.username)
    } else {
        res.status(406).json({message: "Not signed in"})
    }
};

exports.password_authenticate = passport.authenticate('local', {
    successRedirect: '/login/success',
    failureRedirect: '/login/failure',
    failureMessage: false
});

exports.success_login = function(req, res) {
    res.status(200).json({message: "Success! You're logged in."});
}

exports.failure_login = function(req, res) {
    res.status(401).send({message: "Invalid password or user."});
}

exports.log_out = function(req, res, next) {
    req.logout();
    res.status(200).json({message: "Successfully logged out."});
}

/*figure it you want to santize the data later*/ 
exports.post_create_user = (req, res, next) => {
    if (!req.user) {
        res.status(400).json({message: "Please log in."})
    } else {
        User.find({'userLogin': req.user.username})
        .exec(function (err, user_list) {
            if (err) { return next(err); }
        //Successful, so render
            if (user_list.length > 0) {
                res.status(409).json({message: "User already created."})
                return;
            }
            //check if user has a file or not. 
            var user = new User({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                year_of_grad: req.body.year_of_grad,
                email: req.body.email,
                phone_number: req.body.phone_number, 
                gender: req.body.gender, 
                major: req.body.major, 
                year_joined_spark: req.body.year_joined_spark, 
                spark_role: req.body.spark_role, 
                chat_participating: false,
                date_created_account: new Date(), 
                userLogin: req.user.username, 
                users_chatted: req.body.users_chatted, 
                activities: req.body.activities,
                users_blocked: req.body.users_blocked, 
                dates_blocked: [], 
                about: ''
            })
            user.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.status(200).json(user);
            })
        })
    }
}

exports.get_dates_blocked = function(req, res, next) {
    User.findOne({"userLogin": req.user.username}).select({dates_blocked: 1, _id: 0}).exec(
        function (err, results) {
            if (err) { return next(err)}
            if (results == null) {
                res.status(400).json({message: "User doesn't have account."})
            } else {
                res.status(200).json(results)
            }
        }
    )
}

exports.post_update_about = function(req, res, next) {
    User.findOne({"userLogin": req.user.username}).exec(
        function (err, results) {
            if (err) { return next(err)}
            if (results == null) {
                res.status(400).json({message: "User doesn't have account."})
            }
            const aboutInfo = req.body.about
            User.findOneAndUpdate({"userLogin": req.user.username}, {'about': aboutInfo}, {}, function (err, user) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.status(200)
                });
        }
    )
}

exports.post_update_dates_blocked = function(req, res, next) {
    User.findOne({"userLogin": req.user.username}).exec(
        function (err, results) {
            if (err) { return next(err)}
            if (results == null) {
                res.status(400).json({message: "User doesn't have account."})
            }
            const dates_blocked = req.body.dates
            User.findOneAndUpdate({"userLogin": req.user.username}, {'dates_blocked': dates_blocked}, {}, function (err, user) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.status(200)
                });
        }
    )
}

exports.post_update_user = [
    // Validate and sanitize fields.
    body('first_name', 'First name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('last_name', 'Last name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('year_of_grad', 'Graduation Year must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('email', 'Email must not be empty').trim().isLength({ min: 1 }).escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a Book object with escaped/trimmed data and old id.
        User.findOne({"userLogin": req.user.username}).exec(
            function (err, results) {
                if (err) {return next(err); }
                if (results==null) { // No results.
                    res.status(400).json({message: "User doesn't have account."})
                }
                const oldID = results._id;
                var updated_user = new User(
                    { first_name: req.body.first_name,
                      last_name: req.body.last_name, 
                      email: req.body.email,
                      year_of_grad: req.body.year_of_grad,
                      phone_number: req.body.phone_number, 
                      gender: req.body.gender, 
                      major: req.body.major, 
                      year_joined_spark: req.body.year_joined_spark, 
                      spark_role: req.body.spark_role, 
                      users_chatted: req.body.users_chatted, 
                      users_blocked: req.body.users_blocked,
                      activities: req.body.activities,
                      _id: oldID //This is required, or a new ID will be assigned!
                     });
                if (!errors.isEmpty()) {
                        // There are errors. Render form again with sanitized values/error messages.
                        // Get all authors and genres for form.
                        res.status(400).json(errors);
                        return;
                    } else {
                        // Data from form is valid. Update the record.
                        User.findOneAndUpdate({"userLogin": req.user.username}, updated_user, {}, function (err, user) {
                            if (err) { return next(err); }
                               // Successful - redirect to book detail page.
                               res.status(200).json(user);
                            });
                    }  
            }
        )
    }
]

//delete account if needed. 
exports.post_delete_user = function (req, res, next) {
    let user_name = req.user.username; 
    req.logout(); 
    Login.find({'username': user_name}).remove().exec(); 
    User.find({'userLogin': user_name}).remove().exec();
    res.status(200).json({message: "Successfully deleted"});
}

exports.change_chat_status = function(req, res, next) {
    User.findOne({'userLogin': req.user.username}).exec(
        function(err, results) {
            if (err) {return next(err); }
            if (results==null) { // No results.
                res.status(400).json({message: "User doesn't have account."})
            }
            var update = { 'chat_participating': req.body.status}
            User.findOneAndUpdate({'userLogin': req.user.username}, update, {}, 
            function (err, account) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.status(200).json({ 
                       message: "success!"});
                }
            )

        }
    )
}
//view user information in dashboard 
exports.get_user_by_link = function(req, res, next) {
    //check whether or not the request is from the correct user 
    //const {user} = req.user;
    User.findById(req.params.id)
        .exec(function (err, result) {
            if (err) { return next(err); }
            if (result==null) { // No results.
                res.status(400).json({message: "User not found."})
            }
            if (result.userLogin !== req.user.username) {
                //change to user url 
                res.status(400).json({message: "Invalid credentials to view user details."})
            } else {
                res.status(200).json(result);
            }
    });
}

//view user information in dashboard 
exports.get_user_by_username = function(req, res, next) {
    //check whether or not the request is from the correct user 
    //const {user} = req.user;
    if (!req.user) {
        res.status(400).json({message: "Not logged in."})
    } else {
        User.findOne({'userLogin': req.user.username})
        .exec(function (err, result) {
            if (err) { return next(err); }
            if (!result) { // No results.
                res.status(406).json({message: "User not found."})
            } else if (result.userLogin !== req.user.username) {
                //change to user url 
                res.status(400).json({message: "Invalid credentials to view user details."})
            } else {
                res.status(200).json(result);
            }
        });
    }
    
}

exports.get_survey_complete = function(req, res, next) {
    FormResponses.findOne({'username': req.user.username}).exec(
        function(err, found_response) {
            if (err) { return next(err); }
            if (found_response) {
                res.status(200).json({'filled_form': true})
            } else {
                res.status(200).json({'filled_form': false})
            }
        }
    )
}

//render the form information 
exports.post_form_response = function(req, res, next) {
    var formResponse = new FormResponses(
        {
            username: req.body.username, 
            form_number: req.body.form_number,
            responses: req.body.responses,
        });
    FormResponses.findOne({'username': req.body.username}).exec(
        function(err, found_response) {
            if (err) { return next(err); }
            if (found_response) {
                res.status(400).json({message: 'Already filled out form.'})
            } else {
                formResponse.save(function (err) {
                    if (err) { return next(err); }
                    // Successful - redirect to new author record.
                    res.status(200).json(formResponse);
                });
            }
        }
    )
}

exports.get_profile_card = function (req, res, next) {
    //populate('profile_picture').
    User.findOne({'userLogin': req.body.username}).populate('profile_picture', { image_url: 1 }).select({first_name: 1, last_name: 1, phone_number: 1, 
        major: 1, year_of_grad: 1, about: 1, profile_picture: 1, activities: 1, _id: 0}).exec(
        //firstname, lastname, schedule, activities they want to do 
        //add schedule & usercard + details 
        function(err, result) {
            if (err) {return next(err); }
            if (result) { 
                res.status(200).json(result)
            } else {
                res.status(400)
            }
        }
    )
}

exports.post_form = function(req, res, next) {
    var formQuestion = new FormSend(
        {
            question: req.body.question, 
            type: req.body.type, 
            options: req.body.options, 
            form_number: req.body.form_number,
        });
    formQuestion.save(function (err) {
        if (err) { return next(err); }
        // Successful - redirect to new author record.
        res.status(200).json(formQuestion);
    });
}

exports.get_form = function(req, res, next) {
    var formNum = req.params.form_number
    FormSend.find({'form_number': formNum}).exec(
        function (err, result) {
            if (err) {return next(err); }
            if (result == null) {
                res.status(400).json({message: "Form doesn't exist."})
            } else {
                res.status(200).json(result); 
            }
        }
    )
}
/* user must be logged in, req should have body with chattedUser
*/
exports.update_user_chatted = function (req, res, next) {
    User.findOne({"userLogin": req.user.username}).exec(
        function (err, result) {
            if (err) {return next(err); }
            var usersChatted = result.usersChatted
            usersChatted.push(req.body.chattedUser)
            var update = { users_chatted: usersChatted }
            User.findOneAndUpdate({'userLogin': req.user.username}, update, {}, 
            function (err, result) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.status(200).json({ 
                       message: "success!"});
                }
            )
        }
    )
}

exports.get_all_users = function(req, res, next) {
    User.find({}).select({first_name: 1, last_name: 1, userLogin: 1, _id: 0}).exec(
        function(err, result) {
            if (err) {return next(err); }
            res.status(200).json(result)
        }
    )
}

exports.get_all_users_with_participating = function(req, res, next) {
    User.find({}).select({first_name: 1, last_name: 1, userLogin: 1, chat_participating: 1, _id: 0}).exec(
        function(err, result) {
            if (err) {return next(err); }
            res.status(200).json(result)
        }
    )
}

const getPictureID = (req, res, next) => {
    User.findOne({'userLogin': req.user.username}).exec(
        function (err, result) {
            if (err) {
                next (err)
            }
            if (result) {
                if (result.profile_picture) {
                    req.picture_id = result.profile_picture
                }
            }
            next()
        }
    )
}

exports.post_update_propic = [imageMiddleware.post_upload_image, getPictureID, 
    imageMiddleware.delete_image, (req, res, next) => {
    User.findOne({'userLogin': req.user.username}).exec(
        function (err, result) {
            if (err) { return next(err) }
            if (req.uploaded_image) {
                const img = req.stored_image
                User.findOneAndUpdate({"userLogin": req.user.username}, {'profile_picture': img._id}, {}, function (err, user) {
                    if (err) { return next(err); }
                       // Successful - redirect to book detail page.
                       res.status(200).json(img.image_url)
                    });
            } else {
                res.status(400).json({'message': 'no picture received'})
            }
        }
    )
}]


exports.get_profile_picture = [getPictureID, imageMiddleware.get_picture, (req, res, next) => {
    if (req.image_url) {
        res.status(200).json(req.image_url)
    } else {
        res.status(400)
    }
}]

exports.post_generate_schedule = function (req, res, next) {
    User.findOne({'userLogin': req.user.username}).select({dates_blocked: 1, _id: 0}).exec(
        function (err, result) {
            let times_a = []
            if (err) { return next(err)}
            if (result) {
                times_a = result.dates_blocked
            }
            User.findOne({'userLogin': req.body.requested_user}).select({dates_blocked: 1, _id: 0}).exec(
                function (err, result2) {
                    let times_b = []
                    if (result2) {
                        times_b = result2.dates_blocked
                    }
                    let availTimes = calendarAlgorithm.generateAvailability(times_a, times_b)
                    res.status(200).json(availTimes)
                } 
            )
        }
    )
}