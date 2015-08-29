angular.module('Oneline.timelineControllers', [])
.controller('timelineCtrl', ['$scope', '$state', '$stateParams', 'store', 'Timeline', 'olUI', 'olTokenHelper', 'timelineCache',
    function($scope, $state, $stateParams, store, Timeline, olUI, olTokenHelper, timelineCache){


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
        $scope.timelineData = filterOldPost(data)

        olUI.setLoading(false, true)
        olUI.setLoading(false, false)
    })


    /**
     * 時間線操作
     *
     *  `loadOldPosts` 加載先前隱藏（發表時間大於一小時）的貼文
     *  `filterOldPost` 隱藏發表時間大於一小時的貼文
     */
    $scope.loadOldPosts = function (){
        var oldPosts = timelineCache.get('oldPosts') || [];

        oldPosts.forEach(function (post){
            $scope.timelineData.push(post)
        })

        timelineCache.remove('oldPosts')
    }
    function filterOldPost(data){
        var oldPosts = [];

        var newPosts = data.filter(function (item){
            var isNewPost = Date.now() - item.created_at < 3600000

            if (!isNewPost){
                oldPosts.push(item)
            }

            return isNewPost
        })

        timelineCache.put('oldPosts', oldPosts)

        return newPosts
    }
    // $scope.getTimeline = function (){
    //     Timeline.get({id: store.get('')})
    // }

    // 更改「當前時間線上聚合的社交網站」
    function setTimelineProvider(provider){
        store.set('timelineProvider', provider)
        $state.go('timeline', { provider: provider })
    }
}])