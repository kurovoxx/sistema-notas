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
    <div className="bg-white p-6 rounded-lg shadow max-w-md">
      <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Estudiante</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo
          </label>
          <input
            type="text"
            value={newStudent.name}
            onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Juan Pérez González"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Curso
          </label>
          <select
            value={newStudent.course}
            onChange={(e) => setNewStudent({...newStudent, course: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar curso</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semestre
          </label>
          <select
            value={newStudent.semester}
            onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar semestre</option>
            <option value="1">Primer Semestre</option>
            <option value="2">Segundo Semestre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año Académico
          </label>
          <select
            value={newStudent.year}
            onChange={(e) => setNewStudent({...newStudent, year: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar año</option>
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <button
          onClick={addStudent}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Estudiante</span>
        </button>
      </div>

      {/* Lista de estudiantes */}
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
