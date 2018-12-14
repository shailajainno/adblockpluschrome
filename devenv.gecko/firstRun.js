"use strict";

(function(){
  function onDOMLoaded(){
    $('.btn').click(function(event){
      event.preventDefault();
      window.location.href = GENER8_FRONTEND_URL + '#/' + $(this).attr('id');
    })
  }
  document.addEventListener("DOMContentLoaded", onDOMLoaded, false);
}());
