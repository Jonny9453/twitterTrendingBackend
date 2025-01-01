const mongoose = require('mongoose');

const TrendsSchema=new mongoose.Schema({
    unique_id: {type:String, require:true},
    trend1:{type:String},
    trend2:{type:String},
    trend3: {type:String},
    trend4: {type:String},
    trend5:{type:String },
    end_time: { type: Date, default: Date.now },
    ip_address: {type:String, require:true}
})




const TrendsModel=mongoose.model('Trends', TrendsSchema)

module.exports = {TrendsModel };