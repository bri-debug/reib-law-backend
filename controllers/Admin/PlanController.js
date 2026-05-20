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
const Admins = require('../../models/admins');
const Plans = require('../../models/plans');

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

/*
|------------------------------------------------ 
| API name          :  newPlanCreate
| Response          :  Respective response message in JSON format
| Logic             :  Create New Plan
| Request URL       :  BASE_URL/admin/plan_create
| Request method    :  POST
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.newPlanCreate = (req, res) => {
    (async () => {
        let purpose = 'Create New Plan';
        try {
            let body = req.body;

            let findPlanInfo = await Plans.findOne({ title: body.title });

            if (findPlanInfo)
                return res.send({
                    status: 404,
                    msg: responseMessages.duplicatePlan,
                    data: {},
                    purpose: purpose,
                });
            
            const planData = {
                title: body.title,
                description: body.description,
                price: [
                    {
                        currency: 'usd',
                        amount: body.amount,
                        initiation_fee: body.initiation_fee,
                        type: 'monthly'
                    }
                ],
                benefits: body.benefits,
                is_deleted: false,
            };

            let planCreateDetails = await Plans.create(planData);
            let responseData = planCreateDetails.toObject();

            return res.send({
                status: 200,
                msg: responseMessages.planCreate,
                data: responseData,
                purpose: purpose,
            });
        } catch (err) {
            console.log('Create New Plan Error: ', err);
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
| API name          :  planList
| Response          :  Respective response message in JSON format
| Logic             :  Fetch Plan List
| Request URL       :  BASE_URL/admin/fetch_plan_list
| Request method    :  GET
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.planList = (req, res) => {
    (async () => {
        let purpose = 'Fetch Plan List';
        try {
            let findPlanList = await Plans.find({ is_deleted: false });

            return res.send({
                status: 200,
                msg: responseMessages.planList,
                data: findPlanList,
                purpose: purpose,
            });
        } catch (err) {
            console.log('Fetch Plan List Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};