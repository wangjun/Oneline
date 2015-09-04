angular.module('Oneline', [
    // ng
    'ngTouch',
    'ngResource',
    // Vendors
    'ui.router',
    'angular-jwt',
    'angular-storage',
    'linkify',
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
    'Oneline.olVideoDirectives',
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
            url: '/?s',
            templateProvider: ['$templateCache', function ($templateCache){
                return $templateCache.get('settings.html')
            }],
            controller: 'settingsCtrl'
        })
        .state('timeline', {
            url: "/{provider:all|twitter|instagram|weibo}",
            templateProvider: ['$templateCache', function ($templateCache){
                return $templateCache.get('timeline.html')
            }],
            controller: 'timelineCtrl'
        })
}])
.factory('timelineCache', ['$cacheFactory', function($cacheFactory){
    return $cacheFactory('timelineCache')
}])