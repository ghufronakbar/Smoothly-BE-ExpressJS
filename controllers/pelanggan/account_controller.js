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
    cb(null, 'images/profile/');
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

const upload = multer({ storage: storage }).single('foto_profile');


// LOGIN
exports.login = function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ status: 400, message: "Email and password are required" });
  }

  const query = "SELECT email, id_pelanggan FROM pelanggan WHERE password=? AND email=?";
  const values = [md5(password), email];

  connection.query(query, values, function (error, rows) {
    if (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
    if (rows.length === 1) {
      const id_pelanggan = rows[0].id_pelanggan;
      const token = jwt.sign({ id_pelanggan }, config.secret, { expiresIn: 1440 * 4 });
      const data = { id_pelanggan, token, ip_address: ip.address() };

      const insertQuery = "INSERT INTO akses_token SET ?";

      connection.query(insertQuery, data, function (insertError) {
        if (insertError) {
          console.error(insertError);
          return res.status(500).json({ success: false, message: "Internal server error" });
        }

        res.json({
          success: true,
          message: "Token JWT Generated!",
          token: token,
          currUser: id_pelanggan
        });
      });
    } else {
      return res.json({ status: 403, message: "Invalid Email or password" });
    }
  });
};

exports.register = async (req, res) => {
  const { nama, alamat, email, no_telepon, password, confirmation_password } = req.body
  console.log({ nama, alamat, email, no_telepon, password, confirmation_password })
  if (!nama || !email || !no_telepon || !password || !confirmation_password || !alamat) {
    return res.status(400).json({ status: 400, message: `Field tidak boleh kosong` })
  } else {
    connection.query(`SELECT * FROM pelanggan WHERE email=?`, [email],
      function (error, rows, result) {
        if (error) {
          console.log(error);
          return res.status(500).json({ status: 500, message: "Internal Server Error" });
        } else {
          const uniqueEmail = rows.length
          if (uniqueEmail) {
            return res.status(400).json({ status: 400, message: `Email ${email} sudah terdaftar` });
          } else {
            connection.query(`SELECT * FROM pelanggan WHERE no_telepon=?`, [no_telepon],
              (error, r, result) => {
                if (error) {
                  console.log(error);
                  return res.status(500).json({ status: 500, message: "Internal Server Error" });
                } else {
                  const uniqueno_telepon = r.length
                  if (uniqueno_telepon) {
                    return res.status(400).json({ status: 400, message: `Nomor ${no_telepon} sudah terdaftar` });
                  } else {
                    if (password != confirmation_password) {
                      return res.status(400).json({ status: 400, message: `Konfirmasi password salah` })
                    } else {
                      const qRegiter = `INSERT INTO pelanggan(nama,email,no_telepon,password,alamat) VALUES(?,?,?,?,?)`
                      const vRegister = [nama, email, no_telepon, md5(password), alamat]
                      connection.query(qRegiter, vRegister,
                        function (error, rows, result) {
                          if (error) {
                            console.log(error);
                            return res.status(500).json({ status: 500, message: "Internal Server Error" });
                          } else {
                            return res.status(200).json({ status: 200, message: "Register berhasil" });
                          }
                        }
                      )
                    }
                  }
                }
              }
            )
          }
        }
      }
    )
  }
}

exports.profile = async (req, res) => {
  const id_pelanggan = req.decoded.id_pelanggan;

  connection.query(`SELECT * FROM pelanggan WHERE id_pelanggan=?`, [id_pelanggan], function (error, rows, fields) {
    if (error) {
      console.log(error);
      return res.status(500).json({ status: 500, message: "Internal Server Error" });
    } else {
      if (rows.length > 0) {
        const profileData = rows.map(row => ({
          id_pelanggan: row.id_pelanggan,
          nama: row.nama,
          alamat: row.alamat,
          email: row.email,
          no_telepon: row.no_telepon,
          foto_profil: row.foto_profil ? process.env.BASE_URL + `/images/profile/` + row.foto_profil : process.env.BASE_URL + `/images/profile/default_user.png`,
          created_at: row.created_at,
          updated_at: row.updated_at
        }));

        return res.status(200).json({ status: 200, rows: profileData });
      } else {
        return res.status(404).json({ status: 404, message: "Profile not found" });
      }
    }
  });
};


exports.editProfile = async (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'Failed to upload image.' });
    } else if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
    }

    const id_pelanggan = req.decoded.id_pelanggan;
    const { nama, alamat, email, no_telepon } = req.body;
    const foto_profil = req.file ? req.file.filename : null;

    if (!nama || !email || !no_telepon || !alamat) {
      return res.status(400).json({ status: 400, message: `Field tidak boleh kosong` });
    } else {
      connection.query(`SELECT email, no_telepon, foto_profil FROM pelanggan WHERE id_pelanggan=?`, [id_pelanggan], (error, r) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ status: 500, message: "Internal Server Error" });
        } else {
          const currentFotoProfil = r[0].foto_profil;

          if (foto_profil) {
            if (currentFotoProfil) {
              // Hapus file foto profil lama
              const oldPath = path.join(__dirname, '../../images/profile', currentFotoProfil);
              fs.unlink(oldPath, (err) => {
                if (err) console.log(err);
              });
            }

            connection.query(`UPDATE pelanggan SET foto_profil=? WHERE id_pelanggan=?`, [foto_profil, id_pelanggan], (error) => {
              if (error) {
                console.log(error);
                return res.status(500).json({ status: 500, message: "Internal Server Error" });
              }
            });
          }

          connection.query(`SELECT * FROM pelanggan WHERE (email=? OR no_telepon=?) AND id_pelanggan<>?`, [email, no_telepon, id_pelanggan], (error, rows) => {
            if (error) {
              console.log(error);
              return res.status(500).json({ status: 500, message: "Internal Server Error" });
            } else {
              if (rows.length > 0) {
                const existingUser = rows[0];
                if (existingUser.email === email) {
                  return res.status(401).json({ status: 401, message: `Email ${email} sudah terdaftar` });
                }
                if (existingUser.no_telepon === no_telepon) {
                  return res.status(401).json({ status: 401, message: `Nomor telepon ${no_telepon} sudah terdaftar` });
                }
              }

              const qEditProfile = `UPDATE pelanggan SET nama=?, email=?, no_telepon=?, alamat=? WHERE id_pelanggan=?`;
              const vEditProfile = [nama, email, no_telepon, alamat, id_pelanggan];
              connection.query(qEditProfile, vEditProfile, (error) => {
                if (error) {
                  console.log(error);
                  return res.status(500).json({ status: 500, message: "Internal Server Error" });
                } else {
                  return res.status(200).json({ status: 200, message: "Berhasil mengedit profile" });
                }
              });
            }
          });
        }
      });
    }
  });
};


exports.editPassword = async (req, res) => {
  const { old_password, new_password, confirmation_password } = req.body;
  const id_pelanggan = req.decoded.id_pelanggan;

  if (!old_password || !new_password || !confirmation_password) {
    return res.status(400).json({ status: 400, message: "Field can't be blank" });
  }

  if (new_password !== confirmation_password) {
    return res.status(400).json({ status: 400, message: "Password baru dan konfirmasi password tidak cocok" });
  }

  connection.query(`
    SELECT password FROM pelanggan WHERE id_pelanggan = ?`,
    [id_pelanggan],
    (error, rows) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
      } 

      if (rows.length > 0) {
        if (rows[0].password === md5(old_password)) {
          connection.query(`
            UPDATE pelanggan SET password=? WHERE id_pelanggan=?`,
            [md5(new_password), id_pelanggan],
            (error) => {
              if (error) {
                console.log(error);
                return res.status(500).json({ status: 500, message: "Internal Server Error" });
              } 
              return res.status(200).json({ status: 200, message: "Berhasil mengedit password" });
            }
          );
        } else {
          return res.status(400).json({ status: 400, message: "Password lama tidak cocok" });
        }
      } else {
        return res.status(400).json({ status: 400, message: "Pengguna tidak ditemukan" });
      }
    }
  );
};
