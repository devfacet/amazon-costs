// Init reqs
var mAmzCosts   = require('../');     // amazon-costs module

// Init vars
var gASIN       = "B00BEZTMQ8",       // ASIN
    gUPC        = "794043165344",     // UPC
    gKeyword    = "The Hobbit",       // Keyword
    gTestList   = {
      ASIN: false, 
      UPC: false, 
      KEYWORD: false, 
      COSTS: true
    }
;

// Tests
console.log(tidyOutput("TESTS: test-all.js"));

// Test for ASIN search
if(gTestList.ASIN == true) {
  mAmzCosts.productSearch(gASIN, function(err, res) {

    console.log(tidyOutput("SEARCH:ASIN:" + gASIN));

    if(!err) {
      console.log(JSON.stringify(res, null, 2));
    }
    else {
      console.log("ERROR!:" + err);
    }
  });
}

// Test for UPC search
if(gTestList.UPC == true) {
  mAmzCosts.productSearch(gUPC, function(err, res) {

    console.log(tidyOutput("SEARCH:UPC:" + gUPC));

    if(!err) {
      console.log(JSON.stringify(res, null, 2));
    }
    else {
      console.log("ERROR!:" + err);
    }
  });
}

// Test for keyword search
if(gTestList.KEYWORD == true) {
  mAmzCosts.productSearch(gKeyword, function(err, res) {

    console.log(tidyOutput("SEARCH:KEYWORD:" + gKeyword));

    if(!err) {
      console.log(JSON.stringify(res, null, 2));
    }
    else {
      console.log("ERROR!:" + err);
    }
  });
}

// Test for costs
if(gTestList.COSTS == true) {

  mAmzCosts.productSearch(gASIN, function(err, res) {

    console.log(tidyOutput("SEARCH:ASIN:" + gASIN));

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

          console.log(tidyOutput("COSTS:FBA:" + gASIN));

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

          console.log(tidyOutput("COSTS:FBM:" + gASIN));

          if(!err) {
            console.log(JSON.stringify(res, null, 2));
          }
          else {
            console.log("ERROR!:" + err);
          }
        });
      }
      else {
        console.log("Product (" + gASIN + ") could not be found.");
      }
    }
    else {
      console.log("ERROR!:" + err);
    }
  });
}

// for tidy output
function tidyOutput(iText) {
  return "\r\n========== " + (iText + '') + " ==========\r\n";
}