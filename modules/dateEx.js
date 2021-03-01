/**
 * @private Restrito ao escopo global
 * @description Coloca 0 na frente da string enquanto a string for menor que a
 * quantia de 0 indicada
 * @param {string} string valor indicado para colocar o 0 a frente desse valor
 * @param {number} length Quantidade de 0 indicada
 * @author GuilhermeSantos
 * @version 1.0.0
 */
var padZero = function (string, length) {
    var s = string.toString();
    while (s.length < length) {
        s = '0' + s;
    }
    return s;
};

/**
 * @private Restrito ao escopo global
 * @description Retorna um texto, uma data completa, dia da semana, dia do 
 * mes, mes, ano e hora
 * @author GuilhermeSantos
 * @version 1.0.0
 */
var now = function () {
    var dias = [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado"
    ];
    var mes = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];
    var date = new Date();
    var h = padZero(date.getHours(), 2);
    var m = padZero(date.getMinutes(), 2);
    var s = padZero(date.getSeconds(), 2);
    var ano = date.getFullYear();
    var data = mes[date.getMonth()] || '???';
    var dataDia = date.getDate();
    var dia = dias[date.getDay()];
    return `${dataDia} de ${data} de ${ano}, na ${dia} as ${h}Horas, ${m}Minutos e ${s}Segundos`;
};

var nowToPDF = function (filter) {
    var mes = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];
    var date = new Date();
    var ano = date.getFullYear();
    var data = mes[date.getMonth()] || '???';
    var dataDia = date.getDate();
    if (filter === 'day') {
        return `${dataDia}`;
    } else if (filter === 'month') {
        return `${data}`;
    } else if (filter === 'year') {
        return `${ano}`;
    }
};

/**
 * @private Restrito ao escopo global
 * @description Retorna um texto, uma data completa, dia da semana, dia do 
 * mes, mes, ano e hora para o login
 * @author GuilhermeSantos
 * @version 1.0.0
 */
function nowToLogin() {
    var dias = [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado"
    ];
    var mes = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];
    var date = new Date();
    var h = padZero(date.getHours(), 2);
    var m = padZero(date.getMinutes(), 2);
    var s = padZero(date.getSeconds(), 2);
    var ano = date.getFullYear();
    var data = mes[date.getMonth()] || '???';
    var dataDia = date.getDate();
    var dia = dias[date.getDay()];
    return `Último login foi em ${dataDia} de ${data} de ${ano}, na ${dia} as ${h}Horas, ${m}Minutos e ${s}Segundos`;
};

module.exports = {
    now,
    nowToPDF,
    nowToLogin
}