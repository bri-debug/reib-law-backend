const fs = require("fs");
const path = require("path");
const multer = require('multer');

// ################################ Response Messages ################################ //
const responseMessages = require('../ResponseMessages');

const assetStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let filePath = 'uploads/';
        fs.mkdirSync(filePath, { recursive: true });
        cb(null, filePath)
    },
    filename: function (req, file, cb) {
        cb(null, 'Doc-' + Date.now() + path.extname(file.originalname))
    }
});

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "text/csv"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Only JPG, PNG, PDF allowed ${file.mimetype}`), false);
    }
};

const assetUpload = multer({ storage: assetStorage, fileFilter: fileFilter });

module.exports.uploadSingle = (req, res, next) => {

    assetUpload.single("file")(req, res, function (err) {

        if (err) {
            return res.send({
                status: 400,
                msg: responseMessages.fileTypeError,
                data: {},
                purpose: purpose,
            });
        }

        next();
    });
};

module.exports.uploadMultiple = (req, res, next) => {

    assetUpload.any()(req, res, function (err) {

        if (err) {
            return res.send({
                status: 400,
                msg: responseMessages.fileTypeError,
                data: {},
                purpose: 'Upload Documents',
            });
        }

        next();
    });
};