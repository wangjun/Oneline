angular.module('Oneline.olMediaDirectives', [])
.directive('olVideo', function (){
    return {
        restrict: 'E',
        scope: {
            olPoster: '=',
            olSrc: '='
        },
        template: '<video ng-attr-poster="{{olPoster}}" preload="none" loop></video> \
                   <svg class="timeline__media__playButton animate--faster"> \
                       <use xlink:href="/public/img/icon-sprite.svg#play-icon"></use> \
                   </svg>',
        link: function (scope, elem, attrs){
            var video = elem.children()[0],
                playIcon = angular.element(elem.children()[1]);

            video.setAttribute('src', scope.olSrc)

            elem.bind('click', function (){
                video.paused ? video.play() : video.pause()
                playIcon.toggleClass('timeline__media__playButton--playing')

                elem.bind('mouseout', function (){
                    video.removeAttribute('loop')
                })
            })

            angular.element(video).bind('ended', function (){
                playIcon.removeClass('timeline__media__playButton--playing')
            })
        }
    }
})
.directive('olImageThumb', function (){
    return {
        restrict: 'A',
        link: function (scope, elem, attrs){
            elem.bind('click', function (){
                var wrapper_thumb  = elem.parent(),
                    wrapper_large  = wrapper_thumb.next(),
                    img_thumb      = wrapper_thumb.children(),
                    img_large      = wrapper_large.children();

                // 設置小圖樣式
                img_thumb.removeClass('button--active')
                img_thumb.addClass('button--inactive')
                elem.addClass('button--active timeline__media--loading')
                wrapper_thumb.addClass('timeline__media--small')
                // 設置大圖樣式
                wrapper_large.removeClass('timeline__media--inactive')
                img_large.attr('src', attrs.src.replace('square', 'bmiddle'))
                // 大圖加載完畢
                img_large.bind('load', function (){
                    img_thumb.length === 1 ? elem.parent().remove() : null
                    elem.removeClass('timeline__media--loading')
                    // wrapper_large.removeClass('cursor--next')
                    img_large.unbind('load')
                })
                // 附加數據
                if (!img_large.data('urlList')){
                    var urlList = Array.prototype.map.call(img_thumb, function (item){
                        return angular.element(item).attr('src').replace('square', 'bmiddle')
                    })  
                    img_large.data('urlList', urlList)
                }
            })
        }
    }
})
.directive('selectImage', function (){
    return {
        restrict: 'A',
        link: function (scope, elem, attrs){

            if (attrs.imageCount > 1){
                // 光標提示
                elem.bind('mouseover', function (){
                    elem.bind('mousemove', function (e){
                        if (e.offsetX - elem[0].offsetWidth / 2 > 0){
                            elem.removeClass('cursor--pre')
                            elem.addClass('cursor--next')
                        } else {
                            elem.removeClass('cursor--next')
                            elem.addClass('cursor--pre')
                        }
                    })
                })
                // 上／下一幅
                elem.bind('click', function (e){
                    var urlList = elem.data('urlList') || [],
                        currentIndex = urlList.indexOf(elem.attr('src')),
                        index = e.offsetX - elem[0].offsetWidth / 2 > 0 ? currentIndex + 1 : currentIndex - 1;

                    var img_thumb = angular.element(
                                        angular.element(
                                            elem.parent().parent().children()[0]
                                        ).children()
                                    ),
                        target = angular.element(img_thumb[index]);

                    // 設置圖片地址
                    elem.attr('src', urlList[index])
                    // 設置小圖樣式
                    img_thumb.removeClass('button--active timeline__media--loading')
                    target.addClass('button--active timeline__media--loading')
                    // 大圖加載完畢
                    elem.bind('load', function (){
                        // 設置小圖樣式
                        target.removeClass('timeline__media--loading')
                        elem.unbind('load')
                    })
                })
            }

        }
    }
})