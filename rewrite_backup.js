document.addEventListener("yt-navigate-start", function(){log("Refresh'd"); window.location.reload();});
if (document.body) process();
else document.addEventListener("DOMContentLoaded", process);

// Utilities functions
function log(data) {
  console.log("ManyVidLog: " + data);
}

function sleep (seconds) {
    var start = new Date().getTime();
    while (new Date() < start + seconds*1000) {}
    return 0;
}

function disconnect(node){
  let q = document.querySelector(node);
  if(q!=null){
    var new_element = q.cloneNode(true);
    q.parentNode.replaceChild(new_element, q);
  }
  else{
    log("disconnect "+node+" failed, null");
  }
}

var dispatchMouseEvent = function(target, var_args) {
  var e = document.createEvent("MouseEvents");
  // If you need clientX, clientY, etc., you can call
  // initMouseEvent instead of initEvent
  e.initEvent.apply(e, Array.prototype.slice.call(arguments, 1));
  target.dispatchEvent(e);
};


function detach(loc) {
  let q = document.querySelector(loc);
  if (q != null) {
    q.remove();
  }
  else{
    log("detach "+loc+" failed, null");
  }
}

function detachRemoveNodes(loc){
  var element = document.querySelector(loc);
  if (element != null) {
    element.parentElement.querySelectorAll("*").forEach(function (node) {
      node.remove();
    });
  }
  else{
    log("detachRemoveNodes "+loc+" failed, null");
  }
}

function detachAndDisconnect(loc){
  disconnect(loc);
  detach(loc);
}

String.prototype.format = function() {
    var formatted = this;
    for( var arg in arguments ) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};

function resizeIFrameToFitContent(iFrame) {
  iFrame.width = iFrame.contentWindow.document.body.scrollWidth;
  iFrame.height = iFrame.contentWindow.document.body.scrollHeight;
}

function process() {
  log("Executing Script,State=" + document.readyState + ",URL=" + window.location.href);
  if (document.title.indexOf("YouTube") == -1) return;

  chrome.storage.sync.get(
    {
      source: "YouTube",
      isEnable: true,
    },
    function (items) {
      let source = items.source;
      let enable = items.isEnable;
      if (enable == false) return;

      const params = new URLSearchParams(window.location.search);
      if (window.location.href == "https://www.youtube.com/") {
        YTMainPage();
      } else if (params.has("search_query")) {
        SearchPage(params.get("search_query"), source);
      } else if (params.has("v")) {
        if(params.has("t")){
          params.delete("t");
          log("Refreshing due to time parameter");
          window.location.search = params.toString();
          return;
        }
        WatchPage(params.get("v"), source);
      }
    }
  );
}

let YTMainPage = () => {
  console.log("Youtube Main Page");
  detach("#content > ytd-mini-guide-renderer");
  detach("#guide-inner-content");
  detach("#items");
  detach("#back-button");
  detach("#back-button-tooltip");
  detach("#guide-button");

  document.querySelector("#primary").innerHTML =
    '<h1 style="text-align:center;">Many More YT Extender Active! Search from search bar!</h1>';
};

let SearchPage = (p, s) => {
  detach("#content > ytd-mini-guide-renderer");
  detach("#guide-inner-content");
  detach("#items");
  // Remove playlists
  document
    .querySelector("#contents")
    .querySelectorAll("ytd-playlist-renderer")
    .forEach((node) => node.remove());

  (async () => {
    let filePath = s + "/" + "main.js";
    const src = chrome.runtime.getURL(filePath);
    const contentMain = await import(src);
    contentMain.search(p, _pri("setDataSearches"));
  })();
};

let WatchPage = (p, s) => {
  _pri("getSearchItem")(p, function (link) {
    window.animeLink = link;
    _pri("_getLastWatch")(link, function(lastWatch){
      (async () => {
        let filePath = s + "/" + "main.js";
        const src = chrome.runtime.getURL(filePath);
        const contentMain = await import(src);
        contentMain.watch(link, lastWatch, _pri("setWatchPlayer"));
      })();
    });
  });
};

function _pri(q) {
  let _map = {};
  let _lastWatch = {};

  let _buildCache = (cbx) => {
    chrome.storage.local.set({ map: _map }, function () {
      cbx();
    });
  };
  let _restoreCache = (cbx) => {
    chrome.storage.local.get(["map"], function (result) {
      _map = result.map;
      cbx();
    });
  };

  let _getLastWatch = (v, cbx) => {
    chrome.storage.local.get("lastWatch_"+v, function (ep) {
      cbx(ep["lastWatch_"+v]);
    });
  }

  let _setLastWatch = (v, ep, cbx) => {
    log("_setLastWatch says setting pointer");
    chrome.storage.local.set({["lastWatch_"+v]: ep }, function () {
      cbx();
    });
  }

  const setDataSearches = (searchResults) => {
    log("Loaded, now parsing data for search results..!");
    var doc = document.querySelector("#contents");
    doc.querySelectorAll("ytd-video-renderer").forEach(function (node, index) {
      detach("#channel-name > ytd-badge-supported-renderer > div > yt-icon");
      detach("#overlays");
      detach("#mouseover-overlay");
      detach("#hover-overlays");
      detach("#badges");
      detach("#channel-info");
      // Optimize
      let thOpt = node.querySelector("#thumbnail > yt-img-shadow");
      if (thOpt.classList.contains("empty")) {
        thOpt.classList.remove("empty");
      }
      const url = new URL(node.querySelector("#thumbnail").href);
      const urlParams = new URLSearchParams(url.search);
      const myParam = urlParams?.get("v");
      _map[myParam] = searchResults[index]?.link;

      let f = node.querySelector("#video-title > yt-formatted-string");
      if (f != null) f.innerHTML = searchResults[index]?.title ?? "MANY-YT-VID ACTIVE";
      f = node.querySelector("#metadata-line > span:nth-child(1)");
      if (f != null) f.innerHTML = searchResults[index]?.views ?? "Infinity";
      f = node.querySelector("#metadata-line > span:nth-child(2)");
      if (f != null) f.innerHTML = searchResults[index]?.time ?? "Infinity";
      // Image
      f = node.querySelector("#img");
      if (f != null) {
        f.remove();
      }
      let x = node.querySelector("#thumbnail > yt-img-shadow");
      x.innerHTML = "";
      var img = new Image();
      img.src = searchResults[index]?.image ?? "https://wallpapercave.com/wp/wp5952080.jpg";
      img.width = "360";
      x.appendChild(img);
      // Channel Name
      f = node.querySelector("#channel-info");
      if (f != null) {
        f.innerHTML = '<p style="font-size:12px">' + searchResults[index]?.channel_name ?? "ManyYTVid" + "</p>";
      }
      // Subtitle
      f = node.querySelector(
        "#dismissible > div > div.metadata-snippet-container.style-scope.ytd-video-renderer > yt-formatted-string"
      );
      if (f != null) f.innerHTML = searchResults[index]?.subtitle ?? "Presented by ManyYTVid Extension";
    });

    _buildCache(function () {
      log("Built local cache");
    });
    searchResults = [];
  };

  const getSearchItem = (key, cbx) => {
    if (_map[key] != null) {
      cbx(_map[key]);
    } else {
      _restoreCache(function () {
        if (_map[key] != null) {
          cbx(_map[key]);
        } else {
          cbx(null);
        }
      });
    }
  };

  const setWatchPlayer = (out, animeLink) => {
    // Audio Optimize
    let element = document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > button");
    if(element) dispatchMouseEvent(element, 'click', true, true);

    detachAndDisconnect("#related");
    detachAndDisconnect("#comments");
    detachAndDisconnect("#secondary");
    detach("#container > ytd-expander > ytd-metadata-row-container-renderer");
    detach("#menu-container");
    detach("#chat");
    detachRemoveNodes("#top-row > ytd-video-owner-renderer");


    let f = document.querySelector("#movie_player");
    f.innerHTML = '<iframe src="' + out.video + '" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%">';
    // TODO REMOVE
    //sleep(3);
    f = document.querySelector("#container > h1 > yt-formatted-string");
    if (f != null) f.innerHTML = out.title;
    //sleep(3);

    f = document.querySelector("#description > yt-formatted-string");
    if (f != null) {
      f.textContent = "";
      f.innerHTML = out.desc;
    }
    f = document.querySelector("#container > yt-formatted-string");
    if (f != null) f.innerHTML = out.hashtags ?? "undefined/no hashtags";
    f = document.querySelector("#count > ytd-video-view-count-renderer > span.view-count.style-scope.ytd-video-view-count-renderer");
    if(f!=null) f.textContent = out.views ?? "Infinity";
    f = document.querySelector("#info-strings > yt-formatted-string");
    if(f!=null) f.textContent = out.time ?? "Infinity";

    let d = document.querySelector("#description > yt-formatted-string");
    if (out.extraVids != null && d!=null) {
      d.innerHTML += "\n\nEpisodes:\n";
      var div = document.createElement('div');
      div.id = 'customlinks';
      d.appendChild(div);
      out.extraVids.forEach(function (ep, index) {
        var a = document.createElement('a');
        var linkText = document.createTextNode(ep.epName + " ");
        if(ep.isHighlight){
          let bold = document.createElement('strong');
          bold.appendChild(linkText);
          linkText = bold;
        }
        a.appendChild(linkText);
        a.className = "yt-simple-endpoint style-scope yt-formatted-string";
        a.index = index;
        a.href = "javascript:void(0)";
        a.addEventListener('click',function(){
          _setLastWatch(window.animeLink, ep.epLink, function(){window.location.reload();});
        });
        div.appendChild(a);
      });
    }

    // // Set event list\
    // let q = document
    //   .querySelectorAll("#customlinks > a")
    //   .forEach((node) => {
    //     console.log(node.textContent);
    //   });

    console.log("DAAATAAAAAA");
  };

  if (q == "setDataSearches") return setDataSearches;
  else if (q == "getSearchItem") return getSearchItem;
  else if (q == "setWatchPlayer") return setWatchPlayer;
  else if (q == "_setLastWatch") return _setLastWatch;
  else if (q == "_getLastWatch") return _getLastWatch;
  return null;
}
