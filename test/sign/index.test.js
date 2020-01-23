import { getPackedData } from "../../src/utils/pack";
import { ethers } from "ethers";

const PRIV_KEY =
  "0x15f570a7914ed27b13ba4a63cee82ad4d77bba3cc60b037abef2f1733423eb70";

const address = "0x920984391853d81CCeeC41AdB48a45D40594A0ec";
const signer = new ethers.Wallet(PRIV_KEY);

test("it should sign correctly a LockExpired", async () => {
  const LE = {
    type: "LockExpired",
    chain_id: 33,
    nonce: 2,
    token_network_address: "0xb3df4fbd04d29a04d9d0666c009713076e364109",
    message_identifier: "100261347073025339",
    channel_identifier: 4,
    secrethash:
      "0xbec0cbd74af7dcc4e2a0d382f7c02562a812c041950746d8c81f42b347075341",
    transferred_amount: 0,
    locked_amount: 0,
    recipient: "0x29021129f5d038897f01bd4bc050525ca01a4758",
    locksroot:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
  };
  const dataToSign = getPackedData(LE);
  const signature = await signer.signMessage(dataToSign);
  const recoveredAddress = ethers.utils.verifyMessage(dataToSign, signature);
  expect(recoveredAddress).toBe(address);
});

test("should sign and recover from NonClosingBP", async () => {
  const data = {
    type: "Secret",
    chain_id: 33,
    message_identifier: "11519063203689793209",
    payment_identifier: "14479511804263315584",
    secret:
      "0x061c302034fa6a4882788a7ff3834b4e3e8bafbdc572fab8d34113e9e32e5cd8",
    nonce: 12,
    token_network_address: "0x013b47e5eb40a476dc0e9a212d376899288561a2",
    channel_identifier: 22,
    transferred_amount: "60000000",
    locked_amount: 0,
    locksroot:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    signature:
      "0x16820ee8ea32b053e4bb837f528b08e6d4e4afb6c468db4a39dc72cba32f2ff51e5db385b72b524c1c44d4801a06d13216ce3a5261db27847b90e3c4bacf82d11c",
  };

  const dataToSign = getPackedData(data);
  const signature = await signer.signMessage(dataToSign);
  const recoveredAddress = ethers.utils.verifyMessage(dataToSign, signature);
  expect(recoveredAddress).toBe(address);
});

test("should sign and recover from Delivered", async () => {
  const data = {
    type: "Delivered",
    delivered_message_identifier: "18237677588114994956",
  };

  const dataToSign = getPackedData(data);
  const signature = await signer.signMessage(dataToSign);
  const recoveredAddress = ethers.utils.verifyMessage(dataToSign, signature);
  expect(recoveredAddress).toBe(address);
});
