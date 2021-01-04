const getConfig = require('./get-config');
const { TRIGGER, BOT_LOGIN } = require('./utils/constants');

module.exports = async (command, ctx, callback) => {
    const {
        comment: { body = '' },
        sender: { login: senderLogin },
    } = ctx.payload;

    if (senderLogin !== BOT_LOGIN && body.includes(`${TRIGGER} ${command}`)) {
        const [config, isValid] = await getConfig(ctx);

        if (!isValid) {
            return;
        }

        return callback(ctx, config);
    }
};
