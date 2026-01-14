/* =====================================================
   Service / API Layer
   - Responsible ONLY for HTTP communication
   - No DOM
   - No UI logic
   ===================================================== */

/* ---------- Students ---------- */

/**
 * GET /api/students
 * @param {string|null} status
 * @param {string|null} major
 */
async function fetchStudents(status = null, major = null) {
    let url = '/api/students';
    const params = [];

    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (major) params.push(`major=${encodeURIComponent(major)}`);

    if (params.length > 0) {
        url += '?' + params.join('&');
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch students');
    }

    return response.json();
}

/**
 * GET /api/students/:id
 */
async function getStudentById(id) {
    const response = await fetch(`/api/students/${id}`);
    if (!response.ok) {
        throw new Error('Failed to load student');
    }
    return response.json();
}

/**
 * POST /api/students
 */
async function createStudent(data) {
    const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Create failed');
    }

    return response.json();
}

/**
 * PUT /api/students/:id
 */
async function updateStudent(id, data) {
    const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Update failed');
    }

    return response.json();
}

/**
 * DELETE /api/students/:id
 */
async function removeStudent(id) {
    const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
    }

    return response.json();
}

/* ---------- GPA ---------- */

/**
 * PATCH /api/students/:id/gpa
 */
async function updateStudentGPA(id, gpa) {
    const response = await fetch(`/api/students/${id}/gpa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gpa })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'GPA update failed');
    }

    return response.json();
}

/* ---------- Status ---------- */

/**
 * PATCH /api/students/:id/status
 */
async function updateStudentStatus(id, status) {
    const response = await fetch(`/api/students/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Status update failed');
    }

    return response.json();
}
