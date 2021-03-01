set -e
# set current head to master
git checkout master
# pull the discord.js master
git pull repo-master
# automerge if possible
git merge repo-master --ff-only --no-edit -m "Automerge.sh - auto merged via update"