angular.module('Oneline.actionsServices', [])
.service('olActionsHelper', ['Action', 
    function(Action){

    this.toggleLike = function (provider, id, isActive){
        var action = isActive ? 'destroy' : 'create';

        return Action[action]({ action: 'like', provider: provider, id: id})
    }

}])