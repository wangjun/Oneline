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
.directive('writeTweet', ['$timeout', 'Action', 'olTokenHelper', function ($timeout, Action, olTokenHelper){
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, elem, attrs){
            var submitButton = elem.find('button'),
                statusElem   = elem.find('textarea'),
                status       = '';


            elem.bind('submit', function (e){
                e.preventDefault()

                statusElem.prop('disabled', true)
                submitButton.addClass('write__button--sending')
                Action.update({ action: 'tweet', provider: 'twitter', id: 0 }, { status: status })
                .$promise
                .then(function (data){
                    $timeout(function (){
                        angular
                        .element(document.querySelector('[js-newTweet]'))
                        .triggerHandler('click')
                    })
                })
                .catch(function (err){
                    submitButton.prop('disabled', false)
                    statusElem.addClass('write__textarea--err')
                    setTimeout(function (){
                        statusElem.removeClass('write__textarea--err')
                    }, 500)
                })
                .finally(function (){
                    statusElem.prop('disabled', false)
                    submitButton.removeClass('write__button--sending')
                })
            })

            elem.bind('input', function (){
                // 更新推文內容
                status = statusElem.val().trim()
                // 超字提醒
                var statusLength = status.length
                if (statusLength > 140 || statusLength === 0){
                    submitButton.prop('disabled', true)
                } else {
                    submitButton.prop('disabled', false)
                }
                // 更新剩餘字數
                submitButton.attr('data-count', statusLength > 0 ? statusLength : '')

                // 動畫
                submitButton.addClass('write__button--typing')
                setTimeout(function (){
                    submitButton.removeClass('write__button--typing')
                }, 700)
            })

            elem.on('$destroy', function (){
                elem.unbind()
            })
        }
    }
}])
