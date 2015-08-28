angular.module('Oneline.timelineControllers', [])
.controller('timelineCtrl', ['$scope', '$state', '$stateParams', 'store', 'Timeline', 'olTokenHelper',
    function($scope, $state, $stateParams, store, Timeline, olTokenHelper){


    /**
     * 初始化
     *     1. 判斷是否需要跳轉到「設置頁面」
     *     2. 設置 `isTimeline` 為 `true`
     *     3. 判斷是否需要設置「當前時間線上聚合的社交網站」
     *     4. 初始化時間線
     */
    // 1
    olTokenHelper.isValidToken()
        ? null
        : $state.go('settings', { settings: 'settings' })
    // 2
    $scope.setTimeline(true)
    // 3
    $scope.providerList.indexOf($stateParams.provider) >= 0 || $stateParams.provider === 'all'
        ? setTimelineProvider($stateParams.provider)
        : $state.go('timeline', { provider: store.get('timelineProvider') })
    // 4
    $scope.timelineData = []
    Timeline.query(function (data){
        $scope.timelineData = data
    })
    /**
     * 時間線操作
     *
     *
     */


    // 更改「當前時間線上聚合的社交網站」
    function setTimelineProvider(provider){
        store.set('timelineProvider', provider)
        $state.go('timeline', { provider: provider })
    }
}])