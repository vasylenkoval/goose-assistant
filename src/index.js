const handleCheck = require('./handle-check');
const handleFix = require('./handle-fix');
const onCommand = require('./on-command');
const { COMMANDS } = require('./utils/constants');

module.exports = async (robot) => {
    robot.on('issue_comment.created', (ctx) => {
        // Only running on pull requests' comments.
        // If pull_request object is falsy it means that we're looking at a regular issue comment.
        if (!ctx.payload.issue.pull_request) {
            return;
        }

        // Checks if current goose files that are being committed are not stale.
        onCommand(COMMANDS.check, ctx, handleCheck);

        // Fixes committed files versioning if it's stale.
        onCommand(COMMANDS.fix, ctx, handleFix);
    });
};
