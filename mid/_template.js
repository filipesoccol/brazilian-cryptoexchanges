var q = require('q');
var request = require('request');
var keys = require('../keys');

module.exports = {

    login : function (keys) {
        // Rotines to login on the exchange (If necessary)
    },

    logout : function (){
        // Routines in case of shutdown the exchange
    },

    getBalance : function () {
        // Routines to get the current balance for all currencies
        /*
        var data = {
            USD:{ amount:100.0 },
            BTC:{ amount:10.0 },
            timestamp:'2014-07-11T03:41:25.323'
        }
        */
    },

    getOrderbook : function (pair) {
        // Fill with routines to get the full orderbook for some pair of currencies
        /*
        var data = {
            buy : [
                { amount:100.0, price:1.122}
                { amount:10.0, price:1.234}
            ],
            sell : [
                {amount:100.0, price:1.122}
                {amount:10.0, price:1.234}
            ], 
        }
        */
    },

    setBalanceListener : function (currencies) {
        // Fill with routines to get balaces from this exchange
    },

    setOrderbookListener : function (pairs,callback) {
        // Fill with routines to get orderbook from time to time for all pairs passed as parameter
        // Return this struct to callback
        /*
            var data = {
                buy : [
                    { price:000.0, amount:100.0}
                ],
                sell : [
                    { price:000.0, amount:100.0}
                ]
            }
        */
    },

    setTradesListener : function (callback) { 
        // Fill with routines to get allTrades from time to time for all currencies
        // Return array to callback
        /*
            var data = [
                    { side:0, from:'BTC', to:'USD', amount:100.0, price:1.122, timestamp:'2014-07-11T03:41:25.323' }
                    { side:0, from:'BTC', to:'USD', amount:10.0, price:1.234, timestamp:'2014-07-11T03:41:25.323' }
                    { side:1, from:'BTC', to:'USD', amount:100.0, price:1.122, timestamp:'2014-07-11T03:41:25.323' }
                    { side:1, from:'BTC', to:'USD', amount:10.0, price:1.234, timestamp:'2014-07-11T03:41:25.323' } 
            ]
        */
    },

    setDepositsListener : function(callback){
        // Fill with routines to get deposits from time to time for all currencies
        // Return array to callback
        /*
            var statuses[ 'PENDING', 'CONFIRMED'];
            var data = [
                { currency:'USD', amount:100.0, status:'CONFIRMED', timestamp:'2014-07-11T03:41:25.323' }
                { currency:'BTC', amount:10.0, status:'PENDING', timestamp:'2014-07-11T03:41:25.323' }
            ]
        */
    },

    setWithdrawalsListener : function(callback){
        // Fill with routines to get withdraws from time to time for all currencies
        // Return array to callback
        /*
            var statuses[ 'PENDING', 'CONFIRMED'];
            var data = [
                { currency:'USD', amount:100.0, status:'CONFIRMED', timestamp:'2014-07-11T03:41:25.323' }
                { currency:'BTC', amount:10.0, status:'PENDING', timestamp:'2014-07-11T03:41:25.323' }
            ]
        */
    },

    createOrder : function(order){
        // create a single order
        // return a promise with creation result
    },

    clearOrders : function(pair){
        // Cancel an array of order or if no order are sent, remove all
    },
    cancelOrder : function(order){
        // cancel a single order
    },

}