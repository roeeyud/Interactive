function validateFileInReq(req) {
    return typeof req.files === 'object' && typeof req.files.file === 'object' && typeof req.files.file.file === 'string';
}

module.exports = validateFileInReq;