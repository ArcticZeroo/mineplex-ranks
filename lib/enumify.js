const ENUM = Symbol('Enum');
const ENUMCHILD = Symbol('EnumChild');

Object.isEnum = function (obj) {
    return obj.hasOwnProperty(ENUM);
};

Object.isEnumChild = function (obj) {
    return obj.hasOwnProperty(ENUMCHILD);
};

function enumify(obj, type) {
    if (this instanceof enumify) {
        throw new Error('enumify cannot be instantiated');
    }

    if (typeof obj !== 'object') {
        throw new TypeError(`Expected type \`object\` for param \`obj\`, got ${typeof obj}`);
    }

    obj[ENUM] = true;

    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        let val = obj[key];

        if (typeof val !== 'object') {
            obj[key] = {
                name: val
            }
        }

        obj[key][ENUMCHILD] = true;
        obj[key].ordinal = i;

        if (type) {
            obj[key].type = type;
            obj[key].toString = () => `${type}_${obj[key].name}`;
        } else {
            obj[key].toString = () => obj[key].name;
        }
    }

    const reservedWords = ['keys', 'keyArray', 'values', 'valueArray', 'indexOf', ENUM, ENUMCHILD];

    obj.keys = function* keyGenerator() {
        for (const key of Object.keys(obj)) {
            if (reservedWords.includes(key)) {
                continue;
            }

            yield key;
        }
    };

    obj.keyArray = function () {
        return Array.from(obj.keys());
    };

    obj.values = function* valueGenerator() {
        for (const key of obj.keys()) {
            yield obj[key];
        }
    };

    obj.valueArray = function () {
        return Array.from(obj.values());
    };

    obj.indexOf = (o) => obj[o] ? obj[o].ordinal : -1;

    return obj;
}

module.exports = enumify;