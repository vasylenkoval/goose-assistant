const { getIsValidConfig, onCommand } = require('./utils/helpers');
const { CONFIG_NAME, COMMANDS } = require('./utils/constants');
const handleCheck = require('./handle-check');
const handleFix = require('./handle-fix');

module.exports = async (robot) => {
    robot.on('issue_comment.created', async (ctx) => {
        // Only running on pull requests' comments.
        // If pull_request object is falsy it means that we're looking at a regular issue comment.
        if (!ctx.payload.issue.pull_request) {
            return;
        }

        // Checking the root of the default branch first (e.g., main, master)
        let config = await ctx.config(`../${CONFIG_NAME}`);

        // If nothing is found then checking develop branch
        if (!config) {
            const { repository } = ctx.payload;

            ({ config } = await ctx.octokit.config.get({
                owner: repository.owner.login,
                repo: repository.name,
                path: CONFIG_NAME,
                branch: 'develop',
            }));
        }

        if (!getIsValidConfig(config)) {
            return;
        }

        // Checks if current goose files that are being committed are not stale
        onCommand(COMMANDS.check, ctx, config, handleCheck);

        // Fixes committed files versioning if it's stale
        onCommand(COMMANDS.fix, ctx, config, handleFix);
    });
};
