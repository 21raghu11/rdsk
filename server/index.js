const express = require('express');
const sql = require('mssql');
const { ClientSecretCredential } = require('@azure/identity');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Use ClientSecretCredential for service principal
const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);

async function getToken() {
  // Azure SQL requires the database.windows.net scope
  const tokenResponse = await credential.getToken('https://database.windows.net/.default');
  return tokenResponse.token;
}

const config = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  authentication: {
    type: 'azure-active-directory-access-token',
    options: {
      token: null, // will be set dynamically
    },
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

app.use(express.json());

app.get('/api/test', async (req, res) => {
  try {
    const token = await getToken();
    config.authentication.options.token = token;
    await sql.connect(config);
    const result = await sql.query('select * from [dbo].[Products]');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.APP_USERNAME &&
    password === process.env.APP_PASSWORD
  ) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
