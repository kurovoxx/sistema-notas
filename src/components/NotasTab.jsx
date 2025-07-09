import React from 'react';
import { Save } from 'lucide-react';

const NotasTab = ({
  students,
  courses,
  selectedCourse,
  setSelectedCourse,
  selectedStudent,
  setSelectedStudent,
  selectedSemester,
  setSelectedSemester,
  selectedYear,
  setSelectedYear,
  getStudentsByCourse,
  subjects,
  currentGrades,
  handleGradeChange,
  gradeRefs,
  observations,
  setObservations,
  saveGrades
}) => {
  return (
    <div className="space-y-6">
      {/* Selectores */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar curso</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={!selectedCourse}
            >
              <option value="">Seleccionar estudiante</option>
              {getStudentsByCourse().map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semestre</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar semestre</option>
              <option value="1">Primer Semestre</option>
              <option value="2">Segundo Semestre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar año</option>
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grilla de Notas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Ingresar Notas</h3>

        {!selectedStudent || !selectedSemester || !selectedYear ? (
          <div className="text-center py-8 text-gray-500">
            <p>Selecciona curso, estudiante, semestre y año para comenzar a ingresar notas</p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Estudiante:</strong> {students.find(s => s.id === parseInt(selectedStudent))?.name} |
                <strong> Semestre:</strong> {selectedSemester}° |
                <strong> Año:</strong> {selectedYear}
              </p>
              <p className="text-xs text-blue-600 mt-1">Notas válidas: 10-70 (máximo 2 dígitos)</p>
            </div>

            <div className="space-y-3 overflow-x-auto">
              {subjects.map(subject => (
                <div key={subject} className="flex items-center space-x-3 min-w-max">
                  <div className="w-32 text-sm font-medium text-gray-700 flex-shrink-0">
                    {subject}
                  </div>
                  <div className="flex space-x-2">
                    {[0, 1, 2, 3, 4, 5, 6].map(index => (
                      <input
                        key={index}
                        ref={el => gradeRefs.current[`${subject}-${index}`] = el}
                        type="text"
                        maxLength="2"
                        value={currentGrades[subject] ? currentGrades[subject][index] : ''}
                        onChange={(e) => handleGradeChange(subject, index, e.target.value)}
                        className="w-12 h-10 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="--"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Observaciones y Guardar */}
      {selectedStudent && selectedSemester && selectedYear && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Observaciones del período..."
            />
          </div>

          <div className="mt-6">
            <button
              onClick={saveGrades}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Notas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotasTab;
