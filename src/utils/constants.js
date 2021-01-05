module.exports = {
    CONFIG_NAME: 'goose-assistant.yml',
    VERSION_TYPES: {
        timestamp: 'timestamp',
        sequential: 'sequential',
    },
    BOT_USERNAME: 'goose-assistant[bot]',
    COMMANDS: {
        check: '/goose-check',
        fix: '/goose-fix',
    },
    PROTECTED_BRANCHES: {
        master: 'master',
        main: 'main',
        develop: 'develop',
    },
};
