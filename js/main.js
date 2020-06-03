/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );


/**
 * cbpAnimatedHeader.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
var cbpAnimatedHeader = (function() {

	var docElem = document.documentElement,
		header = document.querySelector( '.navbar-default' ),
		didScroll = false,
		changeHeaderOn = 300;

	function init() {
		window.addEventListener( 'scroll', function( event ) {
			if( !didScroll ) {
				didScroll = true;
				setTimeout( scrollPage, 250 );
			}
		}, false );
	}

	function scrollPage() {
		var sy = scrollY();
		if ( sy >= changeHeaderOn ) {
			classie.add( header, 'navbar-shrink' );
		}
		else {
			classie.remove( header, 'navbar-shrink' );
		}
		didScroll = false;
	}

	function scrollY() {
		return window.pageYOffset || docElem.scrollTop;
	}

	init();

})();


$(function () {
    var $callButton = $('#order-call'),
        $callRequestBtn = $('.call-request'),
        $phoneNumber = $('#phone-number'),
        $phoneIcon = $('#phone-icon'),
        $modalCall = $('#get-call'),
        $callStatus =$('#call-status');

    $callRequestBtn.bind('click', showCallReqForm);
    $callButton.bind('click', makeCall);
    $phoneNumber.bind("input", validatePhoneNumber);
    $modalCall.on('shown.bs.modal', focusOnPhoneNumber);
    $phoneNumber.mask('+0-000-000-00-00');


    $('#call-button').bind('click', () =>
        alert('Обратный звонок временно недоступен. Вы можете связаться с нами в разделе "контакты". Приносим извинения за неудобства'));

    function showCallReqForm(e) {
        e.preventDefault();

        var lastTime = localStorage.getItem('timeOut'),
            curTimeOut = (lastTime) ? (new Date()).getTime() - +lastTime : 0,
            timeLimit = 3600000;

        if(lastTime && curTimeOut < timeLimit) {
            badtimeOut(getTimeRemain(timeLimit - curTimeOut));
        } else {
            localStorage.removeItem('timeOut');
            clearForm();
        }
    }

    function makeCall(e) {
        console.log(1);
        e.preventDefault();
        e.stopPropagation();

        var url = location.origin + '/sendMail',
            sendData = {},
            that = this;

        sendData.phoneNumber = $phoneNumber.val();
        $(this).html('<span class="glyphicon glyphicon-cog gly-spin"></span>');

        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(sendData),
            success: sucCall,
            contentType: "application/json",
            dataType: 'json'
        });

        function sucCall(data) {
            if(data.status) {
                goodResponse(that)
            } else {
                badResponse()
            }
        }
    }

    function validatePhoneNumber() {
        if(this.value.length >= 16) {
            $callButton.prop('disabled', false);
        } else {
            $callButton.prop('disabled', true);
        }
    }

    function goodResponse(that) {
        $callStatus.text('Ваш номер успешно отправлен. Ожидайте...');
        $callStatus.addClass('success');
        $(that).html('Готово');
        $callButton.prop('disabled', true);
        $phoneNumber.prop('disabled', true);

        localStorage.setItem('timeOut', (new Date()).getTime() );
    }

    function badResponse() {
        $callStatus.addClass('fail');

        $callButton.html('Повторить');
        $callStatus.text('Произошла ошибка. Повторите запрос');
    }

    function badtimeOut(time) {
        $phoneNumber.prop('disabled', true);
        $callButton.removeClass();
        $callButton.addClass('btn btn-danger fail');
        $callStatus.removeClass();
        $callStatus.addClass('fail');

        $callButton.html('Заблокировано');
        $callStatus.text('Наберитесь терпения. Запрос можно отсылать не чаще, чем 1 раз в час. До следующего звонка ' +
            'осталось ' + time.hours + 'ч ' + time.mins + 'мин ' + time.secs + 'сек');
        $phoneNumber.val('');
    }

    function clearForm() {
        $phoneNumber.prop('disabled', false);
        $callButton.prop('disabled', true);
        $callButton.removeClass();
        $callStatus.removeClass();
        $callButton.addClass('btn btn-success');

        $callButton.html('Заказать звонок');
        $phoneNumber.val('');
        $callStatus.text('Для получения консультации Вам не обязательно приходить к нам в офис. Просто закажите звонок ' +
            'и наши менеджеры свяжутся с Вами.');
    }

    function getTimeRemain(mlsec){
        var time ={};

        time.hours = Math.floor(mlsec / 36e5);
        time.mins = Math.floor((mlsec % 36e5) / 6e4);
        time.secs = Math.floor((mlsec % 6e4) / 1000);

        return time;
    }

    function focusOnPhoneNumber() {
        $phoneNumber.focus();
    }
});


/*!
 * Start Bootstrap - Agency Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 500, 'linear');
        event.preventDefault();
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
}); 
