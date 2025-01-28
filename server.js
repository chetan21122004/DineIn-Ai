require("dotenv").config();
const express = require("express");
const pool = require("./db");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Server is working!");
});
app.get("/tables/check", async (req, res) => {
    const { date, time, persons } = req.body;
  
    try {
      const query = `
        SELECT t.table_no
        FROM tables t
        LEFT JOIN reservations r
        ON t.table_no = r.table_no 
           AND r.reservation_date = $1 
           AND r.time_slot = $2
        WHERE t.persons = $3
          AND r.reservation_id IS NULL
        LIMIT 1;
      `;
      const values = [date, time, persons];
      const result = await pool.query(query, values);
  
      if (result.rowCount > 0) {
        res.json({ available: true, table_no: result.rows[0].table_no });
      } else {
        res.json({ available: false ,result});
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });
  

  app.post("/tables/reserve", async (req, res) => {
    const { table_no, date, time, phone_number, reserved_by } = req.body;
  
    try {
      const query = `
        INSERT INTO reservations (table_no, reservation_date, time_slot, phone_number, reserved_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const values = [table_no, date, time, phone_number, reserved_by];
      const result = await pool.query(query, values);
  
      res.json({ message: "Table reserved successfully", reservation: result.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });
  

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
