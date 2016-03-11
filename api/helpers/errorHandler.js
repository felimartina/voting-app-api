/**
 * Created by Pipe on 3/10/2016.
 */
var logger = require('./logger');
module.exports = {
    handleError: function(req, res, status_code, err) {
        logger.error(err);
        return res.status(status_code).send({message: err.message});
    }
};