DIST="dist"

printf "\n-- DEPLOY START -----------------------\n"

yarn run build

printf "\n-- COPYING FILES ----------------------\n"

cd DIST
rsync -avz --delete -e ssh . admin@dev.sldev.cz:~/experiments/www
cd ../

printf "\n-- COMPLETE ---------------------------\n"
