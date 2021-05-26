'use strict';

const config = require('../../config');
const formidable = require('formidable');
const middleware = require('../shared/middleware');
import { getImageTypeIsValid } from '../utils/image.utils';
import { errorMessages } from '../models/error-model';
import jwt from 'jsonwebtoken';
import {
    sendPasswordResetEmail,
    sendRegistrationEmail,
} from '../utils/email.utils';
import User from '../models/user-model.js';
import validateFormData from '../utils/validator.utils';

export function create_user(req, res) {
    const errorMessages = validateFormData(
        req.body.name,
        req.body.email,
        req.body.password,
        req.body.defaultSite
    );
    if (errorMessages.length > 0) {
        res.status(401).send(errorMessages);
        return;
    } else {
        const newUser = new User(req.body);
        User.addUser(newUser, function (err, insertId, activationToken) {
            if (err) {
                res.status(400).send(err);
                return;
            } else {
                res.status(200).send(
                    `Inserted new user with the ID: ${insertId}. Email message sent to your address!`
                );
                sendRegistrationEmail(
                    newUser.email,
                    newUser.name,
                    activationToken
                );
                return;
            }
        });
    }
}

export function read_user(req, res) {
    const id = middleware.getIdForRequest(req);
    User.getUserById(id, function (err, user) {
        if (err) {
            res.status(400).send(err);
            return;
        } else {
            res.json({ user });
            return;
        }
    });
}

export function read_all_users(req, res) {
    User.getAllUsers(function (err, users) {
        if (err) {
            res.status(400).send(err);
            return;
        } else {
            res.json({ users });
            return;
        }
    });
}

export function update_user(req, res) {
    const errorMessages = validateFormData(
        req.body.name,
        req.body.email,
        req.body.password,
        req.body.defaultSite
    );
    if (errorMessages.length > 0) {
        res.status(401).send(errorMessages);
        return;
    } else {
        const updatedUser = new User(req.body);
        const id = middleware.getIdForRequest(req);
        User.modifyUserById(id, updatedUser, function (err, resp) {
            if (err) {
                res.status(400).send(err);
                return;
            } else {
                jwt.sign(
                    {
                        id: req.decodedJWT.id,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        default_site_id: updatedUser.default_site_id,
                        is_admin: req.decodedJWT.is_admin,
                    },
                    config.tokenKey,
                    { expiresIn: config.tokenExpiration },
                    (err, token) => {
                        res.json({
                            token,
                            message: 'User profile updated successfully!',
                        });
                    }
                );
                return;
            }
        });
    }
}

export function update_user_as_admin(req, res) {
    const id = middleware.getIdForRequest(req);
    User.modifyUserByIdAsAdmin(
        req.body.name,
        req.body.email,
        req.body.defaultSite,
        id,
        function (err, resp) {
            if (err) {
                res.status(400).send(err);
                return;
            } else {
                res.status(200).send({
                    message: `User profile successfully updated for ${req.body.email}!`,
                });
                return;
            }
        }
    );
}

export function delete_user(req, res) {
    const id = middleware.getIdForRequest(req);
    User.deleteUserById(id, req.body.email, req.body.password, function (
        err,
        response
    ) {
        if (err) {
            res.status(400).send(err);
            return;
        } else if (response.affectedRows === 0 && response.changedRows === 0) {
            res.status(404).send(
                'User not found or could not be deleted with the provided ID!'
            );
            return;
        } else {
            res.status(200).send(
                `User with email ${req.body.email} successfully deleted!`
            );
            return;
        }
    });
}

export function delete_user_as_admin(req, res) {
    User.deleteUserByIdAsAdmin(req.params.id, function (err, response) {
        if (err) {
            res.status(400).send(err);
            return;
        } else if (response.affectedRows === 0 && response.changedRows === 0) {
            res.status(404).send(
                'User not found or could not be deleted with the provided ID!'
            );
            return;
        } else {
            res.status(200).send(
                `User with ID ${req.params.id} successfully deleted!`
            );
            return;
        }
    });
}

export function login_user(req, res) {
    User.loginUserByEmailAndPassword(req, function (err, user) {
        if (err) {
            res.status(400).send(err);
            return;
        } else {
            jwt.sign(
                {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    default_site_id: user.default_site_id,
                    is_admin: user.is_admin,
                },
                config.tokenKey,
                { expiresIn: config.tokenExpiration },
                (err, token) => {
                    res.json({ token });
                }
            );
            return;
        }
    });
}

export function activate_a_user(req, res) {
    User.activateUserByEmailToken(req.params.token, function (err, response) {
        if (err) {
            res.status(400).send(err);
            return;
        } else if (response.changedRows == 0) {
            res.status(403).send(errorMessages.get(403));
        } else {
            res.status(200).send('User successfully activated!');
            return;
        }
    });
}

export function request_password_reset(req, res) {
    User.requestResetUserPasswordByEmail(req.body.email, function (
        err,
        email,
        token
    ) {
        if (err) {
            res.status(400).send(err);
            return;
        } else {
            res.status(200).send(
                `Your request to reset password was sent to ${email} address!`
            );
            sendPasswordResetEmail(email, token);
            return;
        }
    });
}

export function validate_reset_password_token(req, res) {
    User.validateResetPasswordTokenExpiration(req.params.token, function (
        err,
        response
    ) {
        if (err) {
            if (err.indexOf('expired') !== -1) {
                res.status(403).send(errorMessages.get(403));
                return;
            }
            if (err.indexOf('Non-existing') !== -1) {
                res.status(404).send(errorMessages.get(404));
                return;
            }
            res.status(400).send(err);
            return;
        } else {
            res.status(200).send(response);
            return;
        }
    });
}

export function reset_user_password(req, res) {
    User.updateUserPasswordByEmailToken(
        req.params.token,
        req.body.password,
        function (err, response) {
            if (err) {
                res.status(400).send(err);
                return;
            } else if (response.changedRows == 0) {
                res.status(403).send(errorMessages.get(403));
            } else {
                res.status(200).send('User password successfully updated!');
                return;
            }
        }
    );
}

export function modify_user_picture(req, res) {
    const form = new formidable.IncomingForm();
    const id = middleware.getIdForRequest(req);
    form.parse(req, function (err, fields, files) {
        const path =
            files.picture && files.picture.path
                ? files.picture.path
                : undefined;
        if (
            typeof files.picture !== 'undefined' &&
            !getImageTypeIsValid(files.picture.type)
        ) {
            res.status(405).send(
                'This format is not allowed! Please, upload file with .png, .gif, .jpg. or .jpeg'
            );
            return;
        } else {
            applyModifyUserProfilePicture(res, id, path);
        }
    });
}

function applyModifyUserProfilePicture(res, id, path) {
    User.modifyUserProfilePicture(id, path, function (err, resp) {
        if (err) {
            res.status(400).send(err);
            return;
        } else {
            res.status(200).send(`Modified picture for the user profile!`);
            return;
        }
    });
}

export function download_user_picture(req, res) {
    const id = middleware.getIdForRequest(req);
    User.downloadUserProfilePicture(id, function (err, resp) {
        if (err) {
            res.status(400).send(err);
            return;
        } else if (resp.message) {
            res.status(200).send(resp);
            return;
        } else {
            res.type(resp.imageMime).status(200).send(resp.imageData);
            return;
        }
    });
}
