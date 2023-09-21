const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  issue_title: {
    required: true,
    type: String
  },
  issue_text: {
    required: true,
    type: String
  },
  created_by: {
    required: true,
    type: String
  },
  assigned_to: String,
  open: Boolean,
  status_text: String,
  created_on: {
    required: true,
    type: Date,
  },
  updated_on: {
    required: true,
    type: Date,
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String
  },
  issues: [{ type: mongoose.Schema.ObjectId, ref: 'Issue' }]
})

module.exports = {
  Issue: mongoose.model('Issue', issueSchema),
  Project: mongoose.model('Project', projectSchema)
}