const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const config = require("./config");

const mimeTypes = {
  html: "text/html",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  js: "text/javascript",
  css: "text/css",
};

const routes = {
  GET: {
    "/": (req, res) => {
      const env = process.env.NODE_ENV;
      const title = process.env.title || "no-title";
      res.write(`...Hello World! env: ${env} - title: ${title}`);
      res.end();
    },
    "/about": (req, res) => {
      res.write("About Page");
      res.end();
    },
    "/contact": (req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      var fileStream = fs.createReadStream("public/contact.html");
      fileStream.pipe(res);
    },
  },
};

http
  .createServer(function (req, res) {
    const urlParse = url.parse(req.url, true);
    const pathname = path.resolve(urlParse.pathname);

    // Checking if a route exist
    if (routes[req.method]) {
      const route = routes[req.method][pathname];
      if (route) {
        try {
          return route(req, res);
        } catch (err) {
          console.log(err);
          res.writeHead(500, { "Content-Type": "text/html" });
          return res.end(`Something happen\n ${JSON.stringify(err, null, 2)}`);
        }
      }
    }

    // Checking if the request is a file
    var uri = url.parse(req.url).pathname;
    var filename = path.join(process.cwd(), "public/", uri);
    console.log(filename);
    fs.exists(filename, function (exists) {
      if (!exists) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.write("404 Not Found\n");
        res.end();
        return;
      }
      var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
      res.writeHead(200, { "Content-Type": mimeType });
      var fileStream = fs.createReadStream(filename);
      fileStream.pipe(res);
    });
  })
  .listen(config.port);

console.log(`server running on port ${config.port}`);

/*
If you want to return a css file...

if (file) {
  fs.readFile('index.css', (err, data) => {
    res.writeHeader(200, { 'Content-Type': 'text/css' })
    res.setHeader('Cache-Control', 'public, must-revalidate, max-age: 86400, s-maxage=86400, stale-while-revalidate=86400');
    res.write(data)
    res.end()
  })
} else {
  res.send('ok')
  res.end()
}

*/
