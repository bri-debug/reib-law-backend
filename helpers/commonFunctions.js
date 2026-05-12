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

exports.uploadFileToS3 = async (base64String, s3FolderPath = '', filePath = null, fileExtention = '') => {
    const key = base64String.charAt(0);
    // console.log('base64String *********', base64String)
    // console.log('s3FolderPath *********', s3FolderPath)
    // console.log('filePath *********', filePath)
    // console.log('fileExtention *********', fileExtention)
    //return;
    // console.log('key*******', key)
    let ext = '';

    switch (key) {
        case '/':
            ext = 'jpg';
            break;
        case 'i':
            ext = 'png'
            break;
        case 'R':
            ext = 'gif'
            break;
        case 'J':
            ext = 'pdf';
            break;
        case 'd':
            ext = 'pdf';
        default:
            break;
    }

    var extension = base64String.split(';')[0].split('/')[1] || fileExtention;

    const buf = Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    if ((fileExtention == 'csv') || (fileExtention == 'xls')) {
        var fileName = Date.now() + "." + fileExtention;
    } else {
        var fileName = Date.now() + "." + extension;
    }


    // console.log('s3FolderPath', s3FolderPath)
    // console.log('fileName', fileName)
    const s3Key = createS3Key(s3FolderPath, fileName);
    //console.log('s3Key', s3Key)
    // const res = await s3.putObject({
    //     Body: buf,
    //     Bucket: process.env.AWS_S3_BUCKET,
    //     Key: s3Key
    // }).promise();
    
    const command = new PutObjectCommand({
        Body: buf,
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key
    });
    
    const res = await s3.send(command);

    //console.log("*********", res)
    if (filePath) {

        fs.unlink(filePath, (err) => {
            if (err) {
                console.log(err);

            } else {
                console.log(filePath + " deleted successfull")
            }
        })
    }

    if (res?.ETag) {
        return generatePublicS3Key(s3FolderPath, fileName);
    } else {
        return null;
    }
}

exports.directUploadFileToS3 = (file, s3Path) => {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET, // Your S3 bucket name
        Key: `${s3Path}/${file.filename}`, // Construct the dynamic file path
        Body: fileStream,
        ContentType: file.mimetype // Ensuring the correct content type
    };

    const upload = new Upload({
        client: s3, // Use the S3Client instance
        params: uploadParams,
    });

    // return s3.upload(uploadParams).promise().then(data => {
    //     // Return additional info if needed
    //     return {
    //         ...data,
    //         ContentType: file.mimetype // Include the content type in the response
    //     };
    // }).catch(err => {
    //     console.log(err);
    //     return false;
    // });

    return upload.done()
        .then(data => {
            // Return additional info if needed
            return {
                ...data,
                ContentType: file.mimetype // Include the content type in the response
            };
        }).catch(err => {
            console.log(err);
            return false;
        });
};

exports.deleteLocalFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Failed to delete local file: ${filePath}`, err);
        } else {
            // console.log(`Successfully deleted local file: ${filePath}`);
            return true;
        }
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