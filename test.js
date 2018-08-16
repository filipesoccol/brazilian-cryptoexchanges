var moment = require('moment');

// var q = require('q');
var mbtc = require('./mid/mbtc');
var btd = require('./mid/btd');
var bzx = require('./mid/bzx');
//var fbtc = require('./mid/fbtc');

var fxb = require('./mid/fxb');
fxb.waitTillLogged()
.then(fxb.getBalance.bind(undefined,'BTCBRL')).then( (res) => {

    console.log(JSON.stringify(res,undefined,2));
    return  new Promise((resolve, reject) => { resolve() })
// }).then(fxb.getTrades.bind(undefined, 'BTCBRL')).then( res =>{
//     console.log(JSON.stringify(res,undefined,2));
//     return  new Promise((resolve, reject) => { resolve() })
// }).then(fxb.sendOrder.bind(undefined, 'BTCBRL', 'sell', 80000, 0.01)).then( res =>{
//     console.log(JSON.stringify(res,undefined,2));
//     return  new Promise((resolve, reject) => { resolve() })
// }).then(fxb.getOpenOrders.bind(undefined, 'BTCBRL')).then( res =>{
//     console.log(JSON.stringify(res,undefined,2));
//     return  new Promise((resolve, reject) => { resolve() })
// }).then(fxb.clearOrders.bind(undefined, 'BTCBRL')).then( res =>{
//     console.log(JSON.stringify(res,undefined,2));
}).catch( err => {
    console.log(err);
})
// .then(fxb.getOrderbook.bind(undefined,'BTCBRL')).then( (res) => {

//     console.log(JSON.stringify(res,undefined,2));

// })
// b2y.getOrderbook().then( (orderbook) => {
//     console.log('ORDERBOOK BUY = '+ orderbook.buy.length);
//     console.log('ORDERBOOK SELL = '+ orderbook.sell.length);
// }).catch( (err) => {
//     console.error('ERROR GETTING ORDERBOOK FROM MBTC ' + err);
// });

// b2y.getBalance().then( (balance) => {
//     console.log("BALANCE = " + JSON.stringify(balance));
// }).catch( (err) => {
//     console.error("ERROR GETTING BALANCE " + err);
// });

// btd.sendOrder("BTCBRL","buy",24095.00,0.01).then( (order) => {
//     console.log('ORDER CREATED: '+ JSON.stringify(order));
// }).catch( (err) => {
//     console.error('ERROR CREATING ORDER ' + err);
// });

// b2y.sendOrder("BTCBRL","buy",80.00,0.01).then( (order) => {
//     console.log('ORDER CREATED: '+ JSON.stringify(order));
//     b2y.getBalance().then(function(balance){
//         console.log(JSON.stringify(balance))
//     });
//     b2y.getOpenOrders().then(function(orders){
//         console.log("ORDERS = " + JSON.stringify(orders));
//         orders.buy.forEach(order => {
//             // CANCELLING BUY ORDERS 
//             b2y.cancelOrder('BTCBRL', order.id).then( (canceled) => {
//                 console.log('CANCELED ORDER B2Y = ' + canceled);
//             }).catch( (err) => {
//                 console.error('ERROR CANCELLING ORDER ' + err);
//             });
//         });
//         orders.sell.forEach(order => {
//             // CANCELLING SELL ORDERS 
//             b2y.cancelOrder('BTCBRL', order.id).then( (canceled) => {
//                 console.log('CANCELED ORDER B2Y = ' + canceled);
//             }).catch( (err) => {
//                 console.error('ERROR CANCELLING ORDER ' + err);
//             });
//         });
//     }).catch( (err) => {
//         console.error('ERROR GETTING TRADES ' + err);
//     })
// }).catch( (err) => {
//     console.error('ERROR CREATING ORDER ' + err);
// });

// mbtc.getOrderbook('BTCBRL').then( (orderbook) => {
//     console.log('ORDERBOOK BUY = '+ orderbook.buy.length);
//     console.log('ORDERBOOK SELL = '+ orderbook.sell.length);
// }).catch( (err) => {
//     console.error('ERROR GETTING ORDERBOOK FROM MBTC ' + err);
// });

// mbtc.getBalance().then( (balance) => {
//     console.log('BALANCE MBTC = ' + JSON.stringify(balance, undefined, 2));
// }).catch( (err) => {
//     console.error('ERROR GETTING MBTC BALANCE ' + err);
// });

// // CREATING ORDER ON MERCADO BITCOIN
// mbtc.sendOrder("BTCBRL","buy",27950.01,0.01).then( (order) => {

//     // console.log('ORDER CREATED: '+ order);

//     // GETTING OPEN ORDERS 
//     mbtc.getOpenOrders('BTCBRL', undefined).then( (orders) => {
//         console.log('ORDERS MBTC = ' + JSON.stringify(orders, undefined, 2));
//         orders.buy.forEach(order => {
//             // CANCELLING BUY ORDERS 
//             mbtc.cancelOrder('BTCBRL', order.id).then( (canceled) => {
//                 console.log('CANCELED ORDER MBTC = ' + canceled);
//             }).catch( (err) => {
//                 console.error('ERROR CANCELLING ORDER ' + err);
//             });
//         });
//         orders.sell.forEach(order => {
//             // CANCELLING SELL ORDERS 
//             mbtc.cancelOrder('BTCBRL', order.id).then( (canceled) => {
//                 console.log('CANCELED ORDER MBTC = ' + canceled);
//             }).catch( (err) => {
//                 console.error('ERROR CANCELLING ORDER ' + err);
//             });
//         });
//     }).catch( (err) => {
//         console.error('ERROR GETTING ORDERS ' + err);
//     });
// });

// btd.getBalance().then( (res) => {
//     console.log(JSON.stringify(res));
// }).catch( err => {
//     console.log('ERR = '+ JSON.stringify(err));
// });

// btd.getOrderbook().then( (orderbook) => {
//     console.log('ORDERBOOK BUY = '+ orderbook.buy.length);
//     console.log('ORDERBOOK SELL = '+ orderbook.sell.length);
// }).catch( (err) => {
//     console.error('ERROR GETTING ORDERBOOK FROM MBTC ' + err);
// });

// btd.sendOrder('BTCBRL', 'sell', 80000.00, 0.01).then( (res) => {
//     console.log(JSON.stringify('ORDER CREATED: '+ res));
//     btd.getBalance().then( res => console.log(JSON.stringify(res)));
//     btd.getOpenOrders('BTCBRL', new Date()).then( (res) => {
//         console.log(JSON.stringify(res,undefined,2));
//         orders.sell.forEach(order => {
//             // CANCELLING SELL ORDERS 
//             btd.cancelOrder('BTCBRL', order.id).then( (canceled) => {
//                 console.log('CANCELED ORDER BTD = ' + JSON.stringify(canceled));
//             }).catch( (err) => {
//                 console.error('ERROR CANCELLING ORDER ' + err);
//             });
//         });
//     }).catch( err => {
//         console.log('ERR = '+ JSON.stringify(err));
//     });
// }).catch( err => {
//     console.log('ERR = '+ JSON.stringify(err));
// });
// btd.sendOrder('BTCBRL', 'sell', 80000.00, 0.001)
// btd.sendOrder('BTCBRL', 'sell', 80000.00, 0.001)
// btd.sendOrder('BTCBRL', 'sell', 80000.00, 0.001).then( (res) => {
//     console.log(JSON.stringify('ORDER CREATED: '+ res));
//     btd.clearOrders('BTCBRL').then( (res) => {
//         console.log(JSON.stringify(res));
//     }).catch( err => {
//         console.log('ERR = '+ JSON.stringify(err));
//     });
// }).catch( err => {
//     console.log('ERR = '+ JSON.stringify(err));
// });

// bzx.sendOrder('BTCBRL', 'sell', 80000.00, 0.001).then( (res) => {
//     console.log(JSON.stringify('ORDER CREATED: '+ res));

//     bzx.getBalance()
//     .then( res => console.log(JSON.stringify(res)))
//     .catch( (err) => console.log(err));
    
//     bzx.clearOrders("BTCBRL").then( (res) => {
//         console.log(JSON.stringify(res));
//     });

// }).catch( err => {
//     console.log('ERR = '+ JSON.stringify(err));
// });

// mbtc.sendOrder("BTCBRL","sell",80000,0.01).then( (order) => {
//     console.log(JSON.stringify('ORDER CREATED MBTC: '+ order));
//     mbtc.clearOrders('BTCBRL');
// });
// btd.sendOrder('BTCBRL', 'buy', 24850.00, 0.02).then( (res) => {
//     console.log(JSON.stringify('ORDER CREATED BTD: '+ res));
//     //btd.clearOrders('BTCBRL');
// });
// b2y.sendOrder('BTCBRL', 'sell', 80000.00, 0.01).then( (res) => {
//     console.log(JSON.stringify('ORDER CREATED B2Y: '+ res));
//     b2y.clearOrders('BTCBRL');
// });


// fbtc.getBalance().then( (res) => {
//     console.log('BALANCE B2Y: '+ JSON.stringify(res));
// });
// b2y.getBalance().then( (res) => {
//     console.log('BALANCE B2Y: '+ JSON.stringify(res));
// });
mbtc.getBalance().then( (res) => {
    console.log('BALANCE MBTC: '+ JSON.stringify(res));
});
btd.getBalance().then( (res) => {
    console.log('BALANCE BTD: '+ JSON.stringify(res));
}).catch( (err) => {
    console.log('ERR = '+ JSON.stringify(err));
});
bzx.getBalance().then( (res) => {
    console.log('BALANCE BZX: '+ JSON.stringify(res));
});
// console.log(moment().toISOString());
// bzx.getOrderbook('BTCBRL').then( (res) => {
//     console.log('BALANCE BZX: '+ JSON.stringify(res));
// });
// bzx.getOpenOrders('BTCBRL').then( (res) => {
//     console.log('BALANCE BZX: '+ JSON.stringify(res));
// });



// q.all([ b2y.getTrades('BTCBRL'),
//         b2y.getTrades('BTCBRL'),
//         b2y.getTrades('BTCBRL'),
//         b2y.getTrades('BTCBRL')])
// .then( res => {
//     console.log(JSON.stringify(res));
// })

// b2y.getTrades('BTCBRL').then( (res) => {
//     console.log('B2Y ====> '+JSON.stringify(res,));
// }).catch( err => {
//     console.log('ERR = '+ JSON.stringify(err));
// });
// btd.getTrades('BTCBRL').then( (res) => {
//     console.log('BTD ====> '+JSON.stringify(res,undefined,2));
// }).catch( err => {
//     console.log('ERR = '+ JSON.stringify(err));
// });
// bzx.getTrades('BTCBRL').then( (res) => {
//     console.log('BTD ====> '+JSON.stringify(res,undefined,2));
// }).catch( err => {
//     console.log('ERR = '+ JSON.stringify(err));
// });
// mbtc.getTrades('BTCBRL').then( (res) => {
//     console.log('MBTC ====> '+JSON.stringify(res,undefined,2));
// }).catch( err => {
//     console.log('ERR = '+ JSON.stringify(err));
// });

// fbtc.getOrderbook('BTCBRL').then( (res) => {
//     console.log('FBTC ====> '+JSON.stringify(res));
// }).catch( err => {
//     console.log('ERR = '+ JSON.stringify(err));
// });
// b2y.clearOrders('BTCBRL').then( (res) => {
//     console.log('B2Y ====> '+JSON.stringify(res));
// }).catch( err => {
//     console.log('ERR = '+ JSON.stringify(err));
// });
// btd.clearOrders('BTCBRL').then( (res) => {
//     console.log('BTD ====> '+JSON.stringify(res,undefined,2));
// }).catch( err => {
//     console.log('ERR = '+ JSON.stringify(err));
// });
// mbtc.clearOrders('BTCBRL').then( (res) => {
//     console.log('MBTC ====> '+JSON.stringify(res,undefined,2));
// }).catch( err => {
//     console.log('ERR = '+ JSON.stringify(err));
// });