MAKEFLAGS := -j 4 --silent --always-make
PAR := $(MAKE) -j 128
DENO := deno run --watch --allow-net --allow-read

clean:
	rm -rf _site

build: clean
	deno run --allow-net --allow-read=./ --allow-write --unstable main.ts docs

watch: clean
	deno run --allow-net --allow-read=./ --allow-write --unstable --watch main.ts docs

serve:
	deno run --allow-net --allow-read=./ --allow-env --watch=_site/**/* https://deno.land/std/http/file_server.ts _site

dev: watch serve

deploy-vercel:
	curl -fsSL https://deno.land/x/install/install.sh | sh
	/vercel/.deno/bin/deno run --allow-net --allow-read=./ --allow-write --unstable main.ts docs
