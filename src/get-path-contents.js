module.exports = async (ctx, path, options = {}) => {
    const { includeBase = true, includeHead = true } = options;

    const {
        repository,
        issue: { number: prNumber },
    } = ctx.payload;

    const { data: pullRequest } = await ctx.octokit.pulls.get({
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: prNumber,
    });

    let baseResp, headResp;

    if (includeBase) {
        ({ data: baseResp } = await ctx.octokit.repos.getContent({
            ref: pullRequest.base.ref,
            owner: repository.owner.login,
            repo: repository.name,
            path,
        }));
    }

    if (includeHead) {
        ({ data: headResp } = await ctx.octokit.repos.getContent({
            ref: pullRequest.head.ref,
            owner: repository.owner.login,
            repo: repository.name,
            path,
        }));
    }

    return { baseResp, headResp, pullRequest };
};
