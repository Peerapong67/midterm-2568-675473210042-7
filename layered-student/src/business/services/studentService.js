// src/business/services/studentService.js
const studentRepository = require('../../data/repositories/studentRepository');
const studentValidator = require('../validators/studentValidator');

class StudentService {

    // GET all students
    async getAllStudents({ major = null, status = null } = {}) {
        // 1. Validate filters
        studentValidator.validateMajorIfProvided(major);
        studentValidator.validateStatusIfProvided(status);

        // 2. Fetch students
        const students = await studentRepository.findAll(major, status);

        // 3. Calculate statistics
        const active = students.filter(s => s.status === 'active').length;
        const graduated = students.filter(s => s.status === 'graduated').length;
        const suspended = students.filter(s => s.status === 'suspended').length;
        const total = students.length;

        const averageGPA = total > 0
            ? parseFloat(
                (students.reduce((sum, s) => sum + s.gpa, 0) / total).toFixed(2)
              )
            : 0;

        // 4. Return result
        return {
            students,
            statistics: {
                active,
                graduated,
                suspended,
                total,
                averageGPA
            }
        };
    }

    // GET student by ID
    async getStudentById(id) {
        // 1. Validate ID
        studentValidator.validateId(id);

        // 2. Fetch student
        const student = await studentRepository.findById(id);

        // 3. Not found
        if (!student) {
            const error = new Error('Student not found');
            error.name = 'NotFoundError';
            throw error;
        }

        // 4. Return student
        return student;
    }

    // CREATE student
    async createStudent(studentData) {
        // 1. Validate required fields
        studentValidator.validateStudentData(studentData);

        // 2. Validate formats
        studentValidator.validateStudentCode(studentData.student_code);
        studentValidator.validateEmail(studentData.email);
        studentValidator.validateMajor(studentData.major);

        // 3. Create student
        try {
            return await studentRepository.create(studentData);
        } catch (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                const error = new Error('Student code or email already exists');
                error.name = 'ConflictError';
                throw error;
            }
            throw err;
        }
    }

    // UPDATE student
    async updateStudent(id, studentData) {
        studentValidator.validateId(id);
        studentValidator.validateStudentData(studentData);
        studentValidator.validateStudentCode(studentData.student_code);
        studentValidator.validateEmail(studentData.email);
        studentValidator.validateMajor(studentData.major);

        const existing = await studentRepository.findById(id);
        if (!existing) {
            const error = new Error('Student not found');
            error.name = 'NotFoundError';
            throw error;
        }

        try {
            return await studentRepository.update(id, studentData);
        } catch (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                const error = new Error('Student code or email already exists');
                error.name = 'ConflictError';
                throw error;
            }
            throw err;
        }
    }

    // UPDATE GPA
    async updateGPA(id, gpa) {
        studentValidator.validateId(id);
        studentValidator.validateGPA(gpa);

        const student = await studentRepository.findById(id);
        if (!student) {
            const error = new Error('Student not found');
            error.name = 'NotFoundError';
            throw error;
        }

        return await studentRepository.updateGPA(id, gpa);
    }

    // UPDATE status
    async updateStatus(id, status) {
        studentValidator.validateId(id);
        studentValidator.validateStatus(status);

        const student = await studentRepository.findById(id);
        if (!student) {
            const error = new Error('Student not found');
            error.name = 'NotFoundError';
            throw error;
        }

        // Business rule: withdrawn cannot be changed
        if (student.status === 'withdrawn') {
            const error = new Error('Cannot change status of withdrawn student');
            error.name = 'ValidationError';
            throw error;
        }

        return await studentRepository.updateStatus(id, status);
    }

    // DELETE student
    async deleteStudent(id) {
        studentValidator.validateId(id);

        const student = await studentRepository.findById(id);
        if (!student) {
            const error = new Error('Student not found');
            error.name = 'NotFoundError';
            throw error;
        }

        // Business rule: cannot delete active student
        if (student.status === 'active') {
            const error = new Error('Cannot delete active student. Change status first.');
            error.name = 'ValidationError';
            throw error;
        }

        await studentRepository.delete(id);
    }
}

module.exports = new StudentService();
