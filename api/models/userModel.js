/**
 * Created by Pipe on 3/10/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    user_email: String
});
UserSchema.methods.toJSON = function() {
    var obj = this.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    return obj;
};
module.exports = mongoose.model('User', UserSchema);