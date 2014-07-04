## Amazon Costs
[![Build Status][travis-image]][travis-url] [![NPM][npm-image]][npm-url]

[amazon-costs](http://github.com/cmfatih/amazon-costs) is a Node.js module for 
retrieving Amazon product information and calculating costs for fulfillment and merchant channels.  

### Installation

For latest release
```
npm install amazon-costs
```

For HEAD
```
git clone https://github.com/cmfatih/amazon-costs.git
```

### Usage

#### Test
```
npm test
```

#### Examples

**Search**
```javascript
var amzCosts = require('amazon-costs');

amzCosts.productSearch('The Hobbit DVD', function(err, data) {
  if(!err) {
    console.log(data);
  } else {
    console.log(err);
  }
});

// Output
/*
{ items:
   [ { link: 'http://www.amazon.com/gp/product/B00BEZTMFY/ref=xx_xx_cont_xx/176-0515210-4045758',
       dimUnits: 'inches',
       thumbnail: 'https://images-na.ssl-images-amazon.com/images/I/51oyx9TCjVL._SL80_.jpg',
       subCategory: null,
       dimensions: [Object],
       gl: 'gl_dvd',
       image: 'https://images-na.ssl-images-amazon.com/images/I/51oyx9TCjVL._SL120_.jpg',
       weightUnits: 'pounds',
       productGroup: '74',
       weight: 0.2,
       asin: 'B00BEZTMFY',
       whiteGlovesRequired: 'N',
       title: 'The Hobbit: An Unexpected Journey (Two-Disc Special Edition) (DVD + UltraViolet Digital Copy) [DVD]' },
     { link: 'http://www.amazon.com/gp/product/B00HWWUQWQ/ref=xx_xx_cont_xx/176-0515210-4045758',
       dimUnits: 'inches',
       thumbnail: 'https://images-na.ssl-images-amazon.com/images/I/51AcQosPxyL._SL80_.jpg',
       subCategory: null,
       dimensions: [Object],
       gl: 'gl_dvd',
       image: 'https://images-na.ssl-images-amazon.com/images/I/51AcQosPxyL._SL120_.jpg',
       weightUnits: 'pounds',
       productGroup: '74',
       weight: 0.1,
       asin: 'B00HWWUQWQ',
       whiteGlovesRequired: 'N',
       title: 'The Hobbit: The Desolation of Smaug (Special Edition) (DVD + UltraViolet Combo Pack) [DVD]' } ],
  errors: null }
*/
```

**Costs**
```javascript
var amzCosts  = require('amazon-costs');
var asin      = 'B00BEZTMQ8';

amzCosts.productSearch(asin, function(err, data) {
  if(err) {
    console.log(err);
    return;
  }

  console.log(data);

  if(!data || !(data.items instanceof Array) || data.items[0] && data.items[0].asin != asin) {
    console.log("Error: Product (" + asin + ") could not be found.");
    return;
  }

  // FBA costs
  amzCosts.productCosts({
    product: data.items[0],
    cost: {
      costType: 'FBA',
      productPrice: 25.00,
      inboundDelivery: 1.00,
      prepService: 1.00
    }
  }, function(err, data) {
    if(!err) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(err);
    }
  });

  // FBM costs
  amzCosts.productCosts({
    product: data.items[0],
    cost: {
      costType: 'FBM',
      productPrice: 25.00,
      shipping: 1.00,
      orderHandling: 1.00,
      pickPack: 1.00,
      outboundDelivery: 1.00,
      storage: 1.00,
      inboundDelivery: 1.00,
      customerService: 1.00,
      prepService: 1.00
    }
  }, function(err, data) {
    if(!err) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(err);
    }
  });
});

// Output
/*
{ items:
   [ { link: 'http://www.amazon.com/gp/product/B00BEZTMQ8/ref=xx_xx_cont_xx/186-8065886-6900841',
       dimUnits: 'inches',
       thumbnail: 'https://images-na.ssl-images-amazon.com/images/I/51nZpnQgUwL._SL80_.jpg',
       subCategory: null,
       dimensions: [Object],
       gl: 'gl_dvd',
       image: 'https://images-na.ssl-images-amazon.com/images/I/51nZpnQgUwL._SL120_.jpg',
       weightUnits: 'pounds',
       productGroup: '74',
       weight: 0.1,
       asin: 'B00BEZTMQ8',
       whiteGlovesRequired: 'N',
       title: 'The Hobbit: An Unexpected Journey (Blu-ray) [Blu-ray]' } ],
  errors: null }
{
  "items": [
    {
      "asin": "B00BEZTMQ8",
      "cost": {
        "merchant": {
          "price": 25,
          "revenueTotal": 25,
          "inbound-delivery": 1,
          "prep-service": 1,
          "fulfillmentTotal": 2
        },
        "amazon": {
          "weightHandlingFee": "0.46",
          "orderHandlingFee": 0,
          "fbaDeliveryServicesFee": 0,
          "commissionFee": "3.75",
          "pickAndPackFee": "1.02",
          "storageFee": 0,
          "variableClosingFee": "0.8"
        }
      }
    }
  ],
  "errors": null
}
{
  "items": [
    {
      "asin": "B00BEZTMQ8",
      "cost": {
        "merchant": {
          "price": 25,
          "shipping": 1,
          "order-handling": 1,
          "pick-pack": 1,
          "outbound-delivery": 1,
          "storage": 1,
          "inbound-delivery": 1,
          "customer-service": 1,
          "prep-service": 1,
          "revenueTotal": 26,
          "fulfillmentTotal": 7
        },
        "amazon": {
          "commissionFee": 3.75,
          "variableClosingFee": "1.35"
        }
      }
    }
  ],
  "errors": null
}
*/
```

### Changelog

For all notable changes see [CHANGELOG.md](https://github.com/cmfatih/amazon-costs/blob/master/CHANGELOG.md)

### License

Copyright (c) 2013 Fatih Cetinkaya (http://github.com/cmfatih/amazon-costs)  
Licensed under The MIT License (MIT)  
For the full copyright and license information, please view the LICENSE.txt file.

[npm-url]: http://npmjs.org/package/amazon-costs
[npm-image]: https://badge.fury.io/js/amazon-costs.png

[travis-url]: https://travis-ci.org/cmfatih/amazon-costs
[travis-image]: https://travis-ci.org/cmfatih/amazon-costs.svg?branch=master