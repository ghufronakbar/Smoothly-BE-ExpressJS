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

  app.route('/api/pelanggan/profile/edit')
    .put(PelangganVerification, PelangganController.account_controller.editProfile);

  app.route('/api/pelanggan/profile/password')
    .put(PelangganVerification, PelangganController.account_controller.editPassword);


  // EVENT CONTROLLER
  app.route('/api/pelanggan/events') // ?limit=(int)
    .get(PelangganVerification, PelangganController.event_controller.eventAll);

  app.route('/api/pelanggan/events/recommended') // RANDOM ?limit=(int)
    .get(PelangganVerification, PelangganController.event_controller.eventRecommended);

  app.route('/api/pelanggan/event/:id_event')
    .get(PelangganVerification, PelangganController.event_controller.eventId);


  // HISTORY CONTROLLER
  app.route('/api/pelanggan/histories') // ?paid=(int)
    .get(PelangganVerification, PelangganController.history_controller.showHistory);

  app.route('/api/pelanggan/history/:id_history')
    .get(PelangganVerification, PelangganController.history_controller.showHistoryId);


  // ORDER CONTROLLER
  // POST MAKE ORDER => HISTORIES(AMOUNT) PAID = 0 (TOTAL = PRICE * AMOUNT + 3INT)
  // => RESPONSE PLEASE PAY IN 10 MINUTES
  // PUT CANCEL ORDER => SET PAID = 1
  // PUT CONFIRM ORDER => CHECK 10 MINUTES => SET T.SOLD += H.AMOUNT => SET PAID =2 => SET UNIQUE CODE => RESPONSE WAITING CONFIRM

  app.route('/api/pelanggan/order')
    .post(PelangganVerification, PelangganController.order_controller.makeOrder);

  app.route('/api/pelanggan/order/cancel/:id_history')
    .put(PelangganVerification, PelangganController.order_controller.cancelOrder);

  app.route('/api/pelanggan/order/confirm/:id_history')
    .put(PelangganVerification, PelangganController.order_controller.confirmOrder);

};

