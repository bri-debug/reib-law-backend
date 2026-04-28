// ################################ NPM Packages ################################ //
const jwt = require('jsonwebtoken');
const moment = require('moment');
const CryptoJS = require('crypto-js');
const axios = require('axios');
const crypto = require('crypto');
const { v7: uuidv7 } = require('uuid');

// ################################ Model ################################ //
const Users = require('../../models/users');

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

// ################################ Globals ################################ //
const jwtOptionsAccess = global.constants.jwtAccessTokenOptions;
const jwtOptionsRefresh = global.constants.jwtRefreshTokenOptions;

/*
|------------------------------------------------ 
| API name          :  newUserCreate
| Response          :  Respective response message in JSON format
| Logic             :  Create New User
| Request URL       :  BASE_URL/api/registration
| Request method    :  POST
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.newUserCreate = (req, res) => {
    (async () => {
        let purpose = 'User New Registration';
        try {
            let body = req.body;
            const userEmail = body.email.trim().toLowerCase();

            let findUserInfo = await Users.findOne({ email: userEmail });

            if (findUserInfo)
                return res.send({
                    status: 404,
                    msg: responseMessages.duplicateEmail,
                    data: {},
                    purpose: purpose,
                });

            const userData = {
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

            let userCreateDetails = await Users.create(userData);

            let accessToken = jwt.sign({ user_id: userCreateDetails._id }, jwtOptionsAccess.secret, jwtOptionsAccess.options);
            let refreshToken = jwt.sign({ user_id: userCreateDetails._id }, jwtOptionsRefresh.secret, jwtOptionsRefresh.options);

            let responseData = userCreateDetails.toObject();
            responseData.access_token = accessToken;
            responseData.refresh_token = refreshToken;
            
            delete responseData.password;
            
            return res.send({
                status: 200,
                msg: responseMessages.registrationSuccess,
                data: responseData,
                purpose: purpose,
            });
        } catch (err) {
            console.log('User New Registration Error: ', err);
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
| API name          :  userLogin
| Response          :  Respective response message in JSON format
| Logic             :  User Login
| Request URL       :  BASE_URL/api/login
| Request method    :  POST
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.userLogin = (req, res) => {
    (async () => {
        let purpose = 'User Login';
        try {
            let body = req.body;

            let userDetails = await Users.findOne({ email: body.email, is_deleted: false });

            if (!userDetails) {
                return res.send({
                    status: 404,
                    msg: responseMessages.userNotFound,
                    data: {},
                    purpose: purpose,
                });
            }

            let password = CryptoJS.AES.decrypt(
                userDetails.password,
                global.constants.passCode_for_password
            ).toString(CryptoJS.enc.Utf8);

            if (body.password == password) {
                let accessToken = jwt.sign({ user_id: userDetails._id }, jwtOptionsAccess.secret, jwtOptionsAccess.options);
                let refreshToken = jwt.sign({ user_id: userDetails._id }, jwtOptionsRefresh.secret, jwtOptionsRefresh.options);

                let responseData = userDetails.toObject();
                responseData.access_token = accessToken;
                responseData.refresh_token = refreshToken;

                delete responseData.password;
                delete responseData.payment_intent_id;
                delete responseData.payment_url;
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
            console.log('User Login Error : ', err);
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
| Request URL       :  BASE_URL/api/forget_password
| Request method    :  PUT
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.forgetPassword = (req, res) => {
    (async () => {
        let purpose = "Forget Password";
        try {
            let body = req.body;
            
            let userDetails = await Users.findOne({ email: body.email, is_deleted: false });

            if (!userDetails) {
                return res.send({
                    status: 404,
                    msg: responseMessages.userNotFound,
                    data: {},
                    purpose: purpose
                })
            } else if (userDetails.status != "active") {
                return res.send({
                    status: 404,
                    msg: responseMessages.userInactived,
                    data: {},
                    purpose: purpose
                })
            }

            const otpValue = Math.floor(1000 + Math.random() * 9000);
            const now = Math.floor(Date.now() / 1000);
            const fiveMinFromNow = now + (5 * 60);
            
            await Users.updateOne({ _id: userDetails._id }, { $set: { otp: otpValue, otp_valid: fiveMinFromNow } });

            let mailData = {
                toEmail: userDetails.email,
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
                                            <p style="font-size:17px; font-weight:500; color:#000; line-height:24px;">Hi ${userDetails.name},</p>
                                            <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top: 20px;">Please use the following code to reset your password: <strong style="font-size:20px; color:#ff301e;"> ${otpValue}</strong> valid for <b>5 minutes</b></p>
                                            <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top: 20px;">If you don't recognize this activity, please reset your password
                                                immediately. You can also reach us by responding to this email.</p>
                                            <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top: 20px;">Thanks for your time,</p>
                                            <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top: 5px; font-weight: bold;">
                                                Reib Law</p>
                                        </th>
                                    </tr>
                                </table>
                            </div>
                        </body>`
            }

            // await axios.post(
            //     `${process.env.FORGET_PASSWORD_SEND_GHL_URL}`,
            //     mailData,
            //     {
            //         headers: {
            //             "Content-Type": "application/json",
            //             Accept: "application/json",
            //         },
            //     }
            // );

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
| Request URL       :  BASE_URL/api/reset_password
| Request method    :  PUT
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.resetPassword = (req, res) => {
    (async () => {
        let purpose = "Reset Password";
        try {
            let body = req.body;
            let userDetails = await Users.findOne({ otp: body.otp });

            if (userDetails) {
                const now = Math.floor(Date.now() / 1000);
                const otpValidTime = userDetails.otp_valid;
                
                if (otpValidTime < now)
                    return res.send({
                        status: 404,
                        msg: responseMessages.otpExpired,
                        data: {},
                        purpose: purpose
                    })
                
                const newPassword = CryptoJS.AES.encrypt(body.password, global.constants.passCode_for_password).toString();
                await Users.updateOne({ _id: userDetails._id }, { $set: { otp: null, otp_valid: null, password: newPassword } });

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
