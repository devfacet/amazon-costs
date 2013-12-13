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
  var debug,            // debug
      urlList,          // url list
      marketPlaceId,    // marketplace Id for Amazon
      locale,           // locale
      urlPrd,           // product url
      urlPDM,           // request url for product search
      urlAFN,           // request url for fees (fulfillment by Amazon)
      urlMFN,           // request url for fees (fulfillment by merchant)
      productSearch,
      productCosts,
      productTidy
  ;

  debug             = false;              // for debug
  marketPlaceId     = 'ATVPDKIKX0DER';    // Marketplace Id - US
  locale            = 'en_US';            // Locale - English US
  urlList           = {                   // List of urls
    urlPrd: 'http://www.amazon.com/gp/product/{asin}',
    urlPDM: 'https://sellercentral.amazon.com/gp/fba/revenue-calculator/data/product-matches.html',
    urlAFN: 'https://sellercentral.amazon.com/gp/fba/revenue-calculator/data/afn-fees.html',
    urlMFN: 'https://sellercentral.amazon.com/gp/fba/revenue-calculator/data/mfn-fees.html'
  };

  // Returns url for product
  urlPrd            = function urlPrd() {
    return urlList.urlPrd;
  };

  // Returns request url for product search
  urlPDM            = function urlPDM() {
    return urlList.urlPDM;
  };

  // Returns request url for fees - FBA
  urlAFN            = function urlAFN() {
    return urlList.urlAFN;
  };

  // Returns request url for fees - FBM
  urlMFN            = function urlMFN() {
    return urlList.urlMFN;
  };

  // Search products (by UPC, EAN, ISBN or ASIN) and returns information
  productSearch     = function productSearch(iParam, iCallback) {

    // Init vars
    var returnRes   = null,   // return object
        returnErr   = null,   // error (for callback)
        returnErrs  = [],     // errors for return
        returnItems = [],     // items for return
        iQuery      = null,   // search query
        reqOpt      = {       // request options
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
    var tParamErr = null;

    if(iQuery === null || iQuery == '') {
      tParamErr   = "Invalid query parameter!";
    }

    if(tParamErr) {
      if(iCallback !== undefined && typeof iCallback === 'function') {
        return iCallback(tParamErr, returnRes);
      }
      else {
        return returnRes;
      }
    }

    // Send request
    reqOpt.form.model = JSON.stringify({"searchString": iQuery, "lang": locale, "marketPlace": marketPlaceId});

    mRequest(reqOpt, function (err, res, body) {
      
      //console.log('mRequest.err:' + err);                     // for debug
      //console.log('mRequest.res:' + res.statusCode);          // for debug
      //console.log('mRequest.body:' + JSON.stringify(body));   // for debug

      if(!err && res.statusCode == 200) {

        // Init response object
        var resObj;

        if(reqOpt.json == true) {
          resObj    = body;
        }
        else {
          try {
            resObj  = JSON.parse(body);
          }
          catch(e) {
            resObj  = {"error": "Response content could not be parsed! (" + e + ")"}
          }
        }

        if(!resObj.error) {

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
          var tCnt = (resObj.data !== undefined && resObj.data instanceof Array) ? resObj.data.length : 0;

          if(tCnt > 0) {
            for (var i = 0; i < tCnt; i++) {
              returnItems.push(resObj.data[i]);
            };
          }
        }
        else {
          returnErr = (resObj.error !== undefined && resObj.error !== null) ? (resObj.error + '') : "Bad response!";

          returnErrs.push(
            {
              "type": "fatal",
              "code": "amzcosts-002",
              "source": "productSearch",
              "reason": "requestError",
              "message": returnErr
            }
          );
        }
      }
      else {
        returnErr = (err) ? (err + '') : 'HTTP status code:' + (res.statusCode + '');

        returnErrs.push(
          {
            "type": "fatal",
            "code": "amzcosts-001",
            "source": "productSearch",
            "reason": "requestError",
            "message": "External error. (" + returnErr + ")"
          }
        );
      }

      if(returnErrs.length || returnItems.length) {
        returnRes = {
          items: (returnItems.length) ? returnItems : null,
          errors: (returnErrs.length) ? returnErrs : null
        };
      }

      if(iCallback !== undefined && typeof iCallback === 'function') {
        return iCallback(returnErr, returnRes);
      }
      else {
        return returnRes;
      }
    });
  };

  // Returns product costs
  productCosts      = function productCosts(iParam, iCallback) {

    // Init vars
    var returnRes   = null,   // return object
        returnErr   = null,   // error (for callback)
        returnErrs  = [],     // errors for return
        returnItems = [],     // items for return
        iProduct    = null,   // product (object)
        iCost       = null,   // cost (object)
        reqOpt      = {       // request options
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
    var tParamErr   = null;

    if(iProduct === null || iProduct.asin === undefined) {
      tParamErr     = "Invalid product parameter!";
    }
    else if(iCost === null || iCost.costType === undefined || (iCost.costType != 'FBA' && iCost.costType != 'FBM')) {
      tParamErr     = "Invalid cost parameter!";
    }

    if(tParamErr) {
      if(iCallback !== undefined && typeof iCallback === 'function') {
        return iCallback(tParamErr, returnRes);
      }
      else {
        return returnRes;
      }
    }

    // Prepare request
    var tModel                    = iProduct;
    tModel['selected']            = true;
    tModel['language']            = locale;

    var tCost                     = {};
    tCost['price']                = !isNaN(iCost.productPrice)      ? iCost.productPrice      : 0;

    if(iCost.costType == 'FBA') {
      reqOpt.url                  = urlAFN();

      tCost['revenueTotal']       = tCost['price'];
      tCost['inbound-delivery']   = !isNaN(iCost.inboundDelivery)   ? iCost.inboundDelivery   : 0;
      tCost['prep-service']       = !isNaN(iCost.prepService)       ? iCost.prepService       : 0;

      tCost['fulfillmentTotal']   = tCost['inbound-delivery'] + tCost['prep-service'];
    }
    else if(iCost.costType == 'FBM') {
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

    for(tCostItem in tCost) {
      tModel[tCostItem] = tCost[tCostItem];
    }

    //console.log(JSON.stringify(tModel, null, 2)); // for debug

    // Send request
    reqOpt.form.model = JSON.stringify(tModel);

    mRequest(reqOpt, function (err, res, body) {
      
      //console.log('mRequest.err:' + err);                     // for debug
      //console.log('mRequest.res:' + res.statusCode);          // for debug
      //console.log('mRequest.body:' + JSON.stringify(body));   // for debug
    
      if(!err && res.statusCode == 200) {

        // Init response object
        var resObj;

        if(reqOpt.json == true) {
          resObj    = body;
        }
        else {
          try {
            resObj  = JSON.parse(body);
          }
          catch(e) {
            resObj  = {"error": "Response content could not be parsed! (" + e + ")"}
          }
        }

        if(!resObj.error) {

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
          if(resObj.data !== undefined && resObj.data instanceof Object) {
            var tItem = {
              asin: iProduct.asin,
              cost: {
                merchant: {},
                amazon: resObj.data
              }
            };

            // merchant costs
            for(tCostItem in tCost) tItem.cost.merchant[tCostItem] = tCost[tCostItem];

            returnItems.push(tItem);
          }
        }
        else {
          returnErr = (resObj.error !== undefined && resObj.error !== null) ? (resObj.error + '') : "Bad response!";

          returnErrs.push(
            {
              "type": "fatal",
              "code": "amzcosts-004",
              "source": "productCosts",
              "reason": "requestError",
              "message": returnErr
            }
          );
        }
      }
      else {
        returnErr = (err) ? (err + '') : 'HTTP status code:' + (res.statusCode + '');

        returnErrs.push(
          {
            "type": "fatal",
            "code": "amzcosts-003",
            "source": "mRequest",
            "reason": "productCosts",
            "message": "External error. (" + returnErr + ")"
          }
        );        
      }

      if(returnErrs.length || returnItems.length) {
        returnRes = {
          items: (returnItems.length) ? returnItems : null,
          errors: (returnErrs.length) ? returnErrs : null
        };
      }

      if(iCallback !== undefined && typeof iCallback === 'function') {
        return iCallback(returnErr, returnRes);
      }
      else {
        return returnRes;
      }
    });

  };

  // Returns tidy product object 
  productTidy       = function productTidy(iProduct) {

    // Init vars
    var returnRes   = null; 

    if(iProduct && typeof iProduct == 'object') {
      returnRes     = {
        "asin": iProduct.asin || null,
        "title": iProduct.title || null,
        "link": (iProduct.asin) ? urlPrd().replace('{asin}', iProduct.asin) : null,
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

    return returnRes;
  };

  // Return
  return {
    productSearch: productSearch,
    productCosts: productCosts,
    productTidy: productTidy
  };
}();
