'use strict';

const response = require('../../res');
const connection = require('../../connection');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const config = require('../../config/secret');
const ip = require('ip');

exports.eventAll = async (req, res) => {
  const { limit } = req.query;

  let qLimit = '';

  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      qLimit = `LIMIT ${parsedLimit}`;
    }
  }

  const qEventShow = `
    SELECT e.id_event, e.id_organization, o.organization_name, e.event_name, e.description, e.location,
           e.event_image, e.site_plan_image, e.type AS event_type, e.status, e.payment_information,
           e.event_start, e.event_end, e.created_at, COALESCE(SUM(t.sold), 0) AS total_sold,
           COALESCE(SUM(t.amount), 0) AS total_ticket
    FROM events AS e
    LEFT JOIN tickets AS t ON e.id_event = t.id_event
    LEFT JOIN organizations AS o ON e.id_organization = o.id_organization
    WHERE e.event_end > CURDATE()
    GROUP BY e.id_event, e.id_organization, o.organization_name, e.event_name, e.description, e.location,
             e.event_image, e.site_plan_image, e.type, e.status, e.payment_information,
             e.event_start, e.event_end, e.created_at 
    ${qLimit}`;

  const qTickets = `
    SELECT id_ticket, id_event, type AS ticket_type, amount, sold, price, date_start, date_end
    FROM tickets
    WHERE id_event IN (SELECT id_event FROM events WHERE event_end > CURDATE())`;

  connection.query(qEventShow, function (error, eventRows) {
    if (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "Internal Server Error" });
    } else {
      connection.query(qTickets, function (ticketError, ticketRows) {
        if (ticketError) {
          console.log(ticketError);
          res.status(500).json({ status: 500, message: "Internal Server Error" });
        } else {
          // Process the event rows
          const events = {};

          eventRows.forEach(row => {
            const eventId = row.id_event;

            const now = new Date();
            const eventStart = new Date(row.event_start);
            const eventEnd = new Date(row.event_end);
            let event_status = "";
            let base_url_google_map = "https://google.com/maps?q=";
            let url_google_map = "";

            if (row.location) {
              let query_google_map = row.location.split(" ").join("+");
              url_google_map = base_url_google_map + query_google_map;
            }

            if (now > eventEnd) {
              event_status = "Past";
            } else if (now < eventStart) {
              event_status = "Soon";
            } else if (now >= eventStart && now <= eventEnd) {
              event_status = "On Going";
            }

            if (!events[eventId]) {
              events[eventId] = {
                id_event: row.id_event,
                id_organization: row.id_organization,
                organization_name: row.organization_name,
                event_name: row.event_name,
                description: row.description,
                location: row.location,
                event_image: row.event_image ? process.env.BASE_URL + `/images/event/` + row.event_image : null,
                site_plan_image: row.site_plan_image ? process.env.BASE_URL + `/images/site-plan/` + row.site_plan_image : null,
                url_google_map,
                event_type: row.event_type,
                status: row.status,
                payment_information: row.payment_information,
                event_start: row.event_start,
                event_end: row.event_end,
                event_status,
                created_at: row.created_at,
                total_ticket: row.total_ticket || 0,
                total_sold: row.total_sold || 0,
                tickets: []
              };
            }
          });

          // Process the ticket rows
          ticketRows.forEach(ticket => {
            const eventId = ticket.id_event;
            if (events[eventId]) {
              events[eventId].tickets.push({
                id_ticket: ticket.id_ticket,
                ticket_type: ticket.ticket_type,
                amount: ticket.amount,
                sold: ticket.sold,
                price: ticket.price,
                date_start: ticket.date_start,
                date_end: ticket.date_end
              });
            }
          });

          const result = Object.values(events);
          res.json(result);
        }
      });
    }
  });
};

exports.eventRecommended = async (req, res) => {
  const { limit } = req.query;

  let queryLimit = '';
  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      queryLimit = `LIMIT ${parsedLimit}`;
    }
  }

  const qEventShow = `
    SELECT e.id_event, e.id_organization, o.organization_name, e.event_name, e.description, e.location,
           e.event_image, e.site_plan_image, e.type AS event_type, e.status, e.payment_information,
           e.event_start, e.event_end, e.created_at, COALESCE(SUM(t.sold), 0) AS total_sold,
           COALESCE(SUM(t.amount), 0) AS total_ticket
    FROM events AS e
    LEFT JOIN tickets AS t ON e.id_event = t.id_event
    LEFT JOIN organizations AS o ON e.id_organization = o.id_organization
    WHERE e.event_end > CURDATE()
    GROUP BY e.id_event, e.id_organization, o.organization_name, e.event_name, e.description, e.location,
             e.event_image, e.site_plan_image, e.type, e.status, e.payment_information,
             e.event_start, e.event_end, e.created_at
    ${queryLimit}`;

  const qTickets = `
    SELECT id_ticket, id_event, type AS ticket_type, amount, sold, price, date_start, date_end
    FROM tickets
    WHERE id_event IN (SELECT id_event FROM events WHERE event_end > CURDATE())`;

  connection.query(qEventShow, function (error, eventRows) {
    if (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "Internal Server Error" });
    } else {
      connection.query(qTickets, function (ticketError, ticketRows) {
        if (ticketError) {
          console.log(ticketError);
          res.status(500).json({ status: 500, message: "Internal Server Error" });
        } else {
          // Process the event rows
          const events = {};

          eventRows.forEach(row => {
            const eventId = row.id_event;

            const now = new Date();
            const eventStart = new Date(row.event_start);
            const eventEnd = new Date(row.event_end);
            let event_status = "";
            let base_url_google_map = "https://google.com/maps?q=";
            let url_google_map = "";

            if (row.location) {
              let query_google_map = row.location.split(" ").join("+");
              url_google_map = base_url_google_map + query_google_map;
            }

            if (now > eventEnd) {
              event_status = "Past";
            } else if (now < eventStart) {
              event_status = "Soon";
            } else if (now >= eventStart && now <= eventEnd) {
              event_status = "On Going";
            }

            if (!events[eventId]) {
              events[eventId] = {
                id_event: row.id_event,
                id_organization: row.id_organization,
                organization_name: row.organization_name,
                event_name: row.event_name,
                description: row.description,
                location: row.location,
                event_image: row.event_image ? process.env.BASE_URL + `/images/event/` + row.event_image : null,
                site_plan_image: row.site_plan_image ? process.env.BASE_URL + `/images/site-plan/` + row.site_plan_image : null,
                url_google_map,
                event_type: row.event_type,
                status: row.status,
                payment_information: row.payment_information,
                event_start: row.event_start,
                event_end: row.event_end,
                event_status,
                created_at: row.created_at,
                total_ticket: row.total_ticket || 0,
                total_sold: row.total_sold || 0,
                tickets: []
              };
            }
          });

          // Process the ticket rows
          ticketRows.forEach(ticket => {
            const eventId = ticket.id_event;
            if (events[eventId]) {
              events[eventId].tickets.push({
                id_ticket: ticket.id_ticket,
                ticket_type: ticket.ticket_type,
                amount: ticket.amount,
                sold: ticket.sold,
                price: ticket.price,
                date_start: ticket.date_start,
                date_end: ticket.date_end
              });
            }
          });

          // Convert the events object to an array
          const result = Object.values(events);

          // Shuffle the array using Fisher-Yates shuffle
          for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
          }

          // If there's a limit, apply it to the shuffled array
          const limitedResult = queryLimit ? result.slice(0, parseInt(limit, 10)) : result;

          res.json(limitedResult);
        }
      });
    }
  });
};


exports.eventId = async (req, res) => {
  const { id_event } = req.params
  const qEventShowId = `
      SELECT e.id_event, e.id_organization, o.organization_name, e.event_name, e.description, e.location,
             e.event_image, e.site_plan_image, e.type AS event_type, e.status, e.payment_information,
             e.event_start, e.event_end, e.created_at, t.id_ticket, t.type AS ticket_type,
             t.amount, t.sold, t.price, t.date_start, t.date_end
      FROM events AS e 
      LEFT JOIN tickets AS t ON e.id_event = t.id_event
      LEFT JOIN organizations AS o ON e.id_organization = o.id_organization
      WHERE e.id_event=?
  `;

  connection.query(qEventShowId, id_event, function (error, rows) {
    if (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "Internal Server Error" });
    } else {
      // Process the rows to create the desired output format
      const events = {};

      rows.forEach(row => {
        const eventId = row.id_event;

        let base_url_google_map = "https://google.com/maps?q="
        let url_google_map = ""
        if (row.id_event) {
          let query_google_map = row.location.split(" ").join("+")
          url_google_map = base_url_google_map + query_google_map;
        }

        if (!events[eventId]) {
          events[eventId] = {
            id_event: row.id_event,
            id_organization: row.id_organization,
            organization_name: row.organization_name,
            event_name: row.event_name,
            description: row.description,
            location: row.location,
            url_google_map,
            event_image: row.event_image,
            event_image: row.event_image ? process.env.BASE_URL + `/images/event/` + row.event_image : null,
            site_plan_image: row.site_plan_image ? process.env.BASE_URL + `/images/site-plan/` + row.site_plan_image : null,
            status: row.status,
            payment_information: row.payment_information,
            event_start: row.event_start,
            event_end: row.event_end,
            created_at: row.created_at,
            total_type: 0,
            total_ticket: 0,
            total_sold: 0,
            tickets: []
          };
        }

        if (row.id_ticket) {
          events[eventId].tickets.push({
            id_ticket: row.id_ticket,
            ticket_type: row.ticket_type,
            amount: row.amount,
            sold: row.sold,
            price: row.price,
            date_start: row.date_start,
            date_end: row.date_end
          });

          events[eventId].total_type += 1;
          events[eventId].total_ticket += row.amount;
          events[eventId].total_sold += row.sold;
        }
      });

      const result = Object.values(events);

      res.json(result);
    }
  });
};