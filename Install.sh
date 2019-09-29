#!/bin/sh

# Run this script after cloning this repository to get the project into a running state.

cd Makets
npm install
npm run build
cd ..

ln -s ./Makets/build/source/make.d.ts ./make.d.ts
ln -s ./Makets/build/source/make.ts ./make.ts

echo "This script will globally install the latest versions of: Jest, Terser, Puppeteer."
read -p "Press any key to continue, or CTRL+C to quit."
read -p "Do you want to use 'sudo' to install global packages? [y/n] " useSudoKey

useSudo=0; [ $useSudoKey = "y" ] && useSudo=1

npmInstallGlobal() {
    if [ $useSudo = 1 ]
    then
        sudo npm install -g $1
    else
        npm install -g $1
    fi
}

npmInstallGlobal jest
npmInstallGlobal terser
npmInstallGlobal puppeteer
