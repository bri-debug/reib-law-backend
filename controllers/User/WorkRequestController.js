// ################################ NPM Packages ################################ //
const moment = require('moment');
const mongoose = require('mongoose');

/* ############################################ Helpers ############################################ */
const commonFunctions = require('../../helpers/commonFunctions');

// ################################ Model ################################ //
const RequestedWorks = require('../../models/requestedWorks');
const Users = require('../../models/users');

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

/*
|------------------------------------------------ 
| API name          :  createNewWorkRequest
| Response          :  Respective response message in JSON format
| Logic             :  Create New Work Request
| Request URL       :  BASE_URL/api/create_new_work_request
| Request method    :  POST
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.createNewWorkRequest = (req, res) => {
    (async () => {
        let purpose = 'Create New Work Request';
        try {
            const userID = req.headers.userID;
            let body = req.body;

            const submitData = {
                created_by: userID,
                workspace_id: body.workspace_id,
                type: body.type,
                title: body.title,
                description: body.description,
                client_name: body.client_name,
                email: body.email,
                phone: body.phone,
                sla: body.sla,
                priority: body.priority,
                files: body.files,
                status: 'active',
                is_deleted: false,
            };

            let createdWorkRequest = await RequestedWorks.create(submitData);

            let responseData = createdWorkRequest.toObject();

            return res.send({
                status: 200,
                msg: responseMessages.workRequestCreate,
                data: responseData,
                purpose: purpose,
            });
        } catch (err) {
            console.log('Create New Work Request Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};

/*
|------------------------------------------------ 
| API name          :  inProgressWorkRequestList
| Response          :  Respective response message in JSON format
| Logic             :  In-Progress Work Request List
| Request URL       :  BASE_URL/api/in-progress_work_request_list
| Request method    :  GET
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.inProgressWorkRequestList = (req, res) => {
    (async () => {
        let purpose = 'In-Progress Work Request List';
        try {
            const userID = req.headers.userID;
            let query = req.query;
            const limit = 25;
            let searchData = { workspace_id: new mongoose.Types.ObjectId(query.workspace_id), status: { $ne: "completed" }, is_deleted: false };

            if (query.status && query.status != '') searchData.status = query.status;
            if (query.search && query.search != '') searchData.$or = [{ title: { $regex: query.search, $options: 'i' } }, { description: { $regex: query.search, $options: 'i' } }];

            const total = await RequestedWorks.countDocuments(searchData);

            if (query.lastID)
                searchData._id = { $gt: query.lastID };
            
            // let inProgressWorkRequestList = await RequestedWorks.find(searchData).sort({ _id: 1 }).limit(limit);
            let inProgressWorkRequestList = await RequestedWorks.aggregate([
                {
                    $match: searchData
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "created_by",
                        foreignField: "_id",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    email: 1
                                }
                            }
                        ],
                        as: "created_by"
                    }
                },
                {
                    $unwind: "$created_by"
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $limit: limit
                }
            ]);

            let responseData = inProgressWorkRequestList;

            return res.send({
                status: 200,
                msg: responseMessages.activeWorkRequestList,
                data: {
                    workRequestList: responseData,
                    lastID: responseData.length > 0 ? responseData[responseData.length - 1]._id : null,
                    limit,
                    totalData: total
                },
                purpose: purpose,
            });
        } catch (err) {
            console.log('In-Progress Work Request List Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};

/*
|------------------------------------------------ 
| API name          :  completedWorkRequestList
| Response          :  Respective response message in JSON format
| Logic             :  Completed Work Request List
| Request URL       :  BASE_URL/api/completed_work_request_list
| Request method    :  GET
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.completedWorkRequestList = (req, res) => {
    (async () => {
        let purpose = 'Completed Work Request List';
        try {
            const userID = req.headers.userID;
            let query = req.query;
            const limit = 25;
            let searchData = { workspace_id: new mongoose.Types.ObjectId(query.workspace_id), status: { $eq: "completed" }, is_deleted: false };

            if (query.status && query.status != '') searchData.status = query.status;
            if (query.search && query.search != '') searchData.$or = [{ title: { $regex: query.search, $options: 'i' } }, { description: { $regex: query.search, $options: 'i' } }];

            const total = await RequestedWorks.countDocuments(searchData);

            if (query.lastID)
                searchData._id = { $gt: query.lastID };

            // let completedWorkRequestList = await RequestedWorks.find(searchData).sort({ _id: 1 }).limit(limit);
            let completedWorkRequestList = await RequestedWorks.aggregate([
                {
                    $match: searchData
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "created_by",
                        foreignField: "_id",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    email: 1
                                }
                            }
                        ],
                        as: "created_by"
                    }
                },
                {
                    $unwind: "$created_by"
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $limit: limit
                }
            ]);

            let responseData = completedWorkRequestList;

            return res.send({
                status: 200,
                msg: responseMessages.completedWorkRequestList,
                data: {
                    workRequestList: responseData,
                    lastID: responseData.length > 0 ? responseData[responseData.length - 1]._id : null,
                    limit,
                    totalData: total
                },
                purpose: purpose,
            });
        } catch (err) {
            console.log('Completed Work Request List Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};

/*
|------------------------------------------------ 
| API name          :  workRequestDetails
| Response          :  Respective response message in JSON format
| Logic             :  Work Request Details
| Request URL       :  BASE_URL/api/work_request_details
| Request method    :  GET
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.workRequestDetails = (req, res) => {
    (async () => {
        let purpose = 'Work Request Details';
        try {
            const userID = req.headers.userID;
            let query = req.query;
            let searchData = { _id: new mongoose.Types.ObjectId(query.id), workspace_id: new mongoose.Types.ObjectId(query.workspace_id), is_deleted: false };

            // let workRequestData = await RequestedWorks.findOne(searchData);

            let workRequestData = await RequestedWorks.aggregate([
                {
                    $match: searchData
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "created_by",
                        foreignField: "_id",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    email: 1
                                }
                            }
                        ],
                        as: "created_by"
                    }
                },
                {
                    $unwind: "$created_by"
                }
            ]);

            if (!workRequestData)
                return res.send({
                    status: 404,
                    msg: responseMessages.workRequestNotFound,
                    data: {},
                    purpose: purpose
                });

            return res.send({
                status: 200,
                msg: responseMessages.completedWorkRequestList,
                data: workRequestData,
                purpose: purpose,
            });
        } catch (err) {
            console.log('Work Request Details Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};

/*
|------------------------------------------------ 
| API name          :  uploadDoc
| Response          :  Respective response message in JSON format
| Logic             :  Upload Documents
| Request URL       :  BASE_URL/api/upload_work_doc
| Request method    :  POST
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.uploadDoc = (req, res) => {
    (async () => {
        let purpose = 'Upload Documents';
        try {
            const uploadPromises = (req.files || [req.file]).map((reqFile) => {
                return new Promise((resolve, reject) => {
                    resolve(commonFunctions.uploadFile(`work_request_doc/${reqFile.originalname}`, reqFile));
                });
            });

            const urls = await Promise.all(uploadPromises);

            return res.send({
                status: 200,
                msg: responseMessages.fileUpload,
                data: urls,
                purpose: purpose,
            });
        } catch (err) {
            console.log('Upload Documents Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};