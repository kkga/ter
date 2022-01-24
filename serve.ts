import * as path from "https://deno.land/std@0.122.0/path/mod.ts";
import { readableStreamFromReader } from "https://deno.land/std@0.122.0/streams/mod.ts";

const buildPath = Deno.args[0];

if (!buildPath) {
  console.log("Specify output directory");
  Deno.exit(1);
} else {
  console.log(`Serving ${buildPath}`);
}

// Start listening on port 8080 of localhost.
const server = Deno.listen({ port: 8080 });
console.log("File server running on http://localhost:8080/");

for await (const conn of server) {
  handleHttp(conn);
}

async function handleHttp(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    // Use the request pathname as filepath
    const url = new URL(requestEvent.request.url);
    const filepath = decodeURIComponent(url.pathname);

    // Try opening the file
    let file;
    try {
      file = await Deno.open(buildPath + filepath, { read: true });
      const stat = await file.stat();

      // If File instance is a directory, lookup for an index.html
      if (stat.isDirectory) {
        file.close();
        const filePath = path.join(buildPath, filepath, "index.html");
        file = await Deno.open(filePath, { read: true });
      }
    } catch {
      // If the file cannot be opened, return a "404 Not Found" response
      const notFoundResponse = new Response("404 Not Found", { status: 404 });
      await requestEvent.respondWith(notFoundResponse);
      return;
    }

    // Build a readable stream so the file doesn't have to be fully loaded into
    // memory while we send it
    const readableStream = readableStreamFromReader(file);

    // Build and send the response
    const response = new Response(readableStream);
    await requestEvent.respondWith(response);
  }
}
