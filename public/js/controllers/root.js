angular.module('Oneline.rootControllers', [])
.controller('rootController', [
        '$scope', '$timeout', 'store', 'olTokenHelper', 'Action',
    function ($scope, $timeout, store, olTokenHelper, Action){


    /**
     * 初始化
     *     1. 初始化「社交網站列表」
     *     2. 初始化 `isTimeline` & `actionsInfo` 的值
     *     3. 設置「當前時間線上聚合的社交網站」
     */
    // 1
    $scope.providerList = olTokenHelper.getProviderList()
    // 2
    $scope.isTimeline = false
    $scope.actionsInfo = {}
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
    // 設置顯示 Actions
    $scope.setActions = function (item){
        $timeout(function (){
            $scope.actionsInfo = item
        })
    }
    // 驗證 provider 是否已授權
    $scope.isAuth = function (provider){
        return $scope.providerList.indexOf(provider) >= 0
    }


    /**
     * 其他操作
     *
     * `scope.showActions` 顯示其他操作介面
     * `scope.like` 點心
     *  
     */
    $scope.showActions = function (item){
        $scope.setActions(item)
    }
    $scope.like = function (provider, id){
        console.log(provider, id)
        Action
        .fire({ action: 'like' }, { provider: provider, id: id })
        .$promise
        .then(function (data){
            console.log(data)
        }, function (err){
            console.log(err)
        })
    }

    // 滾動時重置 `actionsInfo`
    document
    .getElementsByClassName('oneline')[0]
    .addEventListener('scroll', function (){
        $scope.setActions({})
    })
}])