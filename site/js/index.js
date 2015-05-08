(function(a) {
    'use strict';

    a.module('ngieWebApp', [
        'ngRoute',
        'ngAnimate'
    ]).config(function($routeProvider) {
        $routeProvider.when('/default', {
            templateUrl: 'html/default.html'
        }).when('/news', {
            templateUrl: 'html/news.html'
        }).when('/features', {
            templateUrl: 'html/features.html'
        }).when('/quickstart', {
            templateUrl: 'html/quickstart.html'
        // }).when('/docs', {
        //     templateUrl: 'html/docs.html'
        }).when('/contributors', {
            templateUrl: 'html/contributors.html'
        }).otherwise('/default');
    });
})(angular);
