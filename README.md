## Amazon Costs

  [amazon-costs](http://github.com/cmfatih/amazon-costs) is a [node.js](http://nodejs.org) module for retrieving Amazon product information and calculating costs for fulfillment and merchant channels.

### Installation

```
npm install amazon-costs
```

### Test

```
npm install amazon-costs
cd node_modules/amazon-costs
npm test
```

### Example

```javascript
var mAmzCosts = require('amazon-costs');
var gASIN     = "B00BEZTMQ8";

mAmzCosts.productSearch(gASIN, function(err, res) {
  if(!err) {
    console.log(JSON.stringify(res, null, 2));

    if(res && res.items instanceof Array && res.items.length && res.items[0].asin == gASIN) {

      // FBA costs
      var pcOptFBA  = {
        product: res.items[0],
        cost: {
          costType: 'FBA',
          productPrice: 25.00,
          inboundDelivery: 1.00,
          prepService: 1.00
        }
      };

      mAmzCosts.productCosts(pcOptFBA, function(err, res) {
        if(!err) {
          console.log(JSON.stringify(res, null, 2));
        }
        else {
          console.log("ERROR!:" + err);
        }
      });

      // FBM costs
      var pcOptFBM  = {
        product: res.items[0],
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

      mAmzCosts.productCosts(pcOptFBM, function(err, res) {
        if(!err) {
          console.log(JSON.stringify(res, null, 2));
        }
        else {
          console.log("ERROR!:" + err);
        }
      });
    }
  }
  else {
    console.log("ERROR!:" + err);
  }
});
```

### License

Copyright (c) 2013 Fatih Cetinkaya (http://github.com/cmfatih/amazon-costs)  
Licensed under The MIT License (MIT) - http://www.opensource.org/licenses/mit-license.php  
For the full copyright and license information, please view the LICENSE.txt file.