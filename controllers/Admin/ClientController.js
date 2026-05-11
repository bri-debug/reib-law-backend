const Users = require('../../models/users');
const RequestedWorks = require('../../models/requestedWorks');
const responseMessages = require('../../ResponseMessages');

function mapClientRecord(user, stats = {}) {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        status: user.status || (user.is_active ? 'active' : 'inactive'),
        company: user.email ? user.email.split('@')[1] : 'Client Account',
        plan: 'Professional',
        requestCount: stats.requestCount || 0,
        completedCount: stats.completedCount || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

module.exports.clientList = (req, res) => {
    (async () => {
        let purpose = 'Client List';
        try {
            let query = req.query;
            let searchData = { is_deleted: false };

            if (query.status && query.status !== '') {
                searchData.status = query.status;
            }

            if (query.search && query.search !== '') {
                searchData.$or = [
                    { name: { $regex: query.search, $options: 'i' } },
                    { email: { $regex: query.search, $options: 'i' } },
                    { phone: { $regex: query.search, $options: 'i' } },
                ];
            }

            let clients = await Users.find(searchData).sort({ createdAt: -1 });
            let clientIds = clients.map((client) => client._id.toString());
            let workStats = await RequestedWorks.aggregate([
                { $match: { user_id: { $in: clientIds }, is_deleted: false } },
                {
                    $group: {
                        _id: '$user_id',
                        requestCount: { $sum: 1 },
                        completedCount: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
                            },
                        },
                    },
                },
            ]);

            let statsMap = new Map(
                workStats.map((item) => [item._id, item])
            );

            return res.send({
                status: 200,
                msg: responseMessages.userListFetch,
                data: clients.map((client) =>
                    mapClientRecord(client, statsMap.get(client._id.toString()))
                ),
                purpose: purpose,
            });
        } catch (err) {
            console.log('Client List Error : ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};

module.exports.clientDetails = (req, res) => {
    (async () => {
        let purpose = 'Client Details';
        try {
            let query = req.query;
            let client = await Users.findOne({ _id: query.id, is_deleted: false });

            if (!client) {
                return res.send({
                    status: 404,
                    msg: responseMessages.userNotFound,
                    data: {},
                    purpose: purpose,
                });
            }

            let requestCount = await RequestedWorks.countDocuments({
                user_id: client._id.toString(),
                is_deleted: false,
            });
            let completedCount = await RequestedWorks.countDocuments({
                user_id: client._id.toString(),
                status: 'completed',
                is_deleted: false,
            });

            let workRequests = await RequestedWorks.find({
                user_id: client._id.toString(),
                is_deleted: false,
            })
                .sort({ updatedAt: -1 })
                .limit(10);
            let completedDeliverables = workRequests.filter((item) => item.status === 'completed');

            return res.send({
                status: 200,
                msg: responseMessages.fetchUserDetails,
                data: {
                    client: mapClientRecord(client, {
                        requestCount,
                        completedCount,
                    }),
                    workRequests,
                    deliverables: completedDeliverables,
                },
                purpose: purpose,
            });
        } catch (err) {
            console.log('Client Details Error : ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose: purpose,
            });
        }
    })();
};
