const assert = require('assert'); //used for testing
const ganache = require('ganache-cli'); //ethereum test network
const Web3 = require('web3'); //Web3 library

const provider = ganache.provider();
const web3 = new Web3(provider); //instance of web3 library, to connect to network for testing purposes

const { interface, bytecode } = require('../compile');

let accounts;
let inbox;

beforeEach(async () => {
    //Get a list of all accounts
    accounts = await web3.eth.getAccounts(); //accessing the ethereum module 
        
    // Use one of those accounts to deploy the contract
    inbox = await new web3.eth.Contract(JSON.parse(interface)) //teaches web3 about what methods an Inbox contract has
        .deploy({ //tells web3 that we want to deploy a new copy of this contract
            data: bytecode, 
            arguments: ['Hello World!'] }) 
        .send({ //instructs web3 to send out a transaction that creates this contract
            from: accounts[0], 
            gas: '1000000' })
});


describe('Inbox', () => {
    it('deploys a contract', () => {
        assert.ok(inbox.options.address); //checks if an address is returned
    });

    it('has a default message', async () => {
        const message = await inbox.methods.message().call();
        assert.equal(message, 'Hello World!');
    });
    it('updates message', async () => {
        await inbox.methods.setMessage('Bye World!').send({ from: accounts[0] });
        const message = await inbox.methods.message().call();
        assert.equal(message, 'Bye World!');

    })
});









// Mocha tests examples: 
// class Car {
//     park() {
//         return 'stopped';
//     }
//     drive() {
//         return 'vroom';
//     }
// }

// let car;

// beforeEach(() => {
//      car = new Car();
// });
// describe('Car', () => {
//     it('can park', () => {      
//         assert.equal(car.park(), 'stopped');
//     });

//     it('can drive', () => {       
//         assert.equal(car.drive(), 'vroom');
//     });
// });