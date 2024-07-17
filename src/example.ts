import { Account, Aptos, AptosConfig, Network, AccountAddress } from "@aptos-labs/ts-sdk";

const APTOS_COIN = "0x1::aptos_coin::AptosCoin";
const COIN_STORE = `0x1::coin::CoinStore<${APTOS_COIN}>`;
const ALICE_INITIAL_BALANCE = 100_000_000;
const BOB_INITIAL_BALANCE = 100;
const TRANSFER_AMOUNT = 100;

// hàm kiểm ra tài khoản trong một address
const balance = async (aptos: Aptos, name: string, address: AccountAddress) => {
  type Coin = { coin: { value: string } };
  const resource = await aptos.getAccountResource<Coin>({
    accountAddress: address,
    resourceType: COIN_STORE,
  });
  const amount = Number(resource.coin.value);

  console.log(`${name}'s balance is: ${amount}`);
  return amount;
};

async function example() {
  console.log(
    "Ví dụ này sẽ tạo hai tài khoản (Alice và Bob), nạp tiền vào chúng, và chuyển tiền giữa chúng.",
  );
  // Thiết lập client
  const config = new AptosConfig({ network: Network.LOCAL });
  const aptos = new Aptos(config);

  // Tạo hai tài khoản
  const alice = Account.generate();
  const bob = Account.generate();

  console.log("=== Địa chỉ ===\n");
  console.log(`Địa chỉ của Alice là: ${alice.accountAddress}`);
  console.log(`Địa chỉ của Bob là: ${bob.accountAddress}`);

  // Nạp tiền vào các tài khoản sử dụng faucet
  console.log("\n=== Đang nạp tiền vào tài khoản ===\n");
  await aptos.fundAccount({
    accountAddress: alice.accountAddress,
    amount: ALICE_INITIAL_BALANCE,
  });
  await aptos.fundAccount({
    accountAddress: bob.accountAddress,
    amount: BOB_INITIAL_BALANCE,
  });
  console.log("Đã nạp tiền vào tài khoản của Alice và Bob!");

  // Kiểm tra số dư
  console.log("\n=== Số dư ===\n");
  const aliceBalance = await balance(aptos, "Alice", alice.accountAddress);
  console.log(`Số dư của Alice là: ${aliceBalance}`);

  const bobBalance = await balance(aptos, "Bob", bob.accountAddress);
  console.log(`Số dư của Bob là: ${bobBalance}`);

  // Chuyển tiền từ Alice sang Bob
  console.log("\n=== Đang thực hiện giao dịch chuyển tiền ===\n");
  const transaction = await aptos.transaction.build.simple({
    sender: alice.accountAddress,
    data: {
      function: "0x1::aptos_account::transfer",
      typeArguments: [],
      functionArguments: [bob.accountAddress, TRANSFER_AMOUNT],
    },
  });

  const committedTxn = await aptos.signAndSubmitTransaction({
    signer: alice,
    transaction,
  });

  const executedTxn = await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
  console.log("Hash giao dịch:", executedTxn.hash);

  // Kiểm tra số dư sau khi chuyển tiền
  console.log("\n=== Số dư sau khi chuyển tiền ===\n");
  const newAliceBalance = await balance(aptos, "Alice", alice.accountAddress);
  console.log(`Số dư mới của Alice là: ${newAliceBalance}`);

  const newBobBalance = await balance(aptos, "Bob", bob.accountAddress);
  console.log(`Số dư mới của Bob là: ${newBobBalance}`);

  // Xác minh số dư
  if (newBobBalance !== TRANSFER_AMOUNT + BOB_INITIAL_BALANCE)
    throw new Error("Số dư của Bob sau khi chuyển tiền không chính xác");
  if (newAliceBalance >= ALICE_INITIAL_BALANCE - TRANSFER_AMOUNT)
    throw new Error("Số dư của Alice sau khi chuyển tiền không chính xác");

  console.log("\nGiao dịch thành công!");
}

// Chạy ví dụ
example().catch(error => {
  console.error("Có lỗi xảy ra:", error);
  process.exit(1);
});
