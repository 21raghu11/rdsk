import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

function renderLogin() {
  document.querySelector('#app').innerHTML = `
    <div class="login-card">
      <h2>Login</h2>
      <form id="login-form">
        <input type="text" id="username" placeholder="Username" required />
        <input type="password" id="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <div id="login-error" style="color:red;"></div>
    </div>
  `;
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // Simple demo: accept any non-empty username/password
    if (username && password) {
      localStorage.setItem('loggedIn', 'true');
      renderApp();
    } else {
      document.getElementById('login-error').textContent = 'Invalid credentials';
    }
  });
}

function renderApp() {
  document.querySelector('#app').innerHTML = `
    <div>
      <a href="https://vite.dev" target="_blank">
        <img src="${viteLogo}" class="logo" alt="Vite logo" />
      </a>
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
        <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
      </a>
      <h1>Hello All!</h1>
      <div class="card">
        <button id="counter" type="button"></button>
        <button id="test-backend" type="button">Test Backend</button>
        <pre id="backend-result"></pre>
      </div>
      <p class="read-the-docs">
        Click on the Vite logo to learn more
      </p>
      <button id="logout">Logout</button>
    </div>
  `;
  setupCounter(document.querySelector('#counter'));
  const testBtn = document.getElementById('test-backend');
  const resultPre = document.getElementById('backend-result');
  const counterBtn = document.getElementById('counter');
  if (testBtn && resultPre) {
    testBtn.addEventListener('click', async () => {
      resultPre.textContent = 'Loading...';
      try {
        const res = await fetch('/api/test');
        const data = await res.json();
        if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          if (counterBtn) counterBtn.textContent = 'Row Count :' + data.data.length;
          const keys = Object.keys(data.data[0]);
          let table = '<table border="1" style="margin:1em auto; border-collapse:collapse;"><thead><tr>';
          table += keys.map(k => `<th>${k}</th>`).join('');
          table += '</tr></thead><tbody>';
          table += data.data.map(row => '<tr>' + keys.map(k => `<td>${row[k]}</td>`).join('') + '</tr>').join('');
          table += '</tbody></table>';
          resultPre.innerHTML = table;
        } else {
          if (counterBtn) counterBtn.textContent = '0';
          resultPre.textContent = JSON.stringify(data, null, 2);
        }
      } catch (err) {
        resultPre.textContent = 'Error: ' + err;
      }
    });
  }
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    renderLogin();
  });
}

if (localStorage.getItem('loggedIn') === 'true') {
  renderApp();
} else {
  renderLogin();
}
