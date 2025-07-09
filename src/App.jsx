import React, { useState, useEffect, useRef } from 'react';
import { Users, BookOpen, GraduationCap, FileDown } from 'lucide-react';
import { supabase } from './supabaseClient';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateStudentReport } from './pdfGenerator';
import './modern-style.css';

import NotasTab from './components/NotasTab';
import EstudiantesTab from './components/EstudiantesTab';
import CursosTab from './components/CursosTab';
import ReportesTab from './components/ReportesTab';

const GradeManagementSystem = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('notas');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);

  // Estados para formularios
  const [newStudent, setNewStudent] = useState({ name: '', course: '', year: '', semester: '' });
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

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      const { data: studentsData } = await supabase.from('students').select('*');
      const { data: coursesData } = await supabase.from('courses').select('*');
      const { data: gradesData } = await supabase.from('grades').select('*');

      if (studentsData) setStudents(studentsData);
      if (coursesData) setCourses(coursesData.map(c => c.name));
      if (gradesData) setGrades(gradesData);
    };
    fetchData();
  }, []);

  // Agregar estudiante
  const addStudent = async () => {
    if (!newStudent.name || !newStudent.course || !newStudent.year || !newStudent.semester) {
      alert('Por favor completa todos los campos');
      return;
    }
    const { data, error } = await supabase.from('students').insert([newStudent]).select();
    if (error || !data || !Array.isArray(data)) {
      alert('Error al agregar estudiante');
      console.error(error || 'Datos inválidos');
      return;
    }
    setStudents(prev => [...prev, ...data]);
    setNewStudent({ name: '', course: '', year: '', semester: '' });
    alert('Estudiante agregado exitosamente');
  };

  // Agregar curso
  const addCourse = async () => {
    if (!newCourse.trim()) {
      alert('Por favor ingresa el nombre del curso');
      return;
    }
    if (courses.includes(newCourse)) {
      alert('Este curso ya existe');
      return;
    }
    const { data, error } = await supabase.from('courses').insert([{ name: newCourse }]);
    if (error) {
      alert('Error al agregar curso');
      console.error(error);
      return;
    }
    setCourses(prev => [...prev, newCourse]);
    setNewCourse('');
    alert('Curso agregado exitosamente');
  };

  // Filtrar estudiantes por curso
  const getStudentsByCourse = () => {
    return students.filter(student => student.course === selectedCourse);
  };

  // Manejar cambio en campos de notas
  const handleGradeChange = (subject, index, value) => {
    if (value === '') {
      setCurrentGrades(prev => ({
        ...prev,
        [subject]: prev[subject].map((grade, i) => i === index ? '' : grade)
      }));
      return;
    }
    if (!/^[a-zA-Z0-9]{1,2}$/.test(value)) return;
    if (/^\d{2}$/.test(value)) {
      const numeric = parseInt(value);
      if (numeric < 10 || numeric > 70) return;
    }
    setCurrentGrades(prev => ({
      ...prev,
      [subject]: prev[subject].map((grade, i) => i === index ? value.toUpperCase() : grade)
    }));
    if (value.length === 2 && index < 6) {
      const nextRef = gradeRefs.current[`${subject}-${index + 1}`];
      if (nextRef) nextRef.focus();
    }
  };

  // Cargar notas existentes cuando se selecciona un estudiante
  useEffect(() => {
    if (selectedStudent && selectedSemester && selectedYear) {
      const existingGrade = grades.find(g =>
        g.student_id === parseInt(selectedStudent) &&
        g.semester === parseInt(selectedSemester) &&
        g.year === parseInt(selectedYear)
      );
      if (existingGrade) {
        setCurrentGrades(existingGrade.grades);
        setObservations(existingGrade.observations || '');
      } else {
        setCurrentGrades(subjects.reduce((acc, subject) => {
          acc[subject] = ['', '', '', '', '', '', ''];
          return acc;
        }, {}));
        setObservations('');
      }
    }
  }, [selectedStudent, selectedSemester, selectedYear, grades, subjects]);

  // Guardar notas
  const saveGrades = async () => {
    if (!selectedStudent || !selectedSemester || !selectedYear) {
      alert('Por favor selecciona estudiante, semestre y año');
      return;
    }
    const gradeRecord = {
      student_id: parseInt(selectedStudent),
      semester: parseInt(selectedSemester),
      year: parseInt(selectedYear),
      grades: currentGrades,
      observations
    };
    const { data: existing } = await supabase
      .from('grades')
      .select('id')
      .eq('student_id', gradeRecord.student_id)
      .eq('semester', gradeRecord.semester)
      .eq('year', gradeRecord.year)
      .single();

    if (existing) {
      const { error: updateError } = await supabase
        .from('grades')
        .update(gradeRecord)
        .eq('id', existing.id);
      if (updateError) {
        alert('Error al actualizar notas');
        console.error(updateError);
        return;
      }
      alert('Notas actualizadas exitosamente');
    } else {
      const { error: insertError } = await supabase.from('grades').insert([gradeRecord]);
      if (insertError) {
        alert('Error al guardar notas');
        console.error(insertError);
        return;
      }
      alert('Notas guardadas exitosamente');
    }
    const { data: updatedGrades } = await supabase.from('grades').select('*');
    setGrades(updatedGrades);
  };

  const calcularPromedio = (notas) => {
    if (!Array.isArray(notas)) return 0;
    const nums = notas
      .filter(n => n !== null && n !== undefined && n !== '')
      .map(n => parseFloat(n))
      .filter(n => !isNaN(n));
    if (nums.length === 0) return 0;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  };

  // Función generateReports
  const generateReports = async () => {
    if (!reportFilters?.course || !reportFilters?.semester || !reportFilters?.year) {
      alert('Por favor selecciona curso, semestre y año');
      return;
    }
    try {
      const zip = new JSZip();
      const filteredStudents = students.filter(s =>
        s.course === reportFilters.course &&
        String(s.year) === String(reportFilters.year) &&
        String(s.semester) === String(reportFilters.semester)
      );

      if (filteredStudents.length === 0) {
        alert('No se encontraron estudiantes con los filtros seleccionados');
        return;
      }

      let processedCount = 0;
      let skippedCount = 0;

      for (const student of filteredStudents) {
        const record = grades.find(g =>
          g.student_id === student.id &&
          String(g.semester) === String(reportFilters.semester) &&
          String(g.year) === String(reportFilters.year)
        );

        if (!record || !record.grades || typeof record.grades !== 'object') {
          skippedCount++;
          continue;
        }

        const materiasData = [];
        const promediosFinales = [];
        subjects.forEach(subject => {
          const notasMateria = record.grades[subject] || [];
          const notasCompletas = Array(7).fill('').map((_, index) => String(notasMateria[index] ?? ''));
          const promedioMateria = calcularPromedio(notasCompletas);
          promediosFinales.push(promedioMateria);
          materiasData.push([subject, ...notasCompletas, promedioMateria.toString()]);
        });

        const promedio_final = Math.round(promediosFinales.reduce((a, b) => a + b, 0) / (subjects.length -1));
        let semestreTexto = (String(student.semester) === '2' || String(reportFilters.semester) === '2') ? 'SEGUNDO' : 'PRIMER';

        const pdfData = {
          nombre_alumno: student.name || 'Sin nombre',
          curso: student.course || 'Sin curso',
          año: student.year || 'Sin año',
          informe_periodo: semestreTexto,
          materias_data: materiasData.map(m => m.map(item => String(item ?? ''))),
          observaciones: record.observations || '',
          promedio_final: promedio_final.toString()
        };

        const pdfBytes = await generateStudentReport(pdfData);
        const nombreLimpio = student.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 50);
        zip.file(`${nombreLimpio}.pdf`, pdfBytes);
        processedCount++;
      }

      if (processedCount === 0) {
        alert('No se pudo procesar ningún estudiante. Revisa los datos y vuelve a intentar.');
        return;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const fechaActual = new Date().toISOString().split('T')[0];
      const nombreZip = `informes_${reportFilters.course}_${reportFilters.semester}sem_${reportFilters.year}_${fechaActual}.zip`;
      saveAs(zipBlob, nombreZip);
      alert(`Descarga completada! ✓ Procesados: ${processedCount} ⚠ Omitidos: ${skippedCount} 📁 Archivo: ${nombreZip}`);
    } catch (error) {
      console.error('Error en generateReports:', error);
      alert('Error al generar los informes. Revisa la consola para más detalles.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión de Notas</h1>
        </div>
      </header>

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

        <div className="mt-6">
          {activeTab === 'notas' && (
            <NotasTab
              students={students}
              courses={courses}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              selectedSemester={selectedSemester}
              setSelectedSemester={setSelectedSemester}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              getStudentsByCourse={getStudentsByCourse}
              subjects={subjects}
              currentGrades={currentGrades}
              handleGradeChange={handleGradeChange}
              gradeRefs={gradeRefs}
              observations={observations}
              setObservations={setObservations}
              saveGrades={saveGrades}
            />
          )}
          {activeTab === 'estudiantes' && (
            <EstudiantesTab
              newStudent={newStudent}
              setNewStudent={setNewStudent}
              courses={courses}
              addStudent={addStudent}
              students={students}
            />
          )}
          {activeTab === 'cursos' && (
            <CursosTab
              newCourse={newCourse}
              setNewCourse={setNewCourse}
              addCourse={addCourse}
              courses={courses}
            />
          )}
          {activeTab === 'reportes' && (
            <ReportesTab
              reportFilters={reportFilters}
              setReportFilters={setReportFilters}
              courses={courses}
              generateReports={generateReports}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeManagementSystem;