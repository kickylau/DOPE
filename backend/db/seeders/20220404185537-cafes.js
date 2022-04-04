'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

      // Add altering commands here.
      // Return a promise to correctly handle asynchronicity.

      // Example:
      return queryInterface.bulkInsert('Cafe', [{
        ownerId: 1,
        title: "Ben & Jerry",
        description: "Lower East Side Your Pet Friendly Cafe",
        img: 'https://images.unsplash.com/photo-1536783006430-a4134d1c4748?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
        address: "15 hudson yards",
        city: "New York",
        zipCode: "10001"
      }], {});

  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:

    */return queryInterface.bulkDelete('Cafe', null, {});
  }
};
