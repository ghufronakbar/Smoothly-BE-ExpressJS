'use strict';

const connection = require('../../connection');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const config = require('../../config/secret');
const ip = require('ip');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/bukti-pembayaran/');
  },
  filename: function (req, file, cb) {
    // Mendapatkan ekstensi file
    const ext = file.originalname.split('.').pop();
    // Membuat string acak sepanjang 6 karakter
    const randomString = crypto.randomBytes(3).toString('hex');
    // Menggabungkan nama file asli dengan string acak dan ekstensi
    const newFilename = file.originalname.replace(`.${ext}`, `_${randomString}.${ext}`);
    cb(null, newFilename);
  }
});

const upload = multer({ storage: storage }).single('bukti_pembayaran');

exports.payTransaksi = async (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'Failed to upload image.' });
    } else if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
    }
    const { id_pemesanan } = req.params
    const { metode_pembayaran } = req.body;
    const bukti_pembayaran = req.file ? req.file.filename : null;

    const qSetStatusPemesanan = `UPDATE pemesanan SET status_pemesanan=1 WHERE id_pemesanan=?`
    connection.query(qSetStatusPemesanan, id_pemesanan,
      (error, rows) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ status: 500, message: "Internal Server Error" });
        } else {
          if (!bukti_pembayaran) {
            const qInsertPembayaran = `INSERT INTO pembayaran(metode_pembayaran,id_pemesanan) VALUES(?,?)`
            const vInsertPembayaran = [metode_pembayaran, id_pemesanan]
            connection.query(qInsertPembayaran, vInsertPembayaran,
              (error, rows) => {
                if (error) {
                  console.log(error);
                  return res.status(500).json({ status: 500, message: "Internal Server Error" });
                } else {
                  return res.status(200).json({ status: 200, message: `Pesanan dengan COD, tunggu konfirmasi admin` })
                }
              }
            )
          } else {
            const qInsertPembayaran = `INSERT INTO pembayaran(metode_pembayaran,bukti_pembayaran,id_pemesanan) VALUES(?,?,?)`
            const vInsertPembayaran = [metode_pembayaran, bukti_pembayaran, id_pemesanan]
            connection.query(qInsertPembayaran, vInsertPembayaran,
              (error, rows) => {
                if (error) {
                  console.log(error);
                  return res.status(500).json({ status: 500, message: "Internal Server Error" });
                } else {
                  return res.status(200).json({ status: 200, message: `Pembayaran berhasil, tunggu konfirmasi admin` })
                }
              }
            )
          }
        }
      }
    )
  })
}


exports.makeTransaksi = async (req, res) => {
  const { id_layanan, jumlah_sepatu, catatan_pelanggan, latitude, longitude } = req.body
  const { id_pelanggan } = req.decoded

  if (!(id_layanan || jumlah_sepatu || catatan_pelanggan || longitude || latitude)) {
    return res.status(400).json({ status: 400, message: `Field tidak boleh kosong` })
  }
  connection.query(`SELECT nama, email, no_telepon FROM pelanggan WHERE id_pelanggan=?`, id_pelanggan,
    (error, rows) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
      } else {
        const { nama, email, no_telepon } = rows[0]
        connection.query(`SELECT toko_latitude, toko_longitude FROM admin WHERE id_admin=1`,
          (error, rows) => {
            if (error) {
              console.log(error);
              return res.status(500).json({ status: 500, message: "Internal Server Error" });
            } else {
              const { toko_latitude, toko_longitude } = rows[0]
              const calculateDistance = (lat1, lon1, lat2, lon2) => {
                // Convert latitude and longitude from degrees to radians
                const R = 6371; // Radius of the Earth in kilometers
                const dLat = (lat2 - lat1) * (Math.PI / 180); // Difference in latitude in radians
                const dLon = (lon2 - lon1) * (Math.PI / 180); // Difference in longitude in radians

                // Convert latitude to radians
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);

                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = R * c; // Distance in kilometers

                return distance;
              }
              const distance = calculateDistance(parseFloat(toko_latitude), parseFloat(toko_longitude), parseFloat(latitude), parseFloat(longitude));
              const distanceRounding = distance.toFixed(2)
              let shippingCost = distanceRounding * 1000

              if(jumlah_sepatu>1){
                shippingCost = 0
              }

              const qLayanan = `SELECT * FROM layanan WHERE id_layanan=?`
              connection.query(qLayanan, id_layanan,
                (error, rows) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).json({ status: 500, message: "Internal Server Error" });
                  } else {
                    const { harga, nama_layanan } = rows[0]
                    const sub_total = harga * jumlah_sepatu
                    const final_total = sub_total + shippingCost
                    const qInsertPemesanan = `INSERT INTO pemesanan(id_pelanggan,id_layanan,jumlah_sepatu,total_biaya,catatan_pelanggan,latitude,longitude) VALUES(?,?,?,?,?,?,?)`
                    const vInsertPemesanan = [id_pelanggan, id_layanan, jumlah_sepatu, final_total, catatan_pelanggan, latitude, longitude]
                    connection.query(qInsertPemesanan, vInsertPemesanan,
                      (error, rows) => {
                        if (error) {
                          console.log(error);
                          return res.status(500).json({ status: 500, message: "Internal Server Error" });
                        } else {
                          const currentdate = new Date();
                          const padZero = (num) => (num < 10 ? '0' : '') + num;
                          const datetime = currentdate.getDate() + "-"
                            + padZero(currentdate.getMonth() + 1) + "-"
                            + currentdate.getFullYear() + " "
                            + padZero(currentdate.getHours()) + ":"
                            + padZero(currentdate.getMinutes()) + ":"
                            + padZero(currentdate.getSeconds());
                          return res.status(200).json({
                            status: 200,
                            message: "Pesanan berhasil, mohon segera melakukan pembayaran",
                            pelanggan: {
                              nama,
                              email,
                              no_telepon
                            },
                            detail: {
                              layanan: nama_layanan,
                              jumlah_sepatu,
                              biaya_layanan_per_sepatu: harga,
                              sub_total: sub_total,
                              ongkos_kirim: shippingCost,
                              total: final_total,
                              tanggal_pemesanan: datetime
                            }
                          });
                        }
                      }
                    )
                  }
                }
              )
            }
          }
        )
      }
    }
  )
}