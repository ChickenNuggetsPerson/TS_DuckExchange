mkdir data
cp ./setupFiles/admins.json ./data/admins.json
cp ./setupFiles/empty.json ./data/categories.json
cp ./setupFiles/empty.json ./data/users.json

mkdir dist

npm install

echo
echo
echo Done Installing Files... You can now run start.sh to start the server