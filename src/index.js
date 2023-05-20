import fs from "fs-extra";
import { extract } from "@extractus/feed-extractor";
import { Feed } from "feed";
const urls = fs.readFileSync("./url.config", "utf8").split("\n");

urls.pop(); // remove useless lastline

const promises = urls.map((url) =>
  extract(url, {
    getExtraEntryFields: (entry) => {
      //console.log(entry);
      return { content: entry.content?.["#text"] };
    },
  })
);
let feeds = await Promise.all(promises);

let items = feeds.reduce((feeds, feed) => {
  return [...feeds, ...feed.entries];
}, []);

const feed = new Feed({
  title: "Veille technique",
  description:
    "Feed personnel pour être utiliser avec n'importe quel cliient RSS",
  author: { name: "Gaetan Puleo" },
});

items.forEach((item) => {
  //console.log(item);
  return feed.addItem({
    title: item.title,
    description: item.description,
    date: new Date(item.published),
    link: item.link,
    content: item.content,
  });
});
//console.log(feeds[1]);
console.log(feed.rss2());

fs.ensureDirSync("./build");
fs.writeFileSync("./build/rss2.xml", feed.rss2());
