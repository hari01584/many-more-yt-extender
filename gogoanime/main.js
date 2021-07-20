var base = "https://gogoanime2.org";

function webScrapeImage(response) {
  console.log("Scraping searches");
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
  console.log("Searching "+search);
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
  console.log("Building page indexes");
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

  let episode_list = [];
  let items = doc
    .querySelectorAll("#episode_related > li")
    .forEach(function (node, index) {
      let t = {
        epLink: base + node.querySelector("a").getAttribute("href"),
        epName: node
          .querySelector("a > div.name")
          .textContent.replace(/[\n\r]+|[\s]{2,}/g, " ")
          .trim(),
      };
      episode_list.push(t);
    });

  let info = {
    image: img,
    animeName: animeName,
    animeType: animeType,
    animePlot: animePlot,
    animeGenre: animeGenre,
    animeReleased: animeReleased,
    animeStatus: animeStatus,
    animeOtherName: animeOtherName,
    animeEpisodes: episode_list,
  };

  return info;
};

const buildWatchAnimePage = (pageData) => {
  console.log("Building Anime Page");
  var doc = new DOMParser().parseFromString(pageData, "text/html");

  let title = doc.querySelector(
    "#wrapper_bg > section > section.content_left > div:nth-child(1) > div.anime_video_body > h1"
  ).innerHTML;

  let vidLink = doc.querySelector("#playerframe").src;

  let epData = {
    title: title,
    video: vidLink,
  };
  return epData;
};

function _mergeAndExecute(animeEpisodePage, animeInfoPage, csb){
  let page = {
    video: animeEpisodePage?.video,
    hashtags: animeEpisodePage?.animeGenre,
    title: animeEpisodePage?.title,
    desc: animeInfoPage?.animePlot
  };

  csb(page);
}

export const watch = (link, csb) => {
  console.log("Now watch! " + link);
  let fullLink = base + link;
  if (link.includes("anime")) {
    chrome.runtime.sendMessage(
      {
        contentScriptQuery: "getScrape",
        url: fullLink,
      },
      function (response) {
        if (response != undefined && response != "") {
          let animeInfoPage = buildWatchMainPage(response);
          let firstEpLink = animeInfoPage["animeEpisodes"][0]["epLink"];
          // Fetch First Episode
          chrome.runtime.sendMessage(
            {
              contentScriptQuery: "getScrape",
              //url: fullLink,
              url: firstEpLink,
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
