import { path, readableStreamFromReader, serve as httpServe } from "./deps.ts";
import { TerConfig } from "./config.ts";

interface WatchOpts {
  config: TerConfig;
  runner: (config: TerConfig) => Promise<void>;
}

interface ServeOpts extends WatchOpts {
  port: number;
}

const sockets: Set<WebSocket> = new Set();

async function watch(opts: WatchOpts) {
  // TODO: watch for source ts changes in dev
  const watcher = Deno.watchFs(opts.config.inputPath);

  for await (const event of watcher) {
    if (["any", "access"].includes(event.kind)) {
      continue;
    }

    console.log("[changes detected]\n---");
    // TODO: add quiet param for build func
    await opts.runner(opts.config);

    console.log("---\nRefreshing...");
    sockets.forEach((socket) => {
      socket.send("refresh");
    });
  }
}

function refreshMiddleware(req: Request): Response | null {
  if (req.url.endsWith("/refresh")) {
    const { response, socket } = Deno.upgradeWebSocket(req);

    sockets.add(socket);
    socket.onclose = () => {
      sockets.delete(socket);
    };

    return response;
  }
  return null;
}

async function requestHandler(request: Request) {
  const response = refreshMiddleware(request);
  if (response) return response;

  const url = new URL(request.url);
  const filepath = decodeURIComponent(url.pathname);

  let file;
  try {
    // TODO: use config path
    file = await Deno.open("_site/" + filepath, { read: true });
    const stat = await file.stat();

    if (stat.isDirectory) {
      file.close();
      const filePath = path.join("_site/", filepath, "index.html");
      file = await Deno.open(filePath, { read: true });
    }
  } catch {
    return new Response("404 Not Found", { status: 404 });
  }

  const readableStream = readableStreamFromReader(file);
  return new Response(readableStream);
}

export function serve(opts: ServeOpts) {
  watch(opts);
  httpServe(requestHandler, { port: opts.port });
  console.log(`---\nServing site on http://localhost:${opts.port}/`);
}
