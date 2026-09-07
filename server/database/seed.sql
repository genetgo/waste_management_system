-- ==========================================
-- Initial Seed Data (Admin & Staff Only)
-- ==========================================

-- ============================================================
-- 1. SYSTEM ADMINISTRATOR
-- Username : sysadmin
-- Email    : sysadmin@waste.gov.et
-- Password : Admin@1234
-- ============================================================
INSERT INTO system_administrators (
    full_name,
    email,
    username,
    password_hash
)
VALUES (
    'Super Admin',
    'sysadmin@waste.gov.et',
    'sysadmin',
    '$2a$10$uxDYhfHi/0HTS8cmUqaRFuRiSKCXDNEPzlofHYKf5n2Q3isOxnBr2'
)
ON CONFLICT (email) DO NOTHING;


