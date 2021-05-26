'use strict';

export function getImageMimeType(imageData, type) {
    let setType = 'image/unknown';
    if (imageData[0] === 0x89 && imageData[1] === 0x50 && imageData[2] === 0x4e)
        setType = 'image/png';
    if (imageData[0] === 0xff && imageData[1] === 0xd8 && imageData[2] === 0xff)
        setType = 'image/jpeg';
    if (imageData[0] === 0x47 && imageData[1] === 0x49 && imageData[2] === 0x46)
        setType = 'image/gif';
    type(setType);
}

export function getImageTypeIsValid(type) {
    const cleanType = type.trim().toString();
    return (
        cleanType.indexOf('jpeg') > -1 ||
        cleanType.indexOf('jpg') > -1 ||
        cleanType.indexOf('gif') > -1 ||
        cleanType.indexOf('png') > -1
    );
}
