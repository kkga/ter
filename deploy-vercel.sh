#!/bin/sh

curl -fsSL https://deno.land/x/install/install.sh | sh
make deploy-vercel
