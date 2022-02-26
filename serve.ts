import { path } from "./deps.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { refresh } from "https://deno.land/x/refresh/mod.ts";
import { readableStreamFromReader } from "https://deno.land/std/streams/mod.ts";

const middleware = refresh();

async function handler(request: Request) {
  const response = middleware(request);
  if (response) return response;

  // Use the request pathname as filepath
  const url = new URL(request.url);
  const filepath = decodeURIComponent(url.pathname);

  // Try opening the file
  let file;
  try {
    file = await Deno.open("_site/" + filepath, { read: true });
    const stat = await file.stat();

    // If File instance is a directory, lookup for an index.html
    if (stat.isDirectory) {
      file.close();
      const filePath = path.join("_site/", filepath, "index.html");
      file = await Deno.open(filePath, { read: true });
    }
  } catch {
    // If the file cannot be opened, return a "404 Not Found" response
    return new Response("404 Not Found", { status: 404 });
  }

  // Build a readable stream so the file doesn't have to be fully loaded into
  // memory while we send it
  const readableStream = readableStreamFromReader(file);

  // Build and send the response
  return new Response(readableStream);
}

serve(handler, { port: 8080 });

console.log("File server running on http://localhost:8080/");
