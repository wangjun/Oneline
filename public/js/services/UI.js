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
    },
    // 設置上次閱讀位置提醒
    this.setDivider = function (step){
        var timelineElem = document.getElementsByClassName('timeline');

        if (step === 1){
            angular.element(timelineElem[0]).addClass('divider--top')
        } else {
            angular.element(timelineElem[timelineElem.length - 1]).addClass('divider--bottom')
        }
    },
    this.setNewPostsCount = function (count){
        document
        .getElementsByClassName('loadMore__count')[0]
        .setAttribute('data-count', count)
    }
})