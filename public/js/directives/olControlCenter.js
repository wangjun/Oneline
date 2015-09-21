angular.module('Oneline.olControlCenterDirectives', [])
.directive('replicantDeckard', ['Replicant', function (Replicant){
    return {
        restrict: 'A',
        link: function (scope, elem, attrs){
            var fakeCode, countDown;

            elem.bind('$destroy', function (){
                clearInterval(fakeCode)
                clearInterval(countDown)
            })

            getCode()

            function getCode(){
                fakeCode = setInterval(function (){
                    for (var rdmString = ''; rdmString.length < 7; rdmString += Math.random().toString(36).substr(2));
                    elem.html(rdmString.substr(0, 7))
                }, 100)

                Replicant.deckard()
                .$promise
                .then(function (data){
                    var deadline = 60;

                    setTimeout(function (){
                        clearInterval(fakeCode)
                        elem.html(data.code)
                    }, 700)

                    countDown = setInterval(function (){
                        if (deadline < 0){
                            getCode()
                            elem.attr('data-countdown', '')
                            clearInterval(countDown)
                            return;
                        }
                        elem.attr('data-countdown', deadline--)
                    }, 1000)
                }, function (err){
                    clearInterval(fakeCode)
                })
            }
        }
    }
}])
.directive('replicantRachael', ['Replicant', 'olTokenHelper', function (Replicant, olTokenHelper){
    return {
        restrict: 'A',
        link: function (scope, elem, attrs){

            elem.bind('submit', function (e){
                e.preventDefault()

                var inputElem = elem.children(),
                    code = inputElem.val();

                inputElem[0].blur()

                Replicant.rachael({ code: code })
                .$promise
                .then(function (data){

                    if (data.msg.length > 0){
                        data.msg.forEach(function (msg){
                            alert(msg)
                        })
                    } else {
                        olTokenHelper.replaceTokenList(data.tokenList)
                        scope.updateProviderList()
                    }

                    scope.setControlCenter('')
                }, function (err){
                    inputElem.addClass('replicant--rachael--errCode')
                    setTimeout(function (){
                        inputElem.removeClass('replicant--rachael--errCode')
                    }, 500)
                })
            })
        }
    }
}])
