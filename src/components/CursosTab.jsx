import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const CursosTab = ({ addCourse, courses }) => {
  const [courseName, setCourseName] = useState('');
  const [courseSubjects, setCourseSubjects] = useState('');

  const handleAddCourse = () => {
    if (!courseName.trim()) {
      alert('Por favor ingresa el nombre del curso');
      return;
    }
    const subjectsArray = courseSubjects.split(',').map(s => s.trim()).filter(s => s);
    if (subjectsArray.length === 0) {
      alert('Por favor ingresa al menos una materia (separadas por comas)');
      return;
    }
    addCourse({ name: courseName, subjects: subjectsArray });
    setCourseName('');
    setCourseSubjects('');
  };

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
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 2°mA"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Materias (separadas por coma)
          </label>
          <input
            type="text"
            value={courseSubjects}
            onChange={(e) => setCourseSubjects(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Lenguaje, Matemáticas, Historia"
          />
        </div>
        <button
          onClick={handleAddCourse}
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
          <div className="max-h-60 overflow-y-auto space-y-1">
            {courses.map(course => (
              <div key={course.id || course.name} className="text-sm bg-gray-50 p-3 rounded">
                <p className="font-semibold">{course.name}</p>
                {course.subjects && course.subjects.length > 0 && (
                  <p className="text-xs text-gray-600">
                    Materias: {course.subjects.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CursosTab;
