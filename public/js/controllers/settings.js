angular.module('Oneline.settingsControllers', [])
.controller('settingsCtrl', ['$scope', '$window', 
    '$state', '$stateParams', 
    'olTokenHelper', 'timelineCache', 'Auth', 'Replicant',
    function($scope, $window, 
        $state, $stateParams, 
        olTokenHelper, timelineCache, Auth, Replicant){


    /**
     * 初始化
     *     1. 判斷是否需要跳轉到「時間線頁面」
     *     2. 設置 `isTimeline` 為 `false`
     *     3. 若清除定時獲取貼文
     */
    // 1
    if (!olTokenHelper.isValidToken()){
        olTokenHelper.clearToken()
        $scope.updateProviderList()
    }
    // 2
    $scope.setTimeline(false)
    // 3
    if (window.intervalLoad){
        clearInterval(window.intervalLoad)
    }

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
            $window.open('/auth/' + provider, '_blank')
        } else {
            // 刪除後端授權信息
            Auth.revoke({provider: provider})
            .$promise
            .finally(function (){
                // 刪除前端授權信息
                olTokenHelper.removeToken(provider)
                $scope.updateProviderList()
            })
        }
    }
}])