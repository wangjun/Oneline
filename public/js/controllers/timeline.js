angular.module('Oneline.timelineControllers', [])
.controller('timelineCtrl', ['$scope', '$state', 
    'Timeline', 'olUI', 'olTokenHelper', 'olTimelineHelper', 'olActionsHelper', 'timelineCache',
    function($scope, $state, 
        Timeline, olUI, olTokenHelper, olTimelineHelper, olActionsHelper, timelineCache){


    /**
     * 初始化
     *     1. 判斷是否需要跳轉到「設置頁面」
     *     2. 設置 `isTimeline` 為 `true`
     *     3. 初始化時間線
     */
    // 1
    if (!olTokenHelper.isValidToken()){
        olTokenHelper.clearToken()
        $scope.updateProviderList()
        $state.go('settings')
        return;
    }
    // 2
    $scope.setTimeline(true)
    // 3
    $scope.timelineData = []
    olTimelineHelper.initTimelineSettings()
    Timeline
    .initLoad()
    .$promise
    .then(function (posts){
        if (!posts || (posts.data && posts.data.length < 1)) return;

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
        olTimelineHelper.checkOldPosts($scope.providerList)
        .then(function (invalidList){
            return olTimelineHelper.loadOldPosts(invalidList, $scope.providerList)
        })
        .finally(function (){
            $scope.timelineData = olTimelineHelper.extractOldPosts()
            // 結束加載動畫
            olUI.setLoading(false, 1)
            olUI.setLoading(false, -1)
        })
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

            if (newPostsFromCache.length > 1){
                var cache = []
                cache = $scope.timelineData.concat(newPostsFromCache)
                $scope.timelineData = olTimelineHelper.removeOldPosts(cache)
                timelineCache.put('newPosts', [])

                olUI.setLoading(false, step)
                olUI.setDivider(step)

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
                if (!newPosts || (newPosts.data && newPosts.data.length < 1)) return;

                var cache = []
                olTimelineHelper.storePosts('newPosts', newPosts, $scope.providerList)
                cache = $scope.timelineData.concat(timelineCache.get('newPosts') || [])
                $scope.timelineData = olTimelineHelper.removeOldPosts(cache)
                timelineCache.put('newPosts', [])

                olUI.setDivider(step)
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
    if (window.intervalLoad){
        clearInterval(window.intervalLoad)
    }
    window.intervalLoad = setInterval(function (){
        olTimelineHelper.loadNewPosts($scope.providerList)
        .then(function (){
            var newPostsLength = (timelineCache.get('newPosts') || []).length
            // 設置提醒
            olUI.setNewPostsCount(newPostsLength)
        }, function (){})
    }, 1000 * 60 * 3)

    /**
     * 其他操作
     *
     *
     */
    $scope.toggleAction = function (action, provider, id){
        // 過濾重複（或凍結的）請求
        if (olUI.isActionWait(action, id) || olUI.isActionFrozen(action, id)) return;

        var isActive = olUI.isActionActive(action, id);
        // 更改樣式
        olUI.setActionState(action, id, 'wait')
        olUI.setActionState(action, id, isActive ? 'inactive' : 'active')
        // 發送請求
        olActionsHelper.toggleAction(action, provider, id, isActive)
        .catch(function (err){
            olUI.setActionState(action, id, isActive ? 'active' : 'inactive')
        })
        .finally(function (){
            olUI.setActionState(action, id, 'done')
        })
    }
}])