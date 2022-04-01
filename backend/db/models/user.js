'use strict';
const { Validator } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 30],
        isNotEmail(value) {
          if (Validator.isEmail(value)) {
            throw new Error('Cannot be an email.');
          }
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 256]
      }
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: {
        len: [60, 60]
      }
    }
  },
    {
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt']
        }
      },
      scopes: {
        currentUser: {
          attributes: { exclude: ['hashedPassword'] }
        },
        loginUser: {
          attributes: {}
        }
      }
    });

  User.associate = function (models) {
    // associations can be defined here
  };

//For the default query when searching for Users,
//the hashedPassword, updatedAt, and, depending on your application, email and createdAt fields
//should not be returned. To do this, set a defaultScope on the User model to exclude the
// desired fields from the default query. For example, when you run User.findAll()
//all fields besides hashedPassword, updatedAt, email, and createdAt will be populated in the return of that query.

//Next, define a User model scope for currentUser that will exclude only the hashedPassword field.
//Finally, define another scope for including all the fields, which should only be used when checking the login credentials of a user.
//These scopes need to be explicitly used when querying.
//For example, User.scope('currentUser').findByPk(id) will find a User by the specified id and return only the User fields that the currentUser model scope allows.

//user model methods

//Define an instance method
User.prototype.toSafeObject = function() { // remember, this cannot be an arrow function
  const { id, username, email } = this; // context will be the User instance
  return { id, username, email };
};

//Define an instance method
User.prototype.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.hashedPassword.toString());
 };

 //Define a static method
 User.getCurrentUserById = async function (id) {
  return await User.scope('currentUser').findByPk(id);
 };

 //Define a static method
 User.login = async function ({ credential, password }) {
  const { Op } = require('sequelize');
  const user = await User.scope('loginUser').findOne({
    where: {
      [Op.or]: { //Op.or --> sequelize method to query either..or
        username: credential,
        email: credential
      }
    }
  });
  if (user && user.validatePassword(password)) {
    return await User.scope('currentUser').findByPk(user.id);
  }
};

User.signup = async function ({ username, email, password }) {
  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({
    username,
    email,
    hashedPassword
  });
  return await User.scope('currentUser').findByPk(user.id);
};

//Define a static method User.login in the user.js model file.
//It should accept an object with credential and password keys.
//The method should search for one User with the specified credential
//(either a username or an email). If a user is found,
//then the method should validate the password by passing it into the instance's .validatePassword method.
//If the password is valid, then the method should return the user by using the currentUser scope.
  return User;
};
