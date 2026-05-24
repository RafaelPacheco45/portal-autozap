const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const API_BASE_URL = "https://aip.autozap.log.br";
const ROOT = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function serveStatic(response, urlPath) {
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.resolve(ROOT, `.${decodeURIComponent(requestedPath)}`);

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(content);
  });
}

async function proxyApi(request, response) {
  const body = await readBody(request);
  const headers = { ...request.headers };

  delete headers.host;
  delete headers.origin;
  delete headers.referer;
  delete headers.connection;
  delete headers["content-length"];

  await new Promise((resolve, reject) => {
    const apiUrl = new URL(`${API_BASE_URL}${request.url}`);
    const proxyRequest = https.request({
      hostname: apiUrl.hostname,
      path: `${apiUrl.pathname}${apiUrl.search}`,
      method: request.method,
      headers
    }, (apiResponse) => {
      const responseHeaders = { ...apiResponse.headers };
      delete responseHeaders["transfer-encoding"];
      response.writeHead(apiResponse.statusCode || 502, responseHeaders);
      apiResponse.pipe(response);
      apiResponse.on("end", resolve);
    });

    proxyRequest.on("error", reject);
    if (body.length) proxyRequest.write(body);
    proxyRequest.end();
  });
}

http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://localhost:${PORT}`);

    if (
      url.pathname.startsWith("/auth/") ||
      url.pathname.startsWith("/supplier/") ||
      url.pathname.startsWith("/admin/") ||
      url.pathname.startsWith("/start/")
    ) {
      await proxyApi(request, response);
      return;
    }

    serveStatic(response, url.pathname);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ok: false, error: error.message }));
  }
}).listen(PORT, () => {
  console.log(`Portal rodando em http://localhost:${PORT}`);
  console.log(`Proxy da API apontando para ${API_BASE_URL}`);
});
