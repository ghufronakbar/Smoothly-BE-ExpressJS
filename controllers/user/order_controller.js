'use strict';

const response = require('../../res');
const connection = require('../../connection');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const config = require('../../config/secret');
const ip = require('ip');

// return res.status(500).json({ status: 500, message: "Internal Server Error" });

exports.makeOrder = async (req, res) => {
    const id_user = req.decoded.id_user
    const { id_ticket, amount } = req.body

    if (!(id_ticket || amount)) {
        return res.status(400).json({ status: 400, message: "Field can't be blank" });
    } else {        
        const qValidatePayment = `SELECT * FROM histories WHERE datetime > DATE_SUB(NOW(), INTERVAL 10 MINUTE) AND paid=0 AND id_user=?`
        connection.query(qValidatePayment, id_user,
            (error, r, result) => {
                if (error) {
                    return res.status(500).json({ status: 500, message: "Internal Server Error" });
                } else {
                    if (r.length > 0) {
                        return res.status(400).json({ status: 400, message: "Please pay the previous pending payment" });
                    } else {
                        const qValidateTicket = `SELECT * FROM tickets JOIN events WHERE tickets.id_event = events.id_event AND tickets.id_ticket=?`
                        connection.query(qValidateTicket, id_ticket,
                            (error, rows, result) => {
                                if (error) {
                                    return res.status(500).json({ status: 500, message: "Internal Server Error" });
                                } else {
                                    const validateAmount = rows[0].amount - rows[0].sold
                                    const { id_organization, event_name, type, price } = rows[0]
                                    const random = Math.floor(Math.random() * 100)
                                    const total = parseInt(rows[0].price) * parseInt(amount) + random

                                    if (amount > validateAmount) {
                                        return res.status(400).json({ status: 400, message: "Can't checkout order than available amount" });
                                    } else {
                                        const qInsertHistory = `INSERT INTO histories
                                                                (id_organization,id_user,id_ticket,event_name,type_ticket,price,amount,total,datetime)
                                                                VALUES(?,?,?,?,?,?,?,?,?)`
                                        const vInsertHistory = [id_organization, id_user, id_ticket, event_name, type, price, amount, total, new Date()]

                                        connection.query(qInsertHistory, vInsertHistory,
                                            (error, rows, result) => {
                                                if (error) {
                                                    return res.status(500).json({ status: 500, message: "Internal Server Error" });
                                                } else {
                                                    return res.status(200).json({ status: 200, message: `Order success, please pay Rp ${total} before 10 minutes!` });
                                                }
                                            }
                                        )
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

exports.cancelOrder = async (req, res) => {
    const id_user = req.decoded.id_user
    const id_history = req.params.id_history

    const qCancelOrder = `UPDATE histories SET paid=1 WHERE id_history=? AND id_user=?`

    connection.query(qCancelOrder, [id_history, id_user],
        (error, rows, result) => {
            if (error) {
                return res.status(500).json({ status: 500, message: "Internal Server Error" });
            } else {
                return res.status(200).json({ status: 200, message: `Cancel order success` });
            }
        }
    )
}


exports.confirmOrder = async (req, res) => {
    const id_user = req.decoded.id_user;
    const id_history = req.params.id_history;

    // Query to get all relevant entries
    const qGetEntries = `
        SELECT h.*, t.id_event, t.sold,t.amount AS ticket_amount
        FROM histories AS h 
        JOIN tickets AS t ON h.id_ticket = t.id_ticket 
        WHERE h.id_user = ? AND h.id_history = ?`;

    connection.query(qGetEntries, [id_user, id_history], (error, rows) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ status: 500, message: "Internal Server Error" });
        }

        if (rows.length === 0) {
            return res.status(400).json({ status: 400, message: "No matching records found" });
        }

        const { id_history, id_user, id_event, id_ticket, amount, datetime, sold, ticket_amount, id_organization } = rows[0];

        // Convert datetime from database to JavaScript Date object
        const dbDatetime = new Date(datetime);

        // Add 10 minutes to the datetime
        const tenMinutesAfterDbDatetime = new Date(dbDatetime.getTime() + 10 * 60000);

        // Current time
        const now = new Date();

        // Compare times
        if (now > tenMinutesAfterDbDatetime) {
            return res.status(400).json({ status: 400, message: "Payment time has expired" });
        }

        if (ticket_amount - sold < amount) {
            return res.status(400).json({ status: 400, message: "Sorry, your purchase exceeded the total available. Maybe it's because you got ahead of someone else" });
        } else {
            const vSold = parseInt(sold + amount)
            const qUpdateSold = `UPDATE tickets SET sold=? WHERE id_ticket=?`
            const vUpdateSold = [vSold, id_ticket]
            connection.query(qUpdateSold, vUpdateSold,
                (error, rows, result) => {
                    if (error) {
                        console.error('Database query error:', error);
                        return res.status(500).json({ status: 500, message: "Internal Server Error" });
                    } else {
                        // Format datetime to YYYY-MM-DD
                        const formattedDatetime = dbDatetime.toISOString().split('T')[0];

                        const unique_code = `${id_history}/${id_user}/${id_organization}/${id_event}/${id_ticket}/${amount}/${formattedDatetime}`;

                        const qConfirmOrder = `
            UPDATE histories 
            SET paid = 3 
            WHERE id_history = ? 
              AND id_user = ?`;

                        const vConfirmOrder = [id_history, id_user];

                        connection.query(qConfirmOrder, vConfirmOrder, (error, result) => {
                            if (error) {
                                console.error('Database update error:', error);
                                return res.status(500).json({ status: 500, message: "Internal Server Error" });
                            }
                            return res.status(200).json({ status: 200, message: `Confirm order success, please wait for confirmation` });
                        });
                    }
                }
            )
        }
    });
};