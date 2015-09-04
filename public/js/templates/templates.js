angular.module("Oneline.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("actions--instagram.html","<div class=\"actions tips--deep animate--faster\" ng-class=\"::{\'tips--frozen\': item.favorited}\">\n    <svg class=\"actions__button\" ng-class=\"::{\'actions__button--active\': item.favorited}\">\n        <use xlink:href=\"/public/img/icon-sprite.svg#like-icon\"></use>\n    </svg>\n    <span class=\"actions__count\" ng-attr-data-count=\"{{:: item.favorite_count > 0 ? item.favorite_count : \'\'}}\"></span>\n</div>\n<div class=\"actions tips--deep animate--faster\">\n    <svg class=\"actions__button\">\n        <use xlink:href=\"/public/img/icon-sprite.svg#reply-icon\"></use>\n    </svg>\n    <span class=\"actions__count\" ng-attr-data-count=\"{{:: item.reply_count > 0 ? item.reply_count : \'\'}}\"></span>\n</div>\n<div class=\"actions tips--deep animate--faster\">\n    <a ng-href=\"{{item.link}}\" target=\"_blank\">\n        <svg class=\"actions__button\">\n            <use xlink:href=\"/public/img/icon-sprite.svg#source-icon\"></use>\n        </svg>\n    </a>\n</div>");
$templateCache.put("actions--tweet.html","<div ng-click=\"toggleAction(\'like\', item.provider, item.id_str)\" class=\"actions tips--deep animate--faster\" ng-class=\"::{\'tips--active\': item.favorited}\">\n    <svg class=\"actions__button\" ng-class=\"::{\'actions__button--active\': item.favorited}\" data-like>\n        <use xlink:href=\"/public/img/icon-sprite.svg#like-icon\"></use>\n    </svg>\n</div>\n<div ng-click=\"toggleAction(\'retweet\', item.provider, item.id_str)\" class=\"actions tips--deep animate--faster\" ng-class=\"::{\'tips--frozen\': item.retweeted}\">\n    <svg class=\"actions__button actions__button--retweet\" ng-class=\"::{\'actions__button--active\': item.retweeted}\" data-retweet>\n        <use xlink:href=\"/public/img/icon-sprite.svg#retweet-icon\"></use>\n    </svg>\n    <span class=\"actions__count\" ng-attr-data-count=\"{{:: item.retweet_count > 0 ? item.retweet_count : \'\'}}\"></span>\n</div>\n<div class=\"actions tips--deep animate--faster\">\n    <svg class=\"actions__button\" data-reply>\n        <use xlink:href=\"/public/img/icon-sprite.svg#reply-icon\"></use>\n    </svg>\n</div>\n<div class=\"actions tips--deep animate--faster\">\n    <a ng-href=\"//twitter.com/{{item.user.screen_name}}/status/{{item.id_str}}\" target=\"_blank\">\n        <svg class=\"actions__button\">\n            <use xlink:href=\"/public/img/icon-sprite.svg#source-icon\"></use>\n        </svg>\n    </a>\n</div>\n");
$templateCache.put("ig-post.html","<div class=\"timeline__profile\">\n    <a ng-href=\"//instagram.com/{{item.user.username}}\" target=\"_blank\">\n        <img class=\"timeline__profile__avatar timeline__profile__avatar--instagram\" ng-src=\"{{item.user.profile_picture}}\" alt=\"avatar\">\n    </a>\n    <div class=\"timeline__profile__fullname\">\n        <a ng-href=\"//instagram.com/{{item.user.username}}\" target=\"_blank\">\n            <strong>{{item.user.full_name}}</strong>\n        </a>\n    </div>\n</div>\n\n<div class=\"timeline__content\">\n\n    <div class=\"timeline__media\" ng-if=\"item.type === \'image\'\">\n        <img ng-src=\"{{item.images.standard_resolution}}\" alt=\"instagram-post-image\">        \n    </div>\n\n    <div class=\"timeline__media\" ng-if=\"item.type === \'video\'\">\n        <ol-video ol-src=\"item.videos.standard_resolution\" ol-poster=\"item.images.standard_resolution\">\n        </ol-video>\n     </div>\n    <p class=\"timeline__text\" linkify=\"instagram\">{{item.text}}</p>\n</div>\n\n<ng-include src=\" \'actions--instagram.html\' \" class=\"cursor--pointer\"></ng-include>\n\n<span class=\"timeline__time tips\" relative-date=\"{{item.created_at}}\"></span>\n");
$templateCache.put("menu--left.html","<div class=\"menu menu--left animate--faster\">\n\n    <div ng-if=\"isTimeline\" class=\"vertically_center\">\n        <a ui-sref=\"settings({ s: \'1\' })\">\n            <svg class=\"menu__button animate--faster\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\">\n                <g fill=\"none\">\n                    <circle fill=\"#F1F1F1\" cx=\"100\" cy=\"100\" r=\"100\"/>\n                    <circle ng-attr-fill=\"{{ isAuth(\'twitter\') ? \'#2AA9E0\' : \'#FFF\' }}\" cx=\"100\" cy=\"42.5\" r=\"15\"/>\n                    <circle ng-attr-fill=\"{{ isAuth(\'instagram\') ? \'#3F5D87\' : \'#FFF\' }}\" cx=\"100\" cy=\"100\" r=\"15\"/>\n                    <circle ng-attr-fill=\"{{ isAuth(\'weibo\') ? \'#E6162D\' : \'#FFF\' }}\" cx=\"100\" cy=\"157.5\" r=\"15\"/>\n                </g>\n            </svg>\n        </a>\n    </div>\n\n</div>");
$templateCache.put("menu--right.html","<div class=\"menu menu--right animate--faster\">\n\n    <div ng-if=\"!isTimeline\" class=\"vertically_center\">\n        <a ui-sref=\"timeline({ provider: timelineProvider })\">\n            <svg ng-show=\"providerList.length > 0\" class=\"menu__button animate--faster\">\n                <use xlink:href=\"/public/img/icon-sprite.svg#ok-icon\"></use>\n            </svg>\n        </a>\n    </div>\n\n</div>");
$templateCache.put("quote.html","<div class=\"timeline__profile\">\n    <a ng-href=\"//twitter.com/{{item.user.screen_name}}\" target=\"_blank\">\n        <img class=\"timeline__profile__avatar\" ng-src=\"{{item.user.profile_image_url_https.replace(\'normal\', \'bigger\')}}\" alt=\"avatar\">\n    </a>\n    <div class=\"timeline__profile__fullname\">\n        <a ng-href=\"//twitter.com/{{item.user.screen_name}}\" target=\"_blank\">\n            <strong>{{item.user.name}}</strong>\n        </a>\n    </div>\n</div>\n\n<div class=\"timeline__content\">\n    <p class=\"timeline__text\" trim-media-link=\"{{item.mediaLink}}\" linkify=\"twitter\">{{item.text}}</p>    \n    <div ng-if=\"item.media\" class=\"timeline__media\">\n        <div ng-repeat=\"media in item.media\">\n            <div ng-if=\"media.type === \'photo\'\">\n                <img ng-src=\"{{media.image_url}}\" alt=\"tweet_photo\">\n            </div>\n\n            <div ng-if=\"media.type !== \'photo\'\">\n                <ol-video ol-src=\"media.video_url\" ol-poster=\"media.image_url\"></ol-video>\n            </div>\n        </div>\n    </div>\n</div>\n\n<div class=\"timeline timeline--quote\">\n    <a ng-href=\"{{\'//twitter.com/\' + item.quote.user.screen_name + \'/status/\' + item.quote.id_str}}\" target=\"_blank\">\n        <div class=\"timeline__profile\">\n            <img class=\"timeline__profile__avatar\" ng-src=\"{{item.quote.user.profile_image_url_https}}\" alt=\"avatar\">\n            <div class=\"timeline__profile__fullname\">\n                <strong>{{item.quote.user.name}}</strong>\n            </div>\n        </div>\n    </a>\n\n    <a ng-href=\"{{\'//twitter.com/\' + item.quote.user.screen_name + \'/status/\' + item.quote.id_str}}\" target=\"_blank\">\n       <div class=\"timeline__content\">\n            <p class=\"timeline__text\" linkify=\"twitter\">{{item.quote.text}}</p>\n        </div>\n    </a>\n\n    <span class=\"timeline__time\" relative-date=\"{{item.quote.created_at}}\"></span>\n</div>\n\n<ng-include src=\" \'actions--tweet.html\' \" class=\"cursor--pointer\"></ng-include>\n\n<span class=\"timeline__time tips\" relative-date=\"{{item.created_at}}\"></span>\n\n");
$templateCache.put("retweet.html","<div class=\"timeline__profile\">\n    <a ng-href=\"//twitter.com/{{item.retweet.user.screen_name}}\" target=\"_blank\">\n        <img class=\"timeline__profile__avatar\" ng-src=\"{{item.retweet.user.profile_image_url_https.replace(\'normal\', \'bigger\')}}\" alt=\"avatar\">\n    </a>\n    <div class=\"timeline__profile__fullname\">\n        <a ng-href=\"//twitter.com/{{item.retweet.user.screen_name}}\" target=\"_blank\">\n            <strong>{{item.retweet.user.name}}</strong>\n        </a>\n    </div>\n</div>\n\n<div class=\"timeline__content\">\n    <p class=\"timeline__text\" trim-media-link=\"{{item.mediaLink}}\" linkify=\"twitter\">{{item.retweet.text}}</p>\n    <div ng-if=\"item.media\" class=\"timeline__media\">\n        <div ng-repeat=\"media in item.media\">\n            <div ng-if=\"media.type === \'photo\'\">\n                <img ng-src=\"{{media.image_url}}\" alt=\"tweet_photo\">\n            </div>\n\n            <div ng-if=\"media.type !== \'photo\'\">\n                <ol-video ol-src=\"media.video_url\" ol-poster=\"media.image_url\"></ol-video>\n            </div>\n        </div>\n    </div>\n</div>\n\n<a class=\"timeline--retweet__profile__avatar\" ng-href=\"//twitter.com/{{item.user.screen_name}}\" target=\"_blank\">\n    <img class=\"timeline__profile__avatar\" ng-src=\"{{item.user.profile_image_url_https}}\" alt=\"avatar\">\n</a>\n\n<ng-include src=\" \'actions--tweet.html\' \" class=\"cursor--pointer\"></ng-include>\n\n<span class=\"timeline__time tips\" relative-date=\"{{item.created_at}}\"></span>\n");
$templateCache.put("settings.html","<div class=\"social-list\">\n    <div class=\"vertically_center\">\n        <!-- Twitter -->\n        <svg class=\"social-icon animate--faster tips\" ng-class=\"{\'social-icon--active\': isAuth(\'twitter\')}\" ng-click=\"toggleAuth(\'twitter\')\" viewBox=\"0 0 300 300\">\n            <use xlink:href=\"/public/img/icon-sprite.svg#twitter-icon\"></use>\n        </svg>\n    \n        <!-- Instagram -->\n        <svg class=\"social-icon animate--faster tips\" ng-class=\"{\'social-icon--active\': isAuth(\'instagram\')}\" ng-click=\"toggleAuth(\'instagram\')\" viewBox=\"0 0 775 300\">\n           <use xlink:href=\"/public/img/icon-sprite.svg#instagram-icon\"></use>\n        </svg>\n\n        <!-- Weibo -->\n        <svg class=\"social-icon animate--faster tips\" ng-class=\"{\'social-icon--active\': isAuth(\'weibo\')}\" ng-click=\"toggleAuth(\'weibo\')\" viewBox=\"0 0 301 300\">\n            <use xlink:href=\"/public/img/icon-sprite.svg#weibo-icon\"></use>\n        </svg>\n    </div>\n</div>");
$templateCache.put("timeline.html","<div ng-click=\"loadMore(1);resetCount()\" class=\"loadMore loadMore--new loadMore--initLoad loadMore__count animate--faster\" data-count>\n    <div class=\"loadMore__loading\"></div>\n</div>\n\n<div class=\"timeline\" ng-repeat=\"item in timelineData | orderBy: \'-created_at\'\">\n\n\n    <div ng-if=\"item.provider === \'twitter\'\">\n        <ng-include data-id=\"{{item.id_str}}\" class=\"timeline--twitter\" src=\" item.type + \'.html\' \"></ng-include>\n    </div>\n\n\n    <div ng-if=\"item.provider === \'instagram\'\">\n        <ng-include data-id=\"{{item.id_str}}\" class=\"timeline--instagram\" src=\" \'ig-post.html\' \"></ng-include>\n    </div>\n\n    \n<!--     <div ng-if=\"item.provider === \'weibo\'\">\n        <weibo class=\"timeline--weibo\"></weibo>\n    </div> -->\n\n\n</div>\n\n<div ng-click=\"loadMore(-1)\" class=\"loadMore loadMore--old loadMore--initLoad animate--faster\">\n    <div></div>\n</div>\n");
$templateCache.put("tweet.html","<div class=\"timeline__profile\">\n    <a ng-href=\"//twitter.com/{{item.user.screen_name}}\" target=\"_blank\">\n        <img class=\"timeline__profile__avatar\" ng-src=\"{{item.user.profile_image_url_https.replace(\'normal\', \'bigger\')}}\" alt=\"avatar\">\n    </a>\n    <div class=\"timeline__profile__fullname\">\n        <a ng-href=\"//twitter.com/{{item.user.screen_name}}\" target=\"_blank\">\n            <strong>{{item.user.name}}</strong>\n        </a>\n    </div>\n\n</div>\n\n<div class=\"timeline__content\">\n    <p class=\"timeline__text\" trim-media-link=\"{{item.mediaLink}}\" linkify=\"twitter\">{{item.text}}</p>    \n    <div ng-if=\"item.media\" class=\"timeline__media\">\n        <div ng-repeat=\"media in item.media\">\n            <div ng-if=\"media.type === \'photo\'\">\n                <img ng-src=\"{{media.image_url}}\" alt=\"tweet_photo\">\n            </div>\n\n            <div ng-if=\"media.type !== \'photo\'\">\n                <ol-video ol-src=\"media.video_url\" ol-poster=\"media.image_url\"></ol-video>\n            </div>\n        </div>\n    </div>\n</div>\n\n<ng-include src=\" \'actions--tweet.html\' \" class=\"cursor--pointer\"></ng-include>\n\n<span class=\"timeline__time tips\" relative-date=\"{{item.created_at}}\"></span>\n");}]);