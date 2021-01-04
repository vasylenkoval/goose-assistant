module.exports = {
    CONFIG_NAME: 'goose-assistant.yml',
    VERSION_TYPES: {
        timestamp: 'timestamp',
        sequential: 'sequential',
    },
    TRIGGER: '/goose',
    BOT_LOGIN: 'goose-assistant[bot]',
    COMMANDS: {
        check: 'check',
        fix: 'fix',
    },
    PROTECTED_BRANCHES: {
        master: 'master',
        main: 'main',
        develop: 'develop',
    },
};
