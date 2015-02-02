var datas = {
    currency: constants.currencies.code978,
    card: {
        datas: null,
        charts: {
            countByCurrency: null,
            amntByCard: null
        }
    },
    status: {
        datas: null,
        charts: {
            amntByStatus: null
        }
    },
    reject: {
        datas: null,
        charts: {
            amntByReason: null
        }
    },
    trend: {
        datas: null,
        charts: {
            trend: null,
            mode: 'turnover',
            scale: {
                active: 'all',
                month: {
                    start: moment().zone(-constants.timezone).subtract(1, 'month').startOf('month').startOf('isoweek'),
                    end: moment().zone(-constants.timezone).subtract(1, 'month').endOf('month').endOf('isoweek'),
                    scale: 'week'
                },
                week: {
                    start: moment().zone(-constants.timezone).subtract(1, 'month').startOf('isoWeek').startOf('day'),
                    end: moment().zone(-constants.timezone).subtract(1, 'month').endOf('isoWeek').endOf('day'),
                    scale: 'day'
                },
                day: {
                    start: moment().zone(-constants.timezone).subtract(1, 'month').startOf('day').startOf('hour'),
                    end: moment().zone(-constants.timezone).subtract(1, 'month').endOf('day').endOf('hour'),
                    scale: 'hour'
                }
            },
        }
    }
}

// req = dist || trend
// type = card || status || reject
window.getData = function getData(req, type) {
    var scale = datas.trend.charts.scale;

    var url = constants.metricsUrl + req + '?time_zone=' + (scale.active !== 'day' ? constants.timezone : 0) + (req === 'dist' ? '&type=' + type : '');
    if (scale.active !== 'all') {
        url += '&scale=' + scale[scale.active].scale + '&start_date=' + moment(scale[scale.active].start).toISOString() + '&end_date=' + moment(scale[scale.active].end).toISOString();
    }

    jQuery.ajax({
        type: 'GET',
        url: url,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',

        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', constants.authent);
        },

        success: function (data, status, jqXHR) {
            refreshData(req, type, data);
        },

        error: function (jqXHR, status) {}
    });
}

convertDistData = function convertDistData(data) {
    return convertData(data, [['string', 'Distribution'], ['number', 'Amount']], function (result, element) {
        if (element.currency == datas.currency.codeNum) {
            result.total = element.sum
            result.count = element.count
            element.dist.forEach(function (distElt) {
                var amt = formatMoney(distElt.sum, datas.currency);
                result.model.addRow([constants.values['val_' + distElt.value.toLowerCase()], {
                    v: amt.amount,
                    f: amt.displayAmount
                        }]);
            })
        }
    });
}

convertCurrData = function convertCurrData(data) {
    return convertData(data, [['string', 'Currency'], ['number', 'Count']], function (result, element) {
        result.model.addRow([constants.currencies['code' + element.currency].name, {
            v: element.count,
            f: formatMoney(element.sum, constants.currencies['code' + element.currency]).displayAmount
            }]);
        result.total += element.count;
        result.count++;
    });
}

convertTrendData = function convertTrendData(data) {
    return convertData(data, [['date', 'Distribution'], ['number', 'Amount']], function (result, element) {
        if (element.currency == datas.currency.codeNum) {
            result.total = element.sum;
            result.count = element.count;
            element.trend.forEach(function (trendElt) {
                var date = moment(trendElt.date);
                var amt = formatMoney(datas.trend.charts.mode === 'turnover' ? trendElt.sum : trendElt.avg, datas.currency);
                result.model.addRow([{
                    v: date.toDate(),
                    f: date.format(datePattern())
                }, {
                    v: amt.amount,
                    f: amt.displayAmount
                }]);
            })
        }
    });
}

datePattern = function datePattern() {
    switch (datas.trend.charts.scale.active) {
    case 'all':
        return 'MMMM YYYY';
    case 'month':
    case 'week':
        return 'll';
    case 'day':
        return 'lll';
    }
}

convertData = function convertData(data, columnsDef, convertionFunction) {
    result = {
        'model': new google.visualization.DataTable(),
        'total': 0,
        'count': 0
    };

    columnsDef.forEach(function (element) {
        result.model.addColumn(element[0], element[1]);
    });

    data.forEach(function (element) {
        convertionFunction(result, element);
    });

    return result;
}

refreshData = function refreshData(req, type, data) {
    var countByCurrency, amntByCard, amntByStatus, amntByReason, trend = false;

    if (req === 'dist') {
        switch (type) {
        case 'card':
            if (data) {
                datas.card.datas = data;
                countByCurrency = true;
            };
            amntByCard = true;
            break;
        case 'status':
            if (data) datas.status.datas = data;
            amntByStatus = true;
            break;
        case 'reject':
            if (data) datas.reject.datas = data;
            amntByReason = true;
            break;
        default:
            amntByCard = true;
            amntByStatus = true;
            amntByReason = true;
        }
    } else if (req === 'trend') {
        if (data) {
            datas.trend.datas = data;
        }
        trend = true;
    } else {
        amntByCard = true;
        amntByStatus = true;
        amntByReason = true;
        trend = true;
    }

    if (countByCurrency) {
        datas.card.charts.countByCurrency = draw('PieChart', datas.card.charts.countByCurrency, 'chart-02', convertCurrData(datas.card.datas), 'currencies', function () {
            var selectedItem = datas.card.charts.countByCurrency.getSelection()[0];
            if (selectedItem) {
                datas.currency = constants.currencies['code' + datas.card.datas[selectedItem.row].currency];
                refreshData();
            } else {
                selectPieChartCurrency(datas.card.charts.countByCurrency);
            }
        });
        selectPieChartCurrency(datas.card.charts.countByCurrency);
    }

    if (amntByCard) {
        datas.status.charts.amntByCard = draw('PieChart', datas.status.charts.amntByCard, 'chart-03', convertDistData(datas.card.datas), 'money');
    }

    if (amntByStatus) {
        datas.status.charts.amntByStatus = draw('PieChart', datas.status.charts.amntByStatus, 'chart-04', convertDistData(datas.status.datas), 'money');
    }

    if (amntByReason) {
        datas.reject.charts.amntByReason = draw('PieChart', datas.reject.charts.amntByReason, 'chart-05', convertDistData(datas.reject.datas), 'money');
    }

    if (trend) {
        datas.trend.charts.trend = draw('ColumnChart', datas.trend.charts.trend, 'chart-01', convertTrendData(datas.trend.datas), 'money', function () {
            var selectedItem = datas.trend.charts.trend.getSelection()[0];
            if (selectedItem) {
                for (var i = 0; i < datas.trend.datas.length; i++) {
                    if (datas.trend.datas[i].currency === datas.currency.codeNum) {
                        if (datas.trend.charts.scale.active !== 'day') {
                            zoom(datas.trend.charts.scale.active, datas.trend.datas[i].trend[selectedItem.row].date);
                        } else {
                            datas.trend.charts.trend.setSelection([{
                                column: null,
                                row: null
                        }]);
                        }
                    }
                };
            }
        });
    }
}

zoom = function zoom(currentScale, targetDate) {
    var scales = ['all', 'month', 'week', 'day', 'hour'];
    var futureScale = scales[scales.indexOf(currentScale) + 1];
    var futureScaleRounding = scales[scales.indexOf(currentScale) + 2];

    $('[id|=time]').each(function () {
        $(this).parent().removeClass('active');
    });

    datas.trend.charts.scale[futureScale].start = moment(targetDate).zone(-constants.timezone).startOf(futureScale !== 'week' ? futureScale : 'isoweek').startOf(futureScaleRounding !== 'week' ? futureScaleRounding : 'isoweek');
    datas.trend.charts.scale[futureScale].end = moment(targetDate).zone(-constants.timezone).endOf(futureScale !== 'week' ? futureScale : 'isoweek').endOf(futureScaleRounding !== 'week' ? futureScaleRounding : 'isoweek');
    datas.trend.charts.scale.active = futureScale;
    $('#time-' + futureScale).parent().toggleClass('active');
    getAllData();
};

selectPieChartCurrency = function selectPieChartCurrency(chart) {
    datas.card.datas.forEach(function (elt, index) {
        if (elt.currency === datas.currency.codeNum)
            chart.setSelection([{
                column: null,
                row: index
              }]);
    });
}

draw = function draw(type, chart, eltId, convDatas, legendType, listener) {
    var legend;

    if (legendType === 'money') {
        legend = 'Total: <b>' + formatNumber(convDatas.count).displayNumber + '</b> transactions, <b>' + formatMoney(convDatas.total, datas.currency).displayAmount + '</b>';
    } else if (legendType === 'currencies') {
        legend = 'Total: <b>' + formatNumber(convDatas.total).displayNumber + '</b> transactions, <b>' + convDatas.count + '</b> currencies';
    }

    var chart = drawChart(type, chart, eltId, convDatas.model, legend, listener);

    return chart;
}

drawChart = function drawChart(type, chart, eltId, content, legend, listener) {
    var view = document.getElementById(eltId);

    if (!chart) {
        view.style.height = '250px';
        switch (type) {
        case 'PieChart':
            chart = new google.visualization.PieChart(view);
            break;
        case 'ColumnChart':
            chart = new google.visualization.ColumnChart(view);
            break;
        }

        if (!listener) {
            listener = function () {
                chart.setSelection([{
                    column: null,
                    row: null
              }]);
            };
        }
        google.visualization.events.addListener(chart, 'select', listener);
    };

    var options = {
        animation: {
            duration: 500,
            easing: 'in',
        },
        colors: constants.colors,
    };

    switch (type) {
    case 'PieChart':
        options.chartArea = {
            height: '85%',
            left: '5%',
            top: '5%',
            width: '100%'
        },
        options.pieSliceText = 'value'
        break;
    case 'ColumnChart':
        options.hAxis = {
            gridlines: {
                count: -1
            }
        };
        options.vAxis = {
            minValue: 0,
            format: datas.currency.display + ' #,###',
        };
        options.chartArea = {
            height: '80%',
            left: '13%',
            top: '5%',
            width: '82%'
        };
        options.legend = {
            position: 'none'
        };
        break;
    };

    if (legend) view.parentNode.parentNode.childNodes[5].innerHTML = legend;

    chart.draw(content, options);

    return chart;
}

google.load('visualization', '1.0', {
    'packages': ['corechart'],
    'language': constants.locale
});

google.setOnLoadCallback(function () {
    getAllData();
});

getAllData = function getAllData() {
    getData('dist', 'card');
    getData('dist', 'status');
    getData('dist', 'reject');
    getData('trend');
}

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    } else {
        return results[1] || 0;
    }
}

$(document).ready(function () {
    var shop = decodeURIComponent($.urlParam('shop'));
    var res = shop.match(/[0-9]+/g);
    if (res && res.length == 2) {
        var tok = res[0] + ':' + res[1];
        var hash = btoa(tok);
        constants.authent = "Basic " + hash;
    }


    $('[id|=time]').on('change', function (event) {
        if (this.checked) {
            datas.trend.charts.scale.active = this.dataset.range;
            getAllData();
        }
    });
    $('[id|=mode]').on('change', function (event) {
        if (this.checked) {
            datas.trend.charts.mode = this.dataset.range;
            refreshData('trend');
        }
    });
});