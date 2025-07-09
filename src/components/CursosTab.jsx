import React from 'react';
import { Plus } from 'lucide-react';

const CursosTab = ({
  newCourse,
  setNewCourse,
  addCourse,
  courses
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-md">
      <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Curso</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Curso
          </label>
          <input
            type="text"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 2°mA"
          />
        </div>

        <button
          onClick={addCourse}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Curso</span>
        </button>
      </div>

      {/* Lista de cursos */}
      {courses.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-2">Cursos Registrados:</h4>
          <div className="space-y-1">
            {courses.map(course => (
              <div key={course} className="text-sm bg-gray-50 p-2 rounded">
                {course}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CursosTab;
