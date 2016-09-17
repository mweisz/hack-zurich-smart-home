
/***********************************************
* CSS3 Analog Clock- by JavaScript Kit (www.javascriptkit.com)
* Visit JavaScript Kit at http://www.javascriptkit.com/ for this script and 100s more
***********************************************/

var $hands = $('#liveclock div.hand')

window.requestAnimationFrame = window.requestAnimationFrame
                               || window.mozRequestAnimationFrame
                               || window.webkitRequestAnimationFrame
                               || window.msRequestAnimationFrame
                               || function(f){setTimeout(f, 60)}


function updateclock(){
    // var curdate = minute //new Date()
    var curMin = minute % 60;
    var curHour = Math.floor(minute / 60) % 12;

    var hour_as_degree = ( curHour + curMin / 60 ) / 12 * 360
    var minute_as_degree = curMin / 60 * 360
    var second_as_degree = 0;//( curdate.getSeconds() + curdate.getMilliseconds()/1000 ) /60 * 360
    $hands.filter('.hour').css({transform: 'rotate(' + hour_as_degree + 'deg)' })
    $hands.filter('.minute').css({transform: 'rotate(' + minute_as_degree + 'deg)' })
    $hands.filter('.second').css({transform: 'rotate(' + second_as_degree + 'deg)' })
    requestAnimationFrame(updateclock)
}

requestAnimationFrame(updateclock)
