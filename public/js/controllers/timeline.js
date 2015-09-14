angular.module('Oneline.timelineControllers', [])
.controller('timelineCtrl', ['$scope', '$q', '$state', 
    'Timeline', 'olUI', 'olTokenHelper', 'olTimelineHelper', 'olActionsHelper', 'timelineCache',
    function($scope, $q, $state, 
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
    olTimelineHelper.initLoad($scope.providerList)
    .then(function (){
        $scope.timelineData = olTimelineHelper.extractOldPosts($scope.providerList)

        // 結束加載動畫
        olUI.setLoading(false, 1)
        olUI.setLoading(false, -1)
    })
    .catch(function (err){
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

        $q(function (resolve, reject){
            olUI.setLoading(true, step)

            // 加載「新貼文」
            if (step > 0){
                olUI.setPostsCount('newPosts', 0)

                var newPostsFromCache = timelineCache.get('newPosts') || []

                // 從本地獲取
                if (newPostsFromCache.length > 0){
                    resolve([newPostsFromCache, 'newPosts'])
                }
                // 從後端獲取
                else {
                    olTimelineHelper.loadNewPosts($scope.providerList)
                    .then(function (){
                        resolve([timelineCache.get('newPosts') || [], 'newPosts'])
                    }, function (err){
                        reject(err)
                    })
                }
            } 
            // 加載「舊貼文」
            else {
                olTimelineHelper.checkOldPosts($scope.providerList)
                .then(function (invalidList){
                    if (invalidList.length > 0){
                        return olTimelineHelper.loadOldPosts(invalidList, $scope.providerList)
                    }
                })
                .then(function (){
                    var extractOldPosts = olTimelineHelper.extractOldPosts($scope.providerList)

                    resolve([$scope.timelineData.concat(extractOldPosts)])
                })
            }
        })
        .then(function (data){
            if (data[1] === 'newPosts'){
                var allPosts = $scope.timelineData.concat(data[0]);

                $scope.timelineData = olTimelineHelper.removeOldPosts(allPosts, $scope.providerList)
                timelineCache.put('newPosts', [])
            } else {
                $scope.timelineData = data[0]
            }

            olUI.setDivider(step)
        })
        .catch(function (err){
            console.log(err)
            if (err && err.status === 401){
                $state.go('settings')
            }
        })
        .finally(function (){
            olUI.setLoading(false, step)
        })
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
            olUI.setPostsCount('newPosts', newPostsLength)
        })
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