## Amazon Costs

[amazon-costs](http://github.com/cmfatih/amazon-costs) is a [node.js](http://nodejs.org) module for retrieving Amazon product information and calculating costs for fulfillment and merchant channels.  

amazon-costs on [npm registry](http://npmjs.org/package/amazon-costs)  
[![NPM](https://nodei.co/npm/amazon-costs.png?compact=true)](https://nodei.co/npm/amazon-costs/)

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
    console.log(JSON.stringify(data, null, 2));
  }
  else {
    console.log("ERROR!:" + JSON.stringify(err, null, 2));
  }
});

// Output
/*
{
  "items": [
    {
      "link": "http://www.amazon.com/gp/product/B00BEZTMFY/ref=xx_xx_cont_xx/180-3685826-3917707",
      "dimUnits": "inches",
      "thumbnail": "https://images-na.ssl-images-amazon.com/images/I/51oyx9TCjVL._SL80_.jpg",
      "subCategory": null,
      "dimensions": {
        "width": 5.3,
        "length": 7.4,
        "height": 0.6
      },
      "gl": "gl_dvd",
      "image": "https://images-na.ssl-images-amazon.com/images/I/51oyx9TCjVL._SL120_.jpg",
      "weightUnits": "pounds",
      "productGroup": "74",
      "weight": 0.2,
      "asin": "B00BEZTMFY",
      "whiteGlovesRequired": "N",
      "title": "The Hobbit: An Unexpected Journey (Two-Disc Special Edition) (DVD + UltraViolet Digital Copy) [DVD]"
    },
    ...
    ...
  ]
}
*/
```

**Costs**
```javascript
var amzCosts  = require('amazon-costs');
var asin      = "B00BEZTMQ8";

amzCosts.productSearch(asin, function(err, data) {
  if(!err) {
    console.log(JSON.stringify(data, null, 2));

    if(data && data.items instanceof Array && data.items.length && data.items[0].asin === asin) {

      // FBA costs
      var pcOptFBA  = {
        product: data.items[0],
        cost: {
          costType: 'FBA',
          productPrice: 25.00,
          inboundDelivery: 1.00,
          prepService: 1.00
        }
      };

      amzCosts.productCosts(pcOptFBA, function(err, data) {
        if(!err) {
          console.log(JSON.stringify(data, null, 2));
        }
        else {
          console.log("ERROR!:" + JSON.stringify(err, null, 2));
        }
      });

      // FBM costs
      var pcOptFBM  = {
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
      };

      amzCosts.productCosts(pcOptFBM, function(err, data) {
        if(!err) {
          console.log(JSON.stringify(data, null, 2));
        }
        else {
          console.log("ERROR!:" + JSON.stringify(err, null, 2));
        }
      });
    }
    else {
      console.log("Product (" + asin + ") could not be found.");
    }
  }
  else {
    console.log("ERROR!:" + JSON.stringify(err, null, 2));
  }
});

// Output
/*
{
  "items": [
    {
      "link": "http://www.amazon.com/gp/product/B00BEZTMQ8/ref=xx_xx_cont_xx/186-1246243-6363763",
      "dimUnits": "inches",
      "thumbnail": "https://images-na.ssl-images-amazon.com/images/I/51nZpnQgUwL._SL80_.jpg",
      "subCategory": null,
      "dimensions": {
        "width": 5.4,
        "length": 6.6,
        "height": 0.6
      },
      "gl": "gl_dvd",
      "image": "https://images-na.ssl-images-amazon.com/images/I/51nZpnQgUwL._SL120_.jpg",
      "weightUnits": "pounds",
      "productGroup": "74",
      "weight": 0.2,
      "asin": "B00BEZTMQ8",
      "whiteGlovesRequired": "N",
      "title": "The Hobbit: An Unexpected Journey (Blu-ray) [Blu-ray]"
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
          "weightHandlingFee": "0.42",
          "orderHandlingFee": 0,
          "fbaDeliveryServicesFee": 0,
          "commissionFee": "3.75",
          "pickAndPackFee": "1",
          "storageFee": "0.01",
          "variableClosingFee": "0.8"
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