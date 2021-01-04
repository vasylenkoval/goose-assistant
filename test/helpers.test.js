const {
    bumpMigrationVersion,
    parseGooseTimestamp,
    formatGooseTimestamp,
    extractLatestMigrationVersion,
    getStaleMigrationNames,
    getIsHeadMigrationsStale,
} = require('../src/utils/helpers');
const { VERSION_TYPES } = require('../src/utils/constants');

describe('parseGooseTimestamp', () => {
    const testCases = [
        {
            input: '20201212052543',
            output: '2020-12-12T05:25:43.000Z',
        },
        {
            input: '19950529215254',
            output: '1995-05-29T21:52:54.000Z',
        },
    ];

    for (let testCase of testCases) {
        test(`testing parseGooseTimestamp ${testCase.input}`, () => {
            expect(parseGooseTimestamp(testCase.input).toJSON()).toEqual(testCase.output);
        });
    }
});

describe('formatGooseTimestamp', () => {
    const testCases = [
        {
            input: new Date('2020-12-12T05:25:43.000Z'),
            output: '20201212052543',
        },
        {
            input: new Date('1995-05-29T21:52:54.000Z'),
            output: '19950529215254',
        },
    ];

    for (let testCase of testCases) {
        test(`testing formatGooseTimestamp ${testCase.input}`, () => {
            expect(formatGooseTimestamp(testCase.input)).toEqual(testCase.output);
        });
    }
});

describe('bumpMigrationVersion', () => {
    const testCases = [
        {
            description: 'timestamps',
            input: {
                name: '20191216170144_testMigration.sql',
                latestVersion: '20191220193901',
                versionType: VERSION_TYPES.timestamp,
                ordinal: 2,
            },
            output: '20191220193903_testMigration.sql',
        },
        {
            description: 'sequence',
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
        test(`testing bumpMigrationVersion on ${testCase.description}`, () => {
            expect(bumpMigrationVersion(testCase.input)).toEqual(testCase.output);
        });
    }
});

describe('extractLatestMigrationVersion', () => {
    const testCases = [
        {
            description: 'timestamps',
            input: [
                { name: '20201212052543__migration' },
                { name: '20211110042342__migration' },
                { name: '19951110042342__migration' },
            ],
            output: '20211110042342',
        },
        {
            description: 'sequence',
            input: [
                { name: '00021__migration' },
                { name: '00019__migration' },
                { name: '00020__migration' },
            ],
            output: '00021',
        },
    ];

    for (let testCase of testCases) {
        test(`testing extractLatestMigrationVersion on ${testCase.description}`, () => {
            expect(extractLatestMigrationVersion(testCase.input)).toEqual(testCase.output);
        });
    }
});

describe('getStaleMigrationNames', () => {
    const testCases = [
        {
            baseMigrations: [
                { name: '20201212052543__migration' },
                { name: '20211110042342__migration' },
                { name: '19951110042342__migration' },
            ],
            headMigrations: [
                { name: '19951110042342__migration' },
                { name: '20211210042342__migration' },
                { name: '20201212052543__migration' },
                { name: '20211110042342__migration' },
                { name: '19970809041749__migration' },
                { name: '19960505011323__migration' },
            ],
            output: [
                '19960505011323__migration',
                '19970809041749__migration',
                '20211210042342__migration',
            ],
        },
    ];

    for (let testCase of testCases) {
        test(`testing getStaleMigrationNames`, () => {
            expect(
                getStaleMigrationNames(testCase.baseMigrations, testCase.headMigrations)
            ).toEqual(testCase.output);
        });
    }
});

describe('getIsHeadMigrationsStale', () => {
    const testCases = [
        {
            baseMigrations: [
                { name: '20201212052543__migration' },
                { name: '20211110042342__migration' },
                { name: '19951110042342__migration' },
            ],
            headMigrations: [
                { name: '19951110042342__migration' },
                { name: '20211210042342__migration' },
                { name: '20201212052543__migration' },
                { name: '20211110042342__migration' },
                { name: '19970809041749__migration' },
                { name: '19960505011323__migration' },
            ],
            output: true,
        },
        {
            baseMigrations: [
                { name: '20201212052543__migration' },
                { name: '20211110042342__migration' },
                { name: '19951110042342__migration' },
            ],
            headMigrations: [
                { name: '19951110042342__migration' },
                { name: '20211210042342__migration' },
                { name: '20201212052543__migration' },
                { name: '20211110042342__migration' },
            ],
            output: false,
        },
    ];

    for (let testCase of testCases) {
        test(`testing getIsHeadMigrationsStale`, () => {
            expect(
                getIsHeadMigrationsStale(testCase.baseMigrations, testCase.headMigrations)
            ).toEqual(testCase.output);
        });
    }
});
