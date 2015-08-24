angular.module('Oneline.timelineServices', [])
.factory('Timeline', ['$resource', function($resource){

    return $resource('/timeline/:id')

}])