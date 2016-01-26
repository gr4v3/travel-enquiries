phonon.options({
    navigator: {
        defaultPage: 'home',
        animatePages: true,
        enableBrowserBackButton: true,
        templateRootDirectory: './tpl'
    },
    i18n: null // for this example, we do not use internationalization
});
var app = phonon.navigator();
/**
 * The activity scope is not mandatory.
 * For the home page, we do not need to perform actions during
 * page events such as onCreate, onReady, etc
*/
app.on({page: 'home', preventClose: false, content: null});
app.on({page: 'main', preventClose: false, content: null});
app.on({page: 'enquiry', preventClose: false, content: 'enquiry.html', readyDelay: 1}, function(activity) {
    activity.onReady(function() {
        enquiry.form();
    });
});
app.on({page: 'reports', preventClose: false, content: 'reports.html', readyDelay: 1}, function(activity) {
    activity.onReady(function() {
        enquiry.reports();
    });
});
app.on({page: 'stats', preventClose: false, content: 'stats.html', readyDelay: 1}, function(activity) {
    activity.onReady(function() {
        enquiry.stats();
    });
});
// Let's go!
app.start();
document.addEventListener('deviceready', function() {
    enquiry.init();
}, false);