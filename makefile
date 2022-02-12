MAKEFLAGS := -j 4 --silent --always-make
DENO := deno run --allow-net --allow-env --allow-read=./ --allow-write=./ --unstable
INPUTDIR = docs
OUTPUTDIR = _site
ASSETSDIR = .ter/assets
VIEWSDIR = .ter/views

build-test:
	$(DENO) main.ts test-10000

clean:
	rm -rf $(OUTPUTDIR)

build:
	mkdir -p $(ASSETSDIR)
	cp assets/* $(ASSETSDIR)
	$(DENO) main.ts $(INPUTDIR) $(OUTPUTDIR)

watch:
	$(DENO) --watch=$(INPUTDIR),$(ASSETSDIR),$(VIEWSDIR) main.ts $(INPUTDIR) $(OUTPUTDIR)

serve:
	$(DENO) https://deno.land/std/http/file_server.ts $(OUTPUTDIR) --port 8080

dev: watch serve
