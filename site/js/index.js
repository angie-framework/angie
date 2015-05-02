(function(a) {
    'use strict';

    a.module('angieWebApp', [
        'ngRoute'
    ]).config(function($routeProvider) {
        $routeProvider.when('/news', {
            templateUrl: 'html/news.html'
        }).when('/features', {
            templateUrl: 'html/features.html'
        }).when('/quickstart', {
            templateUrl: 'html/quickstart.html'
        }).when('/docs', {
            templateUrl: 'html/docs.html'
        }).when('/contributors', {
            templateUrl: 'html/contributors.html'
        }).otherwise('/news');
    });
})(angular);
