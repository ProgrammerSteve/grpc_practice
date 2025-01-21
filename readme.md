### Setting up
mkdir proto
touch ./proto/{{PACKAGE_NAME}}.proto
npm init -y
npm install --save-dev @grpc/grpc-js @grpc/proto-loader typescript ts-node @types/express
npx tsc --init
npm install 

### proto-gen.sh script
npx proto-loader-gen-types --grpcLib=@grpc/grpc-js --outDir=proto/ proto/*.proto

## scripts in package.json
```
  "scripts": {
    "proto:gen":"./proto-gen.sh",
    "start": "ts-node server",
    "client": "ts-node client"
  },
```
