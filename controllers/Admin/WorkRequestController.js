// ################################ NPM Packages ################################ //
const jwt = require('jsonwebtoken');
const moment = require('moment');
const CryptoJS = require('crypto-js');
const axios = require('axios');
const crypto = require('crypto');
const fs = require("fs");
const fsPromises = fs.promises;
const { v7: uuidv7 } = require('uuid');

// ################################ Model ################################ //
const RequestedWorks = require('../../models/requestedWorks');
const Admins = require('../../models/admins');

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

/*
|------------------------------------------------ 
| API name          :  inProgressWorkRequestList
| Response          :  Respective response message in JSON format
| Logic             :  In-Progress Work Request List
| Request URL       :  BASE_URL/admin/in-progress_work_request_list
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
            let searchData = { status: { $ne: "completed" }, is_deleted: false };

            if (query.status && query.status != '') searchData.status = query.status;
            if (query.search && query.search != '') searchData.$or = [{ title: { $regex: query.search, $options: 'i' } }, { description: { $regex: query.search, $options: 'i' } }];

            const total = await RequestedWorks.countDocuments(searchData);

            if (query.lastID)
                searchData._id = { $gt: query.lastID };

            let inProgressWorkRequestList = await RequestedWorks.find(searchData).sort({ _id: 1 }).limit(limit);

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
| Request URL       :  BASE_URL/admin/completed_work_request_list
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
            let searchData = { status: { $eq: "completed" }, is_deleted: false };

            if (query.status && query.status != '') searchData.status = query.status;
            if (query.search && query.search != '') searchData.$or = [{ title: { $regex: query.search, $options: 'i' } }, { description: { $regex: query.search, $options: 'i' } }];

            const total = await RequestedWorks.countDocuments(searchData);

            if (query.lastID)
                searchData._id = { $gt: query.lastID };

            let inProgressWorkRequestList = await RequestedWorks.find(searchData).sort({ _id: 1 }).limit(limit);

            let responseData = inProgressWorkRequestList;

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
| Request URL       :  BASE_URL/admin/work_request_details
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
            let searchData = { _id: query.id, is_deleted: false };

            let workRequestData = await RequestedWorks.findOne(searchData);

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
| API name          :  assignWorkRequest
| Response          :  Respective response message in JSON format
| Logic             :  Assign Work Request
| Request URL       :  BASE_URL/admin/assign_work_request
| Request method    :  PUT
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.assignWorkRequest = (req, res) => {
    (async () => {
        let purpose = 'Assign Work Request';
        try {
            const userID = req.headers.userID;
            let body = req.body;

            let adminDetails = await Admins.findOne({ _id: body.assigned_to, is_deleted: false });

            if (!adminDetails) {
                return res.send({
                    status: 404,
                    msg: responseMessages.adminNotFound,
                    data: {},
                    purpose: purpose,
                });
            }
            
            let caseDetails = await RequestedWorks.findOne({ _id: body.id, status: { $ne: "completed" }, is_deleted: false });

            if (!caseDetails) {
                return res.send({
                    status: 404,
                    msg: responseMessages.workRequestNotFound,
                    data: {},
                    purpose: purpose,
                });
            }

            await RequestedWorks.updateOne({ _id: caseDetails._id }, { assigned_to: body.assigned_to });

            return res.send({
                status: 200,
                msg: responseMessages.workRequestAssign,
                data: {},
                purpose: purpose,
            });
        } catch (err) {
            console.log('Assign Work Request Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};