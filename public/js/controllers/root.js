angular.module('Oneline.rootControllers', [])
.controller('rootController', [
        '$scope', '$timeout', 'store', 'olTokenHelper',
    function ($scope, $timeout, store, olTokenHelper){


    /**
     * 初始化
     *     1. 初始化「社交網站列表」
     *     2. 初始化 `isTimeline` 的值
     *     3. 設置「當前時間線上聚合的社交網站」
     */
    // 1
    $scope.providerList = olTokenHelper.getProviderList()
    // 2
    $scope.isTimeline = false
    // 3
    $scope.timelineProvider = store.get('timelineProvider') || 'all'
    store.set('timelineProvider', $scope.timelineProvider)


    // 刷新「社交網站列表」
    $scope.updateProviderList = function (){
        $timeout(function (){
            $scope.providerList = olTokenHelper.getProviderList()
        })
    }
    // 設置當前是否為「時間線頁面」
    $scope.setTimeline = function (value){
        $scope.isTimeline = value
    }
    // 驗證 provider 是否已授權
    $scope.isAuth = function (provider){
        return $scope.providerList.indexOf(provider) >= 0
    }

}])