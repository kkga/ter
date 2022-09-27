import { join, relative } from "./deps.ts";
import { readableStreamFromReader } from "./deps.ts";
import { serve as httpServe } from "./deps.ts";
import { BuildConfig } from "./config.ts";
import { RE_HIDDEN_OR_UNDERSCORED } from "./entries.ts";
import { GenerateSiteOpts } from "./main.ts";

interface WatchOpts {
  runner: (opts: GenerateSiteOpts) => Promise<void>;
  config: BuildConfig;
}

interface ServeOpts extends WatchOpts {
  port: number | null;
}

const sockets: Set<WebSocket> = new Set();

let servePath: string;

async function watch(opts: WatchOpts) {
  const watcher = Deno.watchFs(opts.config.inputPath);
  let timer = 0;

  eventLoop:
  for await (const event of watcher) {
    if (["any", "access"].includes(event.kind)) {
      continue;
    }

    for (const eventPath of event.paths) {
      if (
        eventPath.match(RE_HIDDEN_OR_UNDERSCORED) ||
        !relative(opts.config.outputPath, eventPath).startsWith("..")
      ) {
        continue eventLoop;
      }
    }

    console.log(
      `>>> ${event.kind}: ${relative(opts.config.inputPath, event.paths[0])}`,
    );
    await opts.runner({
      config: opts.config,
      quiet: true,
      includeRefresh: true,
    });

    sockets.forEach((socket) => {
      clearTimeout(timer);
      timer = setTimeout(() => socket.send("refresh"), 100);
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
    file = await Deno.open(join(servePath, filepath), { read: true });
    const stat = await file.stat();

    if (stat.isDirectory) {
      file.close();
      const filePath = join(servePath, filepath, "index.html");
      file = await Deno.open(filePath, { read: true });
    }
  } catch {
    // TODO: serve the 404.html
    const resp = new Response("404 Not Found", { status: 404 });
    console.log(`[${resp.status}]\t${url.pathname}`);
    return resp;
  }

  const readableStream = readableStreamFromReader(file);
  const resp = new Response(readableStream);
  console.log(`[${resp.status}]\t${url.pathname}`);
  return resp;
}

export function serve(opts: ServeOpts) {
  servePath = opts.config.outputPath;
  watch(opts);
  if (opts.port) httpServe(requestHandler, { port: opts.port });
  else httpServe(requestHandler);
}
