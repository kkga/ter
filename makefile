MAKEFLAGS := -j 4 --silent --always-make
DENO := deno run --allow-net --allow-env --allow-read=./ --allow-write=./ --unstable
INPUTDIR = docs
OUTPUTDIR = _site

clean:
	rm -rf $(OUTPUTDIR)

build:
	$(DENO) main.ts $(INPUTDIR)

build-test:
	$(DENO) main.ts 10000-files-test

watch:
	$(DENO) --watch=$(INPUTDIR),_assets,_views main.ts $(INPUTDIR)

serve:
	$(DENO) https://deno.land/std/http/file_server.ts $(OUTPUTDIR) --port 8080

dev: watch serve

deploy-vercel:
	curl -fsSL https://deno.land/x/install/install.sh | sh
	/vercel/.deno/bin/$(DENO) main.ts $(INPUTDIR)
