const getPathContents = require('./get-path-contents');
const {
    getStaleMigrationNames,
    getIsHeadMigrationsStale,
    extractLatestMigrationVersion,
    bumpMigrationVersion,
} = require('./utils/helpers');
const { PROTECTED_BRANCHES } = require('./utils/constants');

module.exports = async (ctx, config) => {
    const { baseResp: baseMigrations, headResp: headMigrations } = await getPathContents(
        ctx,
        config.path
    );

    const {
        sender: { login: senderLogin },
    } = ctx.payload;

    if (!getIsHeadMigrationsStale(baseMigrations, headMigrations)) {
        ctx.octokit.issues.createComment(
            ctx.issue({
                body: `@${senderLogin} couldn't find any stale migrations on the head branch.`,
            })
        );

        return;
    }

    const latestVersion = extractLatestMigrationVersion(baseMigrations, headMigrations);

    for (const [index, migrationName] of Object.entries(
        getStaleMigrationNames(baseMigrations, headMigrations)
    )) {
        const { pullRequest, headResp: migration } = await getPathContents(
            ctx,
            `${config.path}/${migrationName}`,
            {
                includeBase: false,
            }
        );

        if (Object.values(PROTECTED_BRANCHES).includes(pullRequest.head.ref)) {
            ctx.octokit.issues.createComment(
                ctx.issue({
                    body: `@${senderLogin} seems like your head branch is one of the protected branches. I can only push fixes to your personal branch.`,
                })
            );

            return;
        }

        const updatedMigrationName = bumpMigrationVersion({
            name: migrationName,
            latestVersion,
            versionType: config.versionType,
            ordinal: Number(index) + 1,
        });

        await ctx.octokit.repos.deleteFile({
            message: `goose-assistant: deleted ${migrationName}`,
            owner: ctx.payload.repository.owner.login,
            repo: ctx.payload.repository.name,
            path: `${config.path}/${migrationName}`,
            sha: migration.sha,
            branch: pullRequest.head.ref,
        });

        await ctx.octokit.repos.createOrUpdateFileContents({
            message: `goose-assistant: renamed ${migrationName} to ${updatedMigrationName}`,
            owner: ctx.payload.repository.owner.login,
            repo: ctx.payload.repository.name,
            path: `${config.path}/${updatedMigrationName}`,
            content: migration.content,
            branch: pullRequest.head.ref,
        });
    }
};
