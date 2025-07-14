import React from 'react';
import { FileDown } from 'lucide-react';

const ReportesTab = ({
  reportFilters,
  setReportFilters,
  courses,
  generateReports
}) => {
  return (
    <div>
      <h3 className="card-title">Generar Informes por Curso</h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Curso</label>
          <select
            value={reportFilters.course}
            onChange={(e) => setReportFilters({ ...reportFilters, course: e.target.value })}
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
            value={reportFilters.semester}
            onChange={(e) => setReportFilters({ ...reportFilters, semester: e.target.value })}
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
            value={reportFilters.year}
            onChange={(e) => setReportFilters({ ...reportFilters, year: e.target.value })}
            className="form-select"
          >
            <option value="">Seleccionar año</option>
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={generateReports} className="btn btn-primary mt-4">
        <FileDown className="w-4 h-4" />
        <span>Descargar Informes</span>
      </button>
    </div>
  );
};

export default ReportesTab;
