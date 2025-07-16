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
    <div className="space-y-6">
      {/* Selectores */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="texto_label">Curso</label>
            <select
              value={selectedCourse} // This is the course name
              onChange={(e) => setSelectedCourse(e.target.value)} // This passes the name to App.jsx
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar curso</option>
              {courses.map(courseName => (
                <option key={courseName} value={courseName}>{courseName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="texto_label">Estudiante</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={!selectedCourse} // Disabled if no course name is selected
            >
              <option value="">Seleccionar estudiante</option>
              {getStudentsByCourse().map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="texto_label">Semestre</label>
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
            <label className="texto_label">Año</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar año</option>
              {[new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grilla de Notas */}
      {selectedCourse && subjects.length > 0 && ( // Only show grid if a course is selected and it has subjects
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Ingresar Notas</h3>

          {!selectedStudent || !selectedSemester || !selectedYear ? (
            <div className="text-center py-8 text-gray-500">
              <p>Selecciona estudiante, semestre y año para comenzar a ingresar notas.</p>
              {subjects.length === 0 && selectedCourse && (
                <p className="text-red-500 mt-2">El curso seleccionado ({selectedCourse}) no tiene materias configuradas.</p>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Estudiante:</strong> {selectedStudentObject?.name || 'N/A'} |
                  <strong> Semestre:</strong> {selectedSemester}° |
                  <strong> Año:</strong> {selectedYear}
                </p>
                
              </div>

              <div className="space-y-3 overflow-x-auto">
                {(subjects || []).map(subject => (
                  <div key={subject} className="flex items-center space-x-3 min-w-max">
                    <div className="w-32 text-sm font-medium text-gray-700 flex-shrink-0">
                      {subject}
                    </div>
                    <div className="flex space-x-2">
                      {Array(7).fill(null).map((_, index) => ( // Assuming 7 evaluations
                        <input
                          key={`${subject}-${index}`}
                          ref={el => gradeRefs.current[`${subject}-${index}`] = el}
                          type="text"
                          maxLength="2"
                          value={(currentGrades && currentGrades[subject] && currentGrades[subject][index] !== undefined) ? currentGrades[subject][index] : ''}
                          onChange={(e) => handleGradeChange(subject, index, e.target.value)}
                          className="w-12 h-10 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="--"
                          disabled={!selectedStudent || !selectedSemester || !selectedYear} // Disable if student/sem/year not selected
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {selectedCourse && subjects.length === 0 && (
         <div className="bg-white p-6 rounded-lg shadow text-center text-red-500">
            <p>El curso seleccionado '{selectedCourse}' no tiene materias configuradas. Por favor, agréguelas en la pestaña 'Agregar Curso'.</p>
        </div>
      )}


      {/* Observaciones y Guardar */}
      {selectedStudent && selectedSemester && selectedYear && selectedCourse && subjects.length > 0 && (
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
              className="btn text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>Guardar Notas</span>
            </button>
            

          </div>
        </div>
      )}
    </div>
  );
};

export default NotasTab;
