var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var braintree = require("braintree"); 

var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//app.use(mongoose);

mongoose.connect('mongodb://beacondb:beacondb@nodecluster-shard-00-00-ldy3x.mongodb.net:27017,nodecluster-shard-00-01-ldy3x.mongodb.net:27017,nodecluster-shard-00-02-ldy3x.mongodb.net:27017/test?ssl=true&replicaSet=nodecluster-shard-0&authSource=admin&retryWrites=true',{
    useNewUrlParser:true
});

const schema = mongoose.Schema({
    discount:Number,
    name: String,
    photo:String,
    price:Number,
    region:String
});

var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "prdx3s7kq3n39jyd",
    publicKey: "y26hhtmxnd4zrqyj",
    privateKey: "43fc8e6a83c46105851044161eff1e0f"
  });

const Product = mongoose.model('schema',schema);

app.get("/client_token", function (req, res) {
    gateway.clientToken.generate({}, function (err, response) {
      res.send({"token":response.clientToken});
    });
  });

  app.post("/checkout", function (req, res) {
    var nonceFromTheClient = req.body.payment_method_nonce;
    gateway.transaction.sale({
        amount: "10.00",
        paymentMethodNonce: nonceFromTheClient,
        options: {
          submitForSettlement: true
        }
      }, function (err, result) {

        if (error){

            res.send({"error":"UnAuthorized"});
        }
      });
  });

app.post('/addData',(req,res)=>{

     const product = new Product({
        discount:req.body.discount,
        name: req.body.name,
        photo:req.body.photo,
        price:req.body.price,
        region:req.body.region
     });

     product.save().then(result => { 
        
        res.status(201).json({
            message:"created successfully",
            createdProduct:product
        });

     }).catch(err => {
         
        res.status(500).json({error:err});
     })

});

app.get('/getData', (req,res,next) =>{

    Product.find().sort({"region":1}).then(result =>
    {
        res.status(200).json(result);
    }).catch(error =>{
       res.status(500).json({err:error});
    })
});

app.listen(4000, () => {
    console.log("server is running at 4000");
});

app.get('/getproductdata/:region',(req,res) =>{

var type = req.params.region;

Product.find({"region":type}).then(result =>{

    res.status(200).json(result);
}).catch(error =>{
    res.status(500).json({err:error});
});



});




