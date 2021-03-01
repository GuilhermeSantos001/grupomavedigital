/**
 * Faz a comparação entre os dois objetivos
 * @param {Object} source Objetivo a ser verificado
 * @param {Object} layout Padrão esperado do objetivo
 * @param {Boolean} ignoreValues Se deve ignorar ou não os valores das propriedades dos objetivos. Por padrão os valores são ignorados.
 */
module.exports = (source = {}, layout = {}, ignoreValues = true) => {
    if (
        Object.keys(source).length <= 0 ||
        Object.keys(layout).length <= 0
    )
        return false;

    const
        source_keys = Object.keys(source),
        layout_keys = Object.keys(layout);

    let filter_keys = [];

    layout_keys.forEach(key => {
        if (ignoreValues) {
            if (source_keys.indexOf(key) != -1)
                filter_keys.push(key)
        } else {
            if (source_keys.indexOf(key) != -1 && source[key] === layout[key])
                filter_keys.push(key)
        }
    });

    return filter_keys.length == source_keys.length;
}