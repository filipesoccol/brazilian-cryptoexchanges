var q = require('q')
// var keys = require('../keys')
var moment = require('moment')
var unirest = require('unirest')
var qs = require('querystring')

let ENDPOINT_API = 'https://api.bitcointrade.com.br/v2/public'
let ENDPOINT_TRADE_API = 'https://api.bitcointrade.com.br/v2'

let pairsDict = {
  BTCBRL: 'BRLBTC',
  LTCBRL: 'LTC',
  ETHBRL: 'ETH'
}

let token = ''

function BTD (config) {
  this.config = config
  token = config.btd
}

BTD.prototype.setOrderbookListener = function (pairs, callback) {
  setInterval(function () {
    var promises = []
    // console.log(pairs.BTCUSD.alias);
    Object.keys(pairs).forEach(function (pair) {
      promises.push(this.getOrderbook(pairs[pair].alias))
    })
    q.all(promises)
      .then(function (res) {
        callback(res)
      })
  }, 5000)
}

BTD.prototype.setBalanceListener = function (pairs, callback) {
  setInterval(function () {
    this.getBalance().then(res => {
      callback(res)
    }).catch(err => {
      console.error('ERROR BTD ' + err)
    })
  }, 10000)
}

BTD.prototype.setTradesListener = function (pairs, callback) {
  setInterval(function () {
    var promises = []
    Object.keys(pairs).forEach(function (pair) {
      promises.push(this.getTrades(pair))
    })
    q.all(promises)
      .then(function (res) {
        res.forEach(r => {
          // console.log(JSON.stringify(res, undefined, 2));
          callback(r)
        })
      })
      .catch(function (err) {
        console.log(err)
      })
  }, 9000)
}

BTD.prototype.clearOrders = function (pair) {
  return new Promise((resolve, reject) => {
    this.getOpenOrders(pair).then((orders) => {
      // console.log(JSON.stringify(orders));

      let cancels = []

      orders.buy.forEach(order => {
        // CANCELLING BUY ORDERS
        cancels.push(this.cancelOrder.bind(null, pair, order.id))
      })
      orders.sell.forEach(order => {
        // CANCELLING SELL ORDERS
        cancels.push(this.cancelOrder.bind(null, pair, order.id))
      })

      return cancels.reduce(q.when, q())
    }).then((res) => {
      resolve(res)
    }).catch(err => {
      console.log('ERR = ' + JSON.stringify(err))
      reject(err)
    })
  })
}

BTD.prototype.getOrderbook = function (pair) {
  return new Promise((resolve, reject) => {
    if (pair === undefined) pair = pairsDict.BTCBRL
    publicRequest(`/${pair}/orders`, undefined, function (result) {
      try {
        if (!result.data) {
          reject(new Error('ERROR GETTING TRADES BTD' + JSON.stringify(result)))
          return
        }

        var orderbook = {}
        orderbook.buy = result.data.bids
        orderbook.sell = result.data.asks
        orderbook.buy = orderbook.buy.map(function (order) {
          order.price = order.unit_price
          // order.amount = order.amount
          delete order.unit_price
          delete order.code
          delete order.stop_limit_price
          return order
        })
        orderbook.sell = orderbook.sell.map(function (order) {
          order.price = order.unit_price
          // order.amount = order.amount
          delete order.unit_price
          delete order.code
          delete order.stop_limit_price
          return order
        })
      } catch (err) {
        console.log(err)
        reject(err)
        return
      }
      resolve(orderbook)
    }, function (err) {
      console.log('REJECT')
      reject(err)
    })
  })
}

BTD.prototype.getBalance = function (pair) {
  return new Promise((resolve, reject) => {
    privateGetRequest('/wallets/balance', undefined, function (result) {
      var balance = {}

      result.data.forEach(currency => {
        balance[currency.currency_code] = parseFloat((currency.available_amount + currency.locked_amount).toPrecision(8))
      })

      resolve(balance)
    }, function (err) {
      reject(err)
    })
  })
}

BTD.prototype.getOpenOrders = function (pair) {
  // https://api.bitcointrade.com.br/v1/market/user_orders/list?status=executed_completely&start_date=2017-01-01&end_date=2018-01-01&currency=BTC&type=buy&page_size=100&current_page=1

  return new Promise((resolve, reject) => {
    if (pair === undefined) pair = pairsDict.BTCBRL
    var params = {
      pair: pair,
      start_date: moment().subtract(1, 'days').format('YYYY-MM-DD')
      // type: 'buy',
      // status: 'executed_completely'
    }

    privateGetRequest('/market/user_orders/list', params, function (result) {
      let orders = { buy: [], sell: [] }

      result.data.orders.filter(function (order) {
        return order.status !== 'canceled' && order.status !== 'executed_completely'
      }).forEach((order) => {
        var orderStruct = {
          id: order.id,
          side: order.type,
          pair: pair,
          price: order.unit_price,
          amount: order.remaining_amount,
          timestamp: moment(order.create_date),
          exchange: 'BTD',
          from: 'BTC',
          to: 'BRL'
        }
        console.log(order.status)
        orders[order.type].push(orderStruct)
      })
      resolve(orders)
    }, function (err) {
      reject(err)
    })
  })
}

BTD.prototype.getTrades = function (pair, since) {
  // https://api.bitcointrade.com.br/v1/market/user_orders/list?status=executed_completely&start_date=2017-01-01&end_date=2018-01-01&currency=BTC&type=buy&page_size=100&current_page=1
  // curl --location --request GET "https://api.bitcointrade.com.br/v2/market/user_orders/list?status=executed_completely&start_date=2017-01-01&end_date=2018-01-01&pair=BRLBTC&type=buy&page_size=100&current_page=1" \
  // --header "Content-Type: application/json" \
  // --header "Authorization: ApiToken U2Ft8tNnGwE7t3vvAc4ZxmUsdVkX18x+VrnwAYM249=" \
  // --data ""

  return new Promise((resolve, reject) => {
    if (pair === undefined) pair = pairsDict.BTCBRL
    var params = {
      pair: pair,
      page_size: 300,
      start_date: moment().subtract(12, 'hours').format('YYYY-MM-DD')
      // end_date: moment().format('YYYY-MM-DD'),
    }

    privateGetRequest('/market/user_orders/list', params, function (result) {
      let orders = []

      if (!result.data) {
        reject(new Error('ERROR GETTING TRADES BTD' + JSON.stringify(result)))
        return
      }

      result.data.orders.filter(function (order) {
        return order.executed_amount > 0.0
      }).forEach((order) => {
        var orderStruct = {
          // id: order.id,
          side: order.type,
          pair: pair,
          price: order.unit_price,
          fee: order.executed_amount * 0.0035,
          amount: order.executed_amount,
          timestamp: moment(order.create_date),
          from: pair.substring(0, 3),
          to: pair.substring(3, 6)
        }
        orderStruct.amount -= orderStruct.fee
        orders.push(orderStruct)
      })
      resolve(orders)
    }, function (err) {
      reject(err)
    })
  })
}

BTD.prototype.sendOrder = function (pair, side, price, volume) {
  return new Promise((resolve, reject) => {
    if (pair === undefined) pair = pairsDict.BTCBRL
    var params = {
      pair: pair,
      type: side,
      subtype: 'limited',
      unit_price: price.toPrecision(6),
      amount: volume.toPrecision(6)
    }

    privatePostRequest('/market/create_order', params, function (result) {
      console.log('ORDER CREATED BTD: ' + result.data.id)
      resolve(result.data.id)
    }, function (err) {
      console.log('ERROR PLACING ON BTD ' + err)
      reject(err)
    })
  })
}

BTD.prototype.cancelOrder = function (pair, id) {
  return new Promise((resolve, reject) => {
    var params = {
      id: id
    }

    privateDeleteRequest('/market/user_orders/', params, function (result) {
      console.log('ORDER REMOVED BTD: ' + id)
      resolve(id)
    }, function (err) {
      reject(err)
    })
  })
}

function privateGetRequest (method, parameters, success, error) {
  setTimeout(() => {
    if (parameters) {
      parameters = '?' + qs.stringify(parameters)
      method += parameters
    }
    unirest.get(ENDPOINT_TRADE_API + method)
      .headers({ 'Content-Type': 'application/json' })
      .headers({ 'Authorization': token })
      .end(function (response) {
        if (typeof response.body !== 'object') { error('BTD Error on request ===> ' + method + ' >>> ' + JSON.stringify(response)) }

        if (response.body.message) {
          console.error('BTD ' + method + ' ERROR: ' + response.error)
          error(response.body.message)
        } else { success(response.body) }
      })
  }, getWaitTime())
}

function privatePostRequest (method, parameters, success, error) {
  setTimeout(() => {
    unirest.post(ENDPOINT_TRADE_API + method)
      .headers({ 'Content-Type': 'application/json' })
      .headers({ 'Authorization': token })
      .form(parameters)
      .end(function (response) {
        if (typeof response.body !== 'object') { error('BTD Error on request ===> ' + method + ' >>> ' + JSON.stringify(response)) }

        // console.log(response);
        if (response.body.message) { error(response.body.message) } else { success(response.body) }
      })
  }, getWaitTime())
}

function privateDeleteRequest (method, parameters, success, error) {
  setTimeout(() => {
    unirest.delete(ENDPOINT_TRADE_API + method)
      .headers({ 'Content-Type': 'application/json' })
      .headers({ 'Authorization': token })
      .form(parameters)
      .end(function (response) {
        // console.log(response);

        if (typeof response.body !== 'object') { error('BTD Error on request ===> ' + method + ' >>> ' + JSON.stringify(response)) }

        if (response.body.message) { error(response.body.message) } else { success(response.body) }
      })
  }, getWaitTime())
}

function publicRequest (method, parameters, success, error) {
  unirest.get(ENDPOINT_API + method)
    .headers('Content-Type', 'application/json')
    .send(qs.stringify(parameters))
    .end(function (response) {
      if (typeof response.body !== 'object') { error('BTD Error on request ===> ' + method + ' >>> ' + JSON.stringify(response)) }

      success(response.body)
    })
}

let lastBTD = new Date().getTime()

let getWaitTime = function () {
  let now = moment()
  let diff = moment().diff(moment(lastBTD))
  let wait = 0
  if (diff < 1000) {
    wait = 1000 - diff
  }
  lastBTD = now.valueOf() + wait
  return wait
}

module.exports = BTD
