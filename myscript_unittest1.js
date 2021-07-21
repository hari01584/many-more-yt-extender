function sleep (seconds) {
    var start = new Date().getTime();
    while (new Date() < start + seconds*1000) {}
    return 0;
}

function disconnect(node){
  let q = document.querySelector(node);
  var new_element = q.cloneNode(true);
  q.parentNode.replaceChild(new_element, q);
}

var dispatchMouseEvent = function(target, var_args) {
  var e = document.createEvent("MouseEvents");
  // If you need clientX, clientY, etc., you can call
  // initMouseEvent instead of initEvent
  e.initEvent.apply(e, Array.prototype.slice.call(arguments, 1));
  target.dispatchEvent(e);
};

console.log("Early " + document.readyState);

console.log("Watch page");
//sleep(3);
// let element = "#player-container-inner";
// disconnect(element);
// document.querySelector(element).remove();
let element = document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > button");
//dispatchMouseEvent(element, 'mouseover', true, true);
//dispatchMouseEvent(element, 'mousedown', true, true);
dispatchMouseEvent(element, 'click', true, true);
//dispatchMouseEvent(element, 'mouseup', true, true);

//q.parentElement.removeChild(q);

//sleep(3);

// q.innerHTML = "";
//
// const config = { attributes: true, childList: true, subtree: true };
// const callback = function (mutationsList, observer) {
//   console.log("CAAAAL");
//
//   for (const mutation of mutationsList) {
//     if (mutation.type === "childList") {
//       console.log("A child node has been added or removed.");
//     } else if (mutation.type === "attributes") {
//       console.log("The " + mutation.attributeName + " attribute was modified.");
//     }
//   }
// };
// const observer = new MutationObserver(callback);
//
// observer.observe(q, config);
console.log("Sett");
