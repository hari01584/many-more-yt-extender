var base = "https://gogoanime2.org";

function webScrapeImage(response) {
  var doc = new DOMParser().parseFromString(response, "text/html");
  var searchResults = [];
  let items = doc
    .querySelectorAll(
      "#wrapper_bg > section > section.content_left > div > div.last_episodes > ul > li"
    )
    .forEach(function (node) {
      let t = {
        image: base + node.querySelector("div > a > img").getAttribute("src"),
        title: node.querySelector("p.name > a").innerHTML,
        link: node.querySelector("p.name > a").getAttribute("href"),
        release: node.querySelector("p.released").innerHTML,
      };
      searchResults.push(t);
    });
  // searchResults.forEach(function (arrayItem) {
  //   var x = arrayItem.title;
  //   console.log(x);
  // });
  return searchResults;
}

function modifyVideoList(searchResults) {
  var doc = document.querySelector("#contents");
  var totalSearches = doc.length;

  doc.querySelectorAll("ytd-video-renderer").forEach(function (node, index) {
    detach("#channel-name > ytd-badge-supported-renderer > div > yt-icon");
    detach("#overlays");
    detach("#mouseover-overlay");
    detach("#hover-overlays");
    // Optimize
    let thOpt = node.querySelector("#thumbnail > yt-img-shadow");
    if (thOpt.classList.contains("empty")) {
      thOpt.classList.remove("empty");
    }

    let data = {
      get title() {
        return node.querySelector("#video-title > yt-formatted-string")
          .innerHTML;
      },
      set title(value) {
        let f = node.querySelector("#video-title > yt-formatted-string");
        if (f != null) f.innerHTML = value;
      },

      get views() {
        return node.querySelector("#metadata-line > span:nth-child(1)")
          .innerHTML;
      },
      set views(value) {
        let f = node.querySelector("#metadata-line > span:nth-child(1)");
        if (f != null) f.innerHTML = value;
      },

      get time() {
        return node.querySelector("#metadata-line > span:nth-child(2)")
          .innerHTML;
      },
      set time(value) {
        let f = node.querySelector("#metadata-line > span:nth-child(2)");
        if (f != null) f.innerHTML = value;
      },

      get link() {
        return node.querySelector("#thumbnail").href;
      },
      set link(value) {
        let f = node.querySelector("#thumbnail");
        if (f != null) f.href = value;
      },

      get img() {
        return node.querySelector("#img").src;
      },
      set img(value) {
        let f = node.querySelector("#img");
        if (f != null) f.src = value;
        else {
          console.log(index + " has null?");
        }
      },

      get channel_img() {
        return node.querySelector("#channel-info > a > yt-img-shadow > #img")
          .src;
      },
      set channel_img(value) {
        let f = node.querySelector("#channel-info > a > yt-img-shadow > #img");
        if (f != null) f.src = value;
      },

      get channel_name() {
        return node.querySelector("#text > a").innerHTML;
      },
      set channel_name(value) {
        let f = node.querySelector("#text > a");
        if (f != null) f.innerHTML = value;
      },

      get subtitle() {
        return node.querySelector(
          "#dismissible > div > div.metadata-snippet-container.style-scope.ytd-video-renderer > yt-formatted-string"
        ).innerHTML;
      },
      set subtitle(value) {
        let f = node.querySelector(
          "#dismissible > div > div.metadata-snippet-container.style-scope.ytd-video-renderer > yt-formatted-string"
        );
        if (f != null) f.innerHTML = value;
      },
    };
    data.title = "MANY-YT-VID ACTIVE";
    data.subtitle = "-1";
    data.time = "Infinity";
    //    data.img = "https://wallpapercave.com/wp/wp5952080.jpg";

    if (index > totalSearches || !searchResults[index]) return;

    data.title = searchResults[index].title;
    data.time = searchResults[index].release;
    //  data.img = searchResults[index].image;
    node.querySelector("#img").remove();
    let x = node.querySelector("#thumbnail > yt-img-shadow");
    var img = new Image();
    img.src =
      searchResults[index].image;
    img.width = "360";
    x.appendChild(img);
  });
}

export const search = (query) => {
  //let contents = detach("#contents");
  var doc = document.querySelector("#contents");
  doc
    .querySelectorAll("ytd-playlist-renderer")
    .forEach((node) => node.remove());
  //doc.querySelectorAll("ytd-video-renderer").forEach(node => node.remove());
  var search = base + "/search/" + encodeURIComponent(query);
  console.log("Search url: " + search);
  chrome.runtime.sendMessage(
    {
      contentScriptQuery: "getScrape",
      url: search,
    },
    function (response) {
      if (response != undefined && response != "") {
        let data = webScrapeImage(response);
        modifyVideoList(data);
      }
    }
  );
};
