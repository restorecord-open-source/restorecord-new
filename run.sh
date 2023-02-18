git pull

yarn

BUILD_DIR=temp yarn build || exit

if [ ! -d "temp" ]; then
  echo '\033[31m temp Directory not exists!\033[0m'  
  exit 1;
fi

rm -rf .next

if [ ! -d ".next" ]; then
  mkdir .next
fi

mv temp/* .next

rm -rf temp

pm2 reload restorecord --update-env