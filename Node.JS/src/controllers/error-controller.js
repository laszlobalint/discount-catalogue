'use strict';

import { errorMessages } from '../models/error-model';

export function not_found_error(req, res) {
    res.status(404).send(errorMessages.get(404));
    return;
}
