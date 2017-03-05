/* jslint node: true */
/* global describe: false, it: false */
'use strict';

var amzCosts = require('../'),
    expect   = require('chai').expect;

// Tests

describe('amzCosts', function() {

  // Init vars
  var asin  = 'B00BEZTMQ8',
      result;

  // Test for product search
  describe('productSearch', function() {
    it.skip('should search for ASIN ' + asin, function(done) {

      // Search product
      amzCosts.productSearch(asin, function(err, data) {
        if(err) {
          done(err.message);
          return;
        }

        expect(data).to.have.property('items');
        expect(data.items).to.be.a('array');
        expect(data.items[0]).to.be.a('object');
        expect(data.items[0]).to.have.property('asin', asin);

        result = data;
        done();
      });
    });
  });

  // Test for product search result
  describe('productSearch result', function() {
    it.skip('should be valid for ASIN ' + asin, function(done) {
      if(!result || !(result.items instanceof Array) || result.items[0] && result.items[0].asin !== asin) {
        done('Invalid product!');
      } else {
        done();
      }
    });
  });

  // Test for product costs - FBA
  describe('productCosts', function() {
    it.skip('should calculate FBA costs for ASIN ' + asin, function(done) {

      // Costs for FBA
      amzCosts.productCosts({
        product: result.items[0],
        cost: {
          costType: 'FBA',
          productPrice: 25.00,
          inboundDelivery: 1.00,
          prepService: 1.00
        }
      }, function(err, data) {
        if(err) {
          done(err.message);
          return;
        }

        expect(data).to.have.property('items');
        expect(data.items).to.be.a('array');
        expect(data.items[0]).to.be.a('object');
        expect(data.items[0]).to.have.property('asin', asin);
        expect(data.items[0]).to.have.property('cost');
        expect(data.items[0].cost).to.be.a('object');
        expect(data.items[0].cost).to.have.property('amazon');
        expect(data.items[0].cost.amazon).to.be.a('object');
        done();
      });
    });
  });

  // Test for product costs - FBM
  describe('productCosts', function() {
    it.skip('should calculate FBM costs for ASIN ' + asin, function(done) {

      // Costs for FBA
      amzCosts.productCosts({
        product: result.items[0],
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
        if(err) {
          done(err.message);
          return;
        }

        expect(data).to.have.property('items');
        expect(data.items).to.be.a('array');
        expect(data.items[0]).to.be.a('object');
        expect(data.items[0]).to.have.property('asin', asin);
        expect(data.items[0]).to.have.property('cost');
        expect(data.items[0].cost).to.be.a('object');
        expect(data.items[0].cost).to.have.property('merchant');
        expect(data.items[0].cost.amazon).to.be.a('object');
        done();
      });
    });
  });

  // Test for product tidy
  describe('productTidy', function() {
    it.skip('should run without any error for ASIN ' + asin, function(done) {

      // Tidy product
      var prodTidy = amzCosts.productTidy(result.items[0]);

      expect(prodTidy).to.be.a('object');
      expect(prodTidy).to.have.property('asin', asin);
      expect(prodTidy).to.have.property('weight');
      expect(prodTidy.weight).to.be.a('object');
      expect(prodTidy).to.have.property('dimension');
      expect(prodTidy.dimension).to.be.a('object');
      expect(prodTidy).to.have.property('other');
      expect(prodTidy.other).to.be.a('object');

      done();
    });
  });

});