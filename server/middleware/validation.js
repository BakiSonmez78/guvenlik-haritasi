// Validation middleware for API requests

const validateRegistration = (req, res, next) => {
    const { email, password, name } = req.body;

    const errors = [];

    // Email validation
    if (!email) {
        errors.push('Email gerekli');
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        errors.push('Geçerli bir email adresi giriniz');
    }

    // Password validation
    if (!password) {
        errors.push('Şifre gerekli');
    } else if (password.length < 6) {
        errors.push('Şifre en az 6 karakter olmalı');
    }

    // Name validation
    if (!name) {
        errors.push('İsim gerekli');
    } else if (name.trim().length < 2) {
        errors.push('İsim en az 2 karakter olmalı');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    const errors = [];

    if (!email) {
        errors.push('Email gerekli');
    }

    if (!password) {
        errors.push('Şifre gerekli');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

const validateIncident = (req, res, next) => {
    const { type, description, location } = req.body;

    const errors = [];

    // Type validation
    const validTypes = ['theft', 'suspicious', 'accident', 'harassment', 'other'];
    if (!type) {
        errors.push('Olay türü gerekli');
    } else if (!validTypes.includes(type)) {
        errors.push('Geçersiz olay türü');
    }

    // Description validation
    if (!description) {
        errors.push('Açıklama gerekli');
    } else if (description.trim().length < 10) {
        errors.push('Açıklama en az 10 karakter olmalı');
    } else if (description.length > 500) {
        errors.push('Açıklama en fazla 500 karakter olmalı');
    }

    // Location validation
    if (!location) {
        errors.push('Konum bilgisi gerekli');
    } else {
        if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
            errors.push('Geçersiz konum formatı');
        } else if (location.lat < -90 || location.lat > 90) {
            errors.push('Geçersiz enlem değeri');
        } else if (location.lng < -180 || location.lng > 180) {
            errors.push('Geçersiz boylam değeri');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateIncident
};
