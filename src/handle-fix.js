const getPathContents = require('./get-path-contents');
const {
    getStaleMigrationNames,
    getIsHeadMigrationsStale,
    extractLatestMigrationVersion,
    bumpMigrationVersion,
} = require('./utils/helpers');

module.exports = async (ctx, config) => {
    const { baseResp: baseMigrations, headResp: headMigrations } = await getPathContents(
        ctx,
        config.path
    );

    if (!getIsHeadMigrationsStale(baseMigrations, headMigrations)) {
        ctx.github.issues.createComment(
            ctx.issue({
                body: `@${senderUsername} couldn't find any stale migrations.`,
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

        const updatedMigrationName = bumpMigrationVersion({
            name: migrationName,
            latestVersion,
            versionType: config.versionType,
            ordinal: Number(index) + 1,
        });

        const { repository } = ctx.payload;

        await ctx.octokit.repos.deleteFile({
            message: `goose-assistant: deleted ${migrationName}`,
            owner: repository.owner.login,
            repo: repository.name,
            path: `${config.path}/${migrationName}`,
            sha: migration.sha,
            branch: pullRequest.head.ref,
        });

        await ctx.octokit.repos.createOrUpdateFileContents({
            message: `goose-assistant: renamed ${migrationName} to ${updatedMigrationName}`,
            owner: repository.owner.login,
            repo: repository.name,
            path: `${config.path}/${updatedMigrationName}`,
            content: migration.content,
            branch: pullRequest.head.ref,
        });
    }
};
