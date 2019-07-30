module.exports = {
    publicPath: process.env.NODE_ENV === 'development' ? '' : '/customer-assigns/',
    productionSourceMap: false,
    pluginOptions: {
        i18n: {
            locale: 'zh-tw',
            fallbackLocale: 'en',
            localeDir: 'locales',
            enableInSFC: false,
        },
    },
    devServer: {
        proxy: {
            '/img': {
                target: 'http://127.0.0.1:3000',
                ws: true,
                changeOrigin: true,
            },
        },
    },
};
