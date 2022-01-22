#!/bin/sh

curl -fsSL https://deno.land/x/install/install.sh | sh
deno run --allow-net --allow-read=./ --allow-write --unstable ./main.ts docs
