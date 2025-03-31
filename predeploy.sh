# predeploy.sh

# remove the version hash from our base javascript file for a stable URL
find dist/assets -name "index*.js" -exec mv '{}' dist/assets/main.js \;