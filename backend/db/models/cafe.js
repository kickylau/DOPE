'use strict';
//const { Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Cafe = sequelize.define('Cafe', {
    title: {
      validate: {
        notEmpty: true
      },
      type: DataTypes.STRING(80)
    },
    description: {
      validate: {
        notEmpty: true
      },
      type: DataTypes.TEXT
    },
    img:  {
      validate: {
        notEmpty: true
      },
      type: DataTypes.STRING
    },
    address:  {
      validate: {
        notEmpty: true
      },
      type: DataTypes.TEXT
    },
    city:  {
      validate: {
        notEmpty: true
      },
      type: DataTypes.TEXT
    },
    zipCode: {
      validate: {
        notEmpty: true
      },
      type: DataTypes.TEXT
    },
    ownerId: {
      validate: {
        notEmpty: true
      },
      type: DataTypes.INTEGER
    },
  }, {freezeTableName: true,});
  Cafe.associate = function(models) {
    Cafe.hasMany(models.Review,{foreignKey:"businessId", onDelete:"cascade", hooks:true})
    Cafe.belongsTo(models.User,{foreignKey:"ownerId"})




    // associations can be defined here
  };
  return Cafe;
};
