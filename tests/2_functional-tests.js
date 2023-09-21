const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional POST Tests', function() {
  test('Create an issue with every field', function(done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest/')
      .send({
        issue_title: "Func. test 1",
        issue_text: "Post with all fields",
        created_by: "Myself",
        assigned_to: "Myself",
        status_text: "To Do"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.issue_title, 'Func. test 1');
        assert.equal(res.body.issue_text, 'Post with all fields');
        assert.equal(res.body.created_by, 'Myself');
        assert.equal(res.body.assigned_to, 'Myself');
        assert.equal(res.body.open, true);
        assert.equal(res.body.status_text, 'To Do');
        done();
      });
  });
  test('Create an issue with only required fields', function(done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest/')
      .send({
        issue_title: "Func. test 2",
        issue_text: "Post with required fields",
        created_by: "Myself",
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.issue_title, 'Func. test 2');
        assert.equal(res.body.issue_text, 'Post with required fields');
        assert.equal(res.body.created_by, 'Myself');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.open, true);
        assert.equal(res.body.status_text, '');
        done();
      });
  });
  test('Create an issue with missing required fields', function(done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest/')
      .send({
        issue_title: "Func. test 3",
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });
});


suite('Functional GET Tests', function() {
  test('View issues on a project', function(done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/apitest/')
      .end(async function(err, res) {
        assert.equal(res.status, 200);
        expect(res.body).to.be.an('array')
        done();
      });
  });
  test('View issues on a project with one filter', function(done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/apitest?open=true')
      .end(async function(err, res) {
        assert.equal(res.status, 200);
        expect(res.body).to.be.an('array')
        done();
      });
  });
  test('View issues on a project with multiple filters', function(done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/apitest?open=true&assigned_to=Myself')
      .end(async function(err, res) {
        assert.equal(res.status, 200);
        expect(res.body).to.be.an('array')
        done();
      });
  });
});


suite('Functional PUT Tests', function() {
  test('Update one field on an issue', function(done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest/')
      .send({
        _id: '6502f9ef06bb47016fffc7e4',
        issue_title: "Func. test 4",
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        if (res.body.hasOwnProperty('result')) {
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, '6502f9ef06bb47016fffc7e4');
        } else {
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, '6502f9ef06bb47016fffc7e4');
        }
        done();
      });
  });
  test('Update multiple fields on an issue', function(done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest/')
      .send({
        _id: '6502f9ef06bb47016fffc7e4',
        issue_title: "Func. test 5",
        issue_text: "PUT more than one field"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        if (res.body.hasOwnProperty('result')) {
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, '6502f9ef06bb47016fffc7e4');
        } else {
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, '6502f9ef06bb47016fffc7e4');
        }
        done();
      });
  });
  test('Update an issue with missing _id', function(done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest/')
      .send({
        issue_title: "Func. test 6",
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
  test('Update an issue with no fields to update', function(done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest/')
      .send({
        _id: '6502f9ef06bb47016fffc7e4',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.equal(res.body._id, '6502f9ef06bb47016fffc7e4');
        done();
      });
  });
  test('Update an issue with an invalid _id', function(done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest/')
      .send({
        _id: '6502f9e9b3fe19f9b1111111',
        issue_title: "Func. test 7",
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, '6502f9e9b3fe19f9b1111111');
        done();
      });
  });
});


suite('Functional DELETE Tests', function() {
  test('Delete an issue', function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/apitest/')
      .send({
        _id: '6502f9e9b3fe19f9b5432c29',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        if (res.body.hasOwnProperty('result')) {
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, '6502f9e9b3fe19f9b5432c29');
        } else {
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, '6502f9e9b3fe19f9b5432c29');
        }
        done();
      });
  });
  test('Delete an issue with an invalid _id', function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/apitest/')
      .send({
        _id: '6502f9e9b3fe19f9b1111111',
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body._id, '6502f9e9b3fe19f9b1111111');
        done();
      });
  });
  test('Delete an issue with missing _id', function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/apitest/')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});