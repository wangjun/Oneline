angular.module('Oneline.actionServices', [])
.factory('Action', ['$resource', function($resource){

    return $resource('/actions/:action', null, {
        fire: {
            method: 'POST'
        }
    })

}])