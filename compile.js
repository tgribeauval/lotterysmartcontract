const path = require('path'); //help us build a path from compile.js to inbox.sol, guarrenteed to have cross platform compatibility (Winbows/Unix). 
const fs = require('fs'); //filesystem module
const solc = require('solc'); //solidity compiler

const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol'); //generates a path that points directly to Inbox.sol file
const source = fs.readFileSync(lotteryPath, 'utf8'); // to read the contents of our file

module.exports = solc.compile(source, 1).contracts[':Lottery']; //to compile our inbox.sol file
