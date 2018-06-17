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
    BUILDER: {
        name: 'builder',
        tag: 'BUILDER'
    },
    MAPPER: {
        name: 'mapper',
        tag: 'MAPPER'
    },
    MAPLEAD: {
        name: 'maplead',
        tag: 'MAPLEAD'
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
    CMOD: 'cmod',
    CONTENT: 'content',
    EVENTMOD: 'eventmod',
    MC: 'mc',
    RC: 'rc'
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

/**
 * Find out whether a given user has the
 * permissions associated with a given rank
 * @param required - The rank they need, as an enum
 * @param primary - their primary rank
 * @param {Array} [additional=[]] - any additional ranks
 * @return {boolean}
 */
function has(required, primary, additional = []) {
    required = convert(required);

    if (required === primaryRanks.UNKNOWN) {
        return false;
    }

    // If they passed { primary: rank, secondary: [...] }
    if (typeof primary === 'object' && primary.primary && primary.additional) {
        ({ primary, additional } = primary);
    }

    primary = convert(primary);
    additional = convert(additional);

    const ownedRanks = [primary, ...additional];

    // If it's a secondary rank, we just want
    // to check for ownership, as there is no
    // hierarchy associated with secondary ranks
    if (required.type === RankType.SECONDARY) {
        // Some ranks inside owned may be unknown
        // but we don't really care about that.
        return ownedRanks.includes(required);
    }

    const ownedPrimary = ownedRanks.filter(rank => rank.type === RankType.PRIMARY);

    // Since the required type is not secondary,
    // we want to iterate through all owned primary
    // ranks and check if any of them have the required
    // permission
    for (const owned of ownedPrimary) {
        if (owned === primaryRanks.UNKNOWN) {
            continue;
        }

        // Ordinal increases as permissions decrease,
        // so we just check whether it is a higher one
        if (owned.ordinal <= required.ordinal) {
            return true;
        }
    }

    return false;
}

module.exports = { RankType, primaryRanks, secondaryRanks, convert, has };