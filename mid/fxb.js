// https://api.blinktrade.com/api/v1/BRL/orderbook

var q = require('q');
var moment = require('moment');
var keys = require('../keys');
var twoFactor = require('node-2fa');
var WebSocket = require('ws');
var waitUntil = require('wait-until');

let ENDPOINT_TRADE_API = 'wss://apifoxbitprodlb.alphapoint.com/WSGateway/';
let ws = new WebSocket(ENDPOINT_TRADE_API);

let listeners = {};
let SessionToken = '';

let instrumentDictTo = ['none', 'BTCBRL'];
let instrumentDictFrom = {
    BTCBRL: 1   
};


module.exports = {

    waitTillLogged : function () {
        return new Promise ( (resolve,reject) => {
            waitUntil(100,100, function condition() {
                return (SessionToken != '');
            }, function done() {
                resolve();
            });
        });
    },

    setOrderbookListener : function (pairs,callback) {
        setInterval(function(){
            var promises = [];
            // console.log(pairs.BTCUSD.alias);
            Object.keys(pairs).forEach(function(pair){
                promises.push(module.exports.getOrderbook(pair));
            });
            q.all(promises)
            .then(function(res){
                callback(res);
            });
        },10000);
    },

    setBalanceListener : function (pairs,callback) {
        setInterval(function(){
            module.exports.getBalance().then( res => {
                callback(res);
            }).catch( err => {
                console.error('ERROR MBTC '+ error);
            })
        },10000);
    },

    setTradesListener : function (pairs,callback) {
        setInterval(function(){
            var promises = [];
            Object.keys(pairs).forEach(function(pair){
                promises.push(module.exports.getTrades(pair));
            })
            q.all(promises)
            .then(function(res){
                res.forEach( r => {
                    callback(r);
                })
            })
            .catch(function(err){
                console.log(err);
            })
        },9000);
    },

    clearOrders : function (pair) {
        return new Promise ( (resolve,reject) => {

            privateRequest('CancelAllOrders',{
                OMSId: keys.fxb.OMSId,                      // Got using GetUserInfo
                AccountID: keys.fxb.accountID,              // Gor using GetUserInfo
                InstrumentId: instrumentDictFrom[pair]      
            }, (res) => {

                try{
                    res = JSON.parse(res);
                    if (res.result){
                        console.log('FXB ORDERS CLEARED!')
                        resolve('FXB ORDERS CLEARED');
                    } else reject('ERROR clearing FXB orders!');
                } catch (err){
                    reject(err);
                }
            });

        });
    },

    getAccountInfo : function (){
        return new Promise ( (resolve,reject) => {
            privateRequest('GetUserInfo',{
                OMSId: keys.fxb.OMSId,              // Got using GetUserInfo
            }, (res)=>{

                console.log(res);
            });
        });
    },

    getOrderbook : function (pair) {

        return new Promise ( (resolve,reject) => {
            privateRequest('SubscribeLevel2',{
                OMSId: keys.fxb.OMSId,              // Got using GetUserInfo
                InstrumentId: instrumentDictFrom[pair],
                Depth: 100
            }, (res)=>{

                res = JSON.parse(res);
                let orderbook = {buy:[],sell:[]};

                res.forEach( order => {
                    orderbook[order[9] == 0 ? 'buy' : 'sell'].push({
                        price: order[6],
                        amount: order[8]
                    });
                })

                resolve(orderbook);
            });
            privateRequest('UnsubscribeLevel2',{
                OMSId: keys.fxb.OMSId,              // Got using GetUserInfo
                InstrumentId: instrumentDictFrom[pair],
                Depth: 100
            }, undefined);
        });
    },

    getBalance : function () {

        return new Promise ( (resolve,reject) => {
        
            privateRequest('GetAccountPositions',{
                OMSId: keys.fxb.OMSId,              // Got using GetUserInfo
                AccountID: keys.fxb.accountID       // Gor using GetUserInfo
            }, (res)=>{

                res = JSON.parse(res);

                let balance = {}
                res.forEach( curr => {
                    balance[curr.ProductSymbol] = curr.Amount;
                });

                resolve(balance);
            });
            
        });

    },

    getOpenOrders : function (pair) {
        return new Promise ( (resolve,reject) => {

            privateRequest('GetOpenOrders',{
                OMSId: keys.fxb.OMSId,              // Got using GetUserInfo
                AccountID: keys.fxb.accountID       // Gor using GetUserInfo
            }, (res) => {
                console.log(res);

                try{
                    res = JSON.parse(res).map( trade => {

                        resultOrder = {
                            id: trade.OrderId,
                            side: trade.Side.toLowerCase(),
                            pair: instrumentDictTo[trade.Instrument],
                            price: trade.Price,
                            amount: trade.Quantity,
                            timestamp: moment(trade.ReceiveTime, 'x')
                        }
                        resultOrder.from = resultOrder.pair.substring(0,3);
                        resultOrder.to = resultOrder.pair.substring(3,6);

                        return resultOrder;

                    });
                    resolve(res);
                } catch (err){
                    reject(err);
                }
            });

        });
    },

    getTrades : function () {
        
        return new Promise ( (resolve,reject) => {
            privateRequest('GetAccountTrades',{
                OMSId: keys.fxb.OMSId,              // Got using GetUserInfo
                AccountID: keys.fxb.accountID       // Gor using GetUserInfo
            }, (res) => {
                // console.log(res);
                try{
                    res = JSON.parse(res).map( trade => {

                        resultOrder = {
                            id: trade.TradeId,
                            side: trade.Side.toLowerCase(),
                            pair: instrumentDictTo[trade.InstrumentId],
                            price: trade.Price,
                            amount: trade.Quantity,
                            fee: trade.Quantity*(trade.Fee*0.01),
                            timestamp: moment(trade.TradeTimeMS, 'x')
                        }
                        resultOrder.from = resultOrder.pair.substring(0,3);
                        resultOrder.to = resultOrder.pair.substring(3,6);

                        return resultOrder;

                    });
                    resolve(res);
                } catch (err){
                    reject(err);
                }
            });
        });
    },

    sendOrder : function (pair, side, price, volume) {

        return new Promise ( (resolve,reject) => {
            privateRequest('SendOrder',{
                OMSId: keys.fxb.OMSId,              // Got using GetUserInfo
                AccountID: keys.fxb.accountID,      // Gor using GetUserInfo
                ClientOrderId: 0,
                Quantity: volume,
                DisplayQuantity: 0,
                UseDisplayQuantity: false,
                LimitPrice: price,
                OrderIdOCO: 0,
                OrderType: 2,
                PegPriceType: 1,
                InstrumentId: instrumentDictFrom[pair],
                TrailingAmount: 1.0,
                LimitOffset: 2.0,
                Side: side == 'buy' ? 0 : 1,
                StopPrice: price,
                TimeInForce: 1,
            }, (res) => {
                
                try {
                    res = JSON.parse(res)
                    
                    if (res.status == 'Accepted'){
			console.log('ORDER CREATED FXB: '+ res.OrderId); 
			resolve('FXB Order created => ' + res.OrderId);
                    } else reject(res.errormsg)
                } catch (err){
                    reject ('Error placing order: '+ err)
                }
            });
        });

    },

    cancelOrder : function (pair, id) {

        return new Promise ( (resolve,reject) => {
            privateRequest('cancelOrder',{
                OMSId: keys.fxb.OMSId,              // Got using GetUserInfo
                AccountID: keys.fxb.accountID,      // Gor using GetUserInfo
                OrderId: id
            }, (res) => {
                
                try{
                    res = JSON.parse(res)
                    
                    if (res.result) resolve('FXB Order cancelled => ' + id)
                    else reject(res.errormsg)
                } catch (err){
                    reject ('Error Cancelling order: '+ err)
                }
            });
        });

    },

}

function setListener(request, callback){
    //console.log('SET LISTENER => '+ request);
    listeners[request] = callback;
}

function triggerListener(data){
    data = JSON.parse(data);
    //console.log('TRIGGERED LISTENER => '+ JSON.stringify(data.o));
    if (listeners[data.n]){
        listeners[data.n](data.o);
        listeners[data.n] = undefined;
    }
}

function privateRequest(method, params, callback) {

    var frame = {
        m: 0,
        i: Math.round(new Date().getTime()),
        n: method,
        o: JSON.stringify(params)
    };

    //console.log(params);
    setListener(method, callback);

    ws.send(JSON.stringify(frame));

}

ws.on('message', triggerListener);

ws.on('open', function open() {

    console.log('logging...'); 
    let params = {
        "UserName": keys.fxb.username,
        "Password": keys.fxb.password
    }

    privateRequest('WebAuthenticateUser',params, (res) =>{
        console.log(res);
        let params = {
            "Code": twoFactor.generateToken(keys.fxb.secret).token
        }
        privateRequest('Authenticate2FA',params, (res) =>{
            res = JSON.parse(res);
            console.log(res.SessionToken);
            SessionToken = res.SessionToken;
        });
        console.log(params);
    })

});
