"use strict";


module.exports = function (app) {
  const AdminController = require("../controllers/admin");
  const AdminVerification = require("../middleware/verifikasi-admin");

  //LOGIN
  app.route(`/api/admin/login`)
    .post(AdminController.account_controller.login);

  app.route(`/api/admin/profile`)
    .get(AdminVerification, AdminController.account_controller.profile);

  app.route(`/api/admin/profile`)
    .put(AdminVerification, AdminController.account_controller.editProfile);

  app.route(`/api/admin/profile/password`)
    .put(AdminVerification, AdminController.account_controller.editPassword);


  // ORGANIZATIONS
  app.route(`/api/admin/organizations`)
    .get(AdminVerification, AdminController.layanan_controller.orgShow);

  app.route(`/api/admin/organization/:id_organization`)
    .get(AdminVerification, AdminController.layanan_controller.orgShowId);

  app.route(`/api/admin/organization/approve/:id_organization`)
    .put(AdminVerification, AdminController.layanan_controller.orgApprove);

  app.route(`/api/admin/organization/banned/:id_organization`)
    .put(AdminVerification, AdminController.layanan_controller.orgBanned);

  app.route(`/api/admin/organization/reject/:id_organization`)
    .delete(AdminVerification, AdminController.layanan_controller.orgReject);

  // EVENTS
  app.route(`/api/admin/events`)
    .get(AdminVerification, AdminController.event_controller.eventShow);

  app.route(`/api/admin/event/:id_event`)
    .get(AdminVerification, AdminController.event_controller.eventShowId);

  app.route(`/api/admin/event/reject/:id_event`)
    .put(AdminVerification, AdminController.event_controller.eventReject);

  app.route(`/api/admin/event/approve/:id_event`)
    .put(AdminVerification, AdminController.event_controller.eventApprove);

};

