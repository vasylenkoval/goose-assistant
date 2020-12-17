const getPathContents = require('./get-path-contents');
const { getIsHeadMigrationsStale } = require('./utils/helpers');
const { COMMANDS, TRIGGER } = require('./utils/constants');

module.exports = async (ctx, config) => {
    const { baseResp: baseMigrations, headResp: headMigrations } = await getPathContents(
        ctx,
        config.path
    );

    const {
        sender: { login: senderUsername },
    } = ctx.payload;

    if (getIsHeadMigrationsStale(baseMigrations, headMigrations)) {
        ctx.github.issues.createComment(
            ctx.issue({
                body: `@${senderUsername} one or more migrations are out of sync with the base branch. You can update the versions manually or use ${
                    '`' + TRIGGER + ' ' + COMMANDS.fix + '`'
                } to update the versions automatically.`,
            })
        );

        return;
    }

    ctx.github.issues.createComment(
        ctx.issue({
            body: `@${senderUsername} couldn't find any stale migrations on the head branch.`,
        })
    );

    return;
};