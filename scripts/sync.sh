#!/bin/sh
export SSH_AUTH_SOCK=$HOME/.ssh/auth_sock
rsync -avr --delete --exclude-from=scripts/rsync-exclude.txt html/ gnerd:www/decafbad.com/docs/recaffeinated/
