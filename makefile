MAKEFLAGS := -j 4 --silent --always-make
DENO := deno run --allow-net --allow-read=./ --allow-write=./ --unstable

clean:
	rm -rf _site

build:
	$(DENO) main.ts docs

watch:
	$(DENO) --watch=docs,_static,_views main.ts docs

serve:
	$(DENO) https://deno.land/std/http/file_server.ts _site --port 8080

dev: watch serve

deploy-vercel:
	curl -fsSL https://deno.land/x/install/install.sh | sh
	/vercel/.deno/bin/deno run --allow-net --allow-env --allow-read=./ --allow-write --unstable main.ts docs
