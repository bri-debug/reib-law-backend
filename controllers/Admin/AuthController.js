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
const TeamMembers = require('../../models/teamMembers');

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

// ################################ Globals ################################ //
const jwtOptionsAccess = global.constants.jwtAccessTokenOptions;
const jwtOptionsRefresh = global.constants.jwtRefreshTokenOptions;

/*
|------------------------------------------------ 
| API name          :  newAdminCreate
| Response          :  Respective response message in JSON format
| Logic             :  Create New Admin
| Request URL       :  BASE_URL/admin/admin_registration
| Request method    :  POST
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.newAdminCreate = (req, res) => {
    (async () => {
        let purpose = 'Create New Admin';
        try {
            let body = req.body;
            const userEmail = body.email.trim().toLowerCase();

            let findAdminInfo = await Admins.findOne({ email: userEmail });

            if (findAdminInfo)
                return res.send({
                    status: 404,
                    msg: responseMessages.duplicateEmail,
                    data: {},
                    purpose: purpose,
                });
            
            const adminData = {
                name: body.name,
                email: body.email,
                phone: body.phone,
                password: CryptoJS.AES.encrypt(
                    body.password,
                    global.constants.passCode_for_password
                ).toString(),
                status: 'active',
                is_deleted: false,
            };

            let adminCreateDetails = await Admins.create(adminData);
            let responseData = adminCreateDetails.toObject();

            let accessToken = jwt.sign({ user_id: responseData._id }, jwtOptionsAccess.secret, jwtOptionsAccess.options);
            let refreshToken = jwt.sign({ user_id: responseData._id }, jwtOptionsRefresh.secret, jwtOptionsRefresh.options);

            responseData.access_token = accessToken;
            responseData.refresh_token = refreshToken;
            delete responseData.password;

            return res.send({
                status: 200,
                msg: responseMessages.adminCreate,
                data: responseData,
                purpose: purpose,
            });
        } catch (err) {
            console.log('Create New Admin Error: ', err);
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
| API name          :  adminLogin
| Response          :  Respective response message in JSON format
| Logic             :  Admin Login
| Request URL       :  BASE_URL/admin/admin_login
| Request method    :  POST
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.adminLogin = (req, res) => {
    (async () => {
        let purpose = 'Admin Login';
        try {
            let body = req.body;

            let adminDetails = await Admins.findOne({ email: body.email, is_deleted: false });

            if (!adminDetails) {
                return res.send({
                    status: 404,
                    msg: responseMessages.adminNotFound,
                    data: {},
                    purpose: purpose,
                });
            }

            let password = CryptoJS.AES.decrypt(
                adminDetails.password,
                global.constants.passCode_for_password
            ).toString(CryptoJS.enc.Utf8);

            if (body.password == password) {
                let accessToken = jwt.sign({ user_id: adminDetails._id }, jwtOptionsAccess.secret, jwtOptionsAccess.options);
                let refreshToken = jwt.sign({ user_id: adminDetails._id }, jwtOptionsRefresh.secret, jwtOptionsRefresh.options);

                let responseData = adminDetails.toObject();
                responseData.access_token = accessToken;
                responseData.refresh_token = refreshToken;

                delete responseData.password;
                delete responseData.otp;
                delete responseData.otp_valid;

                return res.send({
                    status: 200,
                    msg: responseMessages.loginSuccess,
                    data: responseData,
                    purpose: purpose,
                });
            } else {
                return res.send({
                    status: 404,
                    msg: responseMessages.passwordUnmatch,
                    data: {},
                    purpose: purpose,
                });
            }
        } catch (err) {
            console.log('Admin Login Error : ', err);
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
| API name          :  forgetPassword
| Response          :  Respective response message in JSON format
| Logic             :  Forget Password
| Request URL       :  BASE_URL/admin/admin_forget_password
| Request method    :  PUT
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.forgetPassword = (req, res) => {
    (async () => {
        let purpose = "Forget Password";
        try {
            let body = req.body;
            let adminDetails = await Admins.findOne({ email: body.email, is_deleted: false });

            if (!adminDetails) {
                return res.send({
                    status: 404,
                    msg: responseMessages.adminNotFound,
                    data: {},
                    purpose: purpose
                })
            } else if (adminDetails.status != "active") {
                return res.send({
                    status: 404,
                    msg: responseMessages.adminInactived,
                    data: {},
                    purpose: purpose
                })
            }

            const otpValue = Math.floor(1000 + Math.random() * 9000);
            const now = Math.floor(Date.now() / 1000);
            const fiveMinFromNow = now + (5 * 60);
            
            await Admins.updateOne({ _id: adminDetails._id }, { $set: { otp: otpValue, otp_valid: fiveMinFromNow } });

            let mailData = {
                toEmail: adminDetails.email,
                subject: "We sent you an OTP to reset your password",
                html: `<body style="background: #dbdbdb;">
                            <div style="width:100%; max-width:600px; margin:0 auto; padding:40px 15px;">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0"
                                    style="padding:15px 0;text-align: center; background:#ffffff; border-bottom: 1px solid #e2e2e2;">
                                </table>
                                
                                <table width="100%" border="0" cellspacing="0" cellpadding="0"
                                    style="padding:60px 40px;text-align: left; background:#fff;">
                                    <tr>
                                        <th scope="col">
                                            <p style="font-size:17px; font-weight:500; color:#000; line-height:24px;">Hi ${adminDetails.name},</p>
                                            <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top: 20px;">Please use the following code to reset your password: <strong style="font-size:20px; color:#ff301e;"> ${otpValue}</strong> valid for <b>5 minutes</b></p>
                                            <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top: 20px;">If you don't recognize this activity, please reset your password
                                                immediately. You can also reach us by responding to this email.</p>
                                            <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top: 20px;">Thanks for your time,</p>
                                            <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top: 5px; font-weight: bold;">
                                                Reinstate Elite</p>
                                        </th>
                                    </tr>
                                </table>
                            </div>
                        </body>`
            }

            if (process.env.FORGET_PASSWORD_SEND_GHL_URL) {
                await axios.post(
                    process.env.FORGET_PASSWORD_SEND_GHL_URL,
                    mailData,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                    }
                );
            }

            return res.send({
                status: 200,
                msg: responseMessages.otpSend,
                data: {},
                purpose: purpose
            })
        } catch (e) {
            console.log("Forget Password Error : ", e);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })();
}

/*
|------------------------------------------------ 
| API name          :  resetPassword
| Response          :  Respective response message in JSON format
| Logic             :  Reset Password
| Request URL       :  BASE_URL/api/admin_reset_password
| Request method    :  PUT
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.resetPassword = (req, res) => {
    (async () => {
        let purpose = "Reset Password";
        try {
            let body = req.body;
            let adminDetails = await Admins.findOne({ otp: body.otp });

            if (adminDetails) {
                const now = Math.floor(Date.now() / 1000);
                const otpValidTime = adminDetails.otp_valid;

                if (otpValidTime < now)
                    return res.send({
                        status: 404,
                        msg: responseMessages.otpExpired,
                        data: {},
                        purpose: purpose
                    })
                
                const newPassword = CryptoJS.AES.encrypt(body.password, global.constants.passCode_for_password).toString();
                await Admins.updateOne({ _id: adminDetails._id }, { $set: { otp: null, otp_valid: null, password: newPassword } });

                return res.send({
                    status: 200,
                    msg: responseMessages.passwordreset,
                    data: {},
                    purpose: purpose
                })
            } else {
                return res.send({
                    status: 404,
                    msg: responseMessages.otpInvalid,
                    data: {},
                    purpose: purpose
                })
            }
        } catch (e) {
            console.log("Reset Password ERROR : ", e);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose
            })
        }
    })();
}

/*
|------------------------------------------------ 
| API name          :  getProfile
| Response          :  Respective response message in JSON format
| Logic             :  Fetch Logged In Admin Profile
| Request URL       :  BASE_URL/admin/profile
| Request method    :  GET
|------------------------------------------------
*/
module.exports.getProfile = (req, res) => {
    (async () => {
        let purpose = 'Admin Profile';
        try {
            const adminID = req.headers.userID;
            let adminDetails = await Admins.findOne({ _id: adminID, is_deleted: false });

            if (!adminDetails) {
                return res.send({
                    status: 404,
                    msg: responseMessages.adminNotFound,
                    data: {},
                    purpose: purpose,
                });
            }

            let responseData = adminDetails.toObject();
            delete responseData.password;
            delete responseData.otp;
            delete responseData.otp_valid;

            return res.send({
                status: 200,
                msg: responseMessages.fetchAdminDetails,
                data: responseData,
                purpose: purpose,
            });
        } catch (err) {
            console.log('Admin Profile Error : ', err);
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
| API name          :  updateProfile
| Response          :  Respective response message in JSON format
| Logic             :  Update Logged In Admin Profile
| Request URL       :  BASE_URL/admin/profile
| Request method    :  PUT
|------------------------------------------------
*/
module.exports.updateProfile = (req, res) => {
    (async () => {
        let purpose = 'Update Admin Profile';
        try {
            const adminID = req.headers.userID;
            let body = req.body;
            const normalizedEmail = body.email.trim().toLowerCase();

            let duplicateAdmin = await Admins.findOne({
                _id: { $ne: adminID },
                email: normalizedEmail,
                is_deleted: false,
            });

            if (duplicateAdmin) {
                return res.send({
                    status: 404,
                    msg: responseMessages.duplicateEmail,
                    data: {},
                    purpose: purpose,
                });
            }

            await Admins.updateOne(
                { _id: adminID, is_deleted: false },
                {
                    $set: {
                        name: body.name.trim(),
                        email: normalizedEmail,
                        phone: body.phone.trim(),
                        updatedAt: new Date(),
                    },
                }
            );

            let updatedAdmin = await Admins.findOne({ _id: adminID, is_deleted: false });
            let responseData = updatedAdmin.toObject();
            delete responseData.password;
            delete responseData.otp;
            delete responseData.otp_valid;

            return res.send({
                status: 200,
                msg: responseMessages.adminUpdate,
                data: responseData,
                purpose: purpose,
            });
        } catch (err) {
            console.log('Update Admin Profile Error : ', err);
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
| API name          :  listTeamMembers
| Response          :  Respective response message in JSON format
| Logic             :  Fetch Team Members
| Request URL       :  BASE_URL/admin/team_members
| Request method    :  GET
|------------------------------------------------
*/
module.exports.listTeamMembers = (req, res) => {
    (async () => {
        let purpose = 'Team Members List';
        try {
            const teamMembers = await TeamMembers.find({ is_deleted: false }).sort({ createdAt: -1 });
            const responseData = teamMembers.map((member) => {
                const item = member.toObject();
                delete item.password;
                delete item.otp;
                delete item.otp_valid;
                return item;
            });
            return res.send({
                status: 200,
                msg: responseMessages.fetchAdminList,
                data: responseData,
                purpose: purpose,
            });
        } catch (err) {
            console.log('Team Members List Error : ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};
