var express = require('express');
var router = express.Router();
var details = require("./details");
var client = require('flipkart-api-affiliate-client');
var _data = require('../lib/data');

// Intializing the new client
var fkClient = new client({
  trackingId: details.trackingId,
  token: details.token
}, "json");


/**
 * Root Route:
 * It will fetch all the categories available
 */
router.get("/", function (req, res, next) {
  var product = null;

  fkClient.getProductsFeedListing().then(function (value) {
    return new Promise(function (resolve, reject) {
      resolve(JSON.parse(value.body));
    })
  }).then(function (value) {

    var listings = Object.keys(value.apiGroups.affiliate.apiListings);
    res.render("index", { product, categories: listings });
  });
});

/**
 * Search for the product using filpkarts built in search function
 *
 */
router.post("/", function (req, res, next) {
  let search = req.body.search;

  fkClient.getProductsFeedListing().then(function (value) {
    return new Promise(function (resolve, reject) {
      resolve(JSON.parse(value.body));
    })
  }).then(function (value) {
    var listings = Object.keys(value.apiGroups.affiliate.apiListings);

    fkClient.doKeywordSearch(search, 10).then(function (value) {
      return new Promise(function (resolve, reject) {
        resolve(JSON.parse(value.body));
      })
    }).then(function (value) {
      //res.send(value);
      res.render("index", { product: value.products, categories: listings });
    })
  });
});

/**
 * Show all the products of a certain category
 * Write the data into a json file and store on the server
 * 
 */
router.get("/:category", function (req, res, next) {

  fkClient.getProductsFeedListing().then(function (value) {
    return new Promise(function (resolve, reject) {
      resolve(JSON.parse(value.body));
    })
  }).then(function (value) {

    var listings = Object.keys(value.apiGroups.affiliate.apiListings);
    var url = value.apiGroups.affiliate.apiListings[req.params.category].availableVariants['v1.1.0'].get;

    fkClient.getProductsFeed(url).then(function (data) {
      return new Promise(function (resolve, reject) {
        resolve(JSON.parse(data.body));
      })
    }).then(function (data) {
      var content = data;

      _data.read('data', req.params.category, function (err, data) {
        if (err) {
          _data.create('data', req.params.category, content, function (err) {
            if (!err) {
              res.render("index", { product: content.products, categories: listings });
            }
            else {
              res.send({ 'Error': 'Could not create a new file' })
            }
          });
        }
        else {
          res.render("index", { product: content.products, categories: listings });
        }
      });
    });
  });
});


/** 
 * 
 * Code for performing fuzzy search
 * 
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.post("/search", (req, res) => {
  var search = req.body.search;
  const regex = new RegExp(escapeRegex(search), 'gi');
  Products.find({ name: regex }, function (err, searchResult) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", { product: searchResult });
    }
  })
});
*
*/



module.exports = router;
