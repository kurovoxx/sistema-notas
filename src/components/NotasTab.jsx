import React from 'react';
import { Save } from 'lucide-react';

const NotasTab = ({
  students, // Full student objects
  courses, // Array of course names for dropdown
  selectedCourse, // Name of the selected course
  setSelectedCourse, // Function to set selected course (name), triggers ID update in App.jsx
  selectedStudent,
  setSelectedStudent,
  selectedSemester,
  setSelectedSemester,
  selectedYear,
  setSelectedYear,
  getStudentsByCourse, // Filters students by selectedCourse (name)
  subjects, // Dynamically passed array of subject strings for the selected course
  currentGrades, // Object with subject keys and array of 7 grades
  handleGradeChange,
  gradeRefs,
  observations,
  setObservations,
  saveGrades
}) => {
  const selectedStudentObject = students.find(s => s.id === parseInt(selectedStudent));

  return (
    <div>
      <h3 className="card-title">Ingresar Notas</h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Curso</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="form-select"
          >
            <option value="">Seleccionar curso</option>
            {courses.map(courseName => (
              <option key={courseName} value={courseName}>{courseName}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Estudiante</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="form-select"
            disabled={!selectedCourse}
          >
            <option value="">Seleccionar estudiante</option>
            {getStudentsByCourse().map(student => (
              <option key={student.id} value={student.id}>{student.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Semestre</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="form-select"
          >
            <option value="">Seleccionar semestre</option>
            <option value="1">Primer Semestre</option>
            <option value="2">Segundo Semestre</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Año</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="form-select"
          >
            <option value="">Seleccionar año</option>
            {[new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse && subjects.length > 0 && (
        <div className="mt-6">
          {!selectedStudent || !selectedSemester || !selectedYear ? (
            <div className="text-center py-8 text-gray-500">
              <p>Selecciona estudiante, semestre y año para comenzar a ingresar notas.</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Estudiante:</strong> {selectedStudentObject?.name || 'N/A'} |
                  <strong> Semestre:</strong> {selectedSemester}° |
                  <strong> Año:</strong> {selectedYear}
                </p>
                <p className="text-xs text-blue-600 mt-1">Notas válidas: 10-70 (máximo 2 dígitos)</p>
              </div>

              <div className="space-y-3 overflow-x-auto">
                {(subjects || []).map(subject => (
                  <div key={subject} className="flex items-center space-x-3 min-w-max">
                    <div className="w-32 text-sm font-medium text-gray-700 flex-shrink-0">
                      {subject}
                    </div>
                    <div className="flex space-x-2">
                      {Array(7).fill(null).map((_, index) => (
                        <input
                          key={`${subject}-${index}`}
                          ref={el => gradeRefs.current[`${subject}-${index}`] = el}
                          type="text"
                          maxLength="2"
                          value={(currentGrades && currentGrades[subject] && currentGrades[subject][index] !== undefined) ? currentGrades[subject][index] : ''}
                          onChange={(e) => handleGradeChange(subject, index, e.target.value)}
                          className="form-input w-12 h-10 text-center"
                          placeholder="--"
                          disabled={!selectedStudent || !selectedSemester || !selectedYear}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <label className="form-label">Observaciones</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows="3"
                  className="form-input"
                  placeholder="Observaciones del período..."
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={saveGrades}
                  className="btn btn-primary"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Notas</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {selectedCourse && subjects.length === 0 && (
        <div className="text-center py-8 text-red-500">
          <p>El curso seleccionado '{selectedCourse}' no tiene materias configuradas. Por favor, agréguelas en la pestaña 'Agregar Curso'.</p>
        </div>
      )}
    </div>
  );
};

export default NotasTab;
