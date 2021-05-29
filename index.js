let apiKey = '85e12aa33653bdaa75995570f7e2ee1c';
let apiSecret = '/0/BvFyRFYtUPSD8QkGpmEb6k3ROGyxqgC2k915B';

// playAlert = require('alert-sound-notify')


const Buda = require('buda-promise');
// const axios = require('axios')

const budaClient = new Buda(apiKey, apiSecret)

const tick =  async(budaClient, markets, tickInterval) => {

    for (const config of markets) {

        const { asset, base, sellSpread, buySpread, sellAllocation, buyAllocation, canBuy, canSell } = config;
        const market = `${asset}-${base}`;

        console.log(
            `\t ${ new Date().toLocaleString() } \n`,
            `\t Market: [${market.toUpperCase()}] \n`
        )
    
        // Cancel orders
        const orders = await budaClient.order_pages(market)
            .then( res =>  {
                // console.log(res.orders)
                return res.orders
            })
            .catch(e => {
                console.log(e.message)
            });
    
        // Get tick
        const tick = await budaClient.ticker(market)
            .then(result =>{
                return result.ticker
            })
            .catch(e => {
                console.log(e.message)
            });
    
        // Get balances
        const balances = await budaClient.balance().then(result => {
                const filteredBalances = result.balances.filter(bal => {
                return bal.id === String(base).toUpperCase() || bal.id === String(asset).toUpperCase()
            })                
            return filteredBalances
        });
    
        for (const order of orders) {
            if (
                order.state !== 'traded' &&
                order.state !== 'canceled'
            ) {
                await budaClient.cancel_order(order.id).then( response => {
                        console.log('\t', `Orden #${response.order.id} (${order.type}) fue cancelada desde: ${order.state}`)
                    })
                    .catch(e => {
                        console.log(e.message)
                    });
            }
        }
        
        // Setting prices
        const marketPrice = (Number(tick.min_ask[0]) + Number(tick.max_bid[0])) / 2;
        const sellPrice = marketPrice * (1 + sellSpread)
        const buyPrice = marketPrice * (1 - buySpread)
        
        // Setting balances
        const assetBalance = Number(balances.find(balance => balance.id === String(asset).toUpperCase()).available_amount[0])
        const baseBalance = Number(balances.find(balance => balance.id === String(base).toUpperCase()).available_amount[0])
        
        // Setting Volumes
        const buyVolume = (baseBalance * buyAllocation) / marketPrice
        const sellVolume = assetBalance * sellAllocation

        // Create buy order
        if (canBuy) {
            await budaClient
                .new_order(market, "bid", "limit", buyPrice, buyVolume).then((result) => {
                    // console.log(result)
                    console.log('\t', `Created limit buy order for ${buyVolume}@${buyPrice}`)
                })
                .catch(e => {
                    console.log(e.message)
                });
        }
        
        if (canSell) {
            // Create sell order
            await budaClient
                .new_order(market, "ask", "limit", sellPrice, sellVolume).then((result) => {
                    // console.log(result)
                    console.log('\t', `Created limit sell order for ${sellVolume}@${sellPrice}`)
                })
                .catch(e => {
                    console.log(e.message)
                });
        }
        
        console.log(
            `\t Market price: ${marketPrice} \n`,
            `\t Current Market Spread: ${(Number(tick.min_ask[0]) - Number(tick.max_bid[0]))} \n`,
            `\t My Spread: ${sellPrice - buyPrice}`
        )
        console.log('\n ******************************************************* \n')
         
    }
    // setTimeout(async () => {
    //     await tick(budaClient, markets, tickInterval);
    // }, tickInterval)
}

const run = async () => {
    const tickInterval = 40000;

    const markets = [
        {
            asset: 'btc',
            base: 'cop',
            buyAllocation: 0.32,
            sellAllocation: 0.32,
            sellSpread: 0.085,
            buySpread: 0.08, 
            canSell: true,
            canBuy: true,
        },
        {
            asset: 'ltc',
            base: 'cop',
            buyAllocation: 0.25,
            sellAllocation: 0.25,
            sellSpread: 0.082,
            buySpread: 0.075, 
            canSell: true,
            canBuy: true,
        },
        {
            asset: 'eth',
            base: 'cop',
            buyAllocation: 0.25,
            sellAllocation: 0.2,
            sellSpread: 0.11, 
            buySpread: 0.9, 
            canSell: true,
            canBuy: true,
        },
        {
            asset: 'eth',
            base: 'btc',
            buyAllocation: 0.3,
            sellAllocation: 0.3,
            sellSpread: 0.11, 
            buySpread: 0.11, 
            canSell: true,
            canBuy: true,
        },
        {
            asset: 'ltc',
            base: 'btc',
            buyAllocation: 0.32,
            sellAllocation: 0.32,
            sellSpread: 0.15, 
            buySpread: 0.15, 
            canSell: true,
            canBuy: true,
        }
    ]

    await tick(budaClient, markets, tickInterval);
    setInterval(tick, tickInterval, budaClient, markets)
}

run();
