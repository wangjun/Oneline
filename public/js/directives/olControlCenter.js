angular.module('Oneline.olControlCenterDirectives', [])
.directive('toggleClass', function (){
    return {
        restrict: 'A',
        link: function (scope, elem, attrs){
            elem.on('click', function (){
                elem.toggleClass(attrs.toggleClass)
            })
        }
    }
})
.directive('toggleIcon', function (){
    return {
        restrict: 'A',
        link: function (scope, elem, attrs){
            elem.on('click', function (){
                var iconList   = attrs.toggleIcon.split(', '),
                    targetElem = elem.find('use'),
                    targetIcon = iconList.indexOf(targetElem.attr('xlink:href')) == 0
                                    ? iconList[1]
                                    : iconList[0]

                                    console.log(targetElem.attr('xlink:href'), targetIcon)
                targetElem.attr('xlink:href', targetIcon)
            })
        }
    }
})
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
                    scope.toggleActive({
                        currentTarget: document.querySelector('.replicant-icon--rachael')
                    })
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
.directive('writeTweet', ['Action', 'olTokenHelper', function (Action, olTokenHelper){
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, elem, attrs){
            var submitButton = elem.find('button'),
                statusElem   = elem.find('textarea'),
                counterElem  = elem.find('span'),
                status       = '';


            elem.bind('submit', function (e){
                e.preventDefault()

                console.log(status)
                Action.update({ action: 'tweet', provider: 'twitter', id: 0 }, { status: status })
                .$promise
                .then(function (data){

                }, function (err){

                })
            })

            elem.bind('input', function (){
                // 更新推文內容
                status = statusElem.val()
                // 更新剩餘字數
                counterElem.html(140 - status.length)

                // 動畫
                submitButton.addClass('write__submit__button--typing')
                setTimeout(function (){
                    submitButton.removeClass('write__submit__button--typing')
                }, 700)
            })

            elem.on('$destroy', function (){
                elem.unbind()
            })
        }
    }
}])
