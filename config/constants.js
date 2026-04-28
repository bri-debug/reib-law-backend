require('dotenv').config();
module.exports = {
    passCode_for_password: 'ReInstateElite#RKw2ZH_LT769qaEijmsqsqHH4w.anbyWQvJKuAy@2026',

    jwtAccessTokenOptions: {
        secret: 'reinstate_elite_backend#@2026',
        options: {
            algorithm: 'HS256',
            expiresIn: '7d',
            audience: 'aud:DTS',
            issuer: 'DTS-' + process.env.GIT_BRANCH + '-' + (process.env.ENVIRONMENT == 'development' ? 'DEV' : 'PROD') + '@' + require('os').hostname()
        }
    },
    jwtRefreshTokenOptions: {
        secret: 'reinstate_elite_backend#@2026',
        options: {
            algorithm: 'HS256',
            expiresIn: '3d',
            audience: 'aud:DTS',
            issuer: 'DTS-' + process.env.GIT_BRANCH + '-' + (process.env.ENVIRONMENT == 'development' ? 'DEV' : 'PROD') + '@' + require('os').hostname()
        }
    },
}