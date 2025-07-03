import React, { useState, useEffect, useRef } from 'react';
import { Users, BookOpen, GraduationCap, FileDown, Save, Plus } from 'lucide-react';

const GradeManagementSystem = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('notas');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);

  // Estados para formularios
  const [newStudent, setNewStudent] = useState({ name: '', course: '', year: '' });
  const [newCourse, setNewCourse] = useState('');
  
  // Estados para ingreso de notas
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [observations, setObservations] = useState('');
  
  // Estados para filtros de reportes
  const [reportFilters, setReportFilters] = useState({
    course: '',
    semester: '',
    year: ''
  });

  // Materias fijas
  const subjects = [
    'Lenguaje', 'Inglés', 'Matemáticas', 'Historia', 'Ciencias', 
    'Artes', 'E. Tecnológica', 'E. Física', 'Religión'
  ];

  // Estado para las notas (9 materias x 7 evaluaciones)
  const [currentGrades, setCurrentGrades] = useState(
    subjects.reduce((acc, subject) => {
      acc[subject] = ['', '', '', '', '', '', ''];
      return acc;
    }, {})
  );

  // Referencias para auto-advance
  const gradeRefs = useRef({});

  // Simulación de base de datos (en producción sería Supabase)
  useEffect(() => {
    // Cargar datos guardados del localStorage como simulación
    const savedStudents = localStorage.getItem('students');
    const savedCourses = localStorage.getItem('courses');
    const savedGrades = localStorage.getItem('grades');
    
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedGrades) setGrades(JSON.parse(savedGrades));
  }, []);

  // Función para guardar en "base de datos"
  const saveToDB = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Agregar estudiante
  const addStudent = () => {
    if (!newStudent.name || !newStudent.course || !newStudent.year) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    const student = {
      id: Date.now(),
      ...newStudent
    };
    
    const updatedStudents = [...students, student];
    setStudents(updatedStudents);
    saveToDB('students', updatedStudents);
    setNewStudent({ name: '', course: '', year: '' });
    alert('Estudiante agregado exitosamente');
  };

  // Agregar curso
  const addCourse = () => {
    if (!newCourse.trim()) {
      alert('Por favor ingresa el nombre del curso');
      return;
    }
    
    if (courses.includes(newCourse)) {
      alert('Este curso ya existe');
      return;
    }
    
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    saveToDB('courses', updatedCourses);
    setNewCourse('');
    alert('Curso agregado exitosamente');
  };

  // Filtrar estudiantes por curso
  const getStudentsByCourse = () => {
    return students.filter(student => student.course === selectedCourse);
  };

  // Manejar cambio en campos de notas
  const handleGradeChange = (subject, index, value) => {
  // Permitir valores vacíos (para borrar)
  if (value === '') {
    setCurrentGrades(prev => ({
      ...prev,
      [subject]: prev[subject].map((grade, i) => i === index ? '' : grade)
    }));
    return;
  }

  // Validar: máximo 2 caracteres, y que sea alfabético o numérico
  if (!/^[a-zA-Z0-9]{1,2}$/.test(value)) return;

  // Si es numérico de dos dígitos, validar el rango
  if (/^\d{2}$/.test(value)) {
    const numeric = parseInt(value);
    if (numeric < 10 || numeric > 70) return;
  }

  // Guardar nota
  setCurrentGrades(prev => ({
    ...prev,
    [subject]: prev[subject].map((grade, i) => i === index ? value.toUpperCase() : grade)
  }));

  // Auto-avance solo para valores de 2 caracteres
  if (value.length === 2 && index < 6) {
    const nextRef = gradeRefs.current[`${subject}-${index + 1}`];
    if (nextRef) nextRef.focus();
  }
};


  // Cargar notas existentes cuando se selecciona un estudiante
  useEffect(() => {
    if (selectedStudent && selectedSemester && selectedYear) {
      const existingGrade = grades.find(g => 
        g.studentId === parseInt(selectedStudent) && 
        g.semester === selectedSemester && 
        g.year === selectedYear
      );
      
      if (existingGrade) {
        setCurrentGrades(existingGrade.grades);
        setObservations(existingGrade.observations || '');
      } else {
        // Limpiar formulario
        setCurrentGrades(subjects.reduce((acc, subject) => {
          acc[subject] = ['', '', '', '', '', '', ''];
          return acc;
        }, {}));
        setObservations('');
      }
    }
  }, [selectedStudent, selectedSemester, selectedYear, grades]);

  // Guardar notas
  const saveGrades = () => {
    if (!selectedStudent || !selectedSemester || !selectedYear) {
      alert('Por favor selecciona estudiante, semestre y año');
      return;
    }

    const gradeRecord = {
      id: Date.now(),
      studentId: parseInt(selectedStudent),
      semester: selectedSemester,
      year: selectedYear,
      grades: currentGrades,
      observations,
      createdAt: new Date().toISOString()
    };

    // Verificar si ya existe un registro para actualizar
    const existingIndex = grades.findIndex(g => 
      g.studentId === parseInt(selectedStudent) && 
      g.semester === selectedSemester && 
      g.year === selectedYear
    );

    let updatedGrades;
    if (existingIndex !== -1) {
      updatedGrades = grades.map((g, i) => i === existingIndex ? { ...gradeRecord, id: g.id } : g);
      alert('Notas actualizadas exitosamente');
    } else {
      updatedGrades = [...grades, gradeRecord];
      alert('Notas guardadas exitosamente');
    }

    setGrades(updatedGrades);
    saveToDB('grades', updatedGrades);
  };

  // Generar reportes (simulado)
  const generateReports = () => {
    if (!reportFilters.course || !reportFilters.semester || !reportFilters.year) {
      alert('Por favor selecciona curso, semestre y año');
      return;
    }

    const courseStudents = students.filter(s => s.course === reportFilters.course);
    const reportsData = courseStudents.map(student => {
      const studentGrades = grades.find(g => 
        g.studentId === student.id && 
        g.semester === reportFilters.semester && 
        g.year === reportFilters.year
      );
      
      return {
        student: student.name,
        grades: studentGrades ? studentGrades.grades : null,
        observations: studentGrades ? studentGrades.observations : ''
      };
    });

    console.log('Datos para PDFs:', reportsData);
    alert(`Generando ${reportsData.length} reportes para ${reportFilters.course} - ${reportFilters.semester}° Semestre ${reportFilters.year}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión de Notas</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'notas', label: 'Ingresar Notas', icon: GraduationCap },
              { id: 'estudiantes', label: 'Agregar Estudiante', icon: Users },
              { id: 'cursos', label: 'Agregar Curso', icon: BookOpen },
              { id: 'reportes', label: 'Descargar Informes', icon: FileDown }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Tab Ingresar Notas */}
          {activeTab === 'notas' && (
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
          )}

          {/* Tab Agregar Estudiante */}
          {activeTab === 'estudiantes' && (
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
          )}

          {/* Tab Agregar Curso */}
          {activeTab === 'cursos' && (
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
          )}

          {/* Tab Descargar Informes */}
          {activeTab === 'reportes' && (
            <div className="bg-white p-6 rounded-lg shadow max-w-md">
              <h3 className="text-lg font-semibold mb-4">Generar Informes por Curso</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
                  <select
                    value={reportFilters.course}
                    onChange={(e) => setReportFilters({...reportFilters, course: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar curso</option>
                    {courses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semestre</label>
                  <select
                    value={reportFilters.semester}
                    onChange={(e) => setReportFilters({...reportFilters, semester: e.target.value})}
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
                    value={reportFilters.year}
                    onChange={(e) => setReportFilters({...reportFilters, year: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar año</option>
                    {[2024, 2025, 2026, 2027].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={generateReports}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 flex items-center justify-center space-x-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Descargar Informes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeManagementSystem;