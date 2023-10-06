const assert = require('chai').assert;

const { getUserByEmail } = require('../helpers');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedUser = testUsers["userRandomID"];

    assert.strictEqual(user, expectedUser);
  });
  it('should return undefined if not a valid email', function() {
    const user = getUserByEmail(testUsers, "user@nope.com");

    assert.strictEqual(user, undefined);
  });
});