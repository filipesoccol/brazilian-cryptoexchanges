var q = require('q')
var crypto = require('crypto')
var keys = require('../keys')
var moment = require('moment')
var request = require('request')
var qs = require('querystring')

var ENDPOINT_API = 'https://www.mercadobitcoin.net/api/'
var ENDPOINT_TRADE_API = 'https://www.mercadobitcoin.net/tapi/v3/'

// DOCS:
// https://www.mercadobitcoin.com.br/trade-api/v2/

// Credentials
let key = keys.mbtc.id
let secret = keys.mbtc.secret

let pairsDictPublic = {
  BTCBRL: 'BTC',
  LTCBRL: 'LTC'
}
let pairsDictPrivate = {
  BTCBRL: 'BRLBTC',
  LTCBRL: 'BRLLTC'
}

module.exports = {

  setOrderbookListener: function (pairs, callback) {
    setInterval(function () {
      var promises = []
      // console.log(pairs.BTCUSD.alias);
      Object.keys(pairs).forEach(function (pair) {
        promises.push(module.exports.getOrderbook(pair))
      })
      q.all(promises)
        .then(function (res) {
          callback(res)
        })
    }, 5000)
  },

  setBalanceListener: function (pairs, callback) {
    setInterval(function () {
      module.exports.getBalance().then(res => {
        callback(res)
      }).catch(err => {
        console.error('ERROR MBTC ' + err)
      })
    }, 10000)
  },

  setTradesListener: function (pairs, callback) {
    setInterval(function () {
      var promises = []
      Object.keys(pairs).forEach(function (pair) {
        promises.push(module.exports.getTrades(pair))
      })
      q.all(promises)
        .then(function (res) {
          res.forEach(r => {
            callback(r)
          })
        })
        .catch(function (err) {
          console.log(err)
        })
    }, 9000)
  },

  clearOrders: function (pair) {
    return new Promise((resolve, reject) => {
      module.exports.getOpenOrders(pair).then((orders) => {
        // console.log(JSON.stringify(orders));

        let cancels = []

        orders.buy.forEach(order => {
          // CANCELLING BUY ORDERS
          cancels.push(module.exports.cancelOrder.bind(null, pair, order.id))
        })
        orders.sell.forEach(order => {
          // CANCELLING SELL ORDERS
          cancels.push(module.exports.cancelOrder.bind(null, pair, order.id))
        })

        return cancels.reduce(q.when, q())
      }).then((res) => {
        resolve(res)
      }).catch(err => {
        console.log('ERR = ' + JSON.stringify(err))
        reject(err)
      })
    })
  },

  getOrderbook: function (pair) {
    return new Promise((resolve, reject) => {
      try {
        publicRequest('orderbook', pairsDictPublic[pair], function (data) {
          var orderbook = {}
          orderbook.buy = data.bids.map(function (bid) {
            var b = { price: bid[0], amount: bid[1] }
            return b
          })
          orderbook.sell = data.asks.map(function (ask) {
            var a = { price: ask[0], amount: ask[1] }
            return a
          })
          resolve(orderbook)
        }, function (err) {
          reject(new Error('ERR = ' + JSON.stringify(err)))
        })
      } catch (err) {
        reject(err)
      }
    })
  },

  getBalance: function () {
    return new Promise((resolve, reject) => {
      privateRequest('get_account_info', null, function (data) {
        var balance = {}
        balance.BRL = parseFloat(data.response_data.balance.brl.total)
        balance.BTC = parseFloat(data.response_data.balance.btc.total)
        resolve(balance)
      }, function (err) {
        reject(err)
      })
    })
  },

  getOpenOrders: function (pair) {
    return new Promise((resolve, reject) => {
      var params = {
        coin_pair: pairsDictPrivate[pair],
        status_list: '[2]'
      }

      privateRequest('list_orders', params, function (data) {
        let orders = { buy: [], sell: [] }

        data.response_data.orders.forEach((order) => {
          var orderStruct = {
            id: order.order_id,
            side: order.order_type === 1 ? 'buy' : 'sell',
            pair: pair,
            price: order.limit_price,
            amount: order.quantity,
            from: order.coin_pair.substring(3, 6),
            to: order.coin_pair.substring(0, 3)
          }
          orders[orderStruct.side].push(orderStruct)
        })

        resolve(orders)
      }, function (err) {
        reject(err)
      })
    })
  },

  getTrades: function (pair, since) {
    return new Promise((resolve, reject) => {
      var params = {
        coin_pair: pairsDictPrivate[pair],
        has_fills: true,
        from_timestamp: moment().subtract(2, 'days').format('X')
      }

      if (since !== undefined) params.since = since

      privateRequest('list_orders', params, function (data) {
        let orders = []
        data.response_data.orders.forEach((order) => {
          order.operations.forEach((trade) => {
            var orderStruct = {
              id: order.order_id,
              side: order.order_type === 1 ? 'buy' : 'sell',
              pair: pair,
              price: trade.price,
              amount: trade.quantity,
              fee: trade.quantity * (trade.fee_rate * 0.01),
              timestamp: moment(trade.executed_timestamp, 'X'),
              from: order.coin_pair.substring(3, 6),
              to: order.coin_pair.substring(0, 3)
            }
            orderStruct.amount -= orderStruct.fee
            orders.push(orderStruct)
          })
        })
        // console.log(orders, undefined, 2);
        resolve(orders)
      }, function (err) {
        reject(err)
      })
    })
  },

  sendOrder: function (pair, side, price, volume) {
    return new Promise((resolve, reject) => {
      let method = side === 'buy' ? 'place_buy_order' : 'place_sell_order'

      var params = {
        coin_pair: pairsDictPrivate[pair],
        quantity: volume,
        limit_price: price.toFixed(6)
      }

      privateRequest(method, params, function (data) {
        console.log('ORDER CREATED MBTC: ' + data.response_data.order.order_id)
        resolve(data.response_data.order.order_id)
      }, function (err) {
        reject(err)
      })
    })
  },

  cancelOrder: function (pair, id) {
    return new Promise((resolve, reject) => {
      var params = {
        coin_pair: pairsDictPrivate[pair],
        order_id: id
      }

      privateRequest('cancel_order', params, function (data) {
        console.log('ORDER REMOVED MBTC: ' + data.response_data.order.order_id)
        resolve(data.response_data.order.order_id)
      }, function (err) {
        reject(err)
      })
    })
  }
}

function privateRequest (method, parameters, success, error) {
  setTimeout(() => {
    var now = Math.round(new Date().getTime())
    let params = {
      tapi_method: method,
      tapi_nonce: now
    }
    params = Object.assign(params, parameters)

    let query = '?' + qs.stringify(params)
    var signature = crypto.createHmac('sha512', secret)
      .update('/tapi/v3/' + query)
      .digest('hex')

    let options = {
      method: 'POST',
      url: ENDPOINT_TRADE_API + query,
      form: params,
      headers: {
        'TAPI-ID': key,
        'TAPI-MAC': signature
      }
    }

    // console.log(options.form);

    request(options, function (err, response, body) {
      if (err) throw err
      try {
        body = JSON.parse(body)

        if (body.status_code !== 100) {
          error(body.error_message)
          return
        }

        success(body)
      } catch (err) {
        error(err)
      }
    })
  }, getWaitTime())
}

function publicRequest (method, pair, success, error) {
  let options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    url: ENDPOINT_API + pair + '/' + method + '/'
  }

  request(options, function (err, response, body) {
    try {
      body = JSON.parse(body)
      success(body)
    } catch (err) {
      error(body)
    }
  })
}

let lastMBTC = new Date().getTime()

let getWaitTime = function () {
  let now = moment()
  let diff = moment().diff(moment(lastMBTC))
  let wait = 0
  if (diff < 1000) {
    wait = 1000 - diff
  }
  lastMBTC = now.valueOf() + wait
  return wait
}
