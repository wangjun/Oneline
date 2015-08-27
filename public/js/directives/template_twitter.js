angular.module('Oneline.templateTwitterDirectives', [])
// Twitter
.directive('tweet', function (){
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: '/public/dist/tweet.min.html'
    }
})
.directive('tweetQuote', function (){
    return {
        restrict: 'E',
        templateUrl: '/public/dist/tweet--quote.min.html'
    }
})
.directive('tweetRetweet', function (){
    return {
        restrict: 'E',
        templateUrl: '/public/dist/tweet--retweet.min.html'
    }
})
// Instagram
.directive('igPost', function (){
    return {
        restrict: 'E',
        templateUrl: '/public/dist/ig-post.min.html'
    }
})