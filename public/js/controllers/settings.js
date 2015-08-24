angular.module('Oneline.settingsControllers', [])
.controller('settingsCtrl', ['$scope', '$window', '$state', '$stateParams', 'store', 'olTokenHelper', 
    function($scope, $window, $state, $stateParams, store, olTokenHelper){


    /**
     * 初始化
     *     1. 判斷是否需要跳轉到「時間線頁面」
     *     2. 設置 `isTimeline` 為 `false`
     */
    olTokenHelper.isValidToken() && $stateParams.s !== '1'
        ? $state.go('timeline', { provider: store.get('timelineProvider') })
        : null
    $scope.setTimeline(false)

    /**
     * 跨標籤頁通信
     *     監聽新標籤頁的 localStorage 存儲
     *
     */
    $window.addEventListener('storage', function (e){
        if (e.key !== 'addToken') return;

        olTokenHelper.addToken()
        $scope.updateProviderList()
    })


    // 添加／刪除「社交網站」授權
    $scope.toggleAuth = function (provider){
        if ($scope.providerList.indexOf(provider) < 0){
            $window.open('/auth/' + provider + '/test', '_blank')
            // $window.open('/auth/' + provider, '_blank')
        } else {
            olTokenHelper.removeToken(provider)
            $scope.updateProviderList()
        }
    }

}])