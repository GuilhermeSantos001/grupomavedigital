module.exports = (prefix = 'id_', length = 10) => {
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
        getWord = (str) => {
            while (length > 0) {
                if (Math.floor(Math.random() * 10) >= 5) {
                    if (Math.floor(Math.random() * 10) >= 5)
                        str += String(letters[Math.floor(Math.random() * letters.length)]).toLowerCase();
                    else
                        str += String(letters[Math.floor(Math.random() * letters.length)]).toUpperCase();

                    length--;
                }
                else
                    str += numbers[Math.floor(Math.random() * numbers.length)], length--;
            }
            return str;
        };

    return `${getWord(prefix)}`;
}