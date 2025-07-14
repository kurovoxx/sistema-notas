import React from 'react';
import { Plus } from 'lucide-react';

const EstudiantesTab = ({
  newStudent,
  setNewStudent,
  courses,
  addStudent,
  students
}) => {
  return (
    <div>
      <h3 className="card-title">Agregar Nuevo Estudiante</h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Nombre Completo</label>
          <input
            type="text"
            value={newStudent.name}
            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            className="form-input"
            placeholder="Ej: Juan Pérez González"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Curso</label>
          <select
            value={newStudent.course}
            onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })}
            className="form-select"
          >
            <option value="">Seleccionar curso</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Semestre</label>
          <select
            value={newStudent.semester}
            onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
            className="form-select"
          >
            <option value="">Seleccionar semestre</option>
            <option value="1">Primer Semestre</option>
            <option value="2">Segundo Semestre</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Año Académico</label>
          <select
            value={newStudent.year}
            onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
            className="form-select"
          >
            <option value="">Seleccionar año</option>
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={addStudent} className="btn btn-secondary mt-4">
        <Plus className="w-4 h-4" />
        <span>Agregar Estudiante</span>
      </button>

      {students.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-2">Estudiantes Registrados:</h4>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {students.map(student => (
              <div key={student.id} className="text-sm bg-gray-50 p-2 rounded">
                {student.name} - {student.course} ({student.year})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EstudiantesTab;
