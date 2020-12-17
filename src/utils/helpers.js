const { VERSION_TYPES, TRIGGER } = require('./constants');

function getIsValidConfig(config) {
    return !!(
        config &&
        config.path &&
        typeof config.path === 'string' &&
        Object.values(VERSION_TYPES).includes(config.versionType)
    );
}

function onCommand(command, ctx, config, callback) {
    const {
        comment: { body = '' },
    } = ctx.payload;

    if (body.includes(`${TRIGGER} ${command}`)) {
        return callback(ctx, config);
    }
}

function getStaleMigrationNames(baseMigrations, headMigrations) {
    const headMigrationsNamesSet = new Set(headMigrations.map((migration) => migration.name));
    const baseMigrationsNamesSet = new Set(baseMigrations.map((migration) => migration.name));

    const diff = [...headMigrationsNamesSet]
        .filter((migrationName) => !baseMigrationsNamesSet.has(migrationName))
        .sort();

    const mergedMigrationNames = [
        ...new Set([...headMigrationsNamesSet, ...baseMigrationsNamesSet]),
    ].sort();

    const isStale = !mergedMigrationNames
        .slice(mergedMigrationNames.length - diff.length)
        .every((migrationName, index) => migrationName === diff[index]);

    return isStale ? diff : [];
}

function getIsHeadMigrationsStale(baseMigrations, headMigrations) {
    return !!getStaleMigrationNames(baseMigrations, headMigrations).length;
}

function extractLatestMigrationVersion(migrations) {
    return migrations
        .map((migration) => migration.name)
        .sort()
        [migrations.length - 1].split('_')[0];
}

function parseGooseTimestamp(str) {
    const year = Number(str.slice(0, 4));
    const month = Number(str.slice(4, 6)) - 1; // jan = 0
    const day = Number(str.slice(6, 8));
    const hours = Number(str.slice(8, 10));
    const minutes = Number(str.slice(10, 12));
    const seconds = Number(str.slice(12, 14));

    return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
}

function formatGooseTimestamp(timestamp) {
    const year = timestamp.getUTCFullYear();
    const month = timestamp.getUTCMonth() + 1;
    const day = timestamp.getUTCDate();
    const hours = timestamp.getUTCHours();
    const minutes = timestamp.getUTCMinutes();
    const seconds = timestamp.getUTCSeconds();

    const padStart = (num) => num.toString().padStart(2, '0');

    return [
        year,
        padStart(month),
        padStart(day),
        padStart(hours),
        padStart(minutes),
        padStart(seconds),
    ].join('');
}

function bumpMigrationVersion(args = {}) {
    const { name, latestVersion, versionType, ordinal } = args;

    let newVersion;

    if (versionType === VERSION_TYPES.timestamp) {
        const timestamp = parseGooseTimestamp(latestVersion);
        timestamp.setSeconds(timestamp.getSeconds() + ordinal);
        newVersion = formatGooseTimestamp(timestamp);
    }

    if (versionType === VERSION_TYPES.sequential) {
        newVersion = `${Number(latestVersion) + Number(ordinal)}`;

        // accounting for padded values (e.g. 001 -> 002)
        if (latestVersion.length > newVersion.length) {
            newVersion = newVersion.padStart(latestVersion.length, '0');
        }
    }

    return name.replace(new RegExp(/^.+?(?=_)/), newVersion);
}

module.exports = {
    onCommand,
    getIsValidConfig,
    getStaleMigrationNames,
    getIsHeadMigrationsStale,
    extractLatestMigrationVersion,
    bumpMigrationVersion,
    parseGooseTimestamp,
    formatGooseTimestamp,
};
