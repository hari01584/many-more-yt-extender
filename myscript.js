if (document.body) process();
else document.addEventListener("yt-navigate-finish", process);

function process() {
  console.log("Executing Script State " + document.readyState);
  _ini();
}

function detach(loc) {
  let q = document.querySelector(loc);
  if (q != null) {
    let content = q.innerHTML;
    q.remove();
    return content;
  }
}

function attach(loc, domElement) {
  // TODO: Incomplete
  console.log(domElement);
}

function createElementFromHTML(htmlString) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild;
}

function YTMainPage() {
  console.log("Youtube Main Page");

  detach("#content > ytd-mini-guide-renderer");
  detach("#guide-inner-content");
  detach("#items");
  detach("#back-button");
  detach("#back-button-tooltip");
  detach("#guide-button");

  document.querySelector("#primary").innerHTML =
    '<h1 style="text-align:center;">Many More YT Extender Active! Search from search bar!</h1>';
  //document.querySelector("#start").innerHTML = "";
}

function recreateNode(el, withChildren) {
  if (withChildren) {
    el.parentNode.replaceChild(el.cloneNode(true), el);
  } else {
    var newEl = el.cloneNode(false);
    while (el.hasChildNodes()) newEl.appendChild(el.firstChild);
    el.parentNode.replaceChild(newEl, el);
  }
}

function _pri(action) {
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
    var doc = document.querySelector("#contents");
    var totalSearches = doc.length;

    doc.querySelectorAll("ytd-video-renderer").forEach(function (node, index) {
      detach("#channel-name > ytd-badge-supported-renderer > div > yt-icon");
      detach("#overlays");
      detach("#mouseover-overlay");
      detach("#hover-overlays");
      detach("#badges");

      // Optimize
      let f = node.querySelector("#channel-info");
      if(f!=null) f.innerHTML = "";

      let thOpt = node.querySelector("#thumbnail > yt-img-shadow");
      if (thOpt.classList.contains("empty")) {
        thOpt.classList.remove("empty");
      }

      let data = {
        set title(value) {
          let f = node.querySelector("#video-title > yt-formatted-string");
          if (f != null) f.innerHTML = value;
        },
        set views(value) {
          let f = node.querySelector("#metadata-line > span:nth-child(1)");
          if (f != null) f.innerHTML = value;
        },
        set time(value) {
          let f = node.querySelector("#metadata-line > span:nth-child(2)");
          if (f != null) f.innerHTML = value;
        },
        get link() {
          return node.querySelector("#thumbnail").href;
        },
        set link(value) {
          console.log(
            "Useless to set links, As there are multiple handlers etc, better use capturing and maps for this :D"
          );
        },
        set img(value) {
          let f = node.querySelector("#img");
          if (f != null) {
            f.remove();
          }
          let x = node.querySelector("#thumbnail > yt-img-shadow");
          x.innerHTML = "";
          var img = new Image();
          img.src = value;
          img.width = "360";
          x.appendChild(img);
        },
        set channel_name(value) {
          let f = node.querySelector("#channel-info");
          if (f != null) {
            f.innerHTML = '<p style="font-size:12px">' + value + "</p>";
          }
        },
        set subtitle(value) {
          let f = node.querySelector(
            "#dismissible > div > div.metadata-snippet-container.style-scope.ytd-video-renderer > yt-formatted-string"
          );
          if (f != null) f.innerHTML = value;
        },
      };
      const url = new URL(data.link);
      const urlParams = new URLSearchParams(url.search);
      const myParam = urlParams?.get("v");
      _map[myParam] = searchResults[index]?.link;

      data.title = searchResults[index]?.title ?? "MANY-YT-VID ACTIVE";
      data.views = searchResults[index]?.views ?? "Infinity";
      data.time = searchResults[index]?.time ?? "Infinity";
      // data.link
      data.channel_img =
        searchResults[index]?.channel_img ??
        "https://wallpapercave.com/wp/wp5952080.jpg";

      data.channel_name = searchResults[index]?.channel_name ?? "ManyYTVid";

      data.subtitle =
        searchResults[index]?.subtitle ?? "Presented by ManyYTVid Extension";
      data.img =
        searchResults[index]?.image ??
        "https://wallpapercave.com/wp/wp5952080.jpg";
    });

    _buildCache(function () {
      console.log("Built local cache");
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

  function resizeIFrameToFitContent(iFrame) {
    iFrame.width = iFrame.contentWindow.document.body.scrollWidth;
    iFrame.height = iFrame.contentWindow.document.body.scrollHeight;
  }

  const setWatchPlayer = (out) => {
    // Optimize
    detach("#chat");
    //  detach("#sections");
    //  detach("#items");
    detach("#comments");
    //  detach("#chips");

    var element = document.querySelector("#top-row > ytd-video-owner-renderer");
    //element.parentElement.removeChild(element);
    if(element != null){
      element.parentElement.querySelectorAll("*").forEach(function (node) {
        node.remove();
      });
    }

    // let el = document.querySelectorAll("#chips").forEach(function (node) {
    //   node.remove();
    // });

    //
    // document.querySelectorAll("#container > yt-formatted-string > a").forEach(function (node) {
    //   node.remove();
    // });

    detach("#menu-container");

    //detach("#top-row");
    // var new_element = old_element.cloneNode(true);
    // old_element.parentNode.replaceChild(new_element, old_element);

    // Todo: Implement comments, Sometiems in future.

    //document.querySelector("#top-row").innerHTML = "";
    var element = document.querySelector("#subscribe-button");
    element.parentElement.removeChild(element);

    let data = {
      set video(value) {
        let f = document.querySelector("#player-container-outer");
        f.innerHTML =
          '<iframe src="'+value+'" width="100%" height="500">';
        //resizeIFrameToFitContent(f);
        console.log(f);
      },
      set title(value) {
        let f = document.querySelector("#container > h1 > yt-formatted-string");
        if (f != null) f.innerHTML = value;
      },
      set subtitle(value) {
        let f = document.querySelector("#description > yt-formatted-string");
        if (f != null) f.innerHTML = value;
      },
      set hashtags(value) {
        let f = document.querySelector("#container > yt-formatted-string");
        if (f != null) f.innerHTML = value;
      },
    };
    data.video = out.video;
    data.title = out.title;
    data.subtitle = out.desc;
    data.hashtags = out.hashtags;
  };

  if (action == "setDataSearches") return setDataSearches;
  else if (action == "getSearchItem") return getSearchItem;
  else if (action == "setWatchPlayer") return setWatchPlayer;
  return null;
}

function SearchPage(query, source) {
  console.log("Ey you searched something :D " + query);
  detach("#content > ytd-mini-guide-renderer");
  detach("#guide-inner-content");
  detach("#items");

  var doc = document.querySelector("#contents");
  doc
    .querySelectorAll("ytd-playlist-renderer")
    .forEach((node) => node.remove());

  (async () => {
    let filePath = source + "/" + "main.js";
    const src = chrome.runtime.getURL(filePath);
    const contentMain = await import(src);
    contentMain.search(query, _pri("setDataSearches"));
  })();
}

function WatchPage(v, source) {
  _pri("getSearchItem")(v, function (link) {
    (async () => {
      let filePath = source + "/" + "main.js";
      const src = chrome.runtime.getURL(filePath);
      const contentMain = await import(src);
      contentMain.watch(link, _pri("setWatchPlayer"));
    })();
  });
}

function _ini() {
  if (document.title.indexOf("YouTube") != -1) {
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
        if (/^(YouTube|\(\d+\) YouTube)$/.test(document.title)) {
          YTMainPage();
        } else if (params.has("search_query")) {
          SearchPage(params.get("search_query"), source);
        } else if (params.has("v")) {
          WatchPage(params.get("v"), source);
        }
      }
    );
  }
}
