angular.module('Oneline.olTextDirectives', [])
.directive('trimMediaLink', ['$timeout', function ($timeout){
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            $timeout(function () {
                element.html(element.html().replace(attrs.trimMediaLink, ''));
            });

        }
    }
}])
.filter('html', ['$sce', function($sce) {
    return function(str) {
        return $sce.trustAsHtml(str);
    };
}])