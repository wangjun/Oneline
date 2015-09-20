angular.module('Oneline.olControlCenterDirectives', [])
.directive('replicantDeckard', ['Replicant', function (Replicant){
    return {
        restrict: 'A',
        link: function (scope, elem, attrs){
            var fakeCode = setInterval(function (){
                for (var rdmString = ''; rdmString.length < 7; rdmString += Math.random().toString(36).substr(2));
                elem.html(rdmString.substr(0, 7))
            }, 100)

            Replicant.deckard()
            .$promise
            .then(function (data){
                setTimeout(function (){
                    clearInterval(fakeCode)
                    elem.html(data.code)
                }, 700)
            }, function (err){
                clearInterval(fakeCode)
            })

        }
    }
}])
.directive('replicantRachael', ['Replicant', function (Replicant){
    return {
        restrict: 'A',
        link: function (scope, elem, attrs){

            var code = '';

            Replicant.rachael({ code: code })
            .$promise
            .then(function (data){
                olTokenHelper.replaceTokenList(data.tokenList)
            }, function (err){
                console.log(err)
            })
        }
    }
}])
