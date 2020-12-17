const { bumpMigrationVersion } = require('../src/utils/helpers');
const { VERSION_TYPES } = require('../src/utils/constants');

describe('bumpMigrationVersion', () => {
    const testCases = [
        {
            input: {
                name: '20191216170144_testMigration.sql',
                latestVersion: '20191220193901',
                versionType: VERSION_TYPES.timestamp,
                ordinal: 2,
            },
            output: '20191220193903_testMigration.sql',
        },
        {
            input: {
                name: '00023_testMigration.sql',
                latestVersion: '00024',
                versionType: VERSION_TYPES.sequential,
                ordinal: 1,
            },
            output: '00025_testMigration.sql',
        },
    ];

    for (let testCase of testCases) {
        test(`testing bumpMigrationVersion ${testCase.input}`, () => {
            expect(bumpMigrationVersion(testCase.input)).toEqual(testCase.output);
        });
    }
});
