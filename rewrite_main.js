document.addEventListener("yt-navigate-start", function(){log("Refresh'd"); window.location.reload();});
if (document.body) process();
else document.addEventListener("DOMContentLoaded", process);

// Utilities functions
function log(data) {
  console.log("ManyVidLog: " + data);
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
    (async () => {
      let filePath = s + "/" + "main.js";
      const src = chrome.runtime.getURL(filePath);
      const contentMain = await import(src);
      contentMain.watch(link, _pri("setWatchPlayer"));
    })();
  });
};

function _pri(q) {
  let _map = {};
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

  const setWatchPlayer = (out) => {
    detachAndDisconnect("#related");
    detachAndDisconnect("#comments");
    detachAndDisconnect("#secondary");
    detach("#container > ytd-expander > ytd-metadata-row-container-renderer");
    detach("#menu-container");
    detach("#chat");
    detachRemoveNodes("#top-row > ytd-video-owner-renderer");

    let f = document.querySelector("#player-container-outer");
    f.innerHTML = '<iframe src="' + out.video + '" width="100%" height="500">';

    f = document.querySelector("#container > h1 > yt-formatted-string");
    if (f != null) f.innerHTML = out.title;
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

    console.log("DAAATAAAAAA");
  };

  if (q == "setDataSearches") return setDataSearches;
  else if (q == "getSearchItem") return getSearchItem;
  else if (q == "setWatchPlayer") return setWatchPlayer;
  return null;
}