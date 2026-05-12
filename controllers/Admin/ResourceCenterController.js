// ################################ NPM Packages ################################ //
const moment = require('moment');
const path = require('path');

/* ############################################ Helpers ############################################ */
const commonFunctions = require('../../helpers/commonFunctions');

// ################################ Model ################################ //
const resourceCenterDocs = require('../../models/resourceCenterDocs');

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

/*
|------------------------------------------------ 
| API name          :  uploadTemplateDoc
| Response          :  Respective response message in JSON format
| Logic             :  Upload Template Documents
| Request URL       :  BASE_URL/admin/upload_template_doc
| Request method    :  POST
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.uploadTemplateDoc = (req, res) => {
    (async () => {
        let purpose = 'Upload Template Documents';
        try {
            const uploadPromises = (req.files || [req.file]).map(async (reqFile) => {
                const safeFilename = path.basename(reqFile.originalname);
                const url = await commonFunctions.uploadFile(
                    `template_doc/${safeFilename}`,
                    reqFile
                );
                return {
                    file_name: reqFile.originalname,
                    file_type: path.extname(reqFile.originalname).replace('.', ''),
                    url,
                };
        });

        const urls = await Promise.all(uploadPromises);
        for (let i = 0; i < urls.length; i++) {
            await resourceCenterDocs.create({
                title: urls[i].file_name,
                file_url: urls[i].url,
                file_type: urls[i].file_type,
                resource_type: 'Template'
            })
        }

        return res.send({
            status: 200,
            msg: responseMessages.fileUpload,
            data: urls,
            purpose: purpose,
        });
    } catch (err) {
        console.log('Upload Template Documents Error: ', err);
        return res.send({
            status: 500,
            msg: responseMessages.serverError,
            data: {},
            purpose: purpose,
        });
    }
}) ();
};