## Run Local net

- [link]("https://aptos.dev/en/build/cli/running-a-local-network") để xem cách chạy local host của aptos

Để chạy localnet bạn cần thực hiện các bước sau:

1. Tải **Aptos CLI**
2. Cài đặt docker - chạy docker
- ở bước này nếu bạn chạy docker trên terminal hoặc wsl, thì chạy docker service như sau:
```shell
sudo service docker start
```
- xem trạng thái 
```shell 
sudo service docker status || sudo service docker start
```
3. chạy local net 
```shell 
aptos node run-local-testnet --with-indexer-api
```

## Config the Typescript SDK
```typescript
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
 
const network = Network.LOCAL;
const config = new AptosConfig({ network });
const client = new Aptos(config);
```

## Run example

1. Chạy lệnh 

