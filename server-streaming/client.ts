import path from 'path'
import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"
import {ProtoGrpcType} from "./proto/random"


const PORT=8082;
const PROTO_FILE=path.join(__dirname,'proto','random.proto');

const packageDef=protoLoader.loadSync(path.resolve(PROTO_FILE));
const grpcObj= (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType;


const client = new grpcObj.randomPackage.Random(
    `0.0.0.0:${PORT}`,grpc.credentials.createInsecure()
)

const deadline= new Date();
deadline.setSeconds(deadline.getSeconds()+ 5)
client.waitForReady(deadline,(err)=>{
    if(err){
        console.error(err)
        return
    }
    onClientReady()
})


function onClientReady(){
    const stream= client.RandomNumbers({maxVal: 85});
    stream.on("data",(chunk)=>{
        console.log(chunk)
    })
    stream.on("end",()=>{
        console.log("communication ended")
    })
}
