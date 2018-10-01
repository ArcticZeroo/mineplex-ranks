const enumify = require('./enumify');

const RankType = {
    PRIMARY: 'PrimaryRank',
    SECONDARY: 'SecondaryRank'
};

const primaryRanks = {
    // Management
    OWNER: {
        name: 'owner',
        tag: 'OWNER'
    },
    LEADER: {
        name: 'leader',
        tag: 'LEADER'
    },
    // Contracted
    DEV: {
        name: 'dev',
        tag: 'DEV'
    },
    ADMIN: {
        name: 'admin',
        tag: 'ADMIN'
    },
    JRDEV: {
        name: 'jrdev',
        tag: 'JR.DEV'
    },
    SUPPORT: {
        name: 'support',
        tag: 'SUPPORT'
    },
    // Volunteer
    SRMOD: {
        name: 'srmod',
        tag: 'SR.MOD'
    },
    MOD: {
        name: 'mod',
        tag: 'MOD'
    },
    TRAINEE: {
        name: 'trainee',
        tag: 'TRAINEE'
    },
    // Personality
    YOUTUBE: {
        name: 'youtube',
        tag: 'YOUTUBE'
    },
    YT: {
        name: 'yt',
        tag: 'YT'
    },
    TWITCH: {
        name: 'twitch',
        tag: 'TWITCH'
    },
    // Premium
    ETERNAL: {
        name: 'eternal',
        tag: 'ETERNAL'
    },
    TITAN: {
        name: 'titan',
        tag: 'TITAN'
    },
    LEGEND: {
        name: 'legend',
        tag: 'LEGEND'
    },
    HERO: {
        name: 'hero',
        tag: 'HERO'
    },
    ULTRA: {
        name: 'ultra',
        tag: 'ULTRA'
    },
    // Peasants
    PLAYER: {
        name: 'all',
        tag: 'PLAYER'
    },
    // Who knows, right?
    UNKNOWN: {
        name: 'unknown',
        tag: 'UNKNOWN'
    }
};

enumify(primaryRanks, RankType.PRIMARY);

const secondaryRanks = {
    QA: 'qa',
    QAM: 'qam',
    EVENT: 'event',
    MODCOORD: 'modcoord',
    CMA: 'cma',
    CMOD: 'cmod'
};

enumify(secondaryRanks, RankType.SECONDARY);

const conversions = {
    ALL: primaryRanks.PLAYER,
    LT: primaryRanks.LEADER
};

function convert(rank, requiredType) {
    if (typeof rank === 'string') {
        // Make the rank lowercase, turn nr (SNR/JNR) into just r (SR/JR),
        // turn MODERATOR into MOD
        // remove underscores and periods.
        rank = rank.toUpperCase().replace('NR', 'R').replace(/[_.]/g, '').replace('MODERATOR', 'MOD');

        if (primaryRanks[rank] && (!requiredType || requiredType === RankType.PRIMARY)) {
            return primaryRanks[rank];
        }

        if (secondaryRanks[rank] && (!requiredType || requiredType === RankType.SECONDARY)) {
            return secondaryRanks[rank];
        }

        if (conversions[rank]) {
            const convertedRank = conversions[rank];

            // If there is no required type,
            // just return it
            if (!requiredType) {
                return convertedRank;
            }

            // Otherwise, return it if it's the same
            if (convertedRank.type === requiredType) {
                return convertedRank;
            }

            // Else it'll just return primary unknown
        }
    } else if (typeof rank === 'object') {
        if (Object.isEnumChild(rank)) {
            return rank;
        }

        if (Array.isArray(rank)) {
            return rank.map(convert);
        }
    }

    return primaryRanks.UNKNOWN;
}

function has(required, ownedPrimary, ownedSecondary = []) {
    required = convert(required);

    if (required === primaryRanks.UNKNOWN) {
        return false;
    }

    if (required.type === RankType.PRIMARY) {
        ownedPrimary = convert(ownedPrimary);

        // Return whether the owned rank has equal
        // or greater permissions than the required
        // one.
        return (ownedPrimary.ordinal <= required.ordinal);
    }

    // Secondary rank requirement simply requires
    // that they have it, not that they are in
    // any kind of hierarchy.
    if (required.type === RankType.SECONDARY) {
        ownedSecondary = convert(ownedSecondary);

        if (ownedSecondary === primaryRanks.UNKNOWN) {
            return false;
        }

        return (ownedSecondary.includes(required));
    }
}

module.exports = { RankType, primaryRanks, secondaryRanks, convert, has };
