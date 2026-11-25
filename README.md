# KidVerse - Full-Stack Educational & E-Commerce Web Application

A full-stack college project converting a modern Figma Make AI-generated UI into an enterprise Java Spring Boot + MySQL architecture with Hibernate/JPA.

---

## 🌟 Architecture Overview

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, React Router v7, Radix UI.
- **Backend**: Java 21, Spring Boot 3.3.5, Spring Web (REST APIs), Spring Data JPA, Hibernate ORM, Spring Validation, Spring Security Crypto (BCrypt).
- **Database**: MySQL / MariaDB via XAMPP (Database Name: `college_project`).
- **Build Tools**: Apache Maven 3.9.6 (Backend) & Vite 6 (Frontend).

---

## 📂 Project Structure

```
college_project/
├── backend/                               # Spring Boot Application
│   ├── pom.xml                            # Maven dependencies & build configuration
│   └── src/
│       ├── main/
│       │   ├── java/com/kidverse/
│       │   │   ├── KidverseApplication.java
│       │   │   ├── config/                # CORS, Security, Database Seeder
│       │   │   ├── controller/            # REST API endpoints
│       │   │   ├── dto/                   # Request/Response payloads
│       │   │   ├── entity/                # JPA Database Entities
│       │   │   ├── repository/            # Spring Data JPA Repositories
│       │   │   └── service/               # Business Logic Layer
│       │   └── resources/
│       │       ├── application.properties # Database connection settings
│       │       └── schema.sql             # SQL table definitions & seed data
│       └── test/
├── frontend/                              # Figma Make AI Generated React UI
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── app/
│       │   ├── routes.tsx                 # Client-side router
│       │   ├── pages/                     # HomePage, LoginPage, ParentDashboard, ChildDashboard
│       │   └── components/                # 15 Interactive games, Header, UI widgets
│       └── services/
│           └── api.ts                     # REST API client connecting frontend to backend
├── tools/                                 # Embedded Maven binary
├── start-backend.bat                      # One-click Spring Boot launcher
├── start-frontend.bat                     # One-click Vite frontend launcher
└── start-all.bat                          # One-click full-stack launcher
```

---

## 🚀 How to Run the Project Locally

### 1. Start MySQL Database (XAMPP)
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL** (Default port `3306`).
3. *(Optional)* If you prefer the command line, run:
   ```cmd
   C:\xampp\mysql\bin\mysqld.exe --standalone
   ```
4. The database `college_project` and tables will be automatically created and initialized by Spring Boot on startup. The SQL script is also available at `backend/src/main/resources/schema.sql`.

### 2. Start the Spring Boot Backend
Double-click `start-backend.bat` or run:
```cmd
cd backend
java -jar target/kidverse-backend-0.0.1-SNAPSHOT.jar
```
Backend runs at: **http://localhost:8080/api**

### 3. Start the Frontend
Double-click `start-frontend.bat` or run:
```cmd
cd frontend
npm run dev
```
Frontend runs at: **http://localhost:5173**

---

## 🔑 Account Access & Roles

| Role | Default Username | Description & Permissions |
|---|---|---|
| **Parent** | `parent@kidverse.com` | Browses educational kits, applies child star discounts, manages orders |
| **Child** | `Leo` | Plays educational games, accumulates stars and learning badges |

*Note: For local testing, default demo accounts are seeded automatically in development mode (`SPRING_PROFILES_ACTIVE=dev`). In production (`SPRING_PROFILES_ACTIVE=prod`), all users must register through the secure registration form. All passwords are encrypted with BCrypt in MySQL.*

---

## ⚙️ Environment Variables & Deployment Configuration

| Variable | Description | Default / Example |
|---|---|---|
| `JWT_SECRET` | 256-bit secret key for HMAC-SHA256 token signing | Minimum 32 characters (Required in prod) |
| `DB_URL` | MySQL JDBC Connection URL | `jdbc:mysql://localhost:3306/college_project` |
| `DB_USERNAME` | MySQL database user | `root` |
| `DB_PASSWORD` | MySQL database password | Empty string for local XAMPP |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile (`dev` or `prod`) | `dev` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend domains (comma-separated) | `http://localhost:5173,http://localhost:3000` |
| `VITE_API_URL` | Frontend API endpoint | `http://localhost:8080/api` |

---

## 🧪 Automated Verification & Security Test Suites

### 1. Security Audit Test Suite
Runs 15 cryptographic token security tests (BCrypt verification, token issuance, header-only spoofing rejection, signature verification, cross-user impersonation prevention, and cross-role privilege escalation prevention):
```powershell
powershell -ExecutionPolicy Bypass -File security_audit_test.ps1
```

### 2. Full-Stack End-to-End Test Suite
Runs 27 end-to-end integration tests across all requirements:
```powershell
powershell -ExecutionPolicy Bypass -File test_suite.ps1
```

---

## 📡 REST API Endpoints

### 1. Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate parent or child user (BCrypt verified).
- `POST /api/auth/register` - Register a new account.

### 2. Learning Kits / Products (`/api/products`)
- `GET /api/products` - List all products.
- `GET /api/products?ageGroup=3-5` - Filter products by age group (`3-5`, `6-8`, `9+`).
- `GET /api/products?budgetOnly=true` - Filter products under ₹1,000.
- `GET /api/products/{id}` - Get product details.

### 3. Orders & Purchases (`/api/orders`)
- `POST /api/orders` - Place order with items, subtotal, discount, shipping, free gifts.
- `GET /api/orders?username={name}` - Fetch user's order history.
- `GET /api/orders/purchased?username={name}` - Fetch IDs of products already purchased.

### 4. Child Progress & Gamification (`/api/progress`)
- `GET /api/progress/{childUsername}` - Get current star bank count, last game, and reward discount tier.
- `POST /api/progress/star` - Increment stars when child plays games.
