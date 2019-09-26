//assert is a helper library
const assert = require('assert');
//Ganache is a local test network
const ganache = require('ganache-cli');
//require Web3 library
const Web3 = require('web3');
//set up instrance of Web3, provider allows us to connect to any network
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lotteray Contract', () => {
    //checking if contract is deployed
    it('deploys a contract', () => {
        //asserting that an address is returned after deployement
        assert.ok(lottery.options.address);
    });
    //checking if players can enter lottery
    it('enters the lottery', async () => {
        //specific who is entering and amount that needs to be sent
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        //to get back the list of players
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        //assert that account[x] entering in contract is equal to player[x]
        assert.equal(accounts[0], players[0]);
        //assert the length of array is equal to nb of players in contract
        assert.equal(1, players.length)
    });
    it('it allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });
    //checking if minimum amount of ether is sent
    it('requires a minimum amount of ether to enter', async () => {
        //try will run code between 72 to 75. 
        try{
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });
            assert(false);
        //if code 72-75 generates an error, line 79 will run.
        } catch (err) {
            assert(err);
        }
    });
    //checking if only the manager can call the pickWinner() function
    it('only manager can call pickWinner', async () => {
        try{
            await lottery.methods.pickWinner().send({
                //accounts[0] is the manager
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err)
        }
    });
    //checking if money is sent to win and contract reset (players array emptied)
    //we are only entering one player to the contract to simplicity
    it('sends money to winner and resets the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });
        //getBalance function gets the amount of ether accounts[0] controls
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        //call pickWinner (from: accounts[0], because he is manager)
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        //check if accounts[0] has been returned ethere
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        //check the difference between initialBalance and finalBalance = 2 ether minus gas fees
        const difference = finalBalance - initialBalance;

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        
        assert(difference > web3.utils.toWei('1.8', 'ether'));
        assert.equal(0, players.length);
    })

    
});
