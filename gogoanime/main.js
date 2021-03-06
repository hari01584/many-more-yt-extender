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
  return searchResults;
}

export const search = (query, csb) => {
  //doc.querySelectorAll("ytd-video-renderer").forEach(node => node.remove());
  var search = base + "/search/" + encodeURIComponent(query);
  chrome.runtime.sendMessage(
    {
      contentScriptQuery: "getScrape",
      url: search,
    },
    function (response) {
      if (response != undefined && response != "") {
        let data = webScrapeImage(response);
        csb(data);
      }
    }
  );
};


const buildWatchMainPage = (pageData) => {
  log("Building page indexes");
  var doc = new DOMParser().parseFromString(pageData, "text/html");
  let img =
    base +
    doc
      .querySelector(
        "#wrapper_bg > section > section.content_left > div.main_body > div.anime_info_body > div.anime_info_body_bg > img"
      )
      .getAttribute("src");
  let animeName = doc.querySelector(
    "#wrapper_bg > section > section.content_left > div.main_body > div.anime_info_body > div.anime_info_body_bg > h1"
  ).innerHTML;
  let animeType = doc
    .querySelector(
      "#wrapper_bg > section > section.content_left > div.main_body > div.anime_info_body > div.anime_info_body_bg > p:nth-child(3)"
    )
    .textContent.replace(/[\n\r]+|[\s]{2,}/g, " ")
    .trim();
  let animePlot = doc
    .querySelector(
      "#wrapper_bg > section > section.content_left > div.main_body > div.anime_info_body > div.anime_info_body_bg > p:nth-child(4)"
    )
    .textContent.replace(/[\n\r]+|[\s]{2,}/g, " ")
    .trim();
  let animeGenre = doc
    .querySelector(
      "#wrapper_bg > section > section.content_left > div.main_body > div.anime_info_body > div.anime_info_body_bg > p:nth-child(5)"
    )
    .textContent.replace(/[\n\r]+|[\s]{2,}/g, " ")
    .trim();
  let animeReleased = doc
    .querySelector(
      "#wrapper_bg > section > section.content_left > div.main_body > div.anime_info_body > div.anime_info_body_bg > p:nth-child(6)"
    )
    .textContent.replace(/[\n\r]+|[\s]{2,}/g, " ")
    .trim();
  let animeStatus = doc
    .querySelector(
      "#wrapper_bg > section > section.content_left > div.main_body > div.anime_info_body > div.anime_info_body_bg > p:nth-child(7)"
    )
    .textContent.replace(/[\n\r]+|[\s]{2,}/g, " ")
    .trim();
  let animeOtherName = doc
    .querySelector(
      "#wrapper_bg > section > section.content_left > div.main_body > div.anime_info_body > div.anime_info_body_bg > p:nth-child(8)"
    )
    .textContent.replace(/[\n\r]+|[\s]{2,}/g, " ")
    .trim();

  let firstEpLink =
    base +
    doc
      .querySelector("#episode_related > li:nth-child(1) > a")
      .getAttribute("href");

  let info = {
    image: img,
    animeName: animeName,
    animeType: animeType,
    animePlot: animePlot,
    animeGenre: animeGenre,
    animeReleased: animeReleased,
    animeStatus: animeStatus,
    animeOtherName: animeOtherName,
    firstEpLink: firstEpLink,
  };

  return info;
};

const buildWatchAnimePage = (pageData) => {
  log("Building Anime Page");
  var doc = new DOMParser().parseFromString(pageData, "text/html");

  let title = doc.querySelector(
    "#wrapper_bg > section > section.content_left > div:nth-child(1) > div.anime_video_body > h1"
  ).innerHTML;

  let vidLink = base + doc.querySelector("#playerframe").getAttribute("src").trim();
  let episode_list = [];
  var capture = false;
  let items = doc
    .querySelectorAll("#episode_related > li")
    .forEach(function (node, index) {
      let cname = node.querySelector("a").className;

      // if (cname == "active") {
      //   capture = true;
      //   return;
      // } else if (!capture) return;
      if(cname == "active"){
        capture = true;
      } else capture = false;

      let t = {
        epLink: node.querySelector("a").getAttribute("href").trim(),
        epName: node
          .querySelector("a > div.name")
          .textContent.replace(/[\n\r]+|[\s]{2,}/g, " ")
          .trim(),
        isHighlight: capture
      };
      episode_list.push(t);
    });

  let epData = {
    title: title,
    video: vidLink,
    animeEpisodes: episode_list,
  };
  return epData;
};

function _mergeAndExecute(animeEpisodePage, animeInfoPage, csb) {
  let page = {
    video: animeEpisodePage?.video,
    hashtags: animeInfoPage?.animeGenre,
    title: animeEpisodePage?.title,
    desc:
      animeInfoPage?.animePlot +
      "\n\n{0}\n{1}\n{2}\n{3}".format(
        animeInfoPage?.animeType,
        animeInfoPage?.animeReleased,
        animeInfoPage?.animeStatus,
        animeInfoPage?.animeOtherName
      ),
  };
  page.extraVids = animeEpisodePage?.animeEpisodes;
  csb(page);
}

export const watch = (link, lastWatch, csb) => {
  log("Now watch! " + link + ", LastSeen "+lastWatch);
  let fullLink = base + link;
  if (link.includes("anime")) {
    chrome.runtime.sendMessage(
      {
        contentScriptQuery: "getScrape",
        url: fullLink,
      },
      function (response) {
        if (response != undefined && response != "") {
          let animeInfoPage = buildWatchMainPage(response, lastWatch);
          if(lastWatch == null){
            var link = animeInfoPage["firstEpLink"];
          }
          else {
            var link = base + lastWatch;
          }
          // Fetch First Episode
          chrome.runtime.sendMessage(
            {
              contentScriptQuery: "getScrape",
              //url: fullLink,
              url: link,
            },
            function (response) {
              let animeEpisodePage = buildWatchAnimePage(response);
              _mergeAndExecute(animeEpisodePage, animeInfoPage, csb);
            }
          );
        }
      }
    );
  } else if (link.includes("watch")) {
  }
};
