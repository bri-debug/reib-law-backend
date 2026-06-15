const mongoose = require('mongoose');

const Users = require('../../models/users');
const Plans = require('../../models/plans');
const WorkspaceMembers = require('../../models/workspaceMembers');
const RequestedWorks = require('../../models/requestedWorks');
const responseMessages = require('../../ResponseMessages');

function mapClientRecord(user, stats = {}, plan = {}) {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        status: user.status || (user.is_active ? 'active' : 'inactive'),
        company: user?.business_name ?? null,
        plan: (plan.filter(f => f._id == user?.plan).length) ? plan.filter(f => f._id == user.plan)[0].title : 'Guardian',
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

            let clients = await Users.aggregate([
                {
                    $match: searchData
                },
                {
                    $lookup: {
                        from: "workspacemembers",
                        localField: "_id",
                        foreignField: "user_id",
                        as: "membership"
                    }
                },
                {
                    $unwind: "$membership"
                },
                {
                    $match: {
                        "membership.role": "owner"
                    }
                },
                {
                    $lookup: {
                        from: "plans",
                        localField: "plan",
                        foreignField: "_id",
                        pipeline: [
                            {
                                $project: {
                                    _id: 0,
                                    title: 1
                                }
                            }
                        ],
                        as: "plan"
                    }
                },
                {
                    $unwind: {
                        path: "$plan",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "workspaces",
                        localField: "_id",
                        foreignField: "owner_id",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1
                                }
                            }
                        ],
                        as: "workspace"
                    }
                },
                {
                    $unwind: {
                        path: "$workspace",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "requestedworks",
                        let: {
                            workspaceId: "$workspace._id"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$workspace_id", "$$workspaceId"]
                                    }
                                }
                            },
                            {
                                $sort: { updatedAt: -1 }
                            },
                            {
                                $facet: {
                                    stats: [
                                        {
                                            $group: {
                                                _id: null,
                                                total: { $sum: 1 },
                                                completed: {
                                                    $sum: {
                                                        $cond: [
                                                            { $eq: ["$status", "completed"] },
                                                            1,
                                                            0
                                                        ]
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        as: "requestedWork"
                    }
                },
                {
                    $addFields: {
                        requestedWork: { $arrayElemAt: ["$requestedWork", 0] }
                    }
                },
                {
                    $addFields: {
                        requestedWork: {
                            stats: { $arrayElemAt: ["$requestedWork.stats", 0] }
                        }
                    }
                },
                {
                    $addFields: {
                        plan: "$plan.title",
                        company: "business_name",
                        requestCount: { $ifNull: ["$requestedWork.stats.total", 0] },
                        completedCount: { $ifNull: ["$requestedWork.stats.completed", 0] },
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $project: {
                        password: 0,
                        business_name: 0,
                        is_active: 0,
                        is_deleted: 0,
                        __v: 0,
                        otp: 0,
                        otp_valid: 0,
                        requestedWork: 0,
                        workspace: 0,
                        membership: 0
                    }
                }
            ]);
            console.log(clients);
            // let clients = await Users.find(searchData).sort({ createdAt: -1 });

            // let findPlanList = await Plans.find({ is_deleted: false });
            // let clientIds = clients.map((client) => client._id.toString());
            // let workStats = await RequestedWorks.aggregate([
            //     { $match: { user_id: { $in: clientIds }, is_deleted: false } },
            //     {
            //         $group: {
            //             _id: '$user_id',
            //             requestCount: {
            //                 $sum: {
            //                     $cond: [{ $ne: ['$status', 'completed'] }, 1, 0],
            //                 }
            //             },
            //             completedCount: {
            //                 $sum: {
            //                     $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
            //                 },
            //             },
            //         },
            //     },
            // ]);

            // let statsMap = new Map(
            //     workStats.map((item) => [item._id, item])
            // );

            return res.send({
                status: 200,
                msg: responseMessages.userListFetch,
                data: clients,
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
            // let client = await Users.findOne({ _id: query.id, is_deleted: false });
            // let findPlanList = await Plans.find({ is_deleted: false });

            // if (!client) {
            //     return res.send({
            //         status: 404,
            //         msg: responseMessages.userNotFound,
            //         data: {},
            //         purpose: purpose,
            //     });
            // }

            // let requestCount = await RequestedWorks.countDocuments({
            //     user_id: client._id.toString(),
            //     is_deleted: false,
            // });
            // let completedCount = await RequestedWorks.countDocuments({
            //     user_id: client._id.toString(),
            //     status: 'completed',
            //     is_deleted: false,
            // });

            // let workRequests = await RequestedWorks.find({
            //     user_id: client._id.toString(),
            //     is_deleted: false,
            // })
            //     .sort({ updatedAt: -1 })
            //     .limit(10);
            // let completedDeliverables = workRequests.filter((item) => item.status === 'completed');

            let userData = await Users.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query.id)
                    }
                },
                {
                    $lookup: {
                        from: "plans",
                        localField: "plan",
                        foreignField: "_id",
                        pipeline: [
                            {
                                $project: {
                                    _id: 0,
                                    title: 1
                                }
                            }
                        ],
                        as: "plan"
                    }
                },
                {
                    $unwind: {
                        path: "$plan",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "workspaces",
                        localField: "_id",
                        foreignField: "owner_id",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1
                                }
                            }
                        ],
                        as: "workspace"
                    }
                },
                {
                    $unwind: {
                        path: "$workspace",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "requestedworks",
                        let: {
                            workspaceId: "$workspace._id"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$workspace_id", "$$workspaceId"]
                                    }
                                }
                            },
                            {
                                $sort: { updatedAt: -1 }
                            },
                            {
                                $facet: {
                                    data: [
                                        { $limit: 10 },
                                        {
                                            $lookup: {
                                                from: "users",
                                                localField: "created_by",
                                                foreignField: "_id",
                                                as: "createdBy"
                                            }
                                        },
                                        {
                                            $unwind: {
                                                path: "$createdBy",
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                        {
                                            $addFields: {
                                                created_by: {
                                                    _id: "$createdBy._id",
                                                    name: "$createdBy.name"
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                createdBy: 0
                                            }
                                        }
                                    ],

                                    stats: [
                                        {
                                            $group: {
                                                _id: null,
                                                total: { $sum: 1 },
                                                completed: {
                                                    $sum: {
                                                        $cond: [
                                                            { $eq: ["$status", "completed"] },
                                                            1,
                                                            0
                                                        ]
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        as: "requestedWork"
                    }
                },
                {
                    $addFields: {
                        requestedWork: { $arrayElemAt: ["$requestedWork", 0] }
                    }
                },
                {
                    $addFields: {
                        requestedWork: {
                            data: "$requestedWork.data",
                            stats: { $arrayElemAt: ["$requestedWork.stats", 0] }
                        }
                    }
                },
                {
                    $addFields: {
                        plan: "$plan.title",
                        company: "business_name",
                        requestCount: { $ifNull: ["$requestedWork.stats.total", 0] },
                        completedCount: { $ifNull: ["$requestedWork.stats.completed", 0] },
                        workRequests: "$requestedWork.data"
                    }
                },
                {
                    $project: {
                        password: 0,
                        business_name: 0,
                        is_active: 0,
                        is_deleted: 0,
                        __v: 0,
                        otp: 0,
                        otp_valid: 0,
                        requestedWork: 0,
                        workspace: 0
                    }
                }
            ]);

            if (!userData.length) {
                return res.send({
                    status: 404,
                    msg: responseMessages.userNotFound,
                    data: {},
                    purpose: purpose,
                });
            }

            let workRequests = userData[0].workRequests;
            let completedDeliverables = workRequests.filter((item) => item.status === 'completed');

            delete userData[0].workRequests;

            const retData = {
                client: userData[0],
                workRequests: workRequests,
                deliverables: completedDeliverables
            };

            return res.send({
                status: 200,
                msg: responseMessages.fetchUserDetails,
                data: retData,
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
