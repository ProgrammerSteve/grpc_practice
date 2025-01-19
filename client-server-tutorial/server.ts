import path from 'path'
import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"
import {ProtoGrpcType} from "./proto/random"
import {RandomHandlers} from './proto/randomPackage/Random'

const PORT=8082;
const PROTO_FILE=path.join(__dirname,'proto','random.proto');
const packageDef=protoLoader.loadSync(path.resolve(PROTO_FILE));
const grpcObj= (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType;
const randomPackage = grpcObj.randomPackage;

function main(){
    const server=getServer();
    server.bindAsync(`0.0.0.0:${PORT}`,grpc.ServerCredentials.createInsecure(),(err,port)=>{
        if(err){
            console.error(err);
            return
        }
        console.log(`Your server has stared on port ${port}`)
    })
}

function getServer(){
    const server=new grpc.Server();
    server.addService(randomPackage.Random.service, {
        "PingPong":(call, callback) => {
            console.log(call.request);
            callback(null, { message: "Pong" });
        }
    } as RandomHandlers)
    return server;
}
main();