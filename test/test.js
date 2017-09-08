const assert = require('assert');
const enumify = require('../lib/enumify');
const ranks = require('../lib/pc-ranks');

describe('enumify', function () {
    const theEnum = {
        cat: 'yellow',
        dog: 'four',
        cheese: 'green'
    };

    enumify(theEnum, 'TestEnum');

    it('should apply properties to converted object children', function () {
        for (const enumValue of theEnum.values()) {
            assert.notEqual(enumValue.name, null, 'Expected name');
            assert.notEqual(enumValue.ordinal, null, `Expected ordinal for ${enumValue.name}`);
            assert.notEqual(enumValue.type, null, `Expected type for ${enumValue.name}`);
            assert.notEqual(enumValue.toString, null, `Expected toString for ${enumValue.name}`);
        }
    });

    it('should add indexOf to converted object', function () {
        assert.strictEqual(typeof theEnum.indexOf, 'function', 'Expected function indexOf to exist');
    });

    it('should return the converted object', function () {
        assert.strictEqual(typeof enumify({ cat: true }), 'object');
    });
});

describe('Object.isEnum', function () {
    it('should return false for non-enum values', function () {
        assert.strictEqual(Object.isEnum(1), false);
        assert.strictEqual(Object.isEnum('cat'), false);
        assert.strictEqual(Object.isEnum({ yellow: true }), false);
        assert.strictEqual(Object.isEnum([]), false);
    });

    it('should return true for enum values', function () {
        assert.strictEqual(Object.isEnum(enumify({
            dog: true
        })), true);
    });
});

describe('Object.isEnumChild', function () {
    it('should return false for non-enum values', function () {
        assert.strictEqual(Object.isEnumChild(1), false);
        assert.strictEqual(Object.isEnumChild('cat'), false);
        assert.strictEqual(Object.isEnumChild({ yellow: true }), false);
        assert.strictEqual(Object.isEnumChild([]), false);
    });

    it('should return true for enum values', function () {
        assert.strictEqual(Object.isEnumChild(enumify({
            dog: true
        }).dog), true);
    });
});

describe('Rank Conversion', function () {
    it('should return unknown when an invalid rank is entered', function () {
         assert.strictEqual(ranks.convert(-76), ranks.primaryRanks.UNKNOWN);
    });

    it('should return the same rank when it\'s already an enum', function () {
        assert.strictEqual(ranks.convert(ranks.primaryRanks.PLAYER), ranks.primaryRanks.PLAYER);
    });


    it('should return a valid rank when it is a primaryRanks key', function () {
       for (const key of ranks.primaryRanks.keys()) {
           assert.strictEqual(ranks.convert(key), ranks.primaryRanks[key]);
       }
    });

    it('should return valid rank when it is a secondaryRanks key', function () {
        for (const key of ranks.secondaryRanks.keys()) {
            assert.strictEqual(ranks.convert(key), ranks.secondaryRanks[key]);
        }
    });

    it('should be able to convert slightly weird rank names', function () {
        const pairs = {
            [ranks.primaryRanks.SRMOD]: ['SRMOD', 'SNR_MOD', 'SNR_MODERATOR', 'SR_MODERATOR', 'SR.MOD', 'SR.MODERATOR', 'sr.mod', 'sr_mod'],
            [ranks.primaryRanks.LEADER]: ['LT', 'lt'],
            [ranks.primaryRanks.PLAYER]: ['ALL', 'all']
        };

        for (const key of Object.keys(pairs)) {
            for (const name of pairs[key]) {
                assert.strictEqual(key, ranks.convert(name).toString());
            }
        }
    });
});

describe('Rank Permissions', function () {
    it('should return true when a user has an equal rank', function () {
        assert.strictEqual(ranks.has(ranks.primaryRanks.PLAYER, ranks.primaryRanks.PLAYER), true);
    });

    it('should return false when a user has a lower rank', function () {
        assert.strictEqual(ranks.has(ranks.primaryRanks.MOD, ranks.primaryRanks.PLAYER), false);
    });

    it('should work as expected with non-converted rank names', function () {
        assert.strictEqual(ranks.has('MODERATOR', 'mod'), true);
        assert.strictEqual(ranks.has('MODERATOR', 'sr.moderator'), true);
    });
});