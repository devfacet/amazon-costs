/*
 * Amazon Costs
 * Copyright (c) 2013 Fatih Cetinkaya (http://github.com/cmfatih/amazon-costs)
 * For the full copyright and license information, please view the LICENSE.txt file.
 */

/* jslint node: true */
'use strict';

var request = require('request'); // request module

// Init the module
exports = module.exports = function amzCosts() {

  var debug,         // debug
      urlList,       // url list
      mpId,          // Amazon marketplace Id
      locale,        // locale
      urlPrd,        // product url
      urlPDM,        // request url for product search
      urlAFN,        // request url for fees (fulfillment by Amazon)
      urlMFN,        // request url for fees (fulfillment by merchant)
      productSearch, // product search - function
      productCosts,  // product costs - function
      productTidy;   // tidy product info - function

  debug   = false;           // for debug
  mpId    = 'ATVPDKIKX0DER'; // Marketplace Id - US
  locale  = 'en_US';         // Locale - English US
  urlList = {                // List of urls
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
  productSearch = function productSearch(keywords, callback) {

    var returnData  = null, // return data
        returnErr   = null, // return error
        returnErrs  = [],   // return data errors
        returnItems = [],   // return data items
        query       = null, // search query
        reqOpt      = {     // request options
          url: urlPDM(),
          method: 'POST',
          json: true,
          timeout: 30000,
          form: {"method": "GET", "model": null}
        }
    ;

    // Check keywords
    if(keywords) {
      if(typeof keywords === 'string') {
        query = (keywords + '').trim();
      } else if(typeof keywords === 'object') {
        if(keywords.query !== undefined && typeof keywords.query === 'string') {
          query = (keywords.query + '').trim();
        }
      }
    }

    // Check query
    if(!query) {
      returnErr = {
        "type": "fatal",
        "code": "amzcos-001",
        "source": "productSearch",
        "message": "Missing query!"
      };
    }

    if(returnErr) {
      if(callback && typeof callback === 'function') {
        return callback(returnErr, returnData);
      } else {
        return {"error": returnErr, "data": returnData};
      }
    }

    // Send request
    reqOpt.form.model = JSON.stringify({"searchString": query, "lang": locale, "marketPlace": mpId});

    request(reqOpt, function (err, res, body) {

      if(!err && res.statusCode === 200) {

        var resObj;

        if(reqOpt.json === true) {
          resObj    = body;
        } else {
          try {
            resObj  = JSON.parse(body);
          } catch(e) {
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
          var itemsLen = (resObj.data && resObj.data instanceof Array) ? resObj.data.length : 0;

          for (var i = 0; i < itemsLen; i++) {
            returnItems.push(resObj.data[i]);
          }
        } else {
          returnErr = {
            "type": "fatal",
            "code": "amzcos-002",
            "source": "productSearch",
            "message": (resObj && resObj.error) ? ('' + resObj.error) : "Bad response!"
          };

          returnErrs.push(returnErr);
        }
      } else {
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

      if(callback && typeof callback === 'function') {
        return callback(returnErr, returnData);
      } else {
        return {"error": returnErr, "data": returnData};
      }
    });
  };

  // Returns product costs
  productCosts = function productCosts(options, callback) {

    var returnData  = null, // return data
        returnErr   = null, // return error
        returnErrs  = [],   // errors for return
        returnItems = [],   // items for return
        product     = null, // product - object
        cost        = null, // cost - object
        reqOpt      = {     // request options
          url: null,
          method: 'POST',
          json: true,
          timeout: 30000,
          form: {"method": "GET", "model": null}
        }
    ;

    // Check options
    if(options) {
      if(typeof options === 'object') {
        if(options.product !== undefined && typeof options.product === 'object') {
          product = options.product;
        }

        if(options.cost !== undefined && typeof options.cost === 'object') {
          cost = options.cost;
        }
      }
    }

    // Check product
    if(!product || !product.asin) {
      returnErr = {
        "type": "fatal",
        "code": "amzcos-004",
        "source": "productCosts",
        "message": "Missing product ASIN!"
      };
    }
    else if(!cost || !cost.costType || (cost.costType !== 'FBA' && cost.costType !== 'FBM')) {
      returnErr = {
        "type": "fatal",
        "code": "amzcos-005",
        "source": "productCosts",
        "message": "Invalid cost type!"
      };
    }

    if(returnErr) {
      if(callback && typeof callback === 'function') {
        return callback(returnErr, returnData);
      } else {
        return {"error": returnErr, "data": returnData};
      }
    }

    // Prepare request
    var model         = product;
    model['selected'] = true;
    model['language'] = locale;
    model['price']    = !isNaN(cost.productPrice) ? cost.productPrice : 0;

    if(cost.costType === 'FBA') {
      reqOpt.url = urlAFN();

      model['revenueTotal']       = cost['price'];
      model['inbound-delivery']   = !isNaN(cost.inboundDelivery)  ? cost.inboundDelivery  : 0;
      model['prep-service']       = !isNaN(cost.prepService)      ? cost.prepService      : 0;
      model['fulfillmentTotal']   = cost['inbound-delivery'] + cost['prep-service'];
    } else if(cost.costType === 'FBM') {
      reqOpt.url = urlMFN();

      model['shipping']           = !isNaN(cost.shipping)         ? cost.shipping         : 0;
      model['order-handling']     = !isNaN(cost.orderHandling)    ? cost.orderHandling    : 0;
      model['pick-pack']          = !isNaN(cost.pickPack)         ? cost.pickPack         : 0;
      model['outbound-delivery']  = !isNaN(cost.outboundDelivery) ? cost.outboundDelivery : 0;
      model['storage']            = !isNaN(cost.storage)          ? cost.storage          : 0;
      model['inbound-delivery']   = !isNaN(cost.inboundDelivery)  ? cost.inboundDelivery  : 0;
      model['customer-service']   = !isNaN(cost.customerService)  ? cost.customerService  : 0;
      model['prep-service']       = !isNaN(cost.prepService)      ? cost.prepService      : 0;
      model['revenueTotal']       = cost['price'] + cost['shipping'];
      model['fulfillmentTotal']   = cost['order-handling']
                                  + cost['pick-pack']
                                  + cost['outbound-delivery']
                                  + cost['storage']
                                  + cost['inbound-delivery']
                                  + cost['customer-service']
                                  + cost['prep-service'];
    }

    //console.log(JSON.stringify(model, null, 2)); // for debug

    // Send request
    reqOpt.form.model = JSON.stringify(model);

    request(reqOpt, function (err, res, body) {

      if(!err && res.statusCode === 200) {

        var resObj;

        if(reqOpt.json === true) {
          resObj    = body;
        } else {
          try {
            resObj  = JSON.parse(body);
          } catch(e) {
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
              asin: product.asin,
              cost: {
                merchant: {},
                amazon: resObj.data
              }
            };

            // merchant costs
            for(var costItem in cost) {
              if(cost.hasOwnProperty(costItem)) {
                tItem.cost.merchant[costItem] = cost[costItem];
              }
            }

            returnItems.push(tItem);
          }
        } else {
          returnErr = {
            "type": "fatal",
            "code": "amzcos-006",
            "source": "productCosts",
            "message": (resObj && resObj.error) ? ('' + resObj.error) : "Bad response!"
          };

          returnErrs.push(returnErr);
        }
      } else {
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

      if(callback && typeof callback === 'function') {
        return callback(returnErr, returnData);
      } else {
        return {"error": returnErr, "data": returnData};
      }
    });
  };

  // Returns tidy product object
  productTidy = function productTidy(product) {

    var returnData = null;

    if(product && typeof product === 'object') {
      returnData = {
        "asin": product.asin || null,
        "title": product.title || null,
        "link": (product.asin) ? urlPrd().replace('{{asin}}', product.asin) : null,
        "image": (product.image) ? product.image.replace('_SL120_', '_SL512_') : null,
        "weight": {
          "unit": product.weightUnits || null,
          "weight": product.weight || null
        },
        "dimension": {
          "unit": product.dimUnits || null,
          "length": (product.dimensions && product.dimensions.length) || null,
          "height": (product.dimensions && product.dimensions.height) || null,
          "width": (product.dimensions && product.dimensions.width) || null
        },
        "other": {
          "prodcutGroupId": product.productGroup || null,
          "prodcutGroupCode": product.gl || null,
          "subCategoryId": product.subCategory || null,
          "whiteGlovesRequired": product.whiteGlovesRequired || null
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