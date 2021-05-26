'use strict';

const fs = require('fs');
import { CATEGORIES, SITES } from '../shared/constansts';
import { conn } from '../../app';
import {
    createNameForFile,
    fileHash,
    getFilesizeInBytes,
} from '../utils/file.utils';

const SELECT_PROPERTIES_QUERY_PART = `SELECT catalogue.id, catalogue.seller, catalogue.address, catalogue.discount_rate, catalogue.valid_from, 
                                        catalogue.valid_till, catalogue.active, catalogue.url, catalogue.description`;
const LEFT_JOIN_QUERY_PART = `FROM catalogue LEFT JOIN attachment ON attachment.catalogue_id = catalogue.id `;
const INNER_JOIN_QUERY_PART = `INNER JOIN category ON catalogue.category_id = category.id INNER JOIN site ON catalogue.site_id = site.id`;
const ACTIVE_AND_VALID_QUERY_PART = `active = 1 AND (valid_from <= DATE(NOW()) OR valid_from IS NULL) AND (valid_till >= DATE(NOW()) OR valid_till IS NULL)`;
const INSERT_INTO_ATTACHMENT = `INSERT INTO attachment (catalogue_id, sha256, filename, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`;

export default class Catalogue {
    constructor(catalogueItem) {
        this.seller = catalogueItem.seller;
        this.categoryId = CATEGORIES.indexOf(catalogueItem.category);
        this.siteId = SITES.indexOf(catalogueItem.site.toUpperCase());
        this.address = catalogueItem.address;
        this.discountRate = catalogueItem.discountRate;
        this.validFrom = new Date(catalogueItem.validFrom);
        this.validTill =
            this.validFrom < new Date(catalogueItem.validTill)
                ? new Date(catalogueItem.validTill)
                : new Date(2099, 12, 31);
        this.active = catalogueItem.active ? 1 : 0;
        this.url = catalogueItem.url;
        this.description = catalogueItem.description;
        this.attachment = '';
        this.fileName = catalogueItem.fileName;
    }

    static addCatalogueItem(newItem, res) {
        conn.query(
            `INSERT INTO catalogue (seller, category_id, site_id, address, discount_rate, valid_from, valid_till, active, url, description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newItem.seller,
                newItem.categoryId,
                newItem.siteId,
                newItem.address,
                newItem.discountRate,
                newItem.validFrom,
                newItem.validTill,
                newItem.active,
                newItem.url,
                newItem.description,
            ],
            function (err, response) {
                if (err) {
                    console.log('Error: ', err);
                    res(err, null);
                } else {
                    if (isFileNamePresent(newItem)) {
                        newItem.attachment = createNameForFile(
                            newItem.seller,
                            response.insertId,
                            newItem.fileName
                        );
                        fs.rename(
                            'assets/_temporary',
                            'assets/' + newItem.attachment,
                            function (err) {
                                if (err) {
                                    console.log('Error: ' + err);
                                    res(err, null);
                                } else
                                    insertAttachmentValues(
                                        newItem,
                                        response,
                                        res
                                    );
                            }
                        );
                    } else {
                        res(null, response.insertId);
                    }
                }
            }
        );
    }

    static filterCatalogueByCustomConditions(siteIds, categoryIds, res) {
        let query = `${SELECT_PROPERTIES_QUERY_PART}, category.name AS category_id, site.name AS site_id, attachment.filename 
        AS attachment_file_name, attachment.sha256 AS sha256 ${LEFT_JOIN_QUERY_PART} ${INNER_JOIN_QUERY_PART} WHERE `;
        let filterQueries = [];
        if (isArrayNotEmpty(siteIds)) {
            filterQueries.push(getOptionsForQueryString(siteIds, 'site'));
        }
        if (isArrayNotEmpty(categoryIds)) {
            filterQueries.push(
                getOptionsForQueryString(categoryIds, 'category')
            );
        }
        performSearchQuery(filterQueries, query, res);
    }

    static getAllCatalogueItems(res) {
        conn.query(
            `${SELECT_PROPERTIES_QUERY_PART}, category.name AS category_name, site.name AS site_name ${LEFT_JOIN_QUERY_PART}
                ${INNER_JOIN_QUERY_PART}
                WHERE ${ACTIVE_AND_VALID_QUERY_PART}`,
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

    static modifyCatalogueItemById(id, modifiedItem, res) {
        conn.query(
            `UPDATE catalogue SET seller = ?, category_id = ?, site_id = ?, address = ?, discount_rate = ?, valid_from = ?, 
            valid_till = ?, active = ?, url = ?, description = ? WHERE id = ?`,
            [
                modifiedItem.seller,
                modifiedItem.categoryId,
                modifiedItem.siteId,
                modifiedItem.address,
                modifiedItem.discountRate,
                modifiedItem.validFrom,
                modifiedItem.validTill,
                modifiedItem.active,
                modifiedItem.url,
                modifiedItem.description,
                id,
            ],
            function (err, response) {
                if (err) {
                    console.log('Error: ', err);
                    res(err, null);
                } else {
                    if (isFileNamePresent(modifiedItem)) {
                        modifiedItem.attachment = createNameForFile(
                            modifiedItem.seller,
                            id,
                            modifiedItem.fileName
                        );
                        fs.rename(
                            'assets/_temporary',
                            'assets/' + modifiedItem.attachment,
                            function (err) {
                                if (err) {
                                    console.log('Error: ' + err);
                                    res(err, null);
                                } else
                                    modifyAttachentValues(
                                        modifiedItem,
                                        id,
                                        response,
                                        res
                                    );
                            }
                        );
                    } else {
                        res(null, response);
                    }
                }
            }
        );
    }

    static deleteCatalogueItemById(id, res) {
        conn.query(
            'UPDATE catalogue SET active = 0 WHERE id = ?',
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

    static fetchCategoryList(res) {
        conn.query(`SELECT * FROM category ORDER BY id`, [], function (
            err,
            categoryResult
        ) {
            if (err) {
                console.log('Error: ', err);
                res(err, null);
            } else {
                for (let i = 0; i < categoryResult.length; i++) {
                    CATEGORIES[i + 1] = categoryResult[i]['name'];
                }
                res(null, categoryResult);
            }
        });
    }

    static uploadCategoryItemAttachment(attachment, res) {
        fs.open(attachment.path, 'r', function (status, fd) {
            if (status) {
                console.log(status.message);
                return;
            }
            const fileSize = getFilesizeInBytes(attachment.path);
            const buffer = Buffer.alloc(fileSize);
            fs.read(fd, buffer, 0, fileSize, 0, function (err, num) {
                fs.writeFile('assets/_temporary', buffer, function (err) {
                    if (err) {
                        console.log('Error: ', err);
                        res(err, null);
                    } else {
                        res(null, 'The temporary file was saved locally!');
                    }
                });
            });
        });
    }
}

function getOptionsForQueryString(array, string) {
    const definedIds = [];
    if (!Array.isArray(array))
        siteIds = Array.from(array.replace(' ', '').split(','));
    array
        .filter((item) => isValueNumber(item))
        .forEach((element) => definedIds.push(element));
    if (isArrayNotEmpty(definedIds)) {
        let value = string + '.id IN (' + definedIds.join(', ') + ')';
        return value;
    }
}

function performSearchQuery(filterQueries, query, res) {
    if (isArrayNotEmpty(filterQueries))
        query += '(' + filterQueries.join(' AND ') + ')' + ' AND ';
    query += ACTIVE_AND_VALID_QUERY_PART;
    conn.query(query, [], function (err, result) {
        if (err) {
            console.log('Error: ', err);
            res(err, null);
        } else {
            res(null, result);
        }
    });
}

function isArrayNotEmpty(array) {
    return array && array.length !== 0;
}

function isValueNumber(value) {
    return value !== null && !isNaN(value);
}

function isFileNamePresent(modifiedItem) {
    return modifiedItem.fileName && modifiedItem.fileName.length > 0;
}

function insertAttachmentValues(newItem, response, res) {
    fileHash(newItem.attachment, function (sha256) {
        conn.query(
            INSERT_INTO_ATTACHMENT,
            [
                response.insertId,
                sha256,
                newItem.attachment,
                new Date(),
                new Date(),
            ],
            function (err, attachmentResponse) {
                if (err) {
                    console.log('Error: ', err);
                    res(err, null);
                }
                res(null, response.insertId);
            }
        );
    });
}

function modifyAttachentValues(modifiedItem, id, response, res) {
    fileHash(modifiedItem.attachment, function (sha256) {
        conn.query(
            'SELECT * FROM attachment WHERE catalogue_id = ?',
            id,
            function (err, r) {
                if (Array.isArray(r) && r.length > 0) {
                    conn.query(
                        `UPDATE attachment SET sha256 = ?, filename = ?, updated_at = ? WHERE catalogue_id = ?`,
                        [sha256, modifiedItem.attachment, new Date(), id],
                        function (err, attachmentResponse) {
                            if (err) {
                                console.log('Error: ', err);
                                res(err, null);
                            }
                            res(null, response);
                        }
                    );
                } else {
                    conn.query(
                        INSERT_INTO_ATTACHMENT,
                        [
                            id,
                            sha256,
                            modifiedItem.attachment,
                            new Date(),
                            new Date(),
                        ],
                        function (err, attachmentResponse) {
                            if (err) {
                                console.log('Error: ', err);
                                res(err, null);
                            }
                            res(null, response);
                        }
                    );
                }
            }
        );
    });
}
