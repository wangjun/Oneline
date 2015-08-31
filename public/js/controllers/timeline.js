angular.module('Oneline.timelineControllers', [])
.controller('timelineCtrl', ['$scope', '$state', '$stateParams', 
    'store', 'Timeline',
    'olUI', 'olTokenHelper', 'olTimelineHelper', 'timelineCache',
    function($scope, $state, $stateParams, 
        store, Timeline, 
        olUI, olTokenHelper, olTimelineHelper, timelineCache){


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
    Timeline
    .initLoad()
    .$promise
    .then(function (posts){
        // 保存貼文與 min_id & min_date
        olTimelineHelper.storeOldPosts(posts, $scope.providerList)
        // 獲取 30 分鐘內貼文
        $scope.timelineData = olTimelineHelper.extractOldPosts()
        // 結束加載動畫
        olUI.setLoading(false, 1)
        olUI.setLoading(false, -1)
    })


    /**
     * 時間線操作
     *
     *  `scope.loadMore` 加載下一個「時間指針」範圍的貼文
     */
    $scope.loadMore = function (step){
        if (olUI.isLoading(step)) return;
        olUI.setLoading(true, step)

        if (step > 0){

            Timeline
            .load({
                id: olTimelineHelper.getMaxId($scope.providerList),
                count: 20
            })
            .$promise
            .then(function (newPosts){
                if (newPosts.data.length > 0){
                    olUI.setDivider(step)
                    $scope.timelineData = $scope.timelineData.concat(newPosts.data)
                }
            })
            .catch(function (err){
                console.log(err)
            })
            .finally(function (){
                olUI.setLoading(false, step)
            })

        } else {

            olTimelineHelper.checkOldPosts($scope.providerList)
            .then(function (invalidList){
                return olTimelineHelper.loadOldPosts(invalidList, $scope.providerList)
            }, function (){})
            .catch(function (err){
                // Oops...
                console.log(err)
            })
            .finally(function (){
                olUI.setDivider(step)
                olUI.setLoading(false, step)
                $scope.timelineData = $scope.timelineData.concat(olTimelineHelper.extractOldPosts())
            })
        }
    }


    // 更改「當前時間線上聚合的社交網站」
    function setTimelineProvider(provider){
        store.set('timelineProvider', provider)
        $state.go('timeline', { provider: provider })
    }
}])