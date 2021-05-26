'use strict';

const validator = require('validator');

export default function validateFormData(name, email, password, defaultSite) {
    let errorMessage = '';
    !validator.isLength(name, { min: 2, max: 100 })
        ? (errorMessage +=
              'Name has to be minimum 2 and maximum 100 characters long. \n')
        : (errorMessage += '');

    validator.isEmpty(name)
        ? (errorMessage += 'Name cannot be left blank. \n')
        : (errorMessage += '');

    !validator.isEmail(email)
        ? (errorMessage += 'Email address has to be in correct email form. \n')
        : (errorMessage += '');

    !validator.isLength(password, { min: 8, max: 100 })
        ? (errorMessage +=
              'Password has to be minimum 8 and maximum 100 characters long. \n')
        : (errorMessage += '');

    !validator.isAlphanumeric(password, ['en-US'])
        ? (errorMessage +=
              'Name can only contain number and letters in English (GB). \n')
        : (errorMessage += '');

    !validator.isLength(defaultSite, { min: 3, max: 50 })
        ? (errorMessage += 'Site field cannot be left blank. \n')
        : (errorMessage += '');
    return errorMessage;
}
