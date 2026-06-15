const Users = require('../../models/users');
const Admins = require('../../models/admins');
const SupportConversation = require('../../models/supportConversations');
const SupportMessage = require('../../models/supportMessages');
const responseMessages = require('../../ResponseMessages');
const { getIO } = require("../../helpers/socketFunctions");

function mapConversation(conversationDoc) {
    return {
        _id: conversationDoc._id,
        client_id: conversationDoc.user_id,
        client_name: conversationDoc.client_name,
        client_email: conversationDoc.client_email,
        last_message: conversationDoc.last_message,
        last_message_sender: conversationDoc.last_message_sender,
        last_message_importance: conversationDoc.last_message_importance,
        last_message_at: conversationDoc.last_message_at,
        unread_for_admin: conversationDoc.unread_for_admin || 0,
        unread_for_client: conversationDoc.unread_for_client || 0,
        has_urgent: conversationDoc.has_urgent || false,
        createdAt: conversationDoc.createdAt,
        updatedAt: conversationDoc.updatedAt,
    };
}

function mapMessage(messageDoc) {
    return {
        _id: messageDoc._id,
        conversation_id: messageDoc.conversation_id,
        sender: messageDoc.sender_role,
        sender_id: messageDoc.sender_id,
        name: messageDoc.sender_name,
        text: messageDoc.message,
        importance: messageDoc.importance,
        createdAt: messageDoc.createdAt,
        updatedAt: messageDoc.updatedAt,
    };
}

async function findClientOrSendNotFound(res, clientID, purpose) {
    const user = await Users.findOne({ _id: clientID, is_deleted: false });

    if (!user) {
        res.send({
            status: 404,
            msg: responseMessages.userNotFound,
            data: {},
            purpose,
        });
        return null;
    }

    return user;
}

module.exports.supportConversationList = (req, res) => {
    (async () => {
        const purpose = 'Support Conversation List';
        try {
            const conversations = await SupportConversation.find({
                is_deleted: false,
            }).sort({ last_message_at: -1, updatedAt: -1 });

            return res.send({
                status: 200,
                msg: responseMessages.supportConversationListFetched,
                data: conversations.map(mapConversation),
                purpose,
            });
        } catch (err) {
            console.log('Support Conversation List Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose,
            });
        }
    })();
};

module.exports.supportMessages = (req, res) => {
    (async () => {
        const purpose = 'Fetch Support Messages';
        try {
            const query = req.query;
            const client = await findClientOrSendNotFound(res, query.client_id, purpose);

            if (!client) return;

            const conversation = await SupportConversation.findOne({
                workspace_id: query.workspace_id,
                is_deleted: false,
            });

            const messages = conversation
                ? await SupportMessage.find({
                    conversation_id: conversation._id,
                    is_deleted: false,
                }).sort({ createdAt: 1 })
                : [];

            if (conversation && conversation.unread_for_admin > 0) {
                await SupportConversation.updateOne(
                    { _id: conversation._id },
                    {
                        unread_for_admin: 0,
                        updatedAt: new Date(),
                    },
                );
            }

            return res.send({
                status: 200,
                msg: responseMessages.supportThreadFetched,
                data: {
                    conversation: conversation
                        ? mapConversation(conversation)
                        : {
                            _id: null,
                            workspace_id: query.workspace_id,
                            client_name: client.name,
                            client_email: client.email,
                            last_message: '',
                            last_message_sender: null,
                            last_message_importance: 'normal',
                            last_message_at: null,
                            unread_for_admin: 0,
                            unread_for_client: 0,
                            has_urgent: false,
                            createdAt: null,
                            updatedAt: null,
                        },
                    messages: messages.map(mapMessage),
                },
                purpose,
            });
        } catch (err) {
            console.log('Fetch Support Messages Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose,
            });
        }
    })();
};

module.exports.sendSupportMessage = (req, res) => {
    (async () => {
        const purpose = 'Send Support Message';
        try {
            const adminID = req.headers.userID;
            const body = req.body;
            const admin = await Admins.findOne({ _id: adminID, is_deleted: false });

            if (!admin) {
                return res.send({
                    status: 404,
                    msg: responseMessages.adminNotFound,
                    data: {},
                    purpose,
                });
            }

            const client = await findClientOrSendNotFound(res, body.client_id, purpose);

            if (!client) return;

            let conversation = await SupportConversation.findOne({
                workspace_id: body.workspace_id,
                is_deleted: false,
            });

            if (!conversation) {
                conversation = await SupportConversation.create({
                    workspace_id: body.workspace_id,
                    client_name: client.name,
                    client_email: client.email,
                    last_message: '',
                    last_message_at: new Date(),
                    last_message_sender: 'admin',
                    last_message_importance: body.importance || 'normal',
                    unread_for_admin: 0,
                    unread_for_client: 0,
                    has_urgent: false,
                    is_deleted: false,
                });
            }

            const createdMessage = await SupportMessage.create({
                conversation_id: conversation._id,
                user_id: body.client_id,
                sender_role: 'admin',
                sender_id: adminID,
                sender_name: admin.name,
                message: body.message.trim(),
                importance: body.importance || 'normal',
                is_deleted: false,
            });

            const nextUnreadForClient = (conversation.unread_for_client || 0) + 1;
            const isUrgentMessage = createdMessage.importance === 'urgent';

            await SupportConversation.updateOne(
                { _id: conversation._id },
                {
                    client_name: client.name,
                    client_email: client.email,
                    last_message: createdMessage.message,
                    last_message_sender: 'admin',
                    last_message_importance: createdMessage.importance,
                    last_message_at: createdMessage.createdAt,
                    unread_for_client: nextUnreadForClient,
                    has_urgent: isUrgentMessage,
                    updatedAt: new Date(),
                },
            );

            const io = getIO();

            const message = {
                conversationID: conversation._id,
                message: mapMessage(createdMessage),
                sender: 'admin',
            };

            io.to(`user:${body.client_id}`).emit(
                "receive_message",
                message
            );

            return res.send({
                status: 200,
                msg: responseMessages.supportMessageSent,
                data: mapMessage(createdMessage),
                purpose,
            });
        } catch (err) {
            console.log('Send Support Message Error: ', err);
            return res.send({
                status: 500,
                msg: responseMessages.serverError,
                data: {},
                purpose,
            });
        }
    })();
};
