#!/bin/sh
rsync -avr --delete --exclude-from=scripts/rsync-exclude.txt html/ gnerd:www/decafbad.com/docs/recaffinated/
