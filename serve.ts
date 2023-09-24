import { RE_HIDDEN_OR_UNDERSCORED } from "./constants.ts";
import { join, relative } from "./deps/std.ts";
import { GenerateSiteOpts } from "./main.ts";
import type { BuildConfig } from "./types.d.ts";

interface WatchOpts {
  runner: (opts: GenerateSiteOpts) => Promise<void>;
  config: BuildConfig;
  logLevel: 0 | 1 | 2;
}

interface ServeOpts extends WatchOpts {
  port: number | null;
}

const sockets: Set<WebSocket> = new Set();

let servePath: string;

async function watch(opts: WatchOpts) {
  const paths = [opts.config.inputPath, join(Deno.cwd(), ".ter")];
  const watcher = Deno.watchFs(paths);
  let timer = 0;

  const isInOutputDir = (path: string): boolean =>
    relative(opts.config.outputPath, path).startsWith("..");

  eventLoop: for await (const event of watcher) {
    if (["any", "access"].includes(event.kind)) {
      continue;
    }

    for (const eventPath of event.paths) {
      if (
        eventPath.match(RE_HIDDEN_OR_UNDERSCORED) ||
        !isInOutputDir(eventPath)
      ) {
        continue eventLoop;
      }
    }

    console.info(`>>> ${event.kind}: ${relative(Deno.cwd(), event.paths[0])}`);
    await opts.runner({
      config: opts.config,
      includeRefresh: true,
      logLevel: 0,
    });

    sockets.forEach((socket) => {
      clearTimeout(timer);
      timer = setTimeout(() => socket.send("refresh"));
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

  let resp: Response;

  try {
    let file = await Deno.open(join(servePath, filepath), { read: true });
    const stat = await file.stat();

    if (stat.isDirectory) {
      file.close();
      const filePath = join(servePath, filepath, "index.html");
      file = await Deno.open(filePath, { read: true });
    }
    resp = new Response(file.readable);
  } catch {
    resp = new Response("404 Not Found", { status: 404 });
  }

  console.info(`[${resp.status}]\t${url.pathname}`);
  return resp;
}

export function serve(opts: ServeOpts) {
  servePath = opts.config.outputPath;

  watch(opts);

  if (opts.port) {
    Deno.serve({ port: opts.port }, requestHandler);
  } else {
    Deno.serve(requestHandler);
  }
}
