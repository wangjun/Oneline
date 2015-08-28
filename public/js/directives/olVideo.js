angular.module('Oneline.olVideoDirectives', [])
.directive('olVideo', function (){
    return {
        restrict: 'E',
        scope: {
            olPoster: '=',
            olSrc: '='
        },
        template: '<video ng-attr-poster="{{olPoster}}" preload="none"></video> \
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
            })

            angular.element(video).bind('ended', function (){
                playIcon.removeClass('timeline__media__playButton--playing')
            })
        }
    }
})