let playAlert = new Audio('https://sampleswap.org/samples-ghost/DRUMS%20(SINGLE%20HITS)/Khezie%20808s/876[kb]khezie-Crunchy-808.wav.mp3');
let wethMultiplier = 1000000000000000000;

const openedAxies = [];

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

function openAndPush(id) {
    let win = window.open(`https://marketplace.axieinfinity.com/axie/${id}`);
    let element = win.document.createElement('script');
    element.innerHTML = "var xpath = \"//div[text()='Buy now']\"; var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.parentElement.click(); console.log(matchingElement)"

    element.type='text/javascript';
  
    setTimeout(function(){ win.document.body.appendChild(element); console.log('New script appended!') }, 10000);
}

const tick =  async(markets) => {
        const query = {
            "operationName": "GetAxieBriefList",
            "variables": {
                "from": 0,
                "size": 100,
                "sort": "PriceAsc",
                "auctionType": "Sale",
                "owner": null,
                "criteria": {
                    "region": null,
                    "parts": null,
                    "bodyShapes": null,
                    "classes": markets.classes,
                    "stages": null,
                    "numMystic": null,
                    "pureness": markets.pureness,
                    "title": null,
                    "breedable": null,
                    "breedCount": markets.breedCount,
                    "hp": [],
                    "skill": [],
                    "speed": [],
                    "morale": []
                }
            },
            "query": "query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {\n  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {\n    total\n    results {\n      ...AxieBrief\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AxieBrief on Axie {\n  id\n  name\n  stage\n  class\n  breedCount\n  image\n  title\n  battleInfo {\n    banned\n    __typename\n  }\n  auction {\n    currentPrice\n    currentPriceUSD\n    __typename\n  }\n  parts {\n    id\n    name\n    class\n    type\n    specialGenes\n    __typename\n  }\n  __typename\n}\n"
        }
        postData('https://graphql-gateway.axieinfinity.com/graphql', query)
          .then(data => {
            const axies = data.data.axies.results
            axies.forEach( (element) => {
              if (!openedAxies.includes(element.id)) {
                const isAffordable = Number(element.auction.currentPrice) < markets.maxWETH * wethMultiplier
                
                openedAxies.push(element.id);
                
                if (!element.battleInfo.banned && isAffordable){
                  playAlert.play();
                  openAndPush(element.id)         
                  console.log(`Abierto axie #${element.id}`, element);
                  console.log(`Precio de Axie (USD): ${Number(element.auction.currentPrice / wethMultiplier )}`);
                }                
              }
            })

            // console.log(openedAxies)
            console.log('Buscando ...')
          });
}

const run = async () => {
    const tickInterval = 5000;

    const markets = {
                classes: ["Plant"],
                pureness: [ 5, 6 ], 
                breedCount: [ 0  ],
                // maxPriceUSD: 130,
                maxWETH: 0.04,
            }

    await tick(markets, tickInterval);
    setInterval(tick, tickInterval, markets)
}

run();
