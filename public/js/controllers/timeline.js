angular.module('Oneline.timelineControllers', [])
.controller('timelineCtrl', ['$scope', '$interval', '$state', '$stateParams', 
    'store', 'Timeline',
    'olUI', 'olTokenHelper', 'olTimelineHelper', 'timelineCache',
    function($scope, $interval, $state, $stateParams, 
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
    if (!olTokenHelper.isValidToken()){
        olTokenHelper.clearToken()
        $scope.updateProviderList()
        $state.go('settings')
    }
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
        olTimelineHelper.storePosts('oldPosts', posts, $scope.providerList)
        // 保存 max_id & max_date
        var fakeNewPosts = {
            data    : [],
            max_id  : posts.max_id,
            max_date: posts.max_date
        }
        olTimelineHelper.storePosts('newPosts', fakeNewPosts, $scope.providerList)
        // 獲取 30 分鐘內貼文
        $scope.timelineData = olTimelineHelper.extractOldPosts()
        // 結束加載動畫
        olUI.setLoading(false, 1)
        olUI.setLoading(false, -1)
    }, function (err){
        if (err.status === 401){
            $state.go('settings')
        }
    })


    /**
     * 時間線操作
     *
     *  `scope.loadMore` 加載「新貼文」／「舊貼文」
     *  `scope.resetCount` 重置未讀「新貼文」提醒
     */
    $scope.loadMore = function (step){
        if (olUI.isLoading(step)) return;
        olUI.setLoading(true, step)

        if (step > 0){

            // 從本地獲取
            var newPostsFromCache = timelineCache.get('newPosts') || []
            if (newPostsFromCache.length > 0){

                olUI.setDivider(step)
                $scope.timelineData = $scope.timelineData.concat(newPostsFromCache)
                timelineCache.put('newPosts', [])
                olUI.setLoading(false, step)

                return;
            }

            // 從後端獲取
            Timeline
            .load({
                id: olTimelineHelper.getId('newPosts', $scope.providerList),
                count: 70
            })
            .$promise
            .then(function (newPosts){
                if (newPosts.data.length > 0){
                    olUI.setDivider(step)
                    $scope.timelineData = $scope.timelineData.concat(newPosts.data)
                }
            })
            .catch(function (err){
                if (err.status === 401){
                    $state.go('settings')
                }
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
                // 此處 401 錯誤不跳轉到授權頁面
                console.log(err)
            })
            .finally(function (){
                olUI.setDivider(step)
                olUI.setLoading(false, step)
                $scope.timelineData = $scope.timelineData.concat(olTimelineHelper.extractOldPosts())
            })
        }
    }
    $scope.resetCount = function (){
        olUI.setNewPostsCount('')
    }
    // 定時獲取「新貼文」
    $interval(function (){
        olTimelineHelper.loadNewPosts($scope.providerList)
        .then(function (){
            var newPostsLength = (timelineCache.get('newPosts') || []).length
            // 設置提醒
            olUI.setNewPostsCount(newPostsLength)
        }, function (){})
    }, 1000 * 60 * 3)


    // 更改「當前時間線上聚合的社交網站」
    function setTimelineProvider(provider){
        store.set('timelineProvider', provider)
        $state.go('timeline', { provider: provider })
    }
}])