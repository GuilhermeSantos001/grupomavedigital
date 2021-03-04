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
        getWord = (length, str) => {
            while (length > 0)
                str += letters[Math.floor(Math.random() * letters.length)], length--;
            return str;
        },
        getNumber = (length, str = '') => {
            while (length > 0)
                str += numbers[Math.floor(Math.random() * numbers.length)], length--;
            return str;
        }

    return `${getWord(Math.floor(length / 2), prefix)}_${getNumber(Math.floor(length / 2))}`;
}