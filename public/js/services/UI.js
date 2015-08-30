angular.module('Oneline.UIServices', [])
.service('olUI', function(){
    // 設置是否為「正在加載」
    this.setLoading = function (bool, step){
        var loadingElem = angular.element(document.getElementsByClassName('loadMore')[step === 1 ? 0 : 1]);

        if (bool){
            loadingElem.children().addClass('loadMore__loading')
        } else {
            loadingElem.removeClass('loadMore--initLoad')
            loadingElem.children().removeClass('loadMore__loading')
        }
    },
    // 判斷是否「正在加載」
    this.isLoading = function (step){
        var loadingElem = angular.element(document.getElementsByClassName('loadMore')[step === 1 ? 0 : 1]);

        return loadingElem.children().hasClass('loadMore__loading')
    }
})