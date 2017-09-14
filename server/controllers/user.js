// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
import User from "../models/user";
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const fs = require('fs');

// Create a new error handling controller method
var getErrorMessage = function (err) {
    // Define the error message variable
    var message = '';

    // If an internal MongoDB error occurs get the error message
    if (err.code) {
        switch (err.code) {
            // If a unique index error occurs set the message error
            case 11000:
            case 11001:
                message = 'Username already exists';
                break;
                // If a general error occurs set the message error
            default:
                message = 'Something went wrong';
        }
    } else {
        // Grab the first error message from a list of possible errors
        for (var errName in err.errors) {
            if (err.errors[errName].message) message = err.errors[errName].message;
        }
    }

    // Return the message error
    return message;
};
/**
 * Validate the login form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateLoginForm(payload) {
    const errors = {};
    let isFormValid = true;
    let message = '';

    if (!payload || typeof payload.email !== 'string' || payload.email.trim().length === 0) {
        isFormValid = false;
        errors.email = 'Please provide your email address.';
    }

    if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
        isFormValid = false;
        errors.password = 'Please provide your password.';
    }

    if (!isFormValid) {
        message = 'Check the form for errors.';
    }

    return {
        success: isFormValid,
        message,
        errors
    };
}
exports.signin = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        console.log('info', info);
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json(info);
        }

        const payload = {
            sub: user._id
        };

        // sign with RSA SHA256
        var cert = fs.readFileSync('../confi/jwtRS256.key'); // get private key
        
        // create a token string
        const token = jwt.sign(payload, cert);
        const data = {
            name: user.name
        };

        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.json({
                success: true,
                message: 'You have successfully logged in!',
                token,
                user: data
            });
        });
    })(req, res, next);
}
// Create a new controller method that creates new 'regular' users
exports.signup = function (req, res, next) {

    // If user is not connected, create and login a new user, otherwise redirect the user back to the main application page
    if (!req.user) {
        // Create a new 'User' model instance
        var user = new User(req.body);
        var message = null;

        // Set the user provider property
        user.provider = 'local';

        // Try saving the new user document
        user.save(function (err) {
            // If an error occurs, use flash messages to report the error
            if (err) {
                // Use the error handling method to get the error message
                var message = getErrorMessage(err);

                return res.status(400).json({
                    message: message
                });
            }

            // If the user was created successfully use the Passport 'login' method to login
            req.login(user, function (err) {
                // If a login error occurs move to the next middleware
                if (err) return next(err);

                return res.status(200).json({
                    message: "User was created successfully"
                });
            });
        });
    } else {
        return res.redirect('/');
    }
};

// Create a new controller method that creates new 'OAuth' users
exports.saveOAuthUserProfile = function (req, profile, done) {
    // Try finding a user document that was registered using the current OAuth provider
    User.findOne({
        provider: profile.provider,
        providerId: profile.providerId
    }, function (err, user) {
        // If an error occurs continue to the next middleware
        if (err) {
            return done(err);
        } else {
            // If a user could not be found, create a new user, otherwise, continue to the next middleware
            if (!user) {
                // Set a possible base username
                var possibleUsername = profile.username || ((profile.email) ? profile.email.split('@')[0] : '');

                // Find a unique available username
                User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
                    // Set the available user name
                    profile.username = availableUsername;

                    // Create the user
                    user = new User(profile);

                    // Try saving the new user document
                    user.save(function (err) {
                        // Continue to the next middleware
                        return done(err, user);
                    });
                });
            } else {
                // Continue to the next middleware
                return done(err, user);
            }
        }
    });
};

// Create a new controller method for signing out
exports.signout = function (req, res) {
    // Use the Passport 'logout' method to logout
    req.logout();

    // Redirect the user back to the main application page
    res.redirect('/');
};

// Create a new controller middleware that is used to authorize authenticated operations
exports.requiresLogin = function (req, res, next) {
    // If a user is not authenticated send the appropriate error message
    if (!req.isAuthenticated()) {
        return res.status(401).send({
            message: 'User is not logged in'
        });
    }

    // Call the next middleware
    next();
};
exports.userByID = function (req, res, next, id) {
    User.findOne({
        _id: id
    }, function (err, user) {
        if (err) {
            return next(err);
        } else {
            req.user = user;
            next();
        }
    });
};
