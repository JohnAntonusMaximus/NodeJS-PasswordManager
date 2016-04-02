console.log('Starting password manager...');

var storage = require('node-persist');
storage.initSync();

var argv = require('yargs')
		.command('create','Creates an account', function(yargs){
			yargs.options({
				name: {							// Name or Type of Account
					demand: true,
					description: 'Name of account (Facebook, Twitter, bank, etc.)',
					alias: 'n',
					type: 'string'
				},
				username: {						// Username for account
					demand: true,
					description: 'Username for account',
					alias: 'u',
					type: 'string'
				},
				password: {						// Password for account
					demand: true,	
					description: 'Password for account',
					alias: 'p',
					type: 'string'
				},
				mpassword: {					//Master Password
					demand: true,
					description: 'Master password',
					alias: 'm',
					type: 'string'
				}
			}).help('help');
		})
		.command('get','Gets account', function(yargs){
			yargs.options({
				name: {
					demand: true,
					description: 'Name of the account to get',
					alias: 'n',
					type: 'string'
				},
				mpassword: {					//Master Password
					demand: true,
					description: 'Master password',
					alias: 'm',
					type: 'string'
				}
			}).help('help');
		})
		.help('help')
		.argv;
	
var command = argv._[0];

var crypto = require('crypto-js');

function getAccounts(mpassword){
	var encryptedAccount = storage.getItemSync('accounts');  //Use getItemSync to fetch accounts
	var accounts = [];
	
	if(typeof encryptedAccount !== 'undefined'){
		var bytes = crypto.AES.decrypt(encryptedAccount, mpassword);//decrypt
		accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));
	}
	
	return accounts; //return accounts array
}

function saveAccounts(accounts, mpassword){
	var stringObject = JSON.stringify(accounts);
	var encryptedAccount = crypto.AES.encrypt(stringObject,mpassword);//Encrypt accounts
	storage.setItemSync('accounts',encryptedAccount.toString());  //setItemSync
	return accounts;//return accounts array
}

function createAccount(account, mpassword){
	var accounts = getAccounts(mpassword);
	accounts.push(account);
	saveAccounts(accounts, mpassword);
	return account;
}

function getAccount(accountName, mpassword){
	var accounts = getAccounts(mpassword);
	var matchedAccount;
	
	accounts.forEach(function(account){
		if(account.name === accountName){
			matchedAccount = account;
		}
	});
		return matchedAccount;
}


if(command === 'create'){
	try{var createdAccount = createAccount({
		name: argv.name,
		username: argv.username,
		password: argv.password,
		}, argv.mpassword);
		console.log('Account Created!');
	console.log(createdAccount);}
	catch(e){console.log('Error: Unable to create account...');}
} else if(command === 'get'){
	try{var retrieved = getAccount(argv.name, argv.mpassword);
		if(typeof retrieved === 'undefined'){
			console.log('Account not found!');
		} else {
			console.log('Account found!');
			console.log(retrieved);
	}} catch(e){
		console.log('Error: Unable to get account...');
	}
	
}



