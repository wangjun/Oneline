angular.module('Oneline.UIServices', [])
.service('olUI', function(){

    this.setLoading = function (bool, isNew){
        var loadingElem = angular.element(document.getElementsByClassName('loadMore')[isNew ? 0 : 1]);

        if (bool){
            loadingElem.children().addClass('loadMore__loading')
        } else {
            loadingElem.removeClass('loadMore--loading')
            loadingElem.children().removeClass('loadMore__loading')
        }

        if (isNew){

        }
    }
})