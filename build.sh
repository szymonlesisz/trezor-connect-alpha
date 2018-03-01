DIST="dist"

function bump1 {
    output=$(npm version ${release} --no-git-tag-version)
    version=${output:1}
    search='("version":[[:space:]]*").+(")'
    replace="\1${version}\2"

    sed -i ".tmp" -E "s/${search}/${replace}/g" "$1"
    rm "$1.tmp"
}

function bump {
    PACKAGE_VERSION=$(cat "$1" \
        | grep version \
        | head -1 \
        | awk -F: '{ print $2 }' \
        | sed 's/[",]//g')

    sed -i ".tmp" -E "s/${PACKAGE_VERSION}/$2/g" "$1"
    echo $PACKAGE_VERSION
    echo $2
}

printf "\n---- Build started -----------------------\n"

yarn run build

if [[ "$1" == "npm" ]]
then
    printf "\n---- Bump npm version ----------------------\n"
    mkdir dist/npm
    mkdir dist/npm/dist

    # bump src/data/npm-package.json $2
    cp src/data/npm-package.json dist/npm/package.json
    cp README.md dist/npm/README.md
    cp COPYING dist/npm/COPYING
    cp dist/js/trezor-connect.*.js dist/npm/dist/index.js
    cp dist/js/trezor-library.*.js dist/npm/dist/library.js

    cd dist/npm
    npm version $2
    npm publish

    # copy bumped version back
    # cp src/data/npm-package.json dist/npm/package.json

else
    echo ' '
fi


printf "\n---- Copying files ----------------------\n"

cd DIST
cp js/trezor-connect.*.js trezor-connect.js
# cp js/trezor-library.*.js trezor-library.js

if [[ "$@" == "copy" ]]
then
    printf "\n---- Copying files to server ----------------------\n"
    rsync -avz --delete -e ssh . admin@dev.sldev.cz:~/sisyfos/www
else
    echo ' '
fi

cd ../

printf "\n---- Complete ---------------------------\n"
