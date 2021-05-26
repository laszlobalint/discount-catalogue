'use strict';

const fs = require('fs');
import { conn } from '../../app';
import { getFilesizeInBytes } from '../utils/file.utils';
import { getImageMimeType } from '../utils/image.utils';
import {
    checkHashPassword,
    createPassword,
    randomTokenGenerator,
} from '../utils/password.utils';
import { SITES } from '../shared/constansts';

export default class User {
    constructor(user) {
        this.name = user.name;
        this.email = user.email;
        this.password = user.password;
        this.defaultSiteId = SITES.indexOf(user.defaultSite.toUpperCase());
    }

    static addUser(newUser, res) {
        const passwordData = createPassword(newUser.password);
        conn.query(
            'SELECT * FROM user WHERE email = ?',
            [newUser.email],
            function (err, result) {
                if (err) {
                    return res(err, null);
                }
                if (result.length > 0) {
                    res('Email address already in use!', null);
                } else {
                    conn.query(
                        'INSERT INTO `user`( `unique_id`, `name`, `email`, `encrypted_password`, `salt`, `created_at`, `updated_at`, `activation_token`, `default_site_id`) ' +
                            'VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)',
                        [
                            passwordData[0],
                            newUser.name,
                            newUser.email,
                            passwordData[1],
                            passwordData[2],
                            passwordData[3],
                            newUser.defaultSiteId,
                        ],
                        function (err, response) {
                            if (err) {
                                console.log('Error: ', err);
                                res(err, null, null);
                            } else {
                                res(null, response.insertId, passwordData[3]);
                            }
                        }
                    );
                }
            }
        );
    }

    static getUserById(id, res) {
        conn.query('SELECT * FROM user WHERE id = ?', [id], function (
            err,
            result
        ) {
            if (err) {
                console.log('Error: ', err);
                res(err, null);
            } else {
                res(null, result);
            }
        });
    }

    static getAllUsers(res) {
        conn.query(
            `SELECT id, name, email, created_at, updated_at, is_active, is_admin, default_site_id from user WHERE is_deleted = 0`,
            [],
            function (err, result) {
                if (err) {
                    console.log('Error: ', err);
                    res(err, null);
                } else {
                    res(null, result);
                }
            }
        );
    }

    static modifyUserById(id, updatedUser, res) {
        const passwordData = createPassword(updatedUser.password);
        conn.query(
            'UPDATE user SET name = ?, email = ?, encrypted_password = ?, salt = ?, updated_at = NOW(), default_site_id = ? WHERE id = ?',
            [
                updatedUser.name,
                updatedUser.email,
                passwordData[1],
                passwordData[2],
                updatedUser.defaultSiteId,
                id,
            ],
            function (err, result) {
                if (err) {
                    console.log('Error: ', err);
                    res(err, null);
                } else {
                    res(null, result);
                }
            }
        );
    }

    static modifyUserByIdAsAdmin(name, email, defaultSiteId, id, res) {
        conn.query(
            'UPDATE user SET name = ?, email = ?, updated_at = NOW(), default_site_id = ? WHERE id = ?',
            [name, email, SITES.indexOf(defaultSiteId.toUpperCase()), id],
            function (err, result) {
                if (err) {
                    console.log('Error: ', err);
                    res(err, null);
                } else {
                    res(null, result);
                }
            }
        );
    }

    static deleteUserById(id, email, password, res) {
        conn.query('SELECT * FROM user WHERE email = ?', [email], function (
            err,
            result
        ) {
            if (err) {
                return res(err, null);
            }
            if (result.length === 0) {
                res('Wrong email address given!', null);
            } else performUserDeletion(password, id, email, result, res);
        });
    }

    static deleteUserByIdAsAdmin(id, res) {
        conn.query(
            'UPDATE user SET is_deleted = 1 WHERE id = ?',
            [id],
            function (err, result) {
                if (err) {
                    res(err, null);
                } else {
                    res(null, result);
                }
            }
        );
    }

    static loginUserByEmailAndPassword(req, res) {
        conn.query(
            'SELECT * FROM user WHERE email = ? AND is_active = 1 AND is_deleted = 0',
            [req.body.email],
            function (err, result) {
                if (err) {
                    return res(err, null);
                }
                if (result.length === 0) {
                    res(
                        'Wrong email address given or you have not activated your profile! (Please, check your inbox for the activation email.)',
                        null
                    );
                } else {
                    const hashed_password = checkHashPassword(
                        req.body.password,
                        result[0].salt
                    ).passwordHash;
                    if (result[0].encrypted_password == hashed_password)
                        res(null, result[0]);
                    else res('Wrong user password given!', null);
                }
            }
        );
    }

    static activateUserByEmailToken(activationToken, res) {
        conn.query(
            'UPDATE user SET is_active = 1 WHERE activation_token = ?',
            [activationToken],
            function (err, result) {
                if (err) {
                    res(err, null);
                } else {
                    res(null, result);
                }
            }
        );
    }

    static requestResetUserPasswordByEmail(email, res) {
        conn.query('SELECT email FROM user WHERE email = ?', [email], function (
            err,
            result
        ) {
            if (err) {
                res(err, null);
            } else if (result.length == 0) {
                res('Email address is not registered!', null);
            } else {
                const token = randomTokenGenerator();
                conn.query(
                    'UPDATE user SET resetPasswordToken = ?, resetPasswordExpires = DATE_ADD(NOW(), INTERVAL 6 HOUR) WHERE email = ?',
                    [token, email],
                    function (err, result) {
                        if (err) {
                            res(err, null);
                        } else {
                            res(null, email, token);
                        }
                    }
                );
            }
        });
    }

    static validateResetPasswordTokenExpiration(token, res) {
        conn.query(
            `SELECT resetPasswordExpires FROM user WHERE resetPasswordToken = ?`,
            [token],
            function (err, result) {
                if (
                    result.length > 0 &&
                    new Date(result[0]['resetPasswordExpires']) < new Date()
                ) {
                    res('Token date expired!', null);
                } else if (result.length === 0) {
                    res('Non-existing token provided!', null);
                } else if (err) {
                    res(err, null);
                } else {
                    res(
                        null,
                        `Token is valid till ${new Date(
                            result[0]['resetPasswordExpires']
                        )}`
                    );
                }
            }
        );
    }

    static updateUserPasswordByEmailToken(
        resetPasswordToken,
        plainPassword,
        res
    ) {
        const passwordData = createPassword(plainPassword);
        conn.query(
            `UPDATE user SET encrypted_password = ?, salt = ?, updated_at = NOW(), resetPasswordToken = NULL, resetPasswordExpires = NULL
            WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()`,
            [passwordData[1], passwordData[2], resetPasswordToken],
            function (err, result) {
                if (err) {
                    res(err, null);
                } else {
                    res(null, result);
                }
            }
        );
    }

    static modifyUserProfilePicture(id, imagePath, res) {
        if (typeof imagePath === 'undefined' || imagePath.length === 0) {
            conn.query(
                'UPDATE user SET profile_picture = NULL WHERE id = ?',
                id,
                function (err, result) {
                    if (err) {
                        console.log('Error: ', err);
                        res(err, null);
                    } else {
                        res(null, result);
                    }
                }
            );
        } else performUserProfilePictureModification(imagePath, id, res);
    }

    static downloadUserProfilePicture(id, res) {
        conn.query(
            'SELECT profile_picture FROM user WHERE id = ?',
            id,
            function (error, blob) {
                if (error) {
                    res(error, null);
                } else if (blob[0]['profile_picture'] !== null) {
                    const imageData = blob[0]['profile_picture'];
                    getImageMimeType(imageData, function (imageMime) {
                        res(null, { imageData, imageMime });
                    });
                } else {
                    res(null, { message: 'No profile picture for the user!' });
                }
            }
        );
    }
}

function performUserDeletion(password, id, email, result, res) {
    const hashed_password = checkHashPassword(password, result[0].salt)
        .passwordHash;
    if (result[0].encrypted_password == hashed_password) {
        conn.query(
            'UPDATE user SET is_deleted = 1 WHERE id = ? AND email = ?',
            [id, email],
            function (err, result) {
                if (err) {
                    res(err, null);
                } else {
                    res(null, result);
                }
            }
        );
    } else res('Wrong user password given!', null);
}

function performUserProfilePictureModification(imagePath, id, res) {
    fs.open(imagePath, 'r', function (status, fd) {
        if (status) {
            console.log(status.message);
            return;
        }
        const fileSize = getFilesizeInBytes(imagePath);
        const buffer = Buffer.alloc(fileSize);
        fs.read(fd, buffer, 0, fileSize, 0, function (err, num) {
            conn.query(
                'UPDATE user SET profile_picture = ? WHERE id = ?',
                [buffer, id],
                function (err, result) {
                    if (err) {
                        console.log('Error: ', err);
                        res(err, null);
                    } else {
                        res(null, result);
                    }
                }
            );
        });
    });
}
