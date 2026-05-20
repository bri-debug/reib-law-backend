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
const Users = require('../../models/users');
const Plans = require('../../models/plans');

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

/*
|------------------------------------------------ 
| API name          :  userPlanDetails
| Response          :  Respective response message in JSON format
| Logic             :  Fetch User Plan Details
| Request URL       :  BASE_URL/api/fetch_user_plan_details
| Request method    :  GET
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.userPlanDetails = (req, res) => {
    (async () => {
        let purpose = 'Fetch User Plan Details';
        try {
            const userID = req.headers.userID;

            let userDetails = await Users.findOne({ _id: userID });
            let findPlanDetails = await Plans.findOne({ _id: userDetails?.plan ?? "6a0de5798837a31011e2031c" });
            findPlanDetails.price = findPlanDetails.price[0];

            return res.send({
                status: 200,
                msg: responseMessages.planDetails,
                data: findPlanDetails,
                purpose: purpose,
            });
        } catch (err) {
            console.log('Fetch User Plan Details Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};