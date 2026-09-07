-- ============================================
-- Waste Collection Management System Database
-- PostgreSQL Schema (Complete, Fixed & Cleaned)
-- ============================================

-- 1. የቆዩ ሰንጠረዦች ካሉ በቅደም ተከተል ማጥፊያ (Drop Tables safely)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS on_demand_requests CASCADE;
DROP TABLE IF EXISTS collection_schedules CASCADE;
DROP TABLE IF EXISTS system_administrators CASCADE;
DROP TABLE IF EXISTS municipal_administrators CASCADE;
DROP TABLE IF EXISTS collectors CASCADE;
DROP TABLE IF EXISTS business_owners CASCADE;
DROP TABLE IF EXISTS residents CASCADE;

-- ============================================
-- Residents (የነዋሪዎች ሰንጠረዥ)
-- ============================================
CREATE TABLE residents (
    resident_id SERIAL PRIMARY KEY,
    full_name VARCHAR(50) NOT NULL,
    
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(150) NOT NULL,
    kebele VARCHAR(50) NOT NULL,
    kifle_ketema VARCHAR(100) NOT NULL,
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Business Owners (የንግድ ተቋማት ባለቤቶች ሰንጠረዥ)
-- ============================================
CREATE TABLE business_owners (
    business_id SERIAL PRIMARY KEY,
    business_name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(150) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    kebele VARCHAR(50) NOT NULL,
    kifle_ketema VARCHAR(100) NOT NULL,
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Collectors (የቆሻሻ ሰብሳቢዎች ሰንጠረዥ)
-- ============================================
CREATE TABLE collectors (
    collector_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    assigned_kifle_ketema VARCHAR(100) NOT NULL,
    kebele VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'On Duty', 'Inactive')),
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Municipal Administrators (የክፍለ ከተማ አስተዳዳሪዎች ሰንጠረዥ)
-- ============================================
CREATE TABLE municipal_administrators (
    admin_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    assigned_kifle_ketema VARCHAR(100) NOT NULL,
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- System Administrators (የሲስተሙ ዋና አስተዳዳሪ ሰንጠረዥ)
-- ============================================
CREATE TABLE system_administrators (
    system_admin_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL, -- የአንተ ኮድ እንዲሰራ እዚህ ላይ በትክክል ተጨምሯል
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Collection Schedules (የመሰብሰቢያ መርሃ ግብሮች ሰንጠረዥ)
-- ============================================
CREATE TABLE collection_schedules (
    schedule_id SERIAL PRIMARY KEY,
    collector_id INT NOT NULL REFERENCES collectors(collector_id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    kebele VARCHAR(50) NOT NULL,
    kifle_ketema VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK(status IN ('Scheduled','Completed','Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- On-Demand Requests (ልዩ የቆሻሻ ማንሳት ጥያቄዎች ሰንጠረዥ)
-- ============================================
CREATE TABLE on_demand_requests (
    request_id SERIAL PRIMARY KEY,
    business_id INT NOT NULL REFERENCES business_owners(business_id) ON DELETE CASCADE,
    collector_id INT REFERENCES collectors(collector_id) ON DELETE SET NULL,
    approved_by INT REFERENCES municipal_administrators(admin_id) ON DELETE SET NULL,
    collection_address VARCHAR(150) NOT NULL,
    kebele VARCHAR(50) NOT NULL,
    kifle_ketema VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    preferred_collection_date DATE NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Assigned', 'Collected', 'Completed', 'Rejected', 'Cancelled')),
    approved_at TIMESTAMP,
    collected_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Feedback (የአስተያየት መስጫ ሰንጠረዥ)
-- ============================================
CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    resident_id INT REFERENCES residents(resident_id) ON DELETE CASCADE,
    business_id INT REFERENCES business_owners(business_id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_feedback_user CHECK (
        (resident_id IS NOT NULL AND business_id IS NULL) OR 
        (resident_id IS NULL AND business_id IS NOT NULL)
    )
);

-- ============================================
-- Notifications (የማሳወቂያዎች ሰንጠረዥ)
-- ============================================
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    resident_id INT REFERENCES residents(resident_id) ON DELETE CASCADE,
    business_id INT REFERENCES business_owners(business_id) ON DELETE CASCADE,
    collector_id INT REFERENCES collectors(collector_id) ON DELETE CASCADE,
    admin_id INT REFERENCES municipal_administrators(admin_id) ON DELETE CASCADE,
    sent_by INT NOT NULL REFERENCES municipal_administrators(admin_id) ON DELETE CASCADE,
    system_admin_id INT REFERENCES system_administrators(system_admin_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    notification_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Reports 
-- ============================================
CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES municipal_administrators(admin_id) ON DELETE SET NULL,
    system_admin_id INT REFERENCES system_administrators(system_admin_id) ON DELETE SET NULL,
    report_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    file_path VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_report_generator CHECK (
        (admin_id IS NOT NULL AND system_admin_id IS NULL) OR 
        (admin_id IS NULL AND system_admin_id IS NOT NULL)
    )
);

-- ============================================
-- Performance and Query Optimization Indexes
-- ============================================
CREATE INDEX idx_residents_kifle_kebele ON residents(kifle_ketema, kebele);
CREATE INDEX idx_business_kifle_kebele ON business_owners(kifle_ketema, kebele);
CREATE INDEX idx_schedule_location ON collection_schedules(kifle_ketema, kebele);
CREATE INDEX idx_requests_status_date ON on_demand_requests(status, preferred_collection_date);
