'use strict';
const bodyParser = require('body-parser');
const { Issue, Project } = require('../models/model')

module.exports = function(app) {

  app.route('/api/issues/:project')

    .get(async (req, res) => {
      let project = req.params.project;

      let filter = req.query;

      if (filter.hasOwnProperty('open')) {
        filter.open = filter.open == 'true' ? true : false
      }

      let dbProj = await Project.findOne({ name: project })
        .populate({
          path: 'issues',
          match: filter
        })
        .exec();

      if (dbProj.issues) res.json(dbProj.issues);
    })

    .post(async (req, res) => {
      let project = req.params.project;
      let today = new Date(Date.now());

      if (!req.body.hasOwnProperty("issue_title") ||
        !req.body.hasOwnProperty("issue_text") ||
        !req.body.hasOwnProperty("created_by")) {
        res.send({ error: 'required field(s) missing' });
      }
      else {
        req.body.status_text = req.body.hasOwnProperty("status_text") ? req.body.status_text : "";
        req.body.assigned_to = req.body.hasOwnProperty("assigned_to") ? req.body.assigned_to : "";

        let newIssue = new Issue({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to,
          open: true,
          status_text: req.body.status_text,
          created_on: today.toISOString(),
          updated_on: today.toISOString(),
        });
        await newIssue.save();

        Project.findOneAndUpdate({ name: project },
          { $set: { name: project }, $push: { issues: newIssue._id } },
          { upsert: true, new: true }).exec();

        res.json(newIssue);
      }
    })

    .put(async (req, res) => {
      // let project = req.params.project;

      if (!req.body.hasOwnProperty("_id") || req.body._id == '') {
        res.send({ error: 'missing _id' });
      }
      else {
        Object.keys(req.body).forEach((k) => { if (req.body[k] === '') delete req.body[k] });

        if (Object.keys(req.body).length === 1) {
          res.send({ error: 'no update field(s) sent', '_id': req.body._id });
        }
        else {
          req.body.updated_on = new Date(Date.now()).toISOString();
          let issue = await Issue.findByIdAndUpdate(req.body._id,
            req.body,
            { new: true }).exec()

          if (issue == null) res.send({ error: 'could not update', '_id': req.body._id });
          else res.send({ result: 'successfully updated', '_id': issue._id });
        }
      }
    })

    .delete(async (req, res) => {
      let project = req.params.project;

      if (!req.body.hasOwnProperty("_id") || req.body._id == '') {
        res.send({ error: 'missing _id' });
      }
      else {
        let issue = await Issue.findByIdAndDelete(req.body._id)

        if (issue == null) res.send({ error: 'could not delete', '_id': req.body._id });
        else {
          Project.findOneAndUpdate({ name: project },
            { $pull: { issues: issue._id } }).exec();
          res.send({ result: 'successfully deleted', '_id': issue._id });
        }
      }
    });
};
