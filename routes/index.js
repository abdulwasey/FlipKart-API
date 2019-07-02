var express = require('express');
var router = express.Router();
var details = require("./details");
var client = require('flipkart-api-affiliate-client');


var fkClient = new client({
  trackingId: details.trackingId,
  token: details.token
}, "json");


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render("index");
});

router.post("/", function (req, res, next) {
  let product = req.body.product;
  fkClient.doKeywordSearch(product).then(function (value) {
    return new Promise(function (resolve, reject) {
      resolve(JSON.parse(value.body));
    })
  }).then(function (value) {
    res.send(value);
  })
})
module.exports = router;
// fkClient.getProductsFeedListing().then(function(value){
//   return new Promise(function(resolve,reject){
//     resolve(JSON.parse(value.body));
//   })
// }).then(function(value){
//  var listings = Object.keys(value.apiGroups.affiliate.apiListings);
//  res.render('index', { title: value.title,listings:listings });
// })