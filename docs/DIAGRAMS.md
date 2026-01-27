# Restaurant Ordering System - Architecture Diagrams

This document provides comprehensive visual documentation of the Restaurant Ordering System architecture, database schema, workflows, and user roles.

---

## 1. System Architecture Diagram

The system follows a modern full-stack architecture with clear separation of concerns:

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser[Web Browser]
        Mobile[Mobile Device]
    end

    subgraph Frontend["Frontend Layer - SvelteKit 5"]
        SPA[Svelte 5 SPA]
        Routing[SvelteKit Routing]
        Components[UI Components]
        State[Svelte Runes State]
    end

    subgraph Server["Server Layer - SvelteKit Server"]
        Load[Load Functions]
        Actions[Server Actions]
        Auth[Authentication]
        API[API Routes]
    end

    subgraph Data["Data Layer"]
        Drizzle[Drizzle ORM]
        SQLite[(SQLite Database)]
    end

    subgraph Utils["Utilities"]
        Paraglide[i18n - Paraglide]
        Tailwind[Tailwind CSS v4]
        Oslo[Oslo.js Crypto]
    end

    subgraph Testing["Testing Layer"]
        Vitest[Vitest Unit Tests]
        Playwright[Playwright E2E Tests]
    end

    Browser --> SPA
    Mobile --> SPA
    SPA --> Routing
    SPA --> Components
    Components --> State
    Components --> Tailwind

    Routing --> Load
    SPA --> Actions
    Actions --> Auth
    Auth --> Oslo
    Load --> Auth
    API --> Load

    Load --> Drizzle
    Actions --> Drizzle
    Drizzle --> SQLite

    Components --> Paraglide

    SPA -.-> Vitest
    Routing -.-> Playwright
    API -.-> Vitest
    API -.-> Playwright

    style Frontend fill:#FF3E00,stroke:#fff,stroke-width:2px,color:#fff
    style Server fill:#3D9A40,stroke:#fff,stroke-width:2px,color:#fff
    style Data fill:#FFC107,stroke:#000,stroke-width:2px,color:#000
    style Testing fill:#6F42C1,stroke:#fff,stroke-width:2px,color:#fff
```

**Architecture Overview:**
- **Client Layer**: Browser and mobile devices access the application
- **Frontend Layer**: SvelteKit 5 with Svelte 5 runes for reactive state management
- **Server Layer**: Server-side rendering, API routes, and authentication
- **Data Layer**: SQLite database accessed through Drizzle ORM
- **Utilities**: i18n, styling, and crypto libraries
- **Testing Layer**: Vitest for unit tests, Playwright for E2E tests

---

## 2. Database Schema ERD

The database consists of 7 tables with relationships supporting the full order lifecycle:

```mermaid
erDiagram
    USER ||--o{ SESSION : creates
    USER ||--o{ ORDER : places
    USER {
        text id PK
        text name
        text email UK
        text password_hash
        text role "enum: order_taker, kitchen, delivery, admin"
        timestamp created_at
        timestamp updated_at
    }

    SESSION {
        text id PK
        text user_id FK
        timestamp expires_at
    }

    CATEGORY ||--o{ MENU_ITEM : contains
    CATEGORY {
        text id PK
        text name
        integer display_order
        timestamp created_at
    }

    MENU_ITEM ||--o{ ORDER_ITEM : "appears in"
    MENU_ITEM {
        text id PK
        text category_id FK
        text name
        text description
        real price
        boolean is_available
        timestamp created_at
    }

    ORDER ||--o{ ORDER_ITEM : contains
    ORDER ||--|| USER : "belongs to"
    ORDER {
        text id PK
        text customer_name
        text customer_phone
        real total_amount
        text status "enum: pending, preparing, ready, delivered"
        text employee_id FK
        timestamp delivery_date_time
        text address
        text comment
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEM {
        text id PK
        text order_id FK
        text menu_item_id FK
        integer quantity
        real unit_price
        timestamp created_at
    }

    CLIENT ||--o{ ORDER : places
    CLIENT {
        text id PK
        text name
        text phone UK
        text address
        timestamp created_at
        timestamp updated_at
    }
```

**Table Descriptions:**
- **USER**: Staff accounts with role-based permissions (order_taker, kitchen, delivery, admin)
- **SESSION**: Authentication sessions with 30-day expiry
- **CATEGORY**: Menu categories for organizing items (Bakery, Beverages, etc.)
- **MENU_ITEM**: Individual menu items with pricing and availability
- **ORDER**: Order headers containing customer info and status
- **ORDER_ITEM**: Line items linking orders to menu items with quantities and prices
- **CLIENT**: Customer database with phone-based lookup

**Key Relationships:**
- One user can have multiple sessions
- One user can place multiple orders
- One category can contain multiple menu items
- One menu item can appear in multiple order items
- One order can contain multiple order items
- One order belongs to one employee (user)
- One client can place multiple orders

---

## 3. Order Flowchart

Orders progress through a defined lifecycle from creation to delivery:

```mermaid
flowchart TD
    Start([Order Created]) --> OrderTaker{Order Taker}
    OrderTaker -->|Creates Order| Pending[Status: PENDING]

    Pending --> Kitchen1{Kitchen Staff}
    Kitchen1 -->|Starts Preparation| Preparing[Status: PREPARING]

    Preparing --> Kitchen2{Kitchen Staff}
    Kitchen2 -->|Fishes Preparation| Ready[Status: READY]

    Ready --> Delivery{Delivery Staff}
    Delivery -->|Delivers Order| Delivered[Status: DELIVERED]

    Delivered --> End([Order Complete])

    style Pending fill:#FFC107,stroke:#000,stroke-width:2px
    style Preparing fill:#FF9800,stroke:#000,stroke-width:2px
    style Ready fill:#4CAF50,stroke:#000,stroke-width:2px
    style Delivered fill:#2196F3,stroke:#fff,stroke-width:2px,color:#fff

    Start --> Pending
```

**Order Status Flow:**
1. **PENDING** (Yellow): Order created by order taker, awaiting kitchen attention
2. **PREPARING** (Orange): Kitchen staff has started preparing the order
3. **READY** (Green): Order is ready for delivery
4. **DELIVERED** (Blue): Delivery completed, order closed

**Role Responsibilities:**
- **Order Taker**: Creates orders (PENDING status)
- **Kitchen**: Updates PENDING → PREPARING → READY
- **Delivery**: Updates READY → DELIVERED

---

## 4. User Roles & Permissions

The system implements role-based access control with four distinct roles:

```mermaid
flowchart TD
    subgraph Authentication["Authentication Required"]
        Login[Login]
    end

    Login --> RoleCheck{Check User Role}

    RoleCheck -->|order_taker| OrderTaker[Order Taker]
    RoleCheck -->|kitchen| Kitchen[Kitchen Staff]
    RoleCheck -->|delivery| Delivery[Delivery Staff]
    RoleCheck -->|admin| Admin[Admin]

    subgraph OrderTakerPerms["Order Taker Permissions"]
        OT1[✓ Create New Orders]
        OT2[✓ View Order History]
        OT3[✓ Manage Menu Items]
        OT4[✓ Manage Clients]
        OT5[✓ View Dashboard]
        OT6[✗ Update Order Status]
        OT7[✗ Access Kitchen View]
        OT8[✗ Access Delivery View]
    end

    subgraph KitchenPerms["Kitchen Permissions"]
        K1[✓ View All Orders]
        K2[✓ Update: pending → preparing]
        K3[✓ Update: preparing → ready]
        K4[✓ View Order History]
        K5[✓ View Dashboard]
        K6[✗ Create New Orders]
        K7[✗ Access Order Taking]
        K8[✗ Access Delivery View]
    end

    subgraph DeliveryPerms["Delivery Permissions"]
        D1[✓ View Ready Orders]
        D2[✓ Update: ready → delivered]
        D3[✓ View Order History]
        D4[✓ View Dashboard]
        D5[✗ Create New Orders]
        D6[✗ Access Kitchen View]
        D7[✗ Access Order Taking]
    end

    subgraph AdminPerms["Admin Permissions"]
        A1[✓ Full Access: All Order Features]
        A2[✓ Manage Users]
        A3[✓ Manage Menu Categories]
        A4[✓ View All Reports]
        A5[✓ System Configuration]
    end

    OrderTaker --> OrderTakerPerms
    Kitchen --> KitchenPerms
    Delivery --> DeliveryPerms
    Admin --> AdminPerms

    style OrderTaker fill:#FF5722,stroke:#fff,stroke-width:2px,color:#fff
    style Kitchen fill:#FF9800,stroke:#000,stroke-width:2px
    style Delivery fill:#4CAF50,stroke:#fff,stroke-width:2px,color:#fff
    style Admin fill:#9C27B0,stroke:#fff,stroke-width:2px,color:#fff
```

**Role-Based Access Control:**

| Role | Dashboard | Orders | Kitchen | Delivery | Admin |
|------|-----------|--------|---------|----------|-------|
| **Order Taker** | ✓ | ✓ (create, view) | ✗ | ✗ | ✗ |
| **Kitchen** | ✓ | ✓ (view, status: pending→ready) | ✓ | ✗ | ✗ |
| **Delivery** | ✓ | ✓ (view, status: ready→delivered) | ✗ | ✓ | ✗ |
| **Admin** | ✓ | ✓ (full access) | ✓ | ✓ | ✓ |

**Default Route Redirects:**
- Order Taker: `/orders/new`
- Kitchen: `/kitchen`
- Delivery: `/delivery`
- Admin: `/admin`

---

## 5. Authentication Flow

The authentication system uses session-based tokens with secure cookie storage:

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Frontend
    participant Server
    participant Auth as Auth Module
    participant DB as Database

    User->>Browser: Enter credentials (email/password)
    Browser->>Frontend: Submit login form
    Frontend->>Server: POST /login (server action)

    Server->>Auth: validateCredentials(email, password)
    Auth->>DB: SELECT * FROM user WHERE email = ?
    DB-->>Auth: user record
    Auth->>Auth: comparePassword(password, password_hash)

    alt Invalid Credentials
        Auth-->>Server: throw error("Invalid credentials")
        Server-->>Frontend: error response
        Frontend-->>Browser: display error message
    else Valid Credentials
        Auth->>DB: INSERT INTO session (id, user_id, expires_at)
        DB-->>Auth: session created
        Auth-->>Server: session token

        Server->>Server: setCookie('auth-session', token, { httpOnly: true, secure: true })
        Server->>Server: redirect(roleBasedRoute)

        Server-->>Frontend: redirect response
        Frontend-->>Browser: navigate to role-based page
    end

    Note over Browser,DB: Session is valid for 30 days<br/>Auto-renewal at 15 days

    Browser->>Server: GET /protected-route
    Server->>Auth: validateSession(cookie)
    Auth->>DB: SELECT * FROM session WHERE id = ? AND expires_at > NOW()
    DB-->>Auth: session record
    Auth->>DB: SELECT * FROM user WHERE id = ?
    DB-->>Auth: user record

    alt Session Invalid/Expired
        Auth-->>Server: session = null
        Server->>Browser: redirect to /login
    else Session Valid
        Auth-->>Server: { user, session }
        Server-->>Browser: render protected page
    end
```

**Authentication Mechanism:**
1. **Login**: Users submit credentials via login form
2. **Validation**: Server validates email and password hash
3. **Session Creation**: New session created in database with 30-day expiry
4. **Cookie Storage**: Session token stored as HTTP-only, secure cookie
5. **Route Protection**: Protected routes validate session on every request
6. **Auto-Renewal**: Sessions automatically renewed 15 days before expiry

**Security Features:**
- Passwords hashed before storage
- Session tokens stored as HTTP-only cookies (not accessible to JavaScript)
- Secure flag enabled (HTTPS only in production)
- Sessions cascade-deleted from database on logout
- Role-based redirects prevent unauthorized access

**Logout Flow:**
```mermaid
flowchart LR
    A[User Clicks Logout] --> B[POST /logout]
    B --> C[Delete session from DB]
    C --> D[Clear auth-session cookie]
    D --> E[Redirect to /login]
    style A fill:#F44336,stroke:#fff,stroke-width:2px,color:#fff
    style E fill:#4CAF50,stroke:#fff,stroke-width:2px,color:#fff
```

---

## Technical Implementation Notes

### Session Management
- **Session Table**: Stores session IDs with user references and expiry timestamps
- **Cookie Configuration**: HTTP-only, secure, same-site strict
- **Expiry**: 30 days from creation, auto-renewal at 15 days

### Route Protection
- **Protected Routes**: All routes under `(app)/` require valid session
- **Public Routes**: `(auth)/` group contains login/logout pages
- **Middleware**: Root layout server handles authentication checks

### Database Relationships
- **Foreign Keys**: All foreign keys properly defined with cascade deletes
- **Indexes**: Email and phone columns have unique constraints
- **Enums**: Role and status fields use SQLite text with enum constraints

### Tech Stack Integration
- **SvelteKit 5**: Server actions for form handling, load functions for data fetching
- **Drizzle ORM**: Type-safe database queries with migrations
- **SQLite**: Embedded database for easy deployment
- **Oslo.js**: Crypto utilities for session token generation

---

## Diagram Legend

```mermaid
graph LR
    A[Component] --> B[Arrow]
    C{Decision}
    D[Database]
    E[Process]
    F[Start/End]

    style A fill:#E3F2FD,stroke:#2196F3,stroke-width:2px
    style B stroke:#000,stroke-width:2px
    style C fill:#FFF9C4,stroke:#FBC02D,stroke-width:2px
    style D fill:#FFE0B2,stroke:#FF9800,stroke-width:2px
    style E fill:#C8E6C9,stroke:#4CAF50,stroke-width:2px
    style F fill:#E1BEE7,stroke:#9C27B0,stroke-width:2px
```

- **Rectangle**: Process, component, or entity
- **Arrow**: Flow direction or relationship
- **Diamond**: Decision point or conditional
- **Cylinder**: Database or data storage
- **Oval/Rounded Rect**: Start or end point

---

## Additional Resources

For more detailed information, refer to:
- [README.md](../README.md) - Project overview and getting started
- [AGENTS.md](../AGENTS.md) - Development guidelines for agents
- [IMPLEMENTATION_PLAN.md](../plans/IMPLEMENTATION_PLAN.md) - Full implementation roadmap

---

*Last updated: January 2026*
