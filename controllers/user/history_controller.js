'use strict';

const response = require('../../res');
const connection = require('../../connection');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const config = require('../../config/secret');
const ip = require('ip');

exports.showHistory = async (req, res) => {
  const id_user = req.decoded.id_user;
  const { paid } = req.query;

  // Membuat bagian dari query tergantung apakah 'paid' disediakan atau tidak
  const queryPaid = paid !== undefined ? ` AND h.paid=${paid}` : "";

  // Query utama dengan tambahan kondisi 'paid' jika ada
  const qShowHistory = `SELECT h.id_history, h.event_name, h.type_ticket, h.price, h.amount,
                          h.total, h.unique_code, h.paid, h.used, h.datetime,
                          u.fullname, u.email, u.phone
                          FROM histories AS h 
                          JOIN users AS u ON h.id_user = u.id_user
                          WHERE h.id_user=?${queryPaid}`;

  await connection.query(qShowHistory, [id_user],
      (error, rows, result) => {
          if (error) {
              console.log(error);
              return res.status(500).json({ status: 500, message: "Internal Server Error" });
          } else {
              return res.status(200).json(rows);
          }
      }
  );
};

exports.showHistoryId = async (req, res) => {
  const id_user = req.decoded.id_user
  const { id_history } = req.params
  const qShowHistory = `SELECT h.id_history, h.event_name, h.type_ticket, h.price, h.amount,
                          h.total, h.unique_code, h.paid, h.used, h.datetime,
                          u.fullname, u.email, u.phone
                          FROM histories AS h JOIN users AS u
                          WHERE h.id_user = u.id_user
                          AND h.id_user=? AND h.id_history=?`

  await connection.query(qShowHistory, [id_user, id_history],
      (error, rows, result) => {
          if (error) {
              console.log(error);
              return res.status(500).json({ status: 500, message: "Internal Server Error" });
          } else {
              return res.status(200).json(rows);
          }
      }
  )
}


