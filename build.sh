DIST="dist"

printf "\n---- Build started -----------------------\n"

yarn run build

printf "\n---- Copying files ----------------------\n"

cd DIST
cp js/trezor-connect.*.js trezor-connect.js
# cp js/trezor-library.*.js trezor-library.js

if [[ "$@" == "copy" ]]
then
    printf "\n---- Copying files to server ----------------------\n"
    rsync -avz --delete -e ssh . admin@dev.sldev.cz:~/experiments/www
else
    echo ' '
fi
cd ../

printf "\n---- Complete ---------------------------\n"
