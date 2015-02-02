formatMoney = function formatMoney(centAmount, currency) {
    var result = {};
    result.currency = currency;
    result.centAmount = centAmount;
    result.amount = centAmount / (currency.dividor);
    result.displayAmount = accounting.formatMoney(result.amount, symbol = currency.display, precision = 0, thousand = ",", decimal = ".", format = "%s %v");
    return result;
}

formatNumber = function formatNumber(number) {
    var result = {};
    result.number = number;
    result.displayNumber = accounting.formatNumber(number, precision = 0, thousand = ",", decimal = ".");
    return result;
}