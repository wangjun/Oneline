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
                var iconList   = attrs.toggleIcon.split(','),
                    targetElem = elem.find('use'),
                    targetIcon = iconList.indexOf(targetElem.attr('xlink:href')) == 0
                                    ? iconList[1].trim()
                                    : iconList[0].trim();

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

            elem.on('$destroy', function (){
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

            elem.on('submit', function (e){
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
                    inputElem.addClassTemporarily('replicant--rachael--errCode', 500)
                })
            })
        }
    }
}])
.directive('writeTweet', ['$timeout', 'Action', 
    function ($timeout, Action){

    return {
        restrict: 'A',
        scope: false,
        link: function (scope, elem, attrs){

            var submitButton = angular.element(document.querySelector('.write__btn--send')),
                statusElem   = elem.find('textarea');

            setTimeout(function (){
                elem.find('textarea')[0].focus()
            }, 700)

            var status = '';
            elem
            .on('submit', function (e){
                e.preventDefault()

                var geo = elem.find('geo-picker').data('geo');
                var media_ids = elem.find('media-upload').data('media_ids');

                statusElem.prop('disabled', true)
                submitButton.addClass('write__btn--send--sending')

                Action.update({
                    action: 'tweet',
                    provider: 'twitter',
                    id: 0
                }, { params: {status: status, geo: geo, media_ids: media_ids } })
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
                    statusElem.addClassTemporarily('write__textarea--err', 500)
                })
                .finally(function (){
                    statusElem.prop('disabled', false)
                    submitButton.removeClass('write__btn--send--sending')
                })
            })
            .on('input', function (){
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
                submitButton.addClassTemporarily('write__btn--send--typing', 700)
            })
            .on('$destroy', function (){
                elem.off()
            })

        }
    }
}])
.directive('geoPicker', ['$window', function ($window){
    return {
        restrict: 'E',
        templateUrl: 'controlCenter/write/geoPicker.html',
        link: function (scope, elem, attrs){
            var geoPickerBtn = elem.find('button'),
                submitButton = angular.element(document.querySelector('.write__btn--send')),
                statusElem   = angular.element(document.querySelector('.write__textarea'));

            geoPickerBtn.on('click', function (){
                if (geoPickerBtn.hasClass('tips--active')){
                    elem.removeData('geo')

                    geoPickerBtn.removeClass('tips--active tips--inprocess')
                } else {
                    geoPickerBtn.addClass('tips--inprocess')
                    submitButton.prop('disabled', true)
                    statusElem.prop('disabled', true)

                    $window.navigator.geolocation.getCurrentPosition(function (pos){

                        elem.data('geo', {
                            lat: pos.coords.latitude,
                            long: pos.coords.longitude
                        })

                        geoPickerBtn.addClass('tips--active')
                        geoPickerBtn.removeClass('tips--inprocess')
                        submitButton.prop('disabled', false)
                        statusElem.prop('disabled', false)
                    }, function (err){
                        geoPickerBtn.removeClass('tips--inprocess')
                        geoPickerBtn.addClassTemporarily('tips--error', 500)
                        submitButton.prop('disabled', false)
                        statusElem.prop('disabled', false)
                    }, { maximumAge: 60000, timeout: 7000 })
                }
            })

            geoPickerBtn.on('$destroy', function (){
                geoPickerBtn.off('click')
            })
        }
    }
}])
.directive('mediaUpload', ['Media', function (Media){
    return {
        restrict: 'E',
        templateUrl: 'controlCenter/write/mediaUpload.html',
        link: function (scope, elem, attrs){
            var uploadBtn = elem.find('input'),
                submitButton = angular.element(document.querySelector('.write__btn--send')),
                statusElem   = angular.element(document.querySelector('.write__textarea'));

            uploadBtn.on('change', function (){
                var fd   = new FormData(),
                    file = uploadBtn[0].files[0];

                submitButton.prop('disabled', true)
                statusElem.prop('disabled', true)

                // Preview
                var fakeId = Date.now()
                addImagePreview(file, fakeId)
                // Upload
                fd.append('twitterMedia', file)
                Media.upload({ provider: 'twitter' }, fd)
                .$promise
                .then(function (data){
                    var media_ids = elem.data('media_ids') || [],
                        media_id  = data.media_id;

                    media_ids.push(media_id)
                    elem.data('media_ids', media_ids)

                    attachMediaId(fakeId, media_id)
                })
                .catch(function (err){
                    removeImagePreview(fakeId)
                })
                .finally(function (){
                    submitButton.prop('disabled', false)
                    statusElem.prop('disabled', false)
                })
                uploadBtn[0].value = ''

            })

            uploadBtn.on('$destroy', function (){
                uploadBtn.off('change')
            })

            function addImagePreview (file, fakeId){
                var reader = new FileReader();

                reader.onload = function (e) {
                    var previews = angular.element(document.querySelectorAll('.write__previews')),
                        previewHTML = '<span class="write__previews__item tips--active tips--inprocess animate--faster" data-mediaId><img src="'
                                        + e.target.result
                                        + '"></span>'

                    previews.append(previewHTML)

                    var previewItems = document.querySelectorAll('.write__previews__item'),
                        previewItem  = angular.element(previewItems[previewItems.length - 1]);

                    previewItem.attr('data-mediaId', fakeId)
                }

                reader.readAsDataURL(file)

                if (document.querySelectorAll('.write__previews__item').length === 3){
                    elem.css('display', 'none')
                }
            }
            function removeImagePreview (fakeId){
                var previewItem = document.querySelector('[data-mediaId="' + fakeId + '"]');

                angular.element(previewItem).remove()
            }
            function attachMediaId (fakeId, media_id){
                var previewItem = angular.element(
                                    document.querySelector('[data-mediaId="' + fakeId + '"]')
                                );

                previewItem
                .removeClass('tips--inprocess')
                .attr('data-mediaId', media_id)
                .on('click', function (){
                    var media_ids = elem.data('media_ids') || [],
                        media_id  = previewItem.attr('data-mediaId'),
                        index     = media_ids.indexOf(media_id);

                    media_ids.splice(index, 1)
                    media_ids.length <= 0
                        ? elem.removeData('media_ids')
                        : elem.data('media_ids', media_ids)

                    previewItem.remove()

                    if (document.querySelectorAll('.write__previews__item').length < 4){
                        elem.attr('style', '')
                    }
                })
                .on('$destroy', function (){
                    previewItem.off('click')
                })
            }
        }
    }
}])
