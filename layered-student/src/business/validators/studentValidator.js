// src/business/validators/studentValidator.js
class StudentValidator {

    validateStudentData(data) {
        const { student_code, first_name, last_name, email, major } = data || {};

        if (!student_code || !first_name || !last_name || !email || !major) {
            const error = new Error('All fields are required');
            error.name = 'ValidationError';
            throw error;
        }

        return true;
    }

    validateStudentCode(code) {
        // Format: 10 digits
        const codePattern = /^\d{10}$/;

        if (!codePattern.test(code)) {
            const error = new Error('Invalid student code format (must be 10 digits)');
            error.name = 'ValidationError';
            throw error;
        }

        return true;
    }

    validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            const error = new Error('Invalid email format');
            error.name = 'ValidationError';
            throw error;
        }

        return true;
    }

    validateMajor(major) {
        const validMajors = ['CS', 'SE', 'IT', 'CE', 'DS'];

        if (!validMajors.includes(major)) {
            const error = new Error(
                'Invalid major. Must be one of: CS, SE, IT, CE, DS'
            );
            error.name = 'ValidationError';
            throw error;
        }

        return true;
    }

    validateGPA(gpa) {
        if (gpa === undefined || gpa < 0 || gpa > 4.0) {
            const error = new Error('GPA must be between 0.0 and 4.0');
            error.name = 'ValidationError';
            throw error;
        }

        return true;
    }

    validateStatus(status) {
        const validStatuses = ['active', 'graduated', 'suspended', 'withdrawn'];

        if (!validStatuses.includes(status)) {
            const error = new Error(
                'Invalid status. Must be one of: active, graduated, suspended, withdrawn'
            );
            error.name = 'ValidationError';
            throw error;
        }

        return true;
    }

    validateId(id) {
        const numId = parseInt(id);

        if (isNaN(numId) || numId <= 0) {
            const error = new Error('Invalid student ID');
            error.name = 'ValidationError';
            throw error;
        }

        return numId;
    }

    // ใช้ใน filter ของ getAllStudents
    validateMajorIfProvided(major) {
        if (major !== undefined && major !== null) {
            this.validateMajor(major);
        }
        return true;
    }

    validateStatusIfProvided(status) {
        if (status !== undefined && status !== null) {
            this.validateStatus(status);
        }
        return true;
    }
}

module.exports = new StudentValidator();
