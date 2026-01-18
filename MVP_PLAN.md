# Restaurant Ordering System MVP Plan

## System Overview

This is a minimum viable product (MVP) for a restaurant/bakery ordering system where employees take orders, which are then prepared and delivered.

### Core Requirements
- **Main Users**: Employees (order takers), Kitchen staff, Delivery staff
- **Order Flow**: Take → Prepare → Deliver  
- **Features**: Order history + status tracking

## Phase 1: Database Schema & Models ✅ COMPLETED

### Database Tables Created
- **Users**: id, name, email, role, password_hash, timestamps
- **Categories**: id, name, display_order, created_at
- **Menu Items**: id, category_id, name, description, price, is_available, created_at
- **Orders**: id, customer_name, customer_phone, total_amount, status, employee_id, timestamps
- **Order Items**: id, order_id, menu_item_id, quantity, unit_price, created_at
- **Sessions**: id, user_id, expires_at (for authentication)

### Sample Data Seeded
- 4 categories (Bakery Items, Beverages, Sandwiches, Pastries)
- 12 menu items across all categories
- 3 users with different roles (order_taker, kitchen, delivery)

## Phase 2: Authentication & User Management ✅ COMPLETED

### Authentication System Implemented
- **Login Page**: Email/password form with validation
- **Role-Based Access**: order_taker, kitchen, delivery roles
- **Protected Routes**: All `(app)/` routes require authentication
- **Session Management**: 30-day expiry with automatic renewal
- **Route Protection**: Root layout handles authentication checks
- **Logout Functionality**: Proper session cleanup and redirect

### Role-Based Navigation
- **Order Taker**: Dashboard + New Order + Order History
- **Kitchen**: Dashboard + Kitchen + Order History
- **Delivery**: Dashboard + Delivery + Order History

### Sample Users for Testing
- **john@bakery.com** (Order Taker) → /orders/new
- **jane@bakery.com** (Kitchen) → /kitchen
- **mike@bakery.com** (Delivery) → /delivery
- **Password**: password123 (for all accounts)

## Phase 3: Order Taking Interface 🚧 IN PROGRESS

### 1. Menu Management
- Menu API endpoints for fetching items by category
- MenuItem component for displaying menu items
- Category-based menu organization
- Item availability status tracking

### 2. Order Form
- Customer information input (name, phone)
- Menu item selection with quantities
- Real-time total price calculation
- Form validation and error handling
- Order creation server action

### 3. Order Display
- Order confirmation page
- Order history access
- Order status tracking
- Basic search and filtering

## Phase 4: Kitchen & Delivery Views 📋 PLANNED

### Kitchen View Features
- Display pending and preparing orders
- Status update buttons (preparing → ready)
- Order details with customer info
- Card-based layout for order management
- Real-time status updates

### Delivery View Features  
- Display ready orders
- Mark orders as delivered
- Customer contact information
- Delivery completion tracking
- Order history access

## Phase 5: Dashboard & History 📋 PLANNED

### Main Dashboard
- Quick overview of current orders by status
- Role-based quick actions
- Order statistics and metrics
- Navigation to main functions

### Order History
- Complete order list with filtering
- Search by customer name/date
- Order status badges
- Sorting options
- Order detail views

## Phase 6: Polish & Testing 📋 PLANNED

### UI/UX Improvements
- Loading states and animations
- Error handling and user feedback
- Mobile responsiveness optimization
- Accessibility improvements (WCAG 2.1 AA)
- Performance optimization

### Testing & Quality
- Unit tests for all components
- End-to-end workflow testing
- Performance testing
- Security validation
- Browser compatibility testing

### Updated User Schema
```typescript
users: id, name, email, role, password_hash
// role: order_taker, kitchen, delivery
```

## Phase 2: Authentication & User Management

### User Roles
- **order_taker**: Can create new orders, view order history
- **kitchen**: Can view pending orders, update to preparing/ready
- **delivery**: Can view ready orders, update to delivered

### Authentication Features
- Simple login page for all staff members
- Role-based access control
- Session management (already implemented)

## Phase 3: Core Pages & Features

### 1. Order Taking Page (`/orders/new`)
- Customer information form (name, phone)
- Menu display categorized by categories
- Order item selector with quantities
- Real-time total calculation
- Submit order functionality

### 2. Kitchen View (`/kitchen`)
- Orders with "pending" and "preparing" status
- Mark orders as "ready for delivery"
- Simple card-based layout for easy scanning
- Order details and customer info

### 3. Delivery View (`/delivery`)
- Orders ready for delivery
- Mark orders as "delivered"
- Customer contact information visible
- Delivery tracking

### 4. Order History (`/orders`)
- All past and current orders
- Search/filter functionality
- Order status badges
- Sort by date/time

### 5. Dashboard (`/`)
- Quick overview of current orders by status
- Access to main functions based on user role

## Phase 4: UI Components & Design

### Design System
- **Status Color Coding**:
  - Pending: Yellow/Orange
  - Preparing: Blue  
  - Ready: Green
  - Delivered: Gray
- Mobile-responsive cards for order management
- Clean, simple Tailwind design
- Large touch-friendly buttons for tablet use
- Consistent typography and spacing

### Reusable Components
- `OrderCard.svelte`: Display order with status
- `MenuItem.svelte`: Menu item selector
- `StatusBadge.svelte`: Order status indicator
- `CustomerInfo.svelte`: Customer details display

## Phase 5: Real-time Features

### Status Updates
- Server-sent events or polling for order updates
- Auto-refresh kitchen/delivery views every 30 seconds
- Manual refresh buttons available
- Simple notification system for status changes

## File Structure Plan

```
src/
├── lib/
│   ├── server/
│   │   ├── db/
│   │   │   ├── schema.ts         # Updated with new tables
│   │   │   ├── queries.ts        # Order/menu queries
│   │   │   └── seed.ts           # Sample data seeding
│   │   ├── auth.ts              # Existing auth (enhanced)
│   │   └── orders.ts            # Order business logic
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Button.svelte
│   │   │   ├── Card.svelte
│   │   │   ├── Input.svelte
│   │   │   └── Badge.svelte
│   │   ├── OrderCard.svelte      # Order display component
│   │   ├── MenuItem.svelte       # Menu item selector
│   │   ├── StatusBadge.svelte    # Order status indicator
│   │   └── CustomerInfo.svelte    # Customer details
│   ├── types/
│   │   ├── orders.ts             # Order-related types
│   │   └── auth.ts              # Auth-related types
│   └── utils/
│       ├── formatting.ts        # Currency, date formatting
│       └── validation.ts         # Form validation helpers
├── routes/
│   ├── (app)/                    # Layout with auth check
│   │   ├── +layout.svelte       # Main app layout
│   │   ├── +page.svelte         # Dashboard
│   │   ├── orders/
│   │   │   ├── +page.svelte      # Order history
│   │   │   └── new/
│   │   │       └── +page.svelte  # Order taking
│   │   ├── kitchen/
│   │   │   └── +page.svelte      # Kitchen view
│   │   ├── delivery/
│   │   │   └── +page.svelte      # Delivery view
│   │   └── profile/
│   │       └── +page.svelte      # User profile
│   ├── (auth)/                   # Public auth routes
│   │   ├── login/
│   │   │   └── +page.svelte      # Login page
│   │   └── +layout.svelte       # Auth layout
│   └── api/
│       ├── orders/              # Order API endpoints
│       ├── menu/                # Menu API endpoints
│       └── auth/                # Auth API endpoints
└── static/
    └── sample-menu.json         # Sample menu data for seeding
```

## Implementation Steps

### Step 1: Database Setup
1. Update `src/lib/server/db/schema.ts` with new tables
2. Generate and run migrations
3. Create seed data script with sample menu items
4. Add sample users with different roles

### Step 2: Authentication UI
1. Create login page (`/login`)
2. Update auth logic to handle user roles
3. Implement route protection based on user role
4. Add logout functionality

### Step 3: Menu Management
1. Create menu API endpoints
2. Add sample menu items to database
3. Create MenuItem component
4. Test menu display functionality

### Step 4: Order Taking
1. Create order form UI
2. Implement order creation API
3. Add customer information input
4. Calculate totals and validate input
5. Test order creation flow

### Step 5: Kitchen View
1. Create kitchen dashboard
2. Implement order status update (preparing/ready)
3. Add real-time updates
4. Test order preparation workflow

### Step 6: Delivery View
1. Create delivery dashboard
2. Implement delivery status update
3. Display customer contact info
4. Test delivery workflow

### Step 7: Order History
1. Create order list view
2. Add search and filter functionality
3. Implement sorting options
4. Add order detail views

### Step 8: Dashboard
1. Create main dashboard
2. Add role-based quick actions
3. Display order statistics
4. Add navigation elements

### Step 9: Polish & Testing
1. Add error handling and validation
2. Improve responsive design
3. Add loading states
4. Write tests for critical functionality
5. Performance optimization

## MVP Feature Set

### ✅ Included Features
- Employee authentication with role-based access
- Order taking with menu selection
- Order status tracking (4 stages: pending → preparing → ready → delivered)
- Kitchen preparation view with status updates
- Delivery management view with customer info
- Order history with search and filtering
- Mobile-responsive design for tablet use
- Real-time order status updates
- Basic menu management

### 🔶 Simplified for MVP
- Single restaurant (no multi-tenant support)
- Basic menu items (no modifiers, options, or variations)
- Simple payment tracking (paid/unpaid status only)
- No customer self-service portal
- No advanced reporting or analytics
- No inventory management
- No employee scheduling
- No receipt printing

### 🚀 Future Enhancements (Post-MVP)
- Customer self-service ordering
- Advanced menu with modifiers and combos
- Payment integration
- Inventory management
- Employee scheduling
- Reporting and analytics
- SMS/email notifications
- Multi-location support
- Receipt printing
- Kiosk mode for customers

## Technical Considerations

### Performance
- Optimized database queries for order listings
- Efficient real-time updates using SSE
- Lazy loading for order history
- Mobile-optimized for tablet use

### Security
- Input validation and sanitization
- SQL injection prevention via Drizzle ORM
- Session-based authentication (already implemented)
- CSRF protection via SvelteKit

### Data Flow
- Server actions for form submissions
- Load functions for data fetching
- Real-time updates for order status changes
- Optimistic UI updates for better UX

## Success Metrics

### MVP Success Criteria
- Employees can successfully create orders
- Kitchen staff can view and update order status
- Delivery staff can manage deliveries
- Order history is accessible and searchable
- System works on tablets and desktop
- Order status updates are reflected in real-time

### Performance Targets
- Page load times < 2 seconds
- Order submission < 1 second
- Status updates appear within 30 seconds
- Mobile/tablet responsive design
- Basic accessibility (WCAG 2.1 AA)

This plan provides a clear roadmap for building a functional restaurant ordering system MVP that addresses the core needs of order taking, preparation, and delivery workflows.