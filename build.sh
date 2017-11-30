DIST="dist"

printf "\n-- DEPLOY START -----------------------\n"

#yarn run build

printf "\n-- COPYING FILES ----------------------\n"

cd DIST
cp js/trezor-connect.*.js trezor-connect.js
cp js/trezor-library.*.js trezor-library.js
rsync -avz --delete -e ssh . admin@dev.sldev.cz:~/experiments/www
cd ../

printf "\n-- COMPLETE ---------------------------\n"
