"use strict";

// TODO: watch block number

window.onload = init;
let flag = false;

const web3 = setupWeb3();
function setupWeb3() {
    let web3;
    if (typeof web3 === 'undefined') {
        return new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    } else {
        return new Web3(web3.currentProvider);
    }
}

const contract = loadContractFromAddress("0x0bad635ec8099ceb72603fa6ef618ac2405b4a37");
function loadContractFromAddress(address) {
    const abi = [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "tokenOwner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "tokens",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "tokens",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_spender",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "name": "success",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "name": "success",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_from",
                    "type": "address"
                },
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "name": "success",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "name": "_spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "name": "remaining",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_address",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "name": "",
                    "type": "uint8"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ];    
    const contract = web3.eth.contract(abi);
    return contract.at(address);
}

const token = {
    name: contract.name(),
    symbol: contract.symbol(),
    decimals: contract.decimals(),
    totalSupply: contract.totalSupply(),

    balanceOf: function(address) {
        return contract.balanceOf(address).c[0];
    },
    transfer: function(to, amount) {
        return contract.transfer(to, amount);
    },
    transferFrom: function(from, to, amount) {
        return contract.transferFrom(from, to, amount);
    },
    approve: function(spender, amount) {
        return contract.approve(spender, amount);
    },
    allowance: function(owner, spender) {
        return contract.allowance(owner, spender);
    }
}

function init() {
    web3.eth.defaultAccount = web3.eth.accounts[0];
    loadBlockchainInfos()
    loadTokenInfos();
    loadAccountsAndBalances();
    watchContractEvents();
    watchBlockchainEvents();
    addEventListeners()
}

function loadBlockchainInfos() {
    document.getElementById("block-number").innerHTML = web3.eth.blockNumber;
    document.getElementById("number-of-peers").innerHTML = web3.net.peerCount;
    document.getElementById("gas-price").innerHTML = web3.fromWei(web3.eth.gasPrice, 'ether');
    document.getElementById("default-acc").value = web3.eth.defaultAccount;
}

function loadTokenInfos() {
    document.getElementById("token-name").innerHTML = token.name
    document.getElementById("token-symbol").innerHTML = token.symbol
    document.getElementById("token-decimals").innerHTML = token.decimals
    document.getElementById("token-supply").innerHTML = token.totalSupply
}

function loadAccountsAndBalances() {
    let accounts = web3.eth.accounts;
    let html = '';
    for (const account of accounts) {
        html += `<div class="w3-third w3-container w3-margin-bottom">
                    <div class="w3-container w3-white">
                        <p><b>${account}</b></p>
                        <p>Ether balance: <b>${web3.fromWei(web3.eth.getBalance(account))}</b></p>
                        <p style="color:red">Token balance: <b>${token.balanceOf(account)}</b></p>
                    </div>
                </div>`
    }
    document.getElementById('accounts-list').innerHTML = html;    
}

function watchContractEvents() {
    const transferEvent = contract.Transfer();
    transferEvent.watch(function(err, res) {
        console.log('transfer fired')
        if (err) {
            showModal(err);
        }
        let msg = `Token sent & transaction mined ! <br>
                    <b>Tx hash:</b> ${res.transactionHash} <br>
                    <b>Block number:</b> ${res.blockNumber}`;
        if (flag) {
            showModal(msg);
            loadAccountsAndBalances();
        } else {
            flag = true;
        }
    })

    const approvalEvent = contract.Approval();
    approvalEvent.watch(function(err, res) {
        console.log('approval fired')
        if (err) {
            showModal(err);
        }
        let msg = `Spender approved & transaction mined ! <br>
                    <b>Tx hash:</b> ${res.transactionHash} <br>
                    <b>Block number:</b> ${res.blockNumber}`;
        if (flag) {
            showModal(msg);
        } else {
            flag = true;
        }
    })
}

function watchBlockchainEvents() {
    // watch block number
}

function addEventListeners() {
    document.getElementById("change-account").addEventListener("click", function(event) {
        web3.eth.defaultAccount = document.getElementById("default-acc").value;
    })

    document.getElementById("send-token").addEventListener("submit", function(event) {
        event.preventDefault();
        sendToken();
    })

    document.getElementById("allow").addEventListener("submit", function(event) {
        event.preventDefault();
        approve();
    })
}

function sendToken()  {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const amount = parseInt(document.getElementById('amount').value);

    if (from !== 'default') {
        try { token.transferFrom(from, to, amount) }
        catch (err) { showModal(err) }

    } else {
        try { token.transfer(to, amount) }
        catch (err) { showModal(err) }
    }
}

function approve()  {
    const spender = document.getElementById('allowed-spender').value;
    const amount = parseInt(document.getElementById('allowed-amount').value);

    try { 
        token.approve(spender, amount)
    }
    catch (err) { showModal(err) }
}

function showModal(html) {
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal').style.display = 'block';
}

// web3.personal.unlockAccount(from, password, 60, (err, res) => {
//     transfer(from, to, amount);
// });
