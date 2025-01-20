npx pbjs -t static-module -w commonjs -o message.js message.proto

npx tsc --init
### Setting up
npm install --save-dev @grpc/grpc-js @grpc/proto-loader typescript ts-node @types/express
npm install 