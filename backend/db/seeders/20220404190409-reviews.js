'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:

    */return queryInterface.bulkInsert('Reviews', [{
        userId: 1,
        businessId: 1,
        answer:"Dope Dope Dope"
      }], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:

    */return queryInterface.bulkDelete('Reviews', null, {});
  }
};
