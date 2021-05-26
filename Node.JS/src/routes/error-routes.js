'use strict';

export default function (router) {
    const errors = require('../controllers/error-controller');

    // No role required
    router.get('*', errors.not_found_error);
}
