build:
	deno run --allow-net --allow-read=./ --allow-write --unstable ./main.ts docs

serve:
	deno run --allow-net --allow-read=./ --allow-env https://deno.land/std/http/file_server.ts _site

deploy-vercel:
	/vercel/.deno/bin/deno run --allow-net --allow-read=./ --allow-write --unstable ./main.ts docs
