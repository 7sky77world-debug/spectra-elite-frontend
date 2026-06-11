-- ============================================================================
-- SQL database schema for Spectra Elite #38 Property Management Platform
-- Target Database: PostgreSQL 14+
-- ============================================================================

-- Enable extra extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Seed initial roles
INSERT INTO roles (name, description) VALUES
('Admin', 'Primary business owner access'),
('Manager', 'Branch/Cluster manager managing repairs and tenants'),
('Sales', 'CRM specialist converting leads'),
('Housekeeping', 'Cleaning operators providing before/after scans'),
('Accounts', 'Generating monthly invoices and arrears'),
('Reception', 'Scheduling physical walkthroughs'),
('Tenant', 'Active long term staying guests'),
('Guest', 'Unregistered visitors submitting queries');

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    role_name VARCHAR(50) NOT NULL REFERENCES roles(name),
    pan_url TEXT,
    aadhar_url TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: properties
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Coliving', 'PG', 'Airbnb', 'Apartment')),
    gender_preference VARCHAR(30) CHECK (gender_preference IN ('Male', 'Female', 'Unisex')),
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    rating NUMERIC(3,2) DEFAULT 4.5,
    description TEXT,
    virtual_tour_url TEXT,
    video_url TEXT,
    google_map_embed_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: property_images
CREATE TABLE IF NOT EXISTS property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: amenities
CREATE TABLE IF NOT EXISTS amenities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('Basic', 'Comfort', 'Entertainment', 'Security'))
);

-- Table: property_amenities_link
CREATE TABLE IF NOT EXISTS property_amenities_link (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id VARCHAR(50) REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);

-- Table: rooms
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_number VARCHAR(30) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Single', 'Double Sharing', 'Triple Sharing')),
    monthly_rent INT NOT NULL,
    security_deposit INT NOT NULL,
    maintenance_charges INT DEFAULT 0,
    electricity_charges VARCHAR(100) DEFAULT 'Metered',
    water_charges INT DEFAULT 0,
    total_beds INT DEFAULT 1,
    available_beds INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(id),
    move_in_date DATE NOT NULL,
    monthly_rent INT NOT NULL,
    security_deposit INT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'CheckedIn', 'CheckedOut')) DEFAULT 'Pending',
    digital_contract_signed BOOLEAN DEFAULT FALSE,
    contract_url TEXT,
    payment_status VARCHAR(50) CHECK (payment_status IN ('Paid', 'Pending', 'Refunded')) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    amount INT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Rent', 'Deposit', 'Maintenance', 'Refund', 'Penalty')),
    method VARCHAR(50) CHECK (method IN ('Razorpay', 'UPI', 'Credit Card', 'Debit Card', 'Cash')),
    status VARCHAR(50) CHECK (status IN ('Success', 'Pending', 'Failed')) DEFAULT 'Pending',
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    invoice_id VARCHAR(100)
);

-- Table: invoices
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    amount INT NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Paid', 'Unpaid', 'Overdue')) DEFAULT 'Unpaid',
    bill_period VARCHAR(100) NOT NULL,
    generated_date DATE DEFAULT CURRENT_DATE
);

-- Table: complaints
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES users(id),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    room_number VARCHAR(30),
    category VARCHAR(50) CHECK (category IN ('Electrical', 'Plumbing', 'Cleaning', 'Internet', 'Furniture', 'Security', 'Other')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Resolved', 'Closed')) DEFAULT 'Open',
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: complaint_comments
CREATE TABLE IF NOT EXISTS complaint_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30) NOT NULL,
    source VARCHAR(50) CHECK (source IN ('Website', 'WhatsApp', 'Phone Call', 'Google Ads', 'Facebook Ads', 'Instagram')),
    status VARCHAR(50) CHECK (status IN ('New Lead', 'Contacted', 'Visit Scheduled', 'Visit Completed', 'Negotiation', 'Booked', 'Lost')) DEFAULT 'New Lead',
    assigned_to_user_id UUID REFERENCES users(id),
    notes TEXT,
    follow_up_date DATE,
    property_interest_id UUID REFERENCES properties(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: tasks (Housekeeping, maintenance)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_number VARCHAR(30) NOT NULL,
    employee_id UUID NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Pending', 'InProgress', 'Completed')) DEFAULT 'Pending',
    photo_before_url TEXT,
    photo_after_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    amount INT NOT NULL,
    category VARCHAR(55) CHECK (category IN ('Maintenance', 'Utility', 'Salary', 'Marketing', 'Taxes', 'Other')),
    description TEXT,
    date DATE DEFAULT CURRENT_DATE
);

-- Table: whatsapp_logs
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_name VARCHAR(100),
    recipient_phone VARCHAR(30) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Lead Welcome', 'Visit Confirm', 'Rent Reminder', 'Complaint Update', 'Move-In Notice')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'Sent'
);
