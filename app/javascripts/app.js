// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
import $ from "jquery";


// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import todoapp_artifacts from '../../build/contracts/TodoApp.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var TodoApp = contract(todoapp_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  consoleIt: function (msg) {
    if (typeof msg === "object")
      $('#console').append(JSON.stringify(msg) + "<br/>");
    else
      $('#console').append(msg + "<br/>");
  },
  start: function () {
    var self = this;

    TodoApp.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
      App.consoleIt('default using address: ' + account);
      App.getBalance();
    });
  },
  getBalance: function () {
    var self = this;
    web3.eth.getBalance(web3.eth.accounts[0], function (error, wei) {
      if (!error) {
        var balance = web3.fromWei(wei, 'ether');
        self.consoleIt("account balance" + balance);
      } else {
        console.log(error)
      }
    })
  },
  addTodo: function () {
    var self = this;
    let task = prompt('Enter Todo Text', "");
    TodoApp.deployed().then((todoContract) => {
      return todoContract.addTodo(task, { from: account })
    }).then((obj) => {
      self.consoleIt('transaction done with id ' + obj.tx);
    }).catch((err) => {
      console.log(err)
    })
  },

  getTodos: function () {
    var self = this;
    TodoApp.deployed().then((todoContract) => {
      return todoContract.getTodos({ from: account })
    }).then((obj) => {
      //this is a constant function, so there is not transaction no. 
      //this will directly return the results.
      self.consoleIt('Fetching Todos');
      for (let i = 0; i < obj.length; i++) {
        //in solidity we have to create array of fixed length.
        //in our contract it was 80. 
        //since we only have 1 todo, other todo's will have value zero.
        //need to remove other todo values
        if (web3.toBigNumber(obj[i]).toNumber() !== 0) {
          self.consoleIt("Todo:::: [" + i + "]" + web3.toAscii(obj[i]));
        }
      }
    }).catch((err) => {
      console.log(err)
    })
  },

  completeTodo: function () {
    var self = this;
    let todoIndex = prompt('Input the index of todo which you want to complete', 0);
    TodoApp.deployed().then((todoContract) => {
      return todoContract.completeTodo(todoIndex, { from: account })
    }).then((obj) => {
      self.consoleIt('transaction done with id ' + obj.tx);
    }).catch((err) => {
      console.log(err)
    })
  },

  getTodoDetail: function () {
    var self = this;
    let todoIndex = prompt('Input the index of todo which you want to complete', 0);
    TodoApp.deployed().then((todoContract) => {
      return todoContract.getTodo(todoIndex)
    }).then((obj) => {
      self.consoleIt('Todo Details For index' + todoIndex);
      let task = web3.toAscii(obj[0]);
      let owner = obj[1];
      let isComplete = obj[2];
      let completed_by = obj[3];
      let complete_at = web3.toBigNumber(obj[4]).toNumber();
      self.consoleIt("Task :" + task + " Owner: " + owner + " is Completed " + isComplete + " completed by " + completed_by + " completed at" + new Date(complete_at));
    }).catch((err) => {
      console.log(err)
    })
  }
};

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  App.start();
});
