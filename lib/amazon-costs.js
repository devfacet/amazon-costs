/*
 * Amazon Costs
 * Copyright (c) 2013 Fatih Cetinkaya (http://github.com/cmfatih/amazon-costs)
 * For the full copyright and license information, please view the LICENSE.txt file.
 */

// Init reqs
/* jslint node: true */
'use strict';

var mRequest = require('request'); // request module

// Init the module
exports = module.exports = function amzCosts() {

  // Init vars
  var debug,          // debug
      urlList,        // url list
      mpId,           // Amazon marketplace Id
      locale,         // locale
      urlPrd,         // product url
      urlPDM,         // request url for product search
      urlAFN,         // request url for fees (fulfillment by Amazon)
      urlMFN,         // request url for fees (fulfillment by merchant)
      productSearch,  // product search - function
      productCosts,   // product costs - function
      productTidy     // tidy product info - function
  ;

  debug   = false;            // for debug
  mpId    = 'ATVPDKIKX0DER';  // Marketplace Id - US
  locale  = 'en_US';          // Locale - English US
  urlList = {                 // List of urls
    urlPrd: 'http://www.amazon.com/gp/product/{{asin}}',
    urlPDM: 'https://sellercentral.amazon.com/gp/fba/revenue-calculator/data/product-matches.html',
    urlAFN: 'https://sellercentral.amazon.com/gp/fba/revenue-calculator/data/afn-fees.html',
    urlMFN: 'https://sellercentral.amazon.com/gp/fba/revenue-calculator/data/mfn-fees.html'
  };

  // Returns url for product
  urlPrd = function urlPrd() {
    return urlList.urlPrd;
  };

  // Returns request url for product search
  urlPDM = function urlPDM() {
    return urlList.urlPDM;
  };

  // Returns request url for fees - FBA
  urlAFN = function urlAFN() {
    return urlList.urlAFN;
  };

  // Returns request url for fees - FBM
  urlMFN = function urlMFN() {
    return urlList.urlMFN;
  };

  // Search products (by UPC, EAN, ISBN or ASIN) and returns information
  productSearch = function productSearch(iParam, iCallback) {

    // Init vars
    var returnData  = null, // return data
        returnErr   = null, // return error
        returnErrs  = [],   // return data errors
        returnItems = [],   // return data items
        iQuery      = null, // search query
        reqOpt      = {     // request options
          url: urlPDM(),
          method: 'POST',
          json: true,
          timeout: 30000,
          form: {"method": "GET", "model": null}
        }
    ;

    // Init params
    if(iParam) {
      if(typeof iParam === 'string') {
        iQuery    = (iParam + '').trim();
      }
      else if(typeof iParam === 'object') {
        if(iParam.query !== undefined && typeof iParam.query === 'string') {
          iQuery  = (iParam.query + '').trim();
        }
      }
    }

    // Check params
    if(!iQuery) {
      returnErr = {
        "type": "fatal",
        "code": "amzcos-001",
        "source": "productSearch",
        "message": "Missing query!"
      };
    }

    if(returnErr) {
      if(iCallback && typeof iCallback === 'function') {
        return iCallback(returnErr, returnData);
      }
      else {
        return {"error": returnErr, "data": returnData};
      }
    }

    // Send request
    reqOpt.form.model = JSON.stringify({"searchString": iQuery, "lang": locale, "marketPlace": mpId});

    mRequest(reqOpt, function (err, res, body) {

      //console.log('mRequest.err:' + err);                   // for debug
      //console.log('mRequest.res:' + res.statusCode);        // for debug
      //console.log('mRequest.body:' + JSON.stringify(body)); // for debug

      if(!err && res.statusCode === 200) {

        // Init response object
        var resObj;

        if(reqOpt.json === true) {
          resObj    = body;
        }
        else {
          try {
            resObj  = JSON.parse(body);
          }
          catch(e) {
            resObj  = {"error": "Response content could not be parsed! (" + e + ")"};
          }
        }

        if(resObj && !resObj.error) {

          /*
           * Fields for body.data (array)
           *
           * asin:                Amazon Standard Identification Number
           * title:               Product title.
           * link:                Link of the product (with reference)
           * image:               Image link of the product.
           * thumbnail:           Thumbnail link of the product.
           * dimensions:          Dimensions (dimensions.width, dimensions.length, dimensions.height)
           * dimUnits:            Units of the dimension. (inches, etc.)
           * weight:              Weight of the product. (float)
           * weightUnits:         Units of the weight. (pounds, etc.)
           * gl:                  Product group code. (gl_*)
           * productGroup:        Product group Id. (number)
           * subCategory:         Sub category Id. (number)
           * whiteGlovesRequired: Flag for "white gloves required" products. (N or Y)
           */
          
          // Items
          var tCnt = (resObj.data && resObj.data instanceof Array) ? resObj.data.length : 0;

          if(tCnt > 0) {
            for (var i = 0; i < tCnt; i++) {
              returnItems.push(resObj.data[i]);
            }
          }
        }
        else {
          returnErr = {
            "type": "fatal",
            "code": "amzcos-002",
            "source": "productSearch",
            "message": (resObj && resObj.error) ? ('' + resObj.error) : "Bad response!"
          };

          returnErrs.push(returnErr);
        }
      }
      else {
        returnErr = {
          "type": "fatal",
          "code": "amzcos-003",
          "source": "productSearch",
          "message": (err) ? ('' + err) : 'HTTP status code: ' + ('' + res.statusCode)
        };

        returnErrs.push(returnErr);
      }

      if(returnItems.length || returnErrs.length) {
        returnData = {
          items: (returnItems.length) ? returnItems : null,
          errors: (returnErrs.length) ? returnErrs : null
        };
      }

      if(iCallback && typeof iCallback === 'function') {
        return iCallback(returnErr, returnData);
      }
      else {
        return {"error": returnErr, "data": returnData};
      }
    });
  };

  // Returns product costs
  productCosts = function productCosts(iParam, iCallback) {

    // Init vars
    var returnData  = null, // return data
        returnErr   = null, // return error
        returnErrs  = [],   // errors for return
        returnItems = [],   // items for return
        iProduct    = null, // product (object)
        iCost       = null, // cost (object)
        reqOpt      = {     // request options
          url: null,
          method: 'POST',
          json: true,
          timeout: 30000,
          form: {"method": "GET", "model": null}
        }
    ;

    // Init params
    if(iParam) {
      if(typeof iParam === 'object') {
        if(iParam.product !== undefined && typeof iParam.product === 'object') {
          iProduct  = iParam.product;
        }

        if(iParam.cost !== undefined && typeof iParam.cost === 'object') {
          iCost     = iParam.cost;
        }
      }
    }

    // Check params
    if(!iProduct || !iProduct.asin) {
      returnErr = {
        "type": "fatal",
        "code": "amzcos-004",
        "source": "productCosts",
        "message": "Missing product ASIN!"
      };
    }
    else if(!iCost || !iCost.costType || (iCost.costType !== 'FBA' && iCost.costType !== 'FBM')) {
      returnErr = {
        "type": "fatal",
        "code": "amzcos-005",
        "source": "productCosts",
        "message": "Invalid cost type!"
      };
    }

    if(returnErr) {
      if(iCallback && typeof iCallback === 'function') {
        return iCallback(returnErr, returnData);
      }
      else {
        return {"error": returnErr, "data": returnData};
      }
    }

    // Prepare request
    var tModel                    = iProduct;
    tModel['selected']            = true;
    tModel['language']            = locale;

    var tCost                     = {};
    tCost['price']                = !isNaN(iCost.productPrice)      ? iCost.productPrice      : 0;

    if(iCost.costType === 'FBA') {
      reqOpt.url                  = urlAFN();

      tCost['revenueTotal']       = tCost['price'];
      tCost['inbound-delivery']   = !isNaN(iCost.inboundDelivery)   ? iCost.inboundDelivery   : 0;
      tCost['prep-service']       = !isNaN(iCost.prepService)       ? iCost.prepService       : 0;

      tCost['fulfillmentTotal']   = tCost['inbound-delivery'] + tCost['prep-service'];
    }
    else if(iCost.costType === 'FBM') {
      reqOpt.url                  = urlMFN();

      tCost['shipping']           = !isNaN(iCost.shipping)          ? iCost.shipping          : 0;
      tCost['order-handling']     = !isNaN(iCost.orderHandling)     ? iCost.orderHandling     : 0;
      tCost['pick-pack']          = !isNaN(iCost.pickPack)          ? iCost.pickPack          : 0;
      tCost['outbound-delivery']  = !isNaN(iCost.outboundDelivery)  ? iCost.outboundDelivery  : 0;
      tCost['storage']            = !isNaN(iCost.storage)           ? iCost.storage           : 0;
      tCost['inbound-delivery']   = !isNaN(iCost.inboundDelivery)   ? iCost.inboundDelivery   : 0;
      tCost['customer-service']   = !isNaN(iCost.customerService)   ? iCost.customerService   : 0;
      tCost['prep-service']       = !isNaN(iCost.prepService)       ? iCost.prepService       : 0;

      tCost['revenueTotal']       = tCost['price'] + tCost['shipping'];

      tCost['fulfillmentTotal']   = tCost['order-handling'] + tCost['pick-pack'] + tCost['outbound-delivery']
                                  + tCost['storage'] + tCost['inbound-delivery'] + tCost['customer-service']
                                  + tCost['prep-service'];
    }

    for(var tCostItem in tCost) {
      tModel[tCostItem] = tCost[tCostItem];
    }

    //console.log(JSON.stringify(tModel, null, 2)); // for debug

    // Send request
    reqOpt.form.model = JSON.stringify(tModel);

    mRequest(reqOpt, function (err, res, body) {

      //console.log('mRequest.err:' + err);                   // for debug
      //console.log('mRequest.res:' + res.statusCode);        // for debug
      //console.log('mRequest.body:' + JSON.stringify(body)); // for debug
    
      if(!err && res.statusCode === 200) {

        // Init response object
        var resObj;

        if(reqOpt.json === true) {
          resObj    = body;
        }
        else {
          try {
            resObj  = JSON.parse(body);
          }
          catch(e) {
            resObj  = {"error": "Response content could not be parsed! (" + e + ")"};
          }
        }

        if(resObj && !resObj.error) {

          /*
           * Fields for body.data (array)
           *
           * weightHandlingFee:       This fee is the weight based shipping fee for Fulfillment by Amazon orders.
           * orderHandlingFee:        A flat cost per order for fulfillment.
           * fbaDeliveryServicesFee:  Delivery services fee.
           * commissionFee:           Amazon's commossion fee, (Amazon referral fee)
           * pickAndPackFee:          This is the cost to physically retrieve the item.
           * storageFee:              Amazon warehouse charges for 30 days.
           * variableClosingFee:      Variable closing fee.
           */

          // Items
          if(resObj.data && resObj.data instanceof Object) {
            var tItem = {
              asin: iProduct.asin,
              cost: {
                merchant: {},
                amazon: resObj.data
              }
            };

            // merchant costs
            for(var tCostItem in tCost) tItem.cost.merchant[tCostItem] = tCost[tCostItem];

            returnItems.push(tItem);
          }
        }
        else {
          returnErr = {
            "type": "fatal",
            "code": "amzcos-006",
            "source": "productCosts",
            "message": (resObj && resObj.error) ? ('' + resObj.error) : "Bad response!"
          };

          returnErrs.push(returnErr);
        }
      }
      else {
        returnErr = {
          "type": "fatal",
          "code": "amzcos-007",
          "source": "productCosts",
          "message": (err) ? ('' + err) : 'HTTP status code: ' + ('' + res.statusCode)
        };

        returnErrs.push(returnErr);
      }

      if(returnItems.length || returnErrs.length) {
        returnData = {
          items: (returnItems.length) ? returnItems : null,
          errors: (returnErrs.length) ? returnErrs : null
        };
      }

      if(iCallback && typeof iCallback === 'function') {
        return iCallback(returnErr, returnData);
      }
      else {
        return {"error": returnErr, "data": returnData};
      }
    });
  };

  // Returns tidy product object 
  productTidy = function productTidy(iProduct) {

    // Init vars
    var returnData = null;

    if(iProduct && typeof iProduct === 'object') {
      returnData = {
        "asin": iProduct.asin || null,
        "title": iProduct.title || null,
        "link": (iProduct.asin) ? urlPrd().replace('{{asin}}', iProduct.asin) : null,
        "image": (iProduct.image) ? iProduct.image.replace('_SL120_', '_SL512_') : null,
        "weight": {
          "unit": iProduct.weightUnits || null,
          "weight": iProduct.weight || null
        },
        "dimension": {
          "unit": iProduct.dimUnits || null,
          "length": (iProduct.dimensions && iProduct.dimensions.length) || null,
          "height": (iProduct.dimensions && iProduct.dimensions.height) || null,
          "width": (iProduct.dimensions && iProduct.dimensions.width) || null
        },
        "other": {
          "prodcutGroupId": iProduct.productGroup || null,
          "prodcutGroupCode": iProduct.gl || null,
          "subCategoryId": iProduct.subCategory || null,
          "whiteGlovesRequired": iProduct.whiteGlovesRequired || null
        }
      };
    }

    return returnData;
  };

  // Return
  return {
    productSearch: productSearch,
    productCosts: productCosts,
    productTidy: productTidy
  };
}();