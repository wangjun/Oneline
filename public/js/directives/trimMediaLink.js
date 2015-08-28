angular.module('Oneline.trimMediaLinkDirectives', [])
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