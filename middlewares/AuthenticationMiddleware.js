const jwt = require('jsonwebtoken');
const responseMessages = require('../ResponseMessages.js');

// ################################ Repositories ################################ //
const userModel = require('../models/users');
const adminsModel = require('../models/admins');

// ################################ Globals ################################ //
const jwtOptionsAccess = global.constants.jwtAccessTokenOptions;

//User Authentication
module.exports.authenticateRequestAPI = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            let accessToken = req.headers.authorization.split(' ')[1];
            jwt.verify(accessToken, jwtOptionsAccess.secret, async (err, decodedToken) => {
                if (err) {
                    return res.json({
                        status: 401,
                        msg: responseMessages.authFailure,
                    })
                }
                else {
                    let userCount = await userModel.findOne({_id: decodedToken.user_id, is_active: true, is_deleted: false});
                    
                    if(userCount) {
                        req.headers.userID = decodedToken.user_id;
                        next();
                    } else{
                        return res.json({
                            status: 401,
                            msg: responseMessages.authFailure,
                        })
                    }
                }
            });
        } else {
            return res.json({
                status: 401,
                msg: responseMessages.authRequired,
            })
        }
    }
    catch (e) {
        console.log("Middleware Error : ", e);
        res.json({
            status: 500,
            message: responseMessages.serverError,
        })
    }
}


//Admin Authentication
module.exports.authenticateAdminRequestAPI = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            let accessToken = req.headers.authorization.split(' ')[1];
            jwt.verify(accessToken, jwtOptionsAccess.secret, async (err, decodedToken) => {
                if (err) {
                    return res.json({
                        status: 401,
                        msg: responseMessages.authFailure,
                    })
                }
                else {
                    let adminCount = await adminsModel.findOne({ _id: decodedToken.user_id });
                    if(adminCount) {
                        req.headers.userID = decodedToken.user_id;
                        next();
                    }
                    else{
                        return res.json({
                            status: 401,
                            msg: responseMessages.authFailure,
                        })
                    }
                }
            });
        }
        else {
            return res.json({
                status: 401,
                msg: responseMessages.authRequired,
            })
        }
    }
    catch (e) {
        console.log("Middleware Error : ", e);
        res.json({
            status: 500,
            message: responseMessages.serverError,
        })
    }
}