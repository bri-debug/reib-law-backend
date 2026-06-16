// ################################ NPM Packages ################################ //
const jwt = require('jsonwebtoken');
const moment = require('moment');
const CryptoJS = require('crypto-js');
const axios = require('axios');
const crypto = require('crypto');
const { v7: uuidv7 } = require('uuid');

// ################################ Model ################################ //
const Users = require('../../models/users');
const Workspaces = require('../../models/workspaces');
const WorkspaceMembers = require('../../models/workspaceMembers');

/* ############################################ Helpers ############################################ */
const commonFunctions = require('../../helpers/commonFunctions');

// ################################ Response Messages ################################ //
const responseMessages = require('../../ResponseMessages');

// ################################ Globals ################################ //
const jwtOptionsAccess = global.constants.jwtAccessTokenOptions;
const jwtOptionsRefresh = global.constants.jwtRefreshTokenOptions;

/*
|------------------------------------------------ 
| API name          :  newMemberAdd
| Response          :  Respective response message in JSON format
| Logic             :  New Member Add
| Request URL       :  BASE_URL/api/member_add
| Request method    :  POST
| Author            :  Mainak Saha
|------------------------------------------------
*/
module.exports.newMemberAdd = (req, res) => {
    (async () => {
        let purpose = 'New Member Add';
        try {
            let body = req.body;
            const userEmail = body.email.trim().toLowerCase();

            const workspaceDetails = await Workspaces.findById(body.workspace_id);

            if (!workspaceDetails) {
                return res.send({
                    status: 404,
                    msg: responseMessages.workspaceNotFound,
                    data: {},
                    purpose,
                });
            }

            let findUserInfo = await Users.findOne({ email: userEmail });
            let userCreated = false;

            if (!findUserInfo) {
                const userData = {
                    name: body.name,
                    email: body.email,
                    password: CryptoJS.AES.encrypt(
                        process.env.MEMBER_CREATE_PASSWORD,
                        global.constants.passCode_for_password
                    ).toString(),
                    status: 'active',
                    is_deleted: false,
                };

                let userCreateDetails = await Users.create(userData);
                findUserInfo = userCreateDetails.toObject();
                userCreated = true;
            }

            let workspaceMemberCreateDetails = await WorkspaceMembers.create({
                workspace_id: body.workspace_id,
                user_id: findUserInfo._id,
                role: 'member',
                permissions: {
                    create_work_request: true,
                    chat_support: true,
                    manage_members: true
                },
                joinedAt: new Date()
            });

            if (userCreated) {
                mailData = {
                    name: findUserInfo.name,
                    toEmail: findUserInfo.email,
                    subject: "Welcome to Reib Law - Your Account Has Been Created",
                    html: `<body style="background: #dbdbdb;">
                <div style="width:100%; max-width:600px; margin:0 auto; padding:40px 15px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0"
                        style="padding:15px 0; text-align:center; background:#ffffff; border-bottom:1px solid #e2e2e2;">
                    </table>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0"
                        style="padding:60px 40px; text-align:left; background:#fff;">
                        <tr>
                            <th scope="col">
                                <p style="font-size:17px; font-weight:500; color:#000; line-height:24px;">
                                    Hi ${findUserInfo.name},
                                </p>

                                <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top:20px;">
                                    Welcome to <strong>Reib Law</strong>!
                                </p>

                                <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top:20px;">
                                    An account has been created for you and you have been added to your assigned workspace named ${workspaceDetails?.name}.
                                </p>

                                <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top:20px;">
                                    You can log in using the following credentials:
                                </p>

                                <p style="font-size:17px; color:#000; line-height:28px; margin-top:15px;">
                                    <strong>Email:</strong> ${findUserInfo.email}<br/>
                                    <strong>Temporary Password:</strong>
                                    <span style="font-size:20px; color:#ff301e; font-weight:bold;">
                                        ${process.env.MEMBER_CREATE_PASSWORD}
                                    </span>
                                </p>

                                <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top:20px;">
                                    For security reasons, please change your password immediately after your first login.
                                </p>

                                <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top:20px;">
                                    If you have any questions or experience any issues accessing your account, please contact us.
                                </p>

                                <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top:20px;">
                                    Thanks,
                                </p>

                                <p style="font-size:17px; font-weight:bold; color:#000; line-height:24px; margin-top:5px;">
                                    Reib Law Team
                                </p>
                            </th>
                        </tr>
                    </table>
                </div>
            </body>`
                }
            } else {
                mailData = {
                    name: findUserInfo.name,
                    toEmail: findUserInfo.email,
                    subject: "You've Been Added to a Workspace",
                    html: `<body style="background: #dbdbdb;">
                <div style="width:100%; max-width:600px; margin:0 auto; padding:40px 15px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0"
                        style="padding:15px 0; text-align:center; background:#ffffff; border-bottom:1px solid #e2e2e2;">
                    </table>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0"
                        style="padding:60px 40px; text-align:left; background:#fff;">
                        <tr>
                            <th scope="col">
                                <p style="font-size:17px; font-weight:500; color:#000; line-height:24px;">
                                    Hi ${findUserInfo.name},
                                </p>

                                <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top:20px;">
                                    We wanted to let you know that you have been added to a workspace in <strong>Reib Law</strong>.
                                </p>

                                <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top:20px;">
                                    You can access the workspace using your existing account credentials.
                                </p>

                                ${workspaceDetails?.name
                            ? `<p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top:20px;">
                                        <strong>Workspace:</strong> ${workspaceDetails?.name}
                                       </p>`
                            : ""
                        }

                                <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top:20px;">
                                    If you were not expecting this change or believe it was made in error, please contact us.
                                </p>

                                <p style="font-size:17px; font-weight:500; color:#000; line-height:24px; margin-top:20px;">
                                    Thanks,
                                </p>

                                <p style="font-size:17px; font-weight:bold; color:#000; line-height:24px; margin-top:5px;">
                                    Reib Law Team
                                </p>
                            </th>
                        </tr>
                    </table>
                </div>
            </body>`
                }
            }

            if (process.env.NEW_MEMBER_ADD) {
                await axios.post(
                    process.env.NEW_MEMBER_ADD,
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
                msg: responseMessages.registrationSuccess,
                data: {},
                purpose: purpose,
            });
        } catch (err) {
            console.log('New Member Add Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};