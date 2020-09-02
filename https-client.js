/*
*    @author      Hëck Lawert
*    @github      https://github.com/hecklawert
*    @date        22/08/2020
*    @description Simple HTTPs Client
*/

'use strict';
const shim = require('fabric-shim');
const util = require('util');
const fetch = require('node-fetch');
const https = require('https');

let Chaincode = class {

  // The Init method is called when the Smart Contract 'httpsclient' is instantiated by the blockchain network
  async Init(stub) {
    console.info('=========== Instantiated HTTPs Client chaincode ===========');
    return shim.success();
  }

  // The Invoke method is called as a result of an application request to run the Smart Contract
  // 'httpsclient'. The calling application program has also specified the particular smart contract
  // function to be called, with arguments
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }  

  async connectEndpoint(stub, args) {
    console.info('============= START : connectEndpoint ===========');
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting 1');
    }    
    
    let endpoint = args[0]; //Get endpoint from argument
    let agent = new https.Agent({});
    
    fetch(endpoint, { agent, method: 'GET' })
    .then((result) => {
      console.log(`App (MID) --> result connection: ${JSON.stringify(result)}`);
      return result.json();
    })
    .then((jsonresponse) => {
      console.log(`App (MID) --> jsonresponse: ${JSON.stringify(jsonresponse)}`);
    })
    .catch((error) => {
      console.log(`App (ERROR) --> error.message: ${error.message}`);
      console.error(error.stack);
      return false;
    });  
    console.info('============= END : connectEndpoint ===========');
  }
};

shim.start(new Chaincode());
