/* =====================================================
   Application Layer
   - UI State
   - Event Handling
   - DOM Manipulation
   ===================================================== */

// ---------- Global State ----------
let currentStatusFilter = 'all';
let currentMajorFilter = 'all';

// ---------- Initial Load ----------
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
});

// ---------- Load Students ----------
async function loadStudents(status = null, major = null) {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('student-list').style.display = 'none';

        const data = await fetchStudents(status, major);

        displayStudents(data.students);
        updateStatistics(data.statistics);

        document.getElementById('loading').style.display = 'none';
        document.getElementById('student-list').style.display = 'grid';

    } catch (error) {
        alert('Failed to load students');
        document.getElementById('loading').style.display = 'none';
    }
}

// ---------- Display Students ----------
function displayStudents(students) {
    const container = document.getElementById('student-list');

    if (!students || students.length === 0) {
        container.innerHTML = '<div class="no-students">🎓 No students found</div>';
        return;
    }

    container.innerHTML = students.map(student => {
        return `
        <div class="student-card">
            <div class="student-header">
                <div>
                    <h3>${escapeHtml(student.first_name)} ${escapeHtml(student.last_name)}</h3>
                    <span class="student-code">🆔 ${escapeHtml(student.student_code)}</span>
                </div>
                <span class="status-badge status-${student.status}">
                    ${student.status.toUpperCase()}
                </span>
            </div>

            <div class="student-details">
                <div class="detail-row">
                    <span class="detail-label">📧 Email</span>
                    <span class="detail-value">${escapeHtml(student.email)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📚 Major</span>
                    <span class="detail-value">${escapeHtml(student.major)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📊 GPA</span>
                    <span class="gpa-badge ${getGPAClass(student.gpa)}">
                        ${student.gpa.toFixed(2)}
                    </span>
                </div>
            </div>

            <div class="actions">
                <button class="btn btn-info"
                    onclick="showGPAModal(${student.id}, ${student.gpa})">
                    Update GPA
                </button>
                <button class="btn btn-warning"
                    onclick="showStatusModal(${student.id}, '${student.status}')">
                    Change Status
                </button>
                <button class="btn btn-secondary"
                    onclick="editStudent(${student.id})">
                    Edit
                </button>
                <button class="btn btn-danger"
                    onclick="deleteStudent(${student.id}, '${student.status}')">
                    Delete
                </button>
            </div>
        </div>`;
    }).join('');
}

// ---------- GPA Color ----------
function getGPAClass(gpa) {
    if (gpa >= 3.5) return 'gpa-excellent';
    if (gpa >= 3.0) return 'gpa-good';
    if (gpa >= 2.0) return 'gpa-fair';
    return 'gpa-poor';
}

// ---------- Statistics ----------
function updateStatistics(stats) {
    document.getElementById('stat-active').textContent = stats.active;
    document.getElementById('stat-graduated').textContent = stats.graduated;
    document.getElementById('stat-suspended').textContent = stats.suspended;
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-gpa').textContent = stats.averageGPA.toFixed(2);
}

// ---------- Filters ----------
function filterStudents(status, major) {
    currentStatusFilter = status;
    currentMajorFilter = major;

    document.querySelectorAll('.filter-btn')
        .forEach(btn => btn.classList.remove('active'));

    event.target.classList.add('active');

    loadStudents(
        status === 'all' ? null : status,
        major === 'all' ? null : major
    );
}

// ---------- Add / Edit Student ----------
function showAddModal() {
    document.getElementById('modal-title').textContent = 'Add New Student';
    document.getElementById('student-form').reset();
    document.getElementById('student-id').value = '';
    document.getElementById('student-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('student-modal').style.display = 'none';
}

async function handleSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('student-id').value;

    const data = {
        student_code: document.getElementById('student_code').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        email: document.getElementById('email').value,
        major: document.getElementById('major').value
    };

    try {
        if (id) {
            await updateStudent(id, data);
            alert('Student updated successfully');
        } else {
            await createStudent(data);
            alert('Student added successfully');
        }

        closeModal();
        reloadWithCurrentFilter();

    } catch (error) {
        alert('Operation failed');
    }
}

async function editStudent(id) {
    const student = await getStudentById(id);

    document.getElementById('modal-title').textContent = 'Edit Student';
    document.getElementById('student-id').value = student.id;
    document.getElementById('student_code').value = student.student_code;
    document.getElementById('first_name').value = student.first_name;
    document.getElementById('last_name').value = student.last_name;
    document.getElementById('email').value = student.email;
    document.getElementById('major').value = student.major;

    document.getElementById('student-modal').style.display = 'flex';
}

// ---------- GPA ----------
function showGPAModal(id, gpa) {
    document.getElementById('gpa-student-id').value = id;
    document.getElementById('gpa').value = gpa.toFixed(2);
    document.getElementById('gpa-modal').style.display = 'flex';
}

function closeGPAModal() {
    document.getElementById('gpa-modal').style.display = 'none';
}

async function handleGPASubmit(event) {
    event.preventDefault();

    const id = document.getElementById('gpa-student-id').value;
    const gpa = parseFloat(document.getElementById('gpa').value);

    await updateStudentGPA(id, gpa);
    alert('GPA updated');

    closeGPAModal();
    reloadWithCurrentFilter();
}

// ---------- Status ----------
function showStatusModal(id, status) {
    document.getElementById('status-student-id').value = id;
    document.getElementById('status').value = status;
    document.getElementById('status-modal').style.display = 'flex';
}

function closeStatusModal() {
    document.getElementById('status-modal').style.display = 'none';
}

async function handleStatusSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('status-student-id').value;
    const status = document.getElementById('status').value;

    await updateStudentStatus(id, status);
    alert('Status updated');

    closeStatusModal();
    reloadWithCurrentFilter();
}

// ---------- Delete ----------
async function deleteStudent(id, status) {
    if (status === 'active') {
        alert('Cannot delete active student');
        return;
    }

    if (!confirm('Confirm delete?')) return;

    await removeStudent(id);
    alert('Student deleted');

    reloadWithCurrentFilter();
}

// ---------- Helper ----------
function reloadWithCurrentFilter() {
    loadStudents(
        currentStatusFilter === 'all' ? null : currentStatusFilter,
        currentMajorFilter === 'all' ? null : currentMajorFilter
    );
}

// ---------- XSS Protection ----------
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}
