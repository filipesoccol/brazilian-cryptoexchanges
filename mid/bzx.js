var q = require('q');
var crypto  = require('crypto');
var keys = require('../keys');
var moment = require('moment');
var request = require('request');
var nonce = require('nonce')();
var qs = require('querystring');

let ENDPOINT_API       = 'https://braziliex.com/api/v1/public/';
let ENDPOINT_TRADE_API = 'https://braziliex.com/api/v1/private';

// Credentials
let key = keys.bzx.key;
let secret = keys.bzx.secret;

let pairsDict = {
    BTCBRL: 'btc_brl',
    LTCBRL: 'ltc_brl',
    ETHBRL: 'eth_brl'
}

// DOCS:
// https://braziliex.com/exchange/api.php

module.exports = {

    setOrderbookListener : function (pairs,callback) {
        setInterval(function(){
            var promises = [];
        
            Object.keys(pairs).forEach(function(pair){
                promises.push(module.exports.getOrderbook(pairs[pair].name));
            });
            q.all(promises)
            .then(function(res){
                callback(res);
            });
        },5000);
    },

    setBalanceListener : function (pairs,callback) {
        setInterval(function(){
            module.exports.getBalance().then( res => {
                callback(res);
            }).catch( err => {
                console.error('ERROR MBTC '+ err);
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
            module.exports.getOpenOrders(pair).then( (orders) => {
                //console.log(JSON.stringify(orders));

                let cancels = [];
            
                orders.buy.forEach(order => {
                    // CANCELLING BUY ORDERS 
                    cancels.push(module.exports.cancelOrder.bind(null,pair, order.id));
                });
                orders.sell.forEach(order => {
                    // CANCELLING SELL ORDERS 
                    cancels.push(module.exports.cancelOrder.bind(null,pair, order.id));
                });

                return cancels.reduce(q.when, q());

            }).then( (res) => {
                resolve(res);
            }).catch( err => {
                console.log('ERR = '+ JSON.stringify(err));
                reject(err);
            });
        });
    },

    getOrderbook : function (pair) {

        //console.log(pair);
        pair = pairsDict[pair];

        return new Promise ( (resolve,reject) => {
            try {
                publicRequest('orderbook/'+pair, undefined, function(data){
                    var orderbook = {buy:[],sell:[]};
                    data = JSON.parse(data);
                    orderbook.buy = data.bids;
                    orderbook.sell = data.asks;
                    resolve(orderbook);
                }, function (err){
                    reject(err);
                });
            } catch (err){
                reject(err);
            }
        });
    },

    getBalance : function (){

        return new Promise ( (resolve,reject) => {
            privateRequest('complete_balance', undefined , function(data){
                var balance = {};
                balance.BRL = parseFloat(data.brl.total);
                balance.BTC = parseFloat(data.btc.total);
                resolve(balance);
            }, function(err){
                reject(err);
            });
        });

    },

    getOpenOrders : function(pair, since){
       
       return new Promise ( (resolve,reject) => {

            var params = {
                market: pairsDict[pair]
            };

            if (since !== undefined) params.since = since;
            
            privateRequest('open_orders', params, function(data){
                
                orders = {buy:[], sell:[]};
                
                data.order_open.map( (order) => {
                    var orderStruct = {
                        id: order.order_number,
                        side: order.type,
                        pair: pair,
                        price: order.price,
                        amount: order.amount,
                        timestamp: moment(order.date),
                        exchange: 'BZX',
                        from: pair.substring(0,3),
                        to: pair.substring(3,6)
                    }

                    orders[order.type].push(orderStruct);
                })
                
                resolve(orders);

            }, function(err){
                
                reject(err);

            });
        });
    },

    getTrades : function(pair, since){
        
        return new Promise ( (resolve,reject) => {

            var params = {
                market: pairsDict[pair]
            };

            if (since !== undefined) params.since = since;
            
            privateRequest('trade_history', params, function(data){
                
                orders = [];
                //console.log(data);

                data.trade_history.map( (order) => {
                    var orderStruct = {
                        id: order.order_number,
                        side: order.type,
                        pair: pair,
                        price: order.price,
                        amount: order.amount,
                        timestamp: moment(order.date_exec),
                        exchange: 'BZX',
                        from: pair.substring(0,3),
                        to: pair.substring(3,6)
                    }

                    orders.push(orderStruct);
                })
                
                resolve(orders);

            }, function(err){
                
                reject(err);

            });
        });
    },

    sendOrder : function(pair, side, price, volume){

        return new Promise ( (resolve,reject) => {
            let params = {
                market: pairsDict[pair],
                amount: volume,
                price: price
            };

            privateRequest(side, params, function(data){
                console.log('ORDER CREATED BZX: '+ data.order_number);
                resolve(data.order_number);
            }, function(err){  
                reject(err);
            });
        });
    },

    cancelOrder : function(pair, id){
        return new Promise ( (resolve,reject) => {

            let params = {
                market: pairsDict[pair],
                order_number: id
            };

            privateRequest('cancel_order', params, function(data){
                console.log('ORDER REMOVED BZX: '+ data.message);
                resolve(data);
            }, function(err){  
                reject(err);
            });
        });
    }
}

function privateRequest(method, parameters, success, error) {

        setTimeout( () => {
            if (!parameters) parameters = {};
            parameters.command = method;
            parameters.nonce = nonce();

            let query = qs.stringify(parameters);
            var signature = crypto.createHmac('sha512', secret)
                            .update(query)
                            .digest('hex');

            let options = {
                method: 'POST',
                url: ENDPOINT_TRADE_API,
                form: parameters,
                headers: {
                    'Key': key,
                    'Sign': signature
                }
            }

            //console.log(options.form);

            request(options, function(err, response, body) {
                // console.log(response);
                // Empty response
                if (!err && (typeof body === 'undefined' || body === null)){  err = 'Empty response';}

                if (!isJson(body)){
                    error("Cannot parse BZX body request = " + body);
                    return;
                }
                
                body = JSON.parse(body);

                if (body.success == 0){
                    error(body.message);
                    return;
                }

                success(body); 
            });
        },getWaitTime());
}

function publicRequest(method, parameters, success, error) {

    let options = {
        method: 'GET',
        url: ENDPOINT_API+method,
    }

    //console.log(options);

    request(options, function(err, response, body) {
        if (!err && (typeof body === 'undefined' || body === null)){  err = 'Empty response';    }
        if (!err){
            try{
                success(body)
            } catch (err){
                error(err);
            }
        }else
            error(err);
    });

}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

let lastBXZ = new Date().getTime();

let getWaitTime = function(){
    let now = moment();
    let diff = moment().diff(moment(lastBXZ));
    let wait = 0;
    if (diff < 1000){
        wait = 1000-diff;
    }
    lastBXZ = now.valueOf()+wait;
    return wait;
}
