// Init reqs
/* jslint node: true */
'use strict';

var mAmzCosts   = require('../');

// Init vars
var gASIN       = "B00BEZTMQ8",
    gUPC        = "794043165344",
    gKeyword    = "The Hobbit",
    gTestList   = {
      ASIN: false,
      UPC: false,
      KEYWORD: false,
      COSTS: true
    }
;

// Tests
console.log('test-all.js');

// Test for ASIN search
if(gTestList.ASIN === true) {
  mAmzCosts.productSearch(gASIN, function(err, data) {
    console.log("ASIN:" + gASIN);

    if(!err) {
      console.log(JSON.stringify(data, null, 2));
    }
    else {
      console.log("ERROR!:" + JSON.stringify(err, null, 2));
    }
  });
}

// Test for UPC search
if(gTestList.UPC === true) {
  mAmzCosts.productSearch(gUPC, function(err, data) {
    console.log("UPC:" + gUPC);

    if(!err) {
      console.log(JSON.stringify(data, null, 2));
    }
    else {
      console.log("ERROR!:" + JSON.stringify(err, null, 2));
    }
  });
}

// Test for keyword search
if(gTestList.KEYWORD === true) {
  mAmzCosts.productSearch(gKeyword, function(err, data) {
    console.log("KEYWORD:" + gKeyword);

    if(!err) {
      console.log(JSON.stringify(data, null, 2));
    }
    else {
      console.log("ERROR!:" + JSON.stringify(err, null, 2));
    }
  });
}

// Test for costs
if(gTestList.COSTS === true) {
  mAmzCosts.productSearch(gASIN, function(err, data) {
    console.log("COSTS:" + gASIN);

    if(!err) {
      console.log(JSON.stringify(data, null, 2));

      if(data && data.items instanceof Array && data.items.length && data.items[0].asin === gASIN) {

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

        mAmzCosts.productCosts(pcOptFBA, function(err, data) {
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

        mAmzCosts.productCosts(pcOptFBM, function(err, data) {
          if(!err) {
            console.log(JSON.stringify(data, null, 2));
          }
          else {
            console.log("ERROR!:" + JSON.stringify(err, null, 2));
          }
        });
      }
      else {
        console.log("Product (" + gASIN + ") could not be found.");
      }
    }
    else {
      console.log("ERROR!:" + JSON.stringify(err, null, 2));
    }
  });
}