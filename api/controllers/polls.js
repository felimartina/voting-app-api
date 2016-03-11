/**
 * Created by Pipe on 3/10/2016.
 */
// 'use strict';
var _ = require("underscore");
var ObjectID = require('mongodb').ObjectID;
var errorHandler = require('../helpers/errorHandler');
var PollSchema = require('../models/pollModel');
var UserSchema = require('../models/userModel');

module.exports = {
    getAllPolls: getAllPolls,
    getSinglePoll: getSinglePoll,
    vote: vote,
    getPollResults: getPollResults
};

/*
 Param 1: a handle to the request object
 Param 2: a handle to the response object
 */
function getAllPolls(req, res) {
    PollSchema.find({}, function (err, polls) {
        if (err)
            return errorHandler.handleError(req, res, 500, err);

        res.json(polls);
    });
}
/*
 Param 1: a handle to the request object
 Param 2: a handle to the response object
 */
function getSinglePoll(req, res) {
    var id = req.swagger.params.id.value;
    PollSchema.findById(id, function (err, poll) {
        if (err)
            return errorHandler.handleError(req, res, 500, err);
        if (!poll)
            return errorHandler.handleError(req, res, 404, new Error('Poll not found'));

        res.json(poll);
    });
}
/*
 Param 1: a handle to the request object
 Param 2: a handle to the response object
 */
function vote(req, res) {
    var id = req.swagger.params.id.value;
    var user_email = req.swagger.params.vote_parameters.value.user_email;
    var vote = req.swagger.params.vote_parameters.value.option_voted;
    //Validate user
    UserSchema.findOne({ user_email: user_email }, function(err, user){
        if (err)
            return errorHandler.handleError(req, res, 500, err);
        if (!user)
            return errorHandler.handleError(req, res, 500, new Error('User does not exist.'));

        //User exists, continue
        PollSchema.findById(id, function (err, poll) {
            if (err)
                return errorHandler.handleError(req, res, 500, err);
            if (!poll)
                return errorHandler.handleError(req, res, 404, new Error('Poll not found'));

            //check if voted option belongs to this poll
            //Check if user has voted already
            var vote_option_exists = _.some(poll.options, function(option) {
                return option.value === vote;
            });
            if (!vote_option_exists)
                return errorHandler.handleError(req, res, 500, new Error('Vote does not belong to this poll'));

            //Check if user has voted already
            var user_has_voted = _.some(poll.votes, function(vote) {
                return vote.user_email === user_email;
            });
            if (user_has_voted)
                return errorHandler.handleError(req, res, 500, new Error('User has voted for this poll already'));

            poll.votes.push( {user_email: user_email, vote: vote} );
            poll.save(function(err, saved_poll){
                if (err)
                    return errorHandler.handleError(req, res, 500, err);

                res.json(saved_poll);
            });
        });
    });
}

/*
 Param 1: a handle to the request object
 Param 2: a handle to the response object
 */
function getPollResults(req, res) {
    var id = req.swagger.params.id.value;
    PollSchema.aggregate([
        { $match: {
            _id: new ObjectID('56e18f6a2a4ab9436e0fde45')
        }},
        { $unwind: '$votes' },
        { $group: {
            _id: '$votes.vote',
            votes: { $sum: 1 }
        }},
        { $project: { _id: 0, option: "$_id", votes: 1} }
    ], function (err, results) {
        if (err) {
            return errorHandler.handleError(req, res, 500, err);
        }
        res.json(results);
    });
}
