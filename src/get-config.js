const { CONFIG_NAME, VERSION_TYPES } = require('./utils/constants');

module.exports = async (ctx) => {
    // Checking the root of the default branch first (e.g., main, master)
    let config = await ctx.config(`../${CONFIG_NAME}`);

    // If nothing is found then checking develop branch
    if (!config) {
        ({ config } = await ctx.octokit.config.get({
            owner: ctx.payload.repository.owner.login,
            repo: ctx.payload.repository.name,
            path: CONFIG_NAME,
            branch: 'develop',
        }));
    }

    const isValid = (config) =>
        !!(
            config &&
            config.path &&
            typeof config.path === 'string' &&
            Object.values(VERSION_TYPES).includes(config.versionType)
        );

    return [config, isValid(config)];
};
