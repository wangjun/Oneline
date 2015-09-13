angular.module('Oneline', [
    // ng
    'ngTouch',
    'ngResource',
    'ngSanitize',
    // Vendors
    'ui.router',
    'angular-jwt',
    'angular-storage',
    'linkify',
    'weibo-emotify',
    // Templates
    'Oneline.templates',
    // Controllers
    'Oneline.rootControllers',
    'Oneline.settingsControllers',
    'Oneline.timelineControllers',
    // Services
    'Oneline.timelineServices',
    'Oneline.actionsServices',
    'Oneline.RESTfulServices',
    'Oneline.relativeDateServices',
    'Oneline.tokenHelperServices',
    'Oneline.UIServices',
    // Directives
    'Oneline.olMediaDirectives',
    'Oneline.trimMediaLinkDirectives'
])
.config(['$locationProvider', '$stateProvider', 
    '$urlRouterProvider', '$httpProvider', 'jwtInterceptorProvider',
    function($locationProvider, $stateProvider, 
        $urlRouterProvider, $httpProvider, jwtInterceptorProvider) {


    $locationProvider.html5Mode(true)

    // 配置每次請求攜帶 JWT
    jwtInterceptorProvider.tokenGetter = function() {
        return localStorage.getItem('tokenList')
    }
    $httpProvider.interceptors.push('jwtInterceptor')

    $urlRouterProvider.otherwise('/')

    $stateProvider
        .state('settings', {
            url: '/settings',
            templateProvider: ['$templateCache', function ($templateCache){
                return $templateCache.get('settings.html')
            }],
            controller: 'settingsCtrl'
        })
        .state('timeline', {
            url: "/",
            templateProvider: ['$templateCache', function ($templateCache){
                return $templateCache.get('timeline.html')
            }],
            controller: 'timelineCtrl'
        })
}])
.factory('timelineCache', ['$cacheFactory', function($cacheFactory){
    return $cacheFactory('timelineCache')
}])