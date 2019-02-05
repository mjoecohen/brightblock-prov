import Web3 from "web3";

const ethereumService = {
  getWeb3: function() {
    if (typeof window.web3 !== "undefined") {
      ethereumService.web3 = new Web3(window.web3.currentProvider);
    } else {
      // set the  provider you want from Web3.providers
      ethereumService.web3 = new Web3(
        new Web3.providers.HttpProvider(ethereumService.ETHEREUM_URI)
      );
    }
    if (ethereumService.web3.isConnected()) {
      return ethereumService.web3;
    }
    // console.log("No connection to ethereum!");
  },
  loggedIn: function(success, failure) {
    let web3 = ethereumService.getWeb3();
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        failure({ ERR_CODE: "ES100", message: error });
      } else if (!accounts || accounts.length === 0) {
        failure({
          ERR_CODE: "ES101",
          message: "No accounts - not logged in to wallet"
        });
      } else {
        web3.eth.defaultAccount = accounts[0];
        success({ accounts: accounts });
      }
    });
  },
  registerOnChain: function(regData, success, failure) {
    let web3 = ethereumService.getWeb3();
    web3.eth.getAccounts(function(error, result) {
      if (error || !result || (result.length === 0)) {
        failure({
          failed: true,
          message:
            "Please check you are logged in to meta mask - then try again?"
        });
      } else {
        web3.eth.defaultAccount = result[0];
        ethereumService.myContract.addItem(
          regData.title,
          regData.timestamp,
          regData.uploader,
          function(err, txId) {
            if (err) {
              failure({ failed: true, message: err });
            } else {
              success({ txId: txId });
            }
          }
        );
      }
    });
  }
};
export default ethereumService;
