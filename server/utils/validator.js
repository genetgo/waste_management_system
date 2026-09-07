const isEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isPhone = (phone) => {
    return /^09\d{8}$/.test(phone);
};

module.exports = {
    isEmail,
    isPhone,
};