import React from 'react';
import { FileDown } from 'lucide-react';

import './componentes_style.css';

const ReportesTab = ({
  reportFilters,
  setReportFilters,
  courses,
  generateReports
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-md">
      <h3 className="text-lg font-semibold mb-4">Generar Informes por Curso</h3>
      <div className="space-y-4">
        <div>
          <label className="texto_label">Curso</label>
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
          <label className="texto_label">Semestre</label>
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
          <label className="texto_label">Año</label>
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
  );
};

export default ReportesTab;
