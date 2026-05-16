# CODE EXPLANATION — Final Project DEPAZ
### Open this file, then press Ctrl+Shift+V in VS Code to preview it nicely.
---

# PART 1 — BACKEND FILES

## server.js — Main Entry Point
```
PURPOSE: Starts the Express web server. Everything plugs into this file.
```
| Code | Why it's there |
|---|---|
| `require('dotenv').config()` | Loads `.env` file so DB_HOST, JWT_SECRET etc. are available as variables |
| `const cors = require('cors')` | Imports CORS library to allow the frontend to talk to the backend |
| `app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))` | Only allows requests from the Vercel frontend. `credentials:true` is needed for cookies |
| `app.use(express.json())` | Parses JSON request bodies so we can read `req.body` |
| `app.use(cookieParser())` | Parses cookies so we can read the refresh token from the browser cookie |
| `app.options('*', cors(...))` | Handles "preflight" OPTIONS requests browsers send before actual POST/PUT requests |
| `app.use('/accounts', accountsRouter)` | Routes all /accounts/* requests to the accountsRouter file |
| `app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))` | Serves the Swagger interactive API documentation page |
| `app.listen(PORT, ...)` | Starts listening for incoming HTTP connections on the port |

---

## db.js — Database Connection Pool
```
PURPOSE: Creates and exports a reusable MySQL connection pool.
```
| Code | Why it's there |
|---|---|
| `mysql.createPool({...})` | Creates a pool of connections instead of one connection — faster and more efficient |
| `connectionLimit: 10` | Maximum 10 simultaneous database connections |
| `host, port, user, password, database` | Read from .env — never hardcoded in the source code |
| `module.exports = pool` | Exports the pool so any other file can import and use it |

---

## accountsRouter.js — All 13 API Endpoints
```
PURPOSE: Defines what happens at each URL. Like a traffic director.
```
| Endpoint | Method | Purpose |
|---|---|---|
| `/register` | POST | Creates a new user account, sends verification email |
| `/verify-email` | POST | Confirms the email using the token from the email link |
| `/authenticate` | POST | Login — checks password, issues JWT + refresh cookie |
| `/refresh-token` | POST | Issues a new JWT using the refresh token cookie |
| `/revoke-token` | POST | Logout — marks refresh token as revoked in DB |
| `/forgot-password` | POST | Sends a password reset link to the email |
| `/validate-reset-token` | POST | Checks if a reset token is still valid |
| `/reset-password` | POST | Changes the password using the reset token |
| `GET /` | GET | Returns all accounts (Admin only) |
| `POST /` | POST | Admin creates an account directly |
| `GET /:id` | GET | Returns one account by ID |
| `PUT /:id` | PUT | Updates an account |
| `DELETE /:id` | DELETE | Deletes an account (Admin only) |

**authorize middleware** added to routes means: "check JWT first before proceeding"

---

## accountService.js — Business Logic
```
PURPOSE: The "brain" of the backend. Does the actual work for each endpoint.
```
| Function | What it does |
|---|---|
| `register()` | Checks if email exists, hashes password with bcrypt, saves to DB, sends email |
| `authenticate()` | Finds user, runs `bcrypt.compare()`, creates JWT + refresh token, saves refresh token to DB |
| `refreshToken()` | Reads cookie, finds token in DB, checks it's not revoked/expired, creates new JWT |
| `revokeToken()` | Marks the refresh token as revoked in the DB (logout) |
| `generateJwtToken()` | Creates JWT with `jwt.sign({ sub: account.id }, JWT_SECRET, { expiresIn: '15m' })` |
| `generateRefreshToken()` | Creates random token using `crypto.randomBytes(40)`, saves to DB with 7-day expiry |
| `setTokenCookie()` | Sets the httpOnly cookie on the response: `res.cookie('refreshToken', token, { httpOnly: true, expires: ... })` |
| `forgotPassword()` | Generates reset token, saves to DB, sends email with link |
| `resetPassword()` | Finds account by reset token, checks not expired, hashes new password, saves |

**Why bcrypt?** Bcrypt hashes the password so even if the DB is stolen, no one can get the real passwords.

**Why JWT?** JWT lets the backend verify who the user is without checking the DB every time.

---

## middleware.js — JWT Verification
```
PURPOSE: Checks the JWT on every protected route before allowing access.
```
| Code | Why it's there |
|---|---|
| `const token = req.headers.authorization.split(' ')[1]` | Extracts the token from `Bearer <token>` header |
| `jwt.verify(token, secret)` | Verifies the JWT signature and checks it's not expired |
| `const account = await db.query('SELECT * FROM accounts WHERE id = ?', [decoded.sub])` | Gets the actual account from DB to confirm it still exists |
| `if (roles.length && !roles.includes(account.role))` | Checks if the user's role (Admin/User) matches the required role for this route |
| `return res.status(401).json({ message: 'Unauthorized' })` | Returns 401 if no valid token |
| `return res.status(403).json({ message: 'Forbidden' })` | Returns 403 if token is valid but wrong role |

---

## sendEmail.js — Email Service
```
PURPOSE: Sends emails for verification and password reset.
```
| Code | Why it's there |
|---|---|
| `nodemailer.createTestAccount()` | Creates a temporary Ethereal email account automatically for testing |
| `nodemailer.createTransport({...})` | Creates the email sender using SMTP settings |
| `transporter.sendMail({...})` | Sends the actual email |
| `nodemailer.getTestMessageUrl(info)` | Gets a preview URL to see the email in the browser (Ethereal feature) |
| `console.log('Email preview:', url)` | Prints the preview URL to the server logs so you can see the email |

---

## migrate.js — Database Setup
```
PURPOSE: Creates the database tables. Run once when setting up.
```
| Code | Why it's there |
|---|---|
| `connection.query('CREATE TABLE IF NOT EXISTS accounts (...)')` | Creates the accounts table if it doesn't exist yet |
| `CREATE TABLE IF NOT EXISTS refresh_tokens (...)` | Creates the refresh tokens table |
| `FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE` | Links refresh tokens to accounts. If account is deleted, its tokens auto-delete |
| `passwordHash VARCHAR(255)` | Stores the bcrypt hash, NOT the real password |
| `isVerified BOOLEAN DEFAULT FALSE` | Account can't login until email is verified |
| `ENUM('Admin','User')` | Role can only be one of these two values |

---

## .env — Environment Variables (SECRET FILE)
```
PURPOSE: Stores sensitive configuration. NEVER committed to GitHub.
```
| Variable | Why it's needed |
|---|---|
| `DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME` | MySQL connection info from Railway |
| `JWT_SECRET` | Secret key used to sign/verify JWTs. If stolen, attacker can forge tokens |
| `JWT_EXPIRES_IN=15m` | JWT expires after 15 minutes for security |
| `REFRESH_TOKEN_EXPIRES_DAYS=7` | Refresh token valid for 7 days |
| `CORS_ORIGIN` | Only this URL is allowed to make requests to the API |
| `APP_URL` | Used by Swagger to know the server address |

---

# PART 2 — FRONTEND FILES

## src/main.ts — Application Bootstrap
```
PURPOSE: The very first file that runs. Starts the Angular app.
```
| Code | Why it's there |
|---|---|
| `platformBrowserDynamic().bootstrapModule(AppModule)` | Tells Angular to start using AppModule as the root |

---

## src/app/app.module.ts — Root Module
```
PURPOSE: The central registry of everything in the app.
```
| Code | Why it's there |
|---|---|
| `BrowserModule` | Required for every Angular web app — provides basic browser features |
| `HttpClientModule` | Enables making HTTP requests to the backend |
| `ReactiveFormsModule` | Enables reactive forms (login, register forms) |
| `APP_INITIALIZER` | Runs `appInitializer()` BEFORE the app loads — auto-refreshes login |
| `JwtInterceptor` | Automatically adds Bearer token to every HTTP request |
| `ErrorInterceptor` | Automatically logs out user on 401 responses |
| `fakeBackendProvider` | Intercepts HTTP calls and returns fake data (Stage A) |

---

## src/app/_helpers/app.initializer.ts
```
PURPOSE: Runs once at startup to restore the user's session automatically.
```
| Code | Why it's there |
|---|---|
| `accountService.refreshToken()` | On app start, tries to get a new JWT using the refresh cookie |
| `.subscribe().add(resolve)` | Waits for it to complete (success or fail) before showing the app |
| **WHY?** | If user refreshes the page, their JWT is gone from memory. This restores it silently. |

---

## src/app/_helpers/jwt.interceptor.ts
```
PURPOSE: Adds the JWT to every outgoing HTTP request automatically.
```
| Code | Why it's there |
|---|---|
| `const isLoggedIn = account?.jwtToken` | Checks if user is logged in and has a token |
| `const isApiUrl = request.url.startsWith(environment.apiUrl)` | Only adds token to backend API requests, not external URLs |
| `request.clone({ setHeaders: { Authorization: 'Bearer ...' } })` | Creates a copy of the request with the auth header added |
| **WHY?** | Without this, you'd have to manually add the token to every HTTP call — interceptor does it automatically |

---

## src/app/_helpers/error.interceptor.ts
```
PURPOSE: Handles HTTP errors globally, especially 401 (unauthorized).
```
| Code | Why it's there |
|---|---|
| `catchError(err => ...)` | Catches any HTTP error before it reaches the component |
| `if (err.status === 401)` | If token expired/invalid, automatically logs the user out |
| `accountService.logout()` | Clears the user session and redirects to login |

---

## src/app/_services/account.service.ts
```
PURPOSE: All authentication logic on the frontend side.
```
| Code | Why it's there |
|---|---|
| `private accountSubject = new BehaviorSubject<Account>(null)` | Stores current user in memory. BehaviorSubject shares it across all components |
| `get accountValue()` | Returns the current account synchronously |
| `login(email, password)` | Calls POST /accounts/authenticate, saves JWT to accountSubject |
| `logout()` | Calls POST /accounts/revoke-token, clears accountSubject, redirects |
| `refreshToken()` | Calls POST /accounts/refresh-token (sends cookie automatically) |
| `startRefreshTokenTimer()` | Sets a timer to refresh JWT 1 minute before it expires |
| `stopRefreshTokenTimer()` | Cancels the timer on logout |

---

## src/environments/environment.prod.ts
```
PURPOSE: Tells the production build which backend URL to use.
```
| Code | Why it's there |
|---|---|
| `apiUrl: 'https://finalprojectdepaz-backend.onrender.com'` | Points to the live Render backend instead of localhost |
| `production: true` | Enables Angular optimizations and disables debug features |
| **HOW IT WORKS** | angular.json swaps environment.ts with this file during `ng build --configuration production` |

---

## src/app/_helpers/auth.guard.ts
```
PURPOSE: Protects routes from unauthorized access.
```
| Code | Why it's there |
|---|---|
| `canActivate(route, state)` | Angular calls this before navigating to a protected route |
| `const account = this.accountService.accountValue` | Gets the current logged-in user |
| `if (account)` | User is logged in — check their role |
| `if (roles.includes(account.role))` | User has the required role (e.g., Admin) — allow navigation |
| `else { router.navigate(['/']) }` | Wrong role — redirect to home |
| `router.navigate(['/account/login'], { queryParams: { returnUrl: state.url }})` | Not logged in — redirect to login, save intended URL |

---

## vercel.json
```
PURPOSE: Fixes the SPA routing problem on Vercel.
```
| Code | Why it's there |
|---|---|
| `{ "source": "/(.*)", "destination": "/index.html" }` | Redirects ALL URLs to index.html |
| **WHY?** | Angular is a SPA — all routes are handled by JavaScript in the browser. Without this, going directly to `/admin` would give a 404 because Vercel looks for a file named `admin` which doesn't exist. |

---

## src/app/_helpers/fake-backend.ts
```
PURPOSE: Simulates a real backend during Stage A (offline testing).
```
| Code | Why it's there |
|---|---|
| `implements HttpInterceptor` | Intercepts HTTP requests before they leave the browser |
| `localStorage.getItem('accounts')` | Uses browser storage as a fake database |
| `if (url.endsWith('/authenticate'))` | Matches the login endpoint and handles it locally |
| `bcrypt.compareSync(password, account.passwordHash)` | Even the fake backend hashes passwords properly |
| First registered account gets `role: Role.Admin` | Auto-assigns Admin to the first account |

---

## Summary Table — Why Each Technology Was Chosen

| Technology | Reason |
|---|---|
| **Angular** | Component-based, built-in routing, forms, HTTP client, guards |
| **TypeScript** | Catches type errors at compile time, better code quality |
| **Node.js + Express** | Fast, lightweight, JavaScript on the server |
| **MySQL** | Relational database — perfect for accounts and tokens with relationships |
| **JWT** | Stateless auth — server doesn't need to store session data |
| **bcrypt** | Industry standard for password hashing — slow by design to resist brute force |
| **Vercel** | Free hosting for Angular SPAs with automatic deployments |
| **Render** | Free hosting for Node.js backends |
| **Railway** | Free managed MySQL database |
| **Swagger** | Documents and allows testing of all API endpoints in a browser |
