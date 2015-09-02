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
.service('olTimelineHelper', ['$q', 'Timeline', 'timelineCache', 'olUI', 
    function($q, Timeline, timelineCache, olUI){

    var time_pointer   = Date.now();
    var retrieve_count = 50;
    var TIME_RANGE     = 1800000;


    // 獲取最「新／舊貼文」的 max_id / min_id
    this.getId = function (typeOfPosts, providerList){
        var id_str1, id_str2,
            posts = timelineCache.get(typeOfPosts);

        var str = ''

        if (typeOfPosts === 'oldPosts'){
            id_str1 = '_maxId-'
            id_str2 = '_min_id'
        } else {
            id_str1 = '_minId-'
            id_str2 = '_max_id'
        }

        providerList.forEach(function (provider, index){
            var oldPosts = timelineCache.get('oldPosts'),
                id_s = provider
                    + id_str1
                    + timelineCache.get(provider + id_str2)
                    + (index === providerList.length - 1 ? '' : ',')

            str += id_s
        })

        return str
    }
    // 保存「新／舊貼文」
    this.storePosts = function (typeOfPosts, posts, providerList){
        var type_str, id_str, id_date,
            cache = timelineCache.get(typeOfPosts) || [];

        if (typeOfPosts === 'oldPosts'){
            type_str = 'min'
            id_str   = '_min_id'
            id_date  = '_min_date'
        } else {
            type_str = 'max'
            id_str   = '_max_id'
            id_date  = '_max_date'
        }

        // 保存貼文 id 和 date
        providerList.forEach(function (provider){
            var id_key     = provider + id_str,
                id_value   = posts[type_str + '_id'][provider],
                date_key   = provider + id_date,
                date_value = posts[type_str + '_date'][provider];

            if (id_value){
                timelineCache.put(id_key, id_value)
            }
            if (date_value){
                timelineCache.put(date_key, date_value)
            }
        })

        // 保存貼文
        cache = cache.concat(posts.data)
        timelineCache.put(typeOfPosts, cache)
    }
    /**
     * 檢查 Provider 最舊的的貼文是否在「時間指針」30 分鐘範圍內，判斷是否需要從後端獲取「舊貼文」
     * 
     * @return 需要獲取（貼文）的 Providers
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
            postsCache = [],
            isEmpty = true,
            extractOldPosts;

        while (isEmpty){
            extractOldPosts = oldPosts.filter(function (item){
                var isExtractPost = time_pointer - item.created_at <= TIME_RANGE;

                if (!isExtractPost){
                    postsCache.push(item)
                }

                return isExtractPost
            })

            time_pointer -= TIME_RANGE
            timelineCache.put('oldPosts', postsCache)
            postsCache = []

            if (extractOldPosts.length > 0){
                isEmpty = false
            }
        }

        return extractOldPosts
    }
    // 向後端請求加載「舊貼文」
    this.loadOldPosts = function (invalidList, providerList){
        var defer = $q.defer()

        var _this = this;
        var count = retrieve_count;

        function fetchPosts(invalidList){
            var defer = $q.defer()

            var max_id_str = _this.getId('oldPosts', invalidList);

            Timeline
            .load({id: max_id_str, count: count})
            .$promise
            .then(function (oldPosts){
                // 過濾 Twitter 返回的「舊貼文」中包含 max_id 貼文
                if (oldPosts.min_date.twitter){
                    oldPosts.data.splice(0, 1)
                }
                _this.storePosts('oldPosts', oldPosts, providerList)

                // 若一次未能滿足，下次獲取時「加量」
                count < 100 ? count += 10 : null

                defer.resolve()
            }, function (err){
                if (err.status === 404){
                    olUI.setLoading(false, -1)
                }
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
    this.loadNewPosts = function (providerList){
        var defer = $q.defer()
            _this = this;

        Timeline
        .load({
            id: _this.getId('newPosts', providerList),
            count: 20
        })
        .$promise
        .then(function (newPosts){
            if (newPosts.data.length > 0){
                _this.storePosts('newPosts', newPosts, providerList)
                defer.resolve()
            }
        })

        return defer.promise;
    }

}])