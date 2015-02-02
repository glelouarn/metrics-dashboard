var constants = {
    locale: 'en',
    timezone: (new Date().getTimezoneOffset()) / -60,
    metricsUrl: "http://serafina.lyra-network.com:8080/vads-metrics/",
    authent: "Basic MjAwMDox",
    colors: ['#6CACC8', '#36606C', '#167E97', '#7EBE5D', '#BFE425', '#DEF26D', '#B4DE18'],
    currencies: {
        code978: {
            codeNum: 978,
            codeAlpha: 'EUR',
            dividor: 100,
            name: 'Euro',
            display: '\u20AC'
        },
        code840: {
            codeNum: 840,
            codeAlpha: 'USD',
            dividor: 100,
            name: 'Dollar',
            display: '$'
        },
        code320: {
            codeNum: 320,
            codeAlpha: 'GTQ',
            dividor: 100,
            name: 'Quetzal',
            display: 'GTQ'
        },
        code458: {
            codeNum: 458,
            codeAlpha: 'MYR',
            dividor: 100,
            name: 'Ringgit',
            display: 'M$'
        },
        code901: {
            codeNum: 901,
            codeAlpha: 'TWD',
            dividor: 100,
            name: 'New Taiwan dollar',
            display: 'NT$'
        }
    },
    values: {
        val_cb: "Carte Bancaire",
        val_visa: "Visa",
        val_mc: "MasterCard",
        val_amex: "American Express",
        val_to_capture: "To capture",
        val_wait_autor: "Wait authorisation",
        val_refused: "Refused",
        val_captured: "Captured",
        val_to_validate: "To validate",
        val_expired: "Expired",
        val_cancelled: "Cancelled",
        val_3ds: "3DS",
        val_auto_05: "Authorisation 05",
        val_auto_07: "Authorisation 07",
        val_auto_57: "Authorisation 57",
        val_risk: "Risk analysis",
        val_other: "Other"
    }
};