const fs = require("fs");
const path = require("path");
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
// const { createS3Key, generatePublicS3Key } = require('./Utils');

const params = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

// const s3 = new AWS.S3(params)
const s3 = new S3Client({
    region: process.env.AWS_DEFAULT_REGION_NAME,
    credentials: params,
});

// ################################ Response Messages ################################ //
const responseMessages = require('../ResponseMessages');

const assetStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.resolve('uploads');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const safeExt = path.extname(path.basename(file.originalname)).replace(/[^a-zA-Z0-9.]/g, '');
        cb(null, 'Doc-' + Date.now() + safeExt);
    }
});

const assetUpload = multer({ storage: assetStorage });

module.exports.uploadSingle = (req, res, next) => {

    assetUpload.single("file")(req, res, function (err) {

        if (err) {
            return res.send({
                status: 400,
                msg: responseMessages.fileTypeError,
                data: {},
                // purpose: purpose,
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

exports.uploadFile = async (filePath, file) => {
  try {
    const body = file.buffer || fs.createReadStream(file.path);
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: filePath,
      Body: body,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_DEFAULT_REGION_NAME}.amazonaws.com/${filePath}`;
  } catch (err) {
    console.error("Upload failed:", err);
    throw err;
  }
}