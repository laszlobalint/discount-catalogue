'use strict';

import crypto from 'crypto';
import { v4 } from 'uuid';

export function checkHashPassword(userPassword, salt) {
    const passwordData = sha512(userPassword, salt);
    return passwordData;
}

export function createPassword(plain_password) {
    const uid = v4();
    const hash_data = saltHashPassword(plain_password);
    const password = hash_data.passwordHash;
    const salt = hash_data.salt;
    const activationToken = randomTokenGenerator();
    return [uid, password, salt, activationToken];
}

export function randomTokenGenerator() {
    return crypto.randomBytes(20).toString('hex');
}

function genRandomString(length) {
    return crypto
        .randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

function sha512(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value,
    };
}

function saltHashPassword(userPassword) {
    const salt = genRandomString(16);
    const passwordData = sha512(userPassword, salt);
    return passwordData;
}
