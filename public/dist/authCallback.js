(function (){

    var socialIcon = document.getElementsByClassName('social-icon')[0]
        token = socialIcon.getAttribute('data-token');

    // Cross-tab Communication
    localStorage.setItem('addToken', token)

    setTimeout(function (){
        socialIcon.setAttribute('class', socialIcon.getAttribute('class') + ' social-icon--active')
        setTimeout(function (){
            window.close()
        }, 1000)
    }, 500)
})()