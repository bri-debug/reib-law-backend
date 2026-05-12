// ################################ NPM Packages ################################ //
const moment = require('moment');

/* ############################################ Helpers ############################################ */
const commonFunctions = require('../../helpers/commonFunctions');

// ################################ Model ################################ //
const RequestedWorks = require('../../models/requestedWorks');
const resourceCenterDocs = require('../../models/resourceCenterDocs');

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

/*
|------------------------------------------------ 
| API name          :  templateList
| Response          :  Respective response message in JSON format
| Logic             :  Template List
| Request URL       :  BASE_URL/api/template_list
| Request method    :  GET
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.templateList = (req, res) => {
    (async () => {
        let purpose = 'Template List';
        try {
            const userID = req.headers.userID;
            let query = req.query;
            const limit = 51;
            let searchData = { resource_type: 'Template', is_deleted: false };

            const total = await resourceCenterDocs.countDocuments(searchData);

            if (query?.lastID)
                searchData._id = { $gt: query.lastID };

            let templateList = await resourceCenterDocs.find(searchData).sort({ _id: 1 }).limit(limit);

            let responseData = templateList;

            return res.send({
                status: 200,
                msg: responseMessages.completedWorkRequestList,
                data: {
                    templateList: responseData,
                    lastID: responseData.length > 0 ? responseData[responseData.length - 1]._id : null,
                    limit,
                    totalData: total
                },
                purpose: purpose,
            });
        } catch (err) {
            console.log('Template List Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};