'use strict';

const formidable = require('formidable');
import Catalogue from '../models/catalogue-model';
import { errorMessages } from '../models/error-model';

export function create_catalogue_item(req, res) {
    const newItem = new Catalogue(req.body);
    Catalogue.addCatalogueItem(newItem, function (err, insertId) {
        if (err) {
            res.status(400).send(err);
            return;
        } else {
            res.status(200).send(
                `Picked up new catalogue item with the ID: ${insertId}.`
            );
            return;
        }
    });
}

export function upload_catalogue_item_attachment(req, res) {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (typeof files.attachment !== 'undefined') {
            Catalogue.uploadCategoryItemAttachment(files.attachment, function (
                err,
                uploadResult
            ) {
                if (err) {
                    res.status(400).send(err);
                    return;
                } else {
                    res.status(200).send(uploadResult);
                    return;
                }
            });
        }
    });
}

export function read_catalogue_items_by_custom_conditions(req, res) {
    Catalogue.filterCatalogueByCustomConditions(
        req.body.siteIds,
        req.body.categoryIds,
        function (err, filteredResults) {
            if (err) {
                res.status(400).send(err);
                return;
            } else {
                res.json({ filterResult: filteredResults });
                return;
            }
        }
    );
}

export function read_all_catalogue_items(req, res) {
    Catalogue.getAllCatalogueItems(function (err, catalogues) {
        if (err) {
            res.status(400).send(err);
            return;
        } else {
            res.json({ catalogues });
            return;
        }
    });
}

export function update_catalogue_item(req, res) {
    const updatedItem = new Catalogue(req.body);
    Catalogue.modifyCatalogueItemById(req.params.id, updatedItem, function (
        err,
        resp
    ) {
        if (err) {
            res.status(400).send(err);
            return;
        } else {
            res.status(200).send('Catalogue item updated successfully!');
            return;
        }
    });
}

export function delete_catalogue_item(req, res) {
    Catalogue.deleteCatalogueItemById(req.params.id, function (err, response) {
        if (err) {
            res.status(400).send(err);
            return;
        } else if (response.affectedRows === 0 && response.changedRows === 0) {
            res.status(404).send(errorMessages.get(404));
            return;
        } else {
            res.status(200).send(
                `Catalogue item with ${req.params.id} ID successfully deleted!`
            );
            return;
        }
    });
}

export function fetch_category_list(req, res) {
    Catalogue.fetchCategoryList(function (err, categoryList) {
        if (err) {
            res.status(400).send(err);
            return;
        } else {
            res.json({ categoryList });
            return;
        }
    });
}
