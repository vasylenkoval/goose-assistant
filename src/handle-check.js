const getPathContents = require('./get-path-contents');
const { getStaleMigrationNames, extractLatestMigrationVersion } = require('./utils/helpers');
const { COMMANDS } = require('./utils/constants');

module.exports = async (ctx, config) => {
    const { baseResp: baseMigrations, headResp: headMigrations } = await getPathContents(
        ctx,
        config.path
    );

    const {
        sender: { login: senderLogin },
    } = ctx.payload;

    const staleMigrationNames = getStaleMigrationNames(baseMigrations, headMigrations);

    if (staleMigrationNames.length) {
        ctx.octokit.issues.createComment(
            ctx.issue({
                body: `@${senderLogin} one or more migrations are out of sync with the base branch. You can update the versions manually or use ${
                    '`' + COMMANDS.fix + '`'
                } to update the versions automatically. \n\n **Your migrations:** \n>${staleMigrationNames.join(
                    '\n\t-'
                )} \n\n **Latest version on the base branch:** \n>${extractLatestMigrationVersion(
                    baseMigrations,
                    headMigrations
                )}`,
            })
        );

        return;
    }

    ctx.octokit.issues.createComment(
        ctx.issue({
            body: `@${senderLogin} couldn't find any stale migrations on the head branch.`,
        })
    );

    return;
};
