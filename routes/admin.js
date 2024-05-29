"use strict";


module.exports = function (app) {
  const AdminController = require("../controllers/admin");
  const AdminVerification = require("../middleware/verifikasi-admin");

  // ACCOUNT CONTROLLER
  app.route(`/api/admin/login`)
    .post(AdminController.account_controller.login);

  app.route(`/api/admin/profile`)
    .get(AdminVerification, AdminController.account_controller.profile);

  app.route(`/api/admin/profile`)
    .put(AdminVerification, AdminController.account_controller.editProfile);

  app.route(`/api/admin/profile/password`)
    .put(AdminVerification, AdminController.account_controller.editPassword);


  // LAYANAN CONTROLLER
  app.route(`/api/admin/layanan`)
    .get(AdminVerification, AdminController.layanan_controller.showLayanan);

  app.route(`/api/admin/layanan/:id_layanan`)
    .get(AdminVerification, AdminController.layanan_controller.showLayananId);

  app.route(`/api/admin/layanan`)
    .post(AdminVerification, AdminController.layanan_controller.addLayanan);

  app.route(`/api/admin/layanan/:id_layanan`)
    .put(AdminVerification, AdminController.layanan_controller.editLayanan);

  app.route(`/api/admin/layanan/:id_layanan`)
    .delete(AdminVerification, AdminController.layanan_controller.deleteLayanan);

  // EVENTS
  // app.route(`/api/admin/events`)
  //   .get(AdminVerification, AdminController.event_controller.eventShow);

  // app.route(`/api/admin/event/:id_event`)
  //   .get(AdminVerification, AdminController.event_controller.eventShowId);

  // app.route(`/api/admin/event/reject/:id_event`)
  //   .put(AdminVerification, AdminController.event_controller.eventReject);

  // app.route(`/api/admin/event/approve/:id_event`)
  //   .put(AdminVerification, AdminController.event_controller.eventApprove);

};

