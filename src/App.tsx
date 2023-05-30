import React, { useState } from "react";
import "./styles.css";
import { Magic } from "magic-sdk";
import { FlowExtension } from '@magic-ext/flow';
// @ts-ignore
import * as fcl from "@onflow/fcl";

const testnetURL = 'https://rest-testnet.onflow.org'
const network = 'testnet'
const magic = new Magic("YOUR_API_KEY", {
    extensions: [
      new FlowExtension({
        rpcUrl: testnetURL,
        network,
      }),
    ]
  }
);

export default function App() {
  const [account, setAccount] = useState('');

  const login = async () => {
    const account = await magic.flow.getAccount()

    console.log(account)
    setAccount(account)
  };

  const flowSendTransaction = async () => {
    const AUTHORIZATION_FUNCTION = magic.flow.authorization;

    fcl.config().put("accessNode.api", testnetURL);
    const response = await fcl.send([
      fcl.transaction`
      transaction {
        var acct: AuthAccount

        prepare(acct: AuthAccount) {
          self.acct = acct
        }

        execute {
          log(self.acct.address)
        }
      }
    `,
      fcl.proposer(AUTHORIZATION_FUNCTION),
      fcl.authorizations([AUTHORIZATION_FUNCTION]),
      fcl.payer(AUTHORIZATION_FUNCTION)
    ]);
    console.log("TRANSACTION SENT");
    console.log("TRANSACTION RESPONSE", response);

    console.log("WAITING FOR TRANSACTION TO BE SEALED");
    const data = await fcl.tx(response).onceSealed();
    console.log("TRANSACTION SEALED", data);

  }

  const showWallet = () => {
    magic.wallet.showUI().catch((e) => {
      console.log(e);
    });
  };

  const disconnect = async () => {
    await magic.user.logout();
    setAccount('');
  };

  return (
    <div className="app">
      <h2>Magic Connect</h2>
      {!account && (
        <button onClick={login} className="button-row">
          Sign In
        </button>
      )}

      {account && (
        <>
          <button onClick={showWallet} className="button-row">
            Show Wallet
          </button>
          <button onClick={flowSendTransaction} className="button-row">
            Flow Send Transaction
          </button>
          <button onClick={disconnect} className="button-row">
            Disconnect
          </button>
        </>
      )}
    </div>
  );
}
