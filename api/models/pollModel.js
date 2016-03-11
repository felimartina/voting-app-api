/**
 * Created by Pipe on 3/10/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OptionSchema = new Schema({
    display_name: String,
    image: String,
    value: String
},{ _id : false });

var VoteSchema = new Schema({
    user_email: String,
    vote: String
},{ _id : false });

var PollSchema = new Schema({
    open_date: Date,
    close_date: Date,
    closed: Boolean,
    options: [OptionSchema],
    votes: [VoteSchema]
});
PollSchema.methods.toJSON = function () {
    var obj = this.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    return obj;
};
module.exports = mongoose.model('Poll', PollSchema);