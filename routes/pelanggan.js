"use strict";


module.exports = function (app) {
  const PelangganController = require("../controllers/pelanggan");
  const PelangganVerification = require("../middleware/verifikasi-pelanggan");

  // ACCOUNT CONTROLLER
  app.route(`/api/pelanggan/register`)
    .post(PelangganController.account_controller.register);

  app.route(`/api/pelanggan/login`)
    .post(PelangganController.account_controller.login);

  app.route('/api/pelanggan/profile')
    .get(PelangganVerification, PelangganController.account_controller.profile);

  app.route('/api/pelanggan/profile')
    .put(PelangganVerification, PelangganController.account_controller.editProfile);

  app.route('/api/pelanggan/profile/password')
    .put(PelangganVerification, PelangganController.account_controller.editPassword);


  

};

