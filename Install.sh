#!/bin/sh

# Run this script after cloning this repository to get the project into a running state.

cd Makejs
npm install
npm run build
cd ..

ln -s ./Makejs/build/source/make.d.ts ./make.d.ts
ln -s ./Makejs/build/source/make.js ./make.js

echo "This script will globally install the latest versions of: TypeScript, Jest, Terser."
read -p "Press any key to continue, or CTRL+C to quit."

npm install -g jest
npm install -g typescript
npm install -g terser
