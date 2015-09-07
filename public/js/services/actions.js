angular.module('Oneline.actionsServices', [])
.service('olActionsHelper', ['Action', 'olUI',
    function(Action, olUI){

    this.toggleAction = function (action, provider, id, isActive){
        var method = isActive ? 'destroy' : 'create',
            _id = id;

        if (action === 'retweet' && method === 'destroy'){
            id = olUI.actionData(action, _id)
        }

        return Action[method]({ action: action, provider: provider, id: id })
        .$promise
        .then(function (data){

            if (action === 'retweet'){
                if (method === 'create'){
                    olUI.actionData(action, _id, data.id_str)

                    var count = provider === 'twitter'
                                    ? data.retweet_count
                                    : ~~olUI.actionData('count', _id) + 1;

                    olUI.actionData('count', _id, count)
                } else {
                    var count = provider === 'twitter' 
                                    ? data.retweet_count - 1
                                    : ~~olUI.actionData('count', _id) - 1;
                        count_value = count > 0 ? count : '';

                    olUI.actionData('count', _id, count_value)
                }
            }

        })
    }

}])