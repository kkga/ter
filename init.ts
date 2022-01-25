import { writableStreamFromWriter } from "https://deno.land/std@0.122.0/streams/mod.ts";
import { fs } from "./deps.ts";

try {
  const pathInfo = Deno.statSync("./_views");
  console.log(pathInfo);
} catch {
  const fileResponse = await fetch(
    "file:///home/kkga/projects/ter/_views/base.eta",
  );

  if (fileResponse.body) {
    fs.ensureDirSync("./_views/");
    const file = await Deno.open("./_views/base.eta", {
      write: true,
      create: true,
    });
    const writableStream = writableStreamFromWriter(file);
    await fileResponse.body.pipeTo(writableStream);
  }
  console.log("initialized new");
}
