angular.module('Oneline.timelineServices', [])
.factory('Timeline', ['$resource', function($resource){

    return $resource('/timeline/:id/:count', null, {
        initLoad: {
            method: 'GET'
        },
        load: {
            method : 'GET'
        }
    })

}])
.service('olTimelineHelper', ['$q', 'Timeline', 'timelineCache', function($q, Timeline, timelineCache){
    var time_pointer   = Date.now();
    var retrieve_count = 30;
    var TIME_RANGE     = 1800000;

    // 獲取最新的貼文 id
    this.getMaxId = function (providerList){
        var id_str = ''

        providerList.forEach(function (provider, index){
            var list = document.getElementsByClassName('timeline--' + provider),
                id_s = provider
                    + '_minId-'
                    + list[0].getAttribute('data-id')
                    + (index === providerList.length - 1 ? '' : ',')

            id_str += id_s
        })

        return id_str
    },
    // 獲取最舊的貼文 id
    this.getMinId = function (providerList){
        var id_str = ''

        providerList.forEach(function (provider, index){
            var oldPosts = timelineCache.get('oldPosts'),
                id_s = provider
                    + '_maxId-'
                    + timelineCache.get(provider + '_min_id')
                    + (index === providerList.length - 1 ? '' : ',')

            id_str += id_s
        })

        return id_str
    }
    // 存儲「舊貼文」
    this.storeOldPosts = function (posts, providerList){
        var data         = posts.data,
            oldPosts     = timelineCache.get('oldPosts') || [];

        // 保存 Instagram 和 Twitter 最舊的貼文 id 和 date
        providerList.forEach(function (provider){
            var id_key     = provider + '_min_id',
                id_value   = posts.min_id[provider],
                date_key   = provider + '_min_date',
                date_value = posts.min_date[provider];

            if (id_value){
                timelineCache.put(id_key, id_value)
            }
            if (date_value){
                timelineCache.put(date_key, date_value)
            }
        })
        // 保存「舊貼文」
        oldPosts = oldPosts.concat(data)
        timelineCache.put('oldPosts', oldPosts)
    }
    /**
     * 檢查 Provider 最舊的的貼文是否在「時間指針」30 分鐘範圍內，判斷是否需要從後端獲取「舊貼文」
     * 
     * @return 不需要獲取（貼文）的 Providers
     *
     */
    this.checkOldPosts = function (providerList){
        return $q(function (resolve, reject){
            var invalidList =  providerList.filter(function (provider){
                return time_pointer - timelineCache.get(provider + '_min_date') < TIME_RANGE
            })

            if (invalidList.length > 0){
                resolve(invalidList)
            } else {
                reject('all valid')
            }
        })
    }
    // 獲取「時間指針」 30 分鐘內的「舊貼文」
    this.extractOldPosts = function (){

        var oldPosts = timelineCache.get('oldPosts') || [],
            postsCache = [];

        var extractOldPosts = oldPosts.filter(function (item){
            var isExtractPost = time_pointer - item.created_at <= TIME_RANGE;

            if (!isExtractPost){
                postsCache.push(item)
            }

            return isExtractPost
        })

        timelineCache.put('oldPosts', postsCache)
        time_pointer -= TIME_RANGE

        return extractOldPosts
    }
    // 向後端請求加載「舊貼文」
    this.loadOldPosts = function(invalidList, providerList){
        var defer = $q.defer()

        var _this = this;

        function fetchPosts(invalidList){
            var defer = $q.defer()

            var max_id_str = _this.getMinId(invalidList),
                count      = retrieve_count;

            Timeline
            .load({id: max_id_str, count: count})
            .$promise
            .then(function (oldPosts){
                // 過濾 Twitter 返回的「舊貼文」中包含 max_id 貼文
                if (oldPosts.min_date.twitter){
                    oldPosts.data.splice(0, 1)
                }
                _this.storeOldPosts(oldPosts, providerList)

                // 若一次未能滿足，下次獲取時「加量」
                count < 100 ? count += 10 : null

                defer.resolve()
            })

            return defer.promise;
        }
        function isLoadFin(){
            var defer = $q.defer()

            _this.checkOldPosts(providerList)
            .then(function (invalidList){
                fetchPosts(invalidList)
                .then(isLoadFin)
                .then(function (){
                    defer.resolve()
                })
            }, function (){
                defer.resolve()
            })

            return defer.promise;
        }

        fetchPosts(invalidList).then(isLoadFin).then(function (){

            retrieve_count < 100 ? retrieve_count += 10 : null

            defer.resolve()
        })

        return defer.promise;
    }

}])