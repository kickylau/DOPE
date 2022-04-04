'use strict';
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    userId: {
      validate: {
        notEmpty: true
      },
      type: DataTypes.INTEGER
    },
    businessId: {
      validate: {
        notEmpty: true
      },
      type: DataTypes.INTEGER
    },
    answer: {
      validate: {
        notEmpty: true
      },
      type: DataTypes.TEXT
    },
  }, {});
  Review.associate = function(models) {
    Review.belongsTo(models.User, { foreignKey: "userId" });
    Review.belongsTo(models.Cafe, { foreignKey: "businessId" });
    // associations can be defined here
  };
  return Review;
};
