angular.module('Oneline', [
    'ngTouch',
    'ngAnimate',
    'ngResource',
    'ui.router',
    'angular-jwt',
    'angular-storage',
    'Oneline.rootControllers',
    'Oneline.settingsControllers',
    'Oneline.timelineControllers',
    'Oneline.timelineServices',
    'Oneline.tokenHelperServices',
    'Oneline.UIServices'
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
            templateUrl: '/public/dist/settings.min.html',
            controller: 'settingsCtrl'
        })
        .state('timeline', {
            url: "/{provider:all|twitter|instagram|weibo}",
            templateUrl: '/public/dist/timeline.min.html',
            controller: 'timelineCtrl'
        })
}])
.factory('feedCache', ['$cacheFactory', function($cacheFactory){
    return $cacheFactory('feedCache')
}])