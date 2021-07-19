if (document.body) process();
else document.addEventListener('yt-navigate-finish', process);

function process() {
  console.log("Executing Script");
  _ini();
}

function detach(loc){
  let q = document.querySelector(loc);
  if(q!=null){
    let content = q.innerHTML;
    q.remove();
    return content;
  }
}

function attach(loc, domElement){
  // TODO: Incomplete
  console.log(domElement);

}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild;
}

function YTMainPage(){
  console.log("Youtube Main Page");
  detach("#content > ytd-mini-guide-renderer");
  detach("#guide-inner-content");
  detach("#items");

  detach("#back-button");
  detach("#back-button-tooltip");
  detach("#guide-button");
  //document.querySelector("#start").innerHTML = "";

  document.querySelector("#primary").innerHTML = '<h1 style="text-align:center;">Many More YT Extender Active! Search from search bar!</h1>';
}

function SearchPage(query){
  console.log("Ey you searched something :D " + query);
  detach("#content > ytd-mini-guide-renderer");
  detach("#guide-inner-content");
  detach("#items");


  chrome.storage.sync.get({
    source: 'YouTube',
    isEnable: true
  }, function(items) {
    let source = items.source;
    let enable = items.isEnable;
    if(enable == false) return;
    (async () => {
      let filePath = source+"/"+"main.js";
      const src = chrome.runtime.getURL(filePath);
      const contentMain = await import(src);
      contentMain.search(query);
    })();

  });
}

function _ini(){
  if (document.title.indexOf("YouTube") != -1) {
    const params = new URLSearchParams(window.location.search)
    if(/^(YouTube|\(\d+\) YouTube)$/.test(document.title)){
      YTMainPage();
    }
    else if(params.has("search_query")){
      SearchPage(params.get('search_query'));
    }
    else{
      console.log(document.title);
    }
  }
}
