MAKEFLAGS := -j 4 --silent --always-make
DENO := deno run --allow-net --allow-env --allow-read=./ --allow-write=./ --unstable
INPUTDIR = docs
OUTPUTDIR = _site
ASSETSDIR = assets
VIEWSDIR = views

build-test:
	$(DENO) main.ts test-10000

clean:
	rm -rf $(OUTPUTDIR)

build:
	$(DENO) main.ts $(INPUTDIR) $(OUTPUTDIR)

watch:
	$(DENO) --watch=$(INPUTDIR),$(ASSETSDIR),$(VIEWSDIR) --no-clear-screen main.ts $(INPUTDIR) $(OUTPUTDIR)

serve:
	$(DENO) https://deno.land/std/http/file_server.ts $(OUTPUTDIR) --port 8080

dev: watch serve
