const fs = require("fs");
const got = require("got");
const axios = require("axios");
const slugify = require("slugify");
const { Track, Release, Store } = require("../database/models");

const request = async (url) => {
  console.log("fetching");
  const { data } = await axios({
    url,
    method: "GET",
    headers: {
      authority: "analytics.dittomusic.com",
      accept: "application/json, text/plain, */*",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
      "x-xsrf-token":
        "eyJpdiI6IngzbTl1bFVDQytDbjczWHViOFhjcWc9PSIsInZhbHVlIjoiOEhDN3I4cWJHV2ZTOUtpdHNPdkd6V0h4WFBSeE5MMFkwbVhnZlwvZzRnSFhKWlRUQ2ZqbmFMSUt5N3BSRDAzcVBOMmJEQ1wvMU53cUZmRUo4UDJhSGIxUT09IiwibWFjIjoiZGJhYzY0MzE3NDE0ZjlmNzAyYTBkZTM5ZjU4MjJiZmRkYjIxZjdmODFhOWYxNGIyODgzYWM3YmE5NWEyMGYzZSJ9",
      origin: "https://dashboard.dittomusic.com",
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      referer: "https://dashboard.dittomusic.com/trends",
      "accept-language": "en-US,en;q=0.9",
      cookie:
        "_ga=GA1.2.909405644.1576323632; _fbp=fb.1.1576323651300.2039594954; _gcl_au=1.1.2004964627.1585067009; _scid=59519498-acdf-46f8-8085-616243d0d3c6; mp_984ccb83f5106d248791ee2ba4c83b10_mixpanel=%7B%22distinct_id%22%3A%221710d5d09c425-09d07e8eafe1ca-f313f6d-100200-1710d5d09c52f7%22%2C%22%24initial_referrer%22%3A%22https%3A%2F%2Fdashboard.dittomusic.com%2Fsales-area%2Fsales%22%2C%22%24initial_referring_domain%22%3A%22dashboard.dittomusic.com%22%7D; DITTOWWWSESSION=eyJpdiI6ImM2dExOTXNcLzlPNkMrTVo1akxJaW1RPT0iLCJ2YWx1ZSI6IlVBSmtzVkErY2FjblwvbVpyT21VUVpRXC9Gc203a2Z5VnBPUkkwRmFiVHJzUkgwOTdUMVl2ZGU0OFhjUnVJdjdqQzF2TE1sWWtFQ1liKzEyT2VoN1Y0dmc9PSIsIm1hYyI6ImQyM2JhN2ZhYzc3ZmRmOTQ3ODM5ZGUxZTQwYWZlY2VlNGM0NWI4ZDg2NjE1MWQxYTM0NDM4MDA0YWNiODZlNjIifQ%3D%3D; _gid=GA1.2.1175521385.1589035270; _sctr=1|1588978800000; PHPSESSID=qa0k6j6ohdakd7dongs6oglkm7; DittoMusic[country]=Q2FrZQ%3D%3D.KG0%3D; DittoMusic[region]=Q2FrZQ%3D%3D.M3k%3D; DittoMusic[currency]=Q2FrZQ%3D%3D.M3mo; DittoMusic[userId]=259773; DITTOSESSION=fh2sol8abh3iclujbgftbfeq41; XSRF-TOKEN=eyJpdiI6IngzbTl1bFVDQytDbjczWHViOFhjcWc9PSIsInZhbHVlIjoiOEhDN3I4cWJHV2ZTOUtpdHNPdkd6V0h4WFBSeE5MMFkwbVhnZlwvZzRnSFhKWlRUQ2ZqbmFMSUt5N3BSRDAzcVBOMmJEQ1wvMU53cUZmRUo4UDJhSGIxUT09IiwibWFjIjoiZGJhYzY0MzE3NDE0ZjlmNzAyYTBkZTM5ZjU4MjJiZmRkYjIxZjdmODFhOWYxNGIyODgzYWM3YmE5NWEyMGYzZSJ9; DITTOAPISESSION=eyJpdiI6InhaM1hzdGdoMTdEU29tWGlSQWJVREE9PSIsInZhbHVlIjoidXhreldHWkQ1MFNYYmlwcXZZNDRqclBxXC9jRWdIODl6QmZoWEw4SUJqdThVZURDWHZobkM1M1dOVk1Obzl0TVR4Y3hMcDNrbm90b2xveTdiMUpsUUl3PT0iLCJtYWMiOiJlZjQ2ODczNGE2ZTY1ZjY3Njc1YjA4ZTVhMGU0YjM4MGI5NmJiZTRkODkxODgxODJlYWM3YTcxNTk0YjhkYTBmIn0%3D; _uetsid=_uet49860bf5-3146-dde0-ba0e-db03c3d40caa; _dc_gtm_UA-63226753-3=1",
    },
  });
  data && console.log("DONE fetching...");
  return data;
};

(async () => {
  const Result = {
    analyticsdates: [],
    analytics: [],
  };
  const analyticsData = JSON.parse(
    fs.readFileSync(__dirname + "/analyticsData.json", "utf-8")
  );
  const response = await Track.findAll({
    attributes: ["id", "title"],
    include: [
      {
        model: Release,
        where: {
          status: "in stores",
        },
        as: "release",
        attributes: ["id", "userId"],
      },
    ],
  });

  const storesResponse = JSON.parse(JSON.stringify(await Store.findAll()));
  const storeDataHash = storesResponse.reduce(
    (prev, { id: storeId, store }) => ({
      ...prev,
      [store.trim().toLowerCase()]: { storeId },
    }),
    {}
  );

  const data = JSON.parse(JSON.stringify(response));
  const trackDataHash = data.reduce(
    (prev, { id: trackId, title, release: { id: releaseId, userId } }) => ({
      ...prev,
      [trackId === 42409 ? "energy" : slugify(title.toLowerCase())]: {
        trackId,
        releaseId,
        userId,
      },
    }),
    {}
  );
  Object.entries(analyticsData).forEach(([date, dateData], index) => {
    const dateId = 42351 + index;
    Result["analyticsdates"].push({ id: dateId, date, status: "published" });

    Object.entries(dateData).forEach(([title, { stream, download }]) => {
      let titleHashData = trackDataHash[title];
      if (!titleHashData) return;

      stream &&
        stream.forEach(({ name, streamTotal }) => {
          const store = storeDataHash[name.trim().toLowerCase()];

          if (!store) return;
          const { storeId } = store;
          Result.analytics.push({
            ...titleHashData,
            type: "stream",
            dateId,
            count: streamTotal,
            storeId,
          });
        });
      download &&
        download.forEach(({ name, streamTotal }) => {
          const store = storeDataHash[name.trim().toLowerCase()];
          if (!store) return;
          const { storeId } = store;
          Result.analytics.push({
            ...titleHashData,
            type: "download",
            dateId,
            count: streamTotal,
            storeId,
          });
        });
    });
  });
  fs.writeFileSync(
    __dirname + "/analytics.json",
    JSON.stringify(Result),
    "utf-8"
  );
})();

// (async () => {
//   const Result = {};
//   let L;
//   const tracksResponse = await request(
//     "https://analytics.dittomusic.com/api/trends/filter?filter_by=tracks&days=50&view=stream"
//   );
//   console.log("TRACKS: ", tracksResponse.table.length);
//   const tracks = tracksResponse.table.map(
//     ({ release_track: { track_title, id } }) => ({
//       track_title,
//       id,
//     })
//   );
//   for (track of tracks) {
//     const { track_title, id } = track;
//     const slugifiedTitle = slugify(track_title.toLowerCase());
//     const trackStreams = await request(
//       `https://analytics.dittomusic.com/api/trends/filter?filter_by=store&days=120&view=stream&tracks[]=${id}`
//     );

//     const trackDownloads = await request(
//       `https://analytics.dittomusic.com/api/trends/filter?filter_by=store&days=120&view=download&tracks[]=${id}`
//     );

//     trackStreams["chart"].series.forEach(({ name, data }) => {
//       Object.entries(data).forEach(([date, { streamTotal }]) => {
//         Result[date] = {
//           ...(L = Result[date] || {}),
//           [slugifiedTitle]: {
//             ...(L = L[slugifiedTitle] || {}),
//             stream: [...(L["stream"] || []), { name, streamTotal }],
//           },
//         };
//       });
//     });

//     trackDownloads["chart"].series.forEach(({ name, data }) => {
//       Object.entries(data).forEach(([date, { streamTotal }]) => {
//         Result[date] = {
//           ...(L = Result[date] || {}),
//           [slugifiedTitle]: {
//             ...(L = L[slugifiedTitle] || {}),
//             download: [...(L["download"] || []), { name, streamTotal }],
//           },
//         };
//       });
//     });
//   }
//
//   fs.writeFileSync(
//     __dirname + "/analyticsData.json",
//     JSON.stringify(Result),
//     "utf-8"
//   );
// })();
