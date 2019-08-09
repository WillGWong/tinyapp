const { assert } = require('chai');

const { getIDbyEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getIDbyEmail', function() {
  it('should return a user with valid email', function() {
    const user = getIDbyEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput)
  });
  it("should return false", function () {
    const wrongUser = getIDbyEmail("DNE@notthere.com", testUsers)
    assert.equal(wrongUser, null)
  })
});