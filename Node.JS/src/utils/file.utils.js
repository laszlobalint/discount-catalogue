'use strict';

const crypto = require('crypto');
const fs = require('fs');

export function fileHash(filename, sha) {
    const hash = crypto.createHash('sha256');
    const input = fs.createReadStream('assets/' + filename);
    input.on('readable', () => {
        const data = input.read();
        if (data) hash.update(data);
        else {
            let sha256 = hash.digest('hex');
            sha(sha256);
        }
    });
}

export function getFilesizeInBytes(fileName) {
    return fs.statSync(fileName)['size'];
}

export function createNameForFile(sellerName, catalogueId, fileName) {
    return `${catalogueId}_${sellerName
        .replace(/\s/g, '-')
        .toLowerCase()}${fileName
        .substring(fileName.toString().indexOf('.'))
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')}`;
}
