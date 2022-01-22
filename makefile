MAKEFLAGS := -j 4 --silent --always-make
PAR := $(MAKE) -j 128
DENO := deno run --watch --allow-net --allow-read

clean:
	rm -rf _site

build: clean
	deno run --allow-net --allow-read=./ --allow-write --unstable main.ts docs

watch: clean
	deno run --allow-net --allow-read=./ --allow-write --unstable --watch=docs,_views main.ts docs

serve:
	deno run --quiet --allow-net --allow-read=./ --allow-env --unstable --watch=docs,_views https://deno.land/std/http/file_server.ts _site

dev: watch serve

deploy-vercel:
	curl -fsSL https://deno.land/x/install/install.sh | sh
	/vercel/.deno/bin/deno run --allow-net --allow-env --allow-read=./ --allow-write --unstable main.ts docs
