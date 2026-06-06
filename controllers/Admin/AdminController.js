// ################################ NPM Packages ################################ //
const moment = require('moment');

// ################################ Model ################################ //
const Admins = require('../../models/admins');

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

/*
|------------------------------------------------ 
| API name          :  adminList
| Response          :  Respective response message in JSON format
| Logic             :  Fetch Admin List
| Request URL       :  BASE_URL/admin/fetch_admin_list
| Request method    :  GET
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.adminList = (req, res) => {
    (async () => {
        let purpose = 'Fetch Admin List';
        try {
            let findAdminList = await Admins.find({ is_deleted: false }, '-password -otp -otp_valid -__v');

            return res.send({
                status: 200,
                msg: responseMessages.adminList,
                data: findAdminList,
                purpose: purpose,
            });
        } catch (err) {
            console.log('Fetch Admin List Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};