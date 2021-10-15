let playAlert = new Audio('https://sampleswap.org/samples-ghost/DRUMS%20(SINGLE%20HITS)/Khezie%20808s/876[kb]khezie-Crunchy-808.wav.mp3');

const tick =  async(markets) => {
        console.log('hla')
        playAlert.play()
}

const run = async () => {
    const tickInterval = 40000;

    const markets = [
            {
                asset: 'eth',
                base: 'cop',
                buyAllocation: 1,
                sellAllocation: 0.2,
                sellSpread: 0.034, 
                buySpread: 0.034, 
                canSell: false,
                canBuy: true,
            },
    ]

    await tick(markets, tickInterval);
    setInterval(tick, tickInterval, markets)
}

run();
