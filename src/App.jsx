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
import Login from './components/Login'; // Import the Login component
import logo from './logos.jpg'; // Import the logo

const GradeManagementSystem = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
  // Estados principales
  const [activeTab, setActiveTab] = useState('notas');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]); // Will store { id, name, subjects (course_json) }
  const [grades, setGrades] = useState([]);

  // Estados para formularios
  const [newStudent, setNewStudent] = useState({ name: '', course: '', year: '', semester: '' });
  // newCourse state is now managed within CursosTab.jsx
  
  // Estados para ingreso de notas
  const [selectedCourse, setSelectedCourse] = useState(''); // Stores course NAME for filtering students
  const [selectedCourseId, setSelectedCourseId] = useState(null); // Stores course ID for fetching subjects
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [observations, setObservations] = useState('');
  
  // Estados para filtros de reportes
  const [reportFilters, setReportFilters] = useState({
    course: '', // This will store course NAME
    semester: '',
    year: ''
  });

  // Dynamically determined subjects based on selectedCourseId
  const [currentCourseSubjects, setCurrentCourseSubjects] = useState([]);

  // Estado para las notas (evaluaciones)
  const [currentGrades, setCurrentGrades] = useState({});

  // Referencias para auto-advance
  const gradeRefs = useRef({});

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      const { data: studentsData, error: studentsError } = await supabase.from('students').select('*');
      // Fetch courses with their names and course_json (subjects)
      const { data: coursesData, error: coursesError } = await supabase.from('courses').select('id, name, course_json');
      const { data: gradesData, error: gradesError } = await supabase.from('grades').select('*');

      if (studentsError) console.error('Error fetching students:', studentsError);
      else if (studentsData) setStudents(studentsData);

      if (coursesError) console.error('Error fetching courses:', coursesError);
      else if (coursesData) setCourses(coursesData.map(c => ({ ...c, subjects: c.course_json || [] }))); // Store full course objects

      if (gradesError) console.error('Error fetching grades:', gradesError);
      else if (gradesData) setGrades(gradesData);
    };
    fetchData();
  }, []);

  // Efecto para actualizar currentCourseSubjects y currentGrades cuando cambia el curso seleccionado
  useEffect(() => {
    if (selectedCourseId) {
      const courseDetails = courses.find(c => c.id === selectedCourseId);
      if (courseDetails && courseDetails.subjects) {
        setCurrentCourseSubjects(courseDetails.subjects);
        // Initialize currentGrades for the new set of subjects
        const initialGrades = courseDetails.subjects.reduce((acc, subject) => {
          acc[subject] = Array(7).fill(''); // Assuming 7 evaluations per subject
          return acc;
        }, {});
        setCurrentGrades(initialGrades);
      } else {
        setCurrentCourseSubjects([]);
        setCurrentGrades({});
      }
    } else {
      setCurrentCourseSubjects([]);
      setCurrentGrades({});
    }
    // Reset student, semester, year, observations when course changes to avoid inconsistent state
    setSelectedStudent('');
    setSelectedSemester('');
    setSelectedYear('');
    setObservations('');
  }, [selectedCourseId, courses]);


  // Agregar estudiante
  const addStudent = async () => {
    if (!newStudent.name || !newStudent.course || !newStudent.year || !newStudent.semester) {
      alert('Por favor completa todos los campos');
      return;
    }
    const { data, error } = await supabase.from('students').insert([newStudent]).select();
    if (error || !data || !Array.isArray(data) || data.length === 0) {
      alert('Error al agregar estudiante');
      console.error(error || 'Datos inválidos o estudiante no devuelto');
      return;
    }
    setStudents(prev => [...prev, ...data]);
    setNewStudent({ name: '', course: '', year: '', semester: '' });
    alert('Estudiante agregado exitosamente');
  };

  // Agregar curso
  const addCourse = async (courseData) => { // courseData is { name: string, subjects: string[] }
    if (courses.some(c => c.name === courseData.name)) {
      alert('Este curso ya existe');
      return;
    }
    const { data, error } = await supabase
      .from('courses')
      .insert([{ name: courseData.name, course_json: courseData.subjects }])
      .select('id, name, course_json') // Select the new course data including id and course_json
      .single(); // Expecting a single object back

    if (error) {
      alert('Error al agregar curso');
      console.error(error);
      return;
    }
    if (data) {
      setCourses(prev => [...prev, { ...data, subjects: data.course_json || [] }]);
      alert('Curso agregado exitosamente');
    } else {
      alert('Error: No se pudo obtener el curso agregado.');
    }
  };


  // Filtrar estudiantes por curso (usa selectedCourse que es el nombre)
  const getStudentsByCourse = () => {
    return students.filter(student => student.course === selectedCourse);
  };

  // Manejar cambio en campos de notas
  const handleGradeChange = (subject, index, value) => {
    if (value === '') {
      setCurrentGrades(prev => ({
        ...prev,
        [subject]: (prev[subject] || Array(7).fill('')).map((grade, i) => i === index ? '' : grade)
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
      [subject]: (prev[subject] || Array(7).fill('')).map((grade, i) => i === index ? value.toUpperCase() : grade)
    }));
    if (value.length === 2 && index < 6) { // Assuming 7 evaluations, so max index is 6
      const nextRef = gradeRefs.current[`${subject}-${index + 1}`];
      if (nextRef) nextRef.focus();
    }
  };

  // Cargar notas existentes cuando se selecciona un estudiante, semestre y año
  useEffect(() => {
    if (selectedStudent && selectedSemester && selectedYear && selectedCourseId) {
      const existingGrade = grades.find(g =>
        g.student_id === parseInt(selectedStudent) &&
        g.semester === parseInt(selectedSemester) &&
        g.year === parseInt(selectedYear) &&
        g.course_id === selectedCourseId // Ensure grades are for the correct course context
      );

      const courseDetails = courses.find(c => c.id === selectedCourseId);
      const subjectsForCourse = courseDetails ? courseDetails.subjects : [];

      if (existingGrade && existingGrade.grades) {
        // Ensure existing grades align with current course subjects
        const alignedGrades = subjectsForCourse.reduce((acc, subj) => {
          acc[subj] = existingGrade.grades[subj] || Array(7).fill('');
          return acc;
        }, {});
        setCurrentGrades(alignedGrades);
        setObservations(existingGrade.observations || '');
      } else {
        // Initialize with empty grades for all subjects of the current course
        const initialGrades = subjectsForCourse.reduce((acc, subject) => {
          acc[subject] = Array(7).fill('');
          return acc;
        }, {});
        setCurrentGrades(initialGrades);
        setObservations('');
      }
    }
  }, [selectedStudent, selectedSemester, selectedYear, selectedCourseId, grades, courses]);


  // Guardar notas
  const saveGrades = async () => {
    if (!selectedStudent || !selectedSemester || !selectedYear || !selectedCourseId) {
      alert('Por favor selecciona curso, estudiante, semestre y año');
      return;
    }
    const gradeRecord = {
      student_id: parseInt(selectedStudent),
      course_id: selectedCourseId, // Add course_id to the record
      semester: parseInt(selectedSemester),
      year: parseInt(selectedYear),
      grades: currentGrades, // This should now be structured by the dynamic subjects
      observations
    };
    const { data: existing } = await supabase
      .from('grades')
      .select('id')
      .eq('student_id', gradeRecord.student_id)
      .eq('course_id', gradeRecord.course_id)
      .eq('semester', gradeRecord.semester)
      .eq('year', gradeRecord.year)
      .single();

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from('grades')
        .update(gradeRecord)
        .eq('id', existing.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('grades').insert([gradeRecord]);
      error = insertError;
    }

    if (error) {
      alert(`Error al ${existing ? 'actualizar' : 'guardar'} notas`);
      console.error(error);
      return;
    }
    alert(`Notas ${existing ? 'actualizadas' : 'guardadas'} exitosamente`);

    const { data: updatedGradesData, error: fetchError } = await supabase.from('grades').select('*');
    if (fetchError) console.error("Error fetching updated grades:", fetchError);
    else if (updatedGradesData) setGrades(updatedGradesData);
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
      alert('Por favor selecciona curso, semestre y año para generar informes.');
      return;
    }

    const targetCourse = courses.find(c => c.name === reportFilters.course);
    if (!targetCourse || !targetCourse.subjects || targetCourse.subjects.length === 0) {
      alert('El curso seleccionado no tiene materias definidas o no se encontró.');
      return;
    }
    const courseSubjectsForReport = targetCourse.subjects;

    try {
      const zip = new JSZip();
      const filteredStudents = students.filter(s =>
        s.course === reportFilters.course && // reportFilters.course is name
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
          g.course_id === targetCourse.id && // Match by course_id
          String(g.semester) === String(reportFilters.semester) &&
          String(g.year) === String(reportFilters.year)
        );

        if (!record || !record.grades || typeof record.grades !== 'object') {
          console.warn(`No grade record or invalid grades for student ${student.name} (ID: ${student.id}) in course ${targetCourse.name}`);
          skippedCount++;
          continue;
        }

        const materiasData = [];
        const promediosFinales = [];
        courseSubjectsForReport.forEach(subject => {
          const notasMateria = record.grades[subject] || [];
          const notasCompletas = Array(7).fill('').map((_, index) => String(notasMateria[index] ?? ''));
          const promedioMateria = calcularPromedio(notasCompletas);
          promediosFinales.push(promedioMateria);
          materiasData.push([subject, ...notasCompletas, promedioMateria.toString()]);
        });

        if (courseSubjectsForReport.length === 0) {
            console.warn(`Skipping student ${student.name} due to no subjects in the course for report.`);
            skippedCount++;
            continue;
        }
        const promedio_final = Math.round(promediosFinales.reduce((a, b) => a + b, 0) / courseSubjectsForReport.length);
        let semestreTexto = (String(student.semester) === '2' || String(reportFilters.semester) === '2') ? 'SEGUNDO' : 'PRIMER';

        const pdfData = {
          nombre_alumno: student.name || 'Sin nombre',
          curso: student.course || 'Sin curso', // Student's registered course name
          año: student.year || 'Sin año',
          informe_periodo: semestreTexto,
          materias_data: materiasData.map(m => m.map(item => String(item ?? ''))),
          observaciones: record.observations || '',
          promedio_final: promedio_final.toString(),
          subjects_for_pdf: courseSubjectsForReport // Pass subjects to PDF generator
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

  const handleCourseSelectionForNotas = (courseName) => {
    setSelectedCourse(courseName); // For student filtering
    const courseDetail = courses.find(c => c.name === courseName);
    setSelectedCourseId(courseDetail ? courseDetail.id : null); // For fetching subjects
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (

    <div className="app-container">
      <header className="app-header">
        <h1 className="header-title">Sistema de Gestión de Notas</h1>
        <img src={logo} alt="logo" className="header-logo" />

      </header>

      <nav className="tabs-navigation">
        <ul className="tabs-list">
          {[
            { id: 'notas', label: 'Ingresar Notas', icon: GraduationCap },
            { id: 'estudiantes', label: 'Agregar Estudiante', icon: Users },
            { id: 'cursos', label: 'Agregar Curso', icon: BookOpen },
            { id: 'reportes', label: 'Descargar Informes', icon: FileDown }
          ].map(tab => (
            <li
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-content">
        <div className="card">
          {activeTab === 'notas' && (
            <NotasTab
              students={students}
              courses={courses.map(c => c.name)}
              selectedCourse={selectedCourse}
              setSelectedCourse={handleCourseSelectionForNotas}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              selectedSemester={selectedSemester}
              setSelectedSemester={setSelectedSemester}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              getStudentsByCourse={getStudentsByCourse}
              subjects={currentCourseSubjects}
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
              courses={courses.map(c => c.name)}
              addStudent={addStudent}
              students={students}
            />
          )}
          {activeTab === 'cursos' && (
            <CursosTab
              addCourse={addCourse}
              courses={courses}
            />
          )}
          {activeTab === 'reportes' && (
            <ReportesTab
              reportFilters={reportFilters}
              setReportFilters={setReportFilters}
              courses={courses.map(c => c.name)}
              generateReports={generateReports}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2024 Your Company Name. All rights reserved.</p>
          <p>Contact: <a href="mailto:info@example.com">info@example.com</a></p>
        </div>
      </footer>
    </div>
  );
};

export default GradeManagementSystem;