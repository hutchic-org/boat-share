#!/bin/sh

# Default command
cmd="npm run dev"

if [ "$1" = "generate" ]; then
  cmd="npm run generate"
fi

exec $cmd
