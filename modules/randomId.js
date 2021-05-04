const hash = require('object-hash');

module.exports = (prefix = 'id_', length = Math.floor(Math.random() * 100) + 10, type = '', ...words) => {
    const
        letters = [
            'a', 'b', 'c', 'd', 'e', 'f',
            'g', 'h', 'i', 'j', 'k', 'l',
            'm', 'n', 'o', 'p', 'q', 'r',
            's', 't', 'u', 'v', 'w', 'x',
            'y', 'z'
        ],
        numbers = [
            1, 2, 3, 4, 5, 6, 7, 8, 9
        ],
        getWord = (str = '') => {
            let i = length;

            while (i > 0) {
                if (Math.floor(Math.random() * 20) >= 5) {
                    if (Math.floor(Math.random() * 20) >= 5)
                        str += String(letters[Math.floor(Math.random() * letters.length)]).toLowerCase();
                    else
                        str += String(letters[Math.floor(Math.random() * letters.length)]).toUpperCase();

                    i--;
                }
                else
                    str += numbers[Math.floor(Math.random() * numbers.length)], i--;
            }
            return str;
        };

    if (type === 'hash') {
        let word = words.length > 0 ? words.toString() : getWord(''),
            suffix = word.replace(word.slice(0, word.lastIndexOf('.')), ''),
            prop = getWord(''),
            object = {};

        object[prop] = getWord(prefix + word);

        return `${hash(object)}${suffix}`;
    }

    return `${getWord(prefix)}`;
}