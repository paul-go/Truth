#!/bin/bash

# Run this script after cloning this repository to get the project into a running state.

cd Makejs
npm install
npm run build
cd ..

ln -s ./Makejs/build/source/make.d.ts ./make.d.ts
ln -s ./Makejs/build/source/make.js ./make.js
