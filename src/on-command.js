const getConfig = require('./get-config');
const { BOT_USERNAME } = require('./utils/constants');

module.exports = async (command, ctx, callback) => {
    const {
        comment: { body = '' },
        sender: { login: senderLogin },
    } = ctx.payload;

    if (senderLogin !== BOT_USERNAME && body.includes(command)) {
        const [config, isValid] = await getConfig(ctx);

        if (!isValid) {
            return;
        }

        return callback(ctx, config);
    }
};
