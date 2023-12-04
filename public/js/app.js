App = {

    loading: false,
    contracts: {},
    account: "",

    load: async () => {
        console.log('App connecting...')
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContracts()
        return false;
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                // Request account access if needed
                await ethereum.enable()
                // Acccounts now exposed
                web3.eth.sendTransaction({/* ... */ })
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({/* ... */ })
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async () => {
        // get current account
        web3.eth.getAccounts()
            .then(accounts => {
                App.account = accounts[0]
                console.log(App.account)
            })
            .catch(error => {
                console.error(error)
            })
    },

    loadContracts: async () => {
        // users ABI
        const UserContract = await $.getJSON('/contracts/UserAuth.json')
        const contractAddress = '0x73a1637b532c203fD2Cb2f30DaC2A5C920D08E36';
        App.contracts.user = new web3.eth.Contract(UserContract.abi, contractAddress);
     

    },

    connectWalletRegister: async () => {
        await App.load()
        data = {}

        data['name'] = document.getElementById('register_name').value
        data['role'] = document.getElementById('register_role').value
        data['authority'] = document.getElementById('register_authority').value
        data['wallet_id'] = App.account

        await App.contracts.user.methods.setUser(data['wallet_id'], data['name'], data['role'], data['authority']).send({ from: App.account });
        let r = await fetch('/auth/register', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-type': 'application/json;charset=UTF-8' } })
        r = await r.json()
        if (r) {
            alert(data['name'] + ' Welcome to the GreenChain EcoSystem')
            window.location.href = `/dashboard`
        }
    },

    connectWalletLogin: async () => {
        await App.load()
        data = {}
        data['wallet_id'] = App.account
        
        var userOrNot = await App.contracts.user.methods.checkUserExists(App.account)
        
        console.log(App.contracts.user.methods.Users(App.account))
        
        if (userOrNot) {
            var dataChain = await App.contracts.user.methods.Users(App.account).call()

            data['name'] = dataChain['name']
            data['role'] = dataChain['privilege']
            let r = await fetch('/auth/login', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-type': 'application/json; charset=UTF-8' } })
            r = await r.json();
            if (r) {
                window.location.href = `/dashboard`
            }
        } else {
            alert('need to register')
        }
    }
}