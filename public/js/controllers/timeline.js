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
        if (data[0].created_time){
            $scope.timelineData = igFilter(data)
        } else {
            $scope.timelineData = twitterFilter(data)
        }
    })
    function twitterFilter (data){
        var cache = []

        data.forEach(function (item){
            var tweetObj = {
                provider: 'twitter',
                created_at: item.created_at,
                id_str: item.id_str,
                user: item.user
            }

            if (item.in_reply_to_status_id){
                angular.extend(tweetObj, {
                    type: 'reply',
                    text: item.text
                })
            } else if (item.retweeted_status){
                angular.extend(tweetObj, {
                    type: 'retweet',
                    retweet: {
                        created_at: item.retweeted_status.created_at,
                        text: item.retweeted_status.text,
                        user: item.retweeted_status.user
                    }
                })
            } else if (item.quoted_status_id){
                angular.extend(tweetObj, {
                    type: 'quote',
                    text: item.text,
                    quote: {
                        created_at: item.quoted_status.created_at,
                        id_str: item.quoted_status.id_str,
                        text: item.quoted_status.text,
                        user: item.quoted_status.user
                    }
                })
            } else {
                angular.extend(tweetObj, {
                    type: 'tweet',
                    text: item.text
                })
            }

            cache.push(tweetObj)
        })

        return cache
    }
    function tweetType (item){

        if (item.in_reply_to_status_id){
            return 'reply' // Reply
        } else if (item.retweeted_status){
            return 'retweet' // Retweet
        } else if (item.quoted_status_id){
            return 'quote' // Quote
        } else {
            return 'tweet' // Tweet
        }
    }
    function igFilter (data){
        var cache = []

        data.forEach(function (item){
            var igPost = {
                provider: 'instagram',
                created_at: new Date(item.created_time * 1000).toString(),
                type: item.type,
                id_str: item.id,
                user: item.user,
                text: item.caption && item.caption.text
                        ? item.caption.text
                        : null
            }

            if (item.type === 'image'){
                angular.extend(igPost, {
                    images_src: item.images.standard_resolution.url,
                })
            } else if (item.type === 'video'){
                angular.extend(igPost, {
                    images_src: item.images.standard_resolution.url,
                    videos_src: item.videos.standard_resolution.url
                })
            }
            cache.push(igPost)
        })

        return cache
    }
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