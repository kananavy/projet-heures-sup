// components/ui/QuickExportButtons.jsx
import React, { useState } from 'react';
import { useExcelExport } from '../../hooks/useExcelExport';

const QuickExportButtons = ({ 
  data, 
  type = 'teachers', // 'teachers' ou 'courses'
  notify,
  className = '',
  size = 'md' // 'sm', 'md', 'lg'
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { loading, exportTeachersToExcel, exportCoursesToExcel } = useExcelExport();

  const handleExport = async (format = 'standard') => {
    if (!data || data.length === 0) {
      notify('Aucune donnée à exporter', 'warning');
      return;
    }

    try {
      let result;
      
      if (type === 'teachers') {
        result = await exportTeachersToExcel(data);
      } else if (type === 'courses') {
        result = await exportCoursesToExcel(data);
      }

      if (result.success) {
        notify(`✅ Export réussi : ${result.filename}`, 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur export:', error);
      notify(`❌ Erreur d'export : ${error.message}`, 'error');
    }

    setShowDropdown(false);
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm', 
      lg: 'px-4 py-3 text-base'
    };
    return sizes[size] || sizes.md;
  };

  const getIconSize = () => {
    const sizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };
    return sizes[size] || sizes.md;
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Interface 1: Bouton simple */}
      <div className="flex gap-2">
        {/* Bouton export principal */}
        <button
          onClick={() => handleExport()}
          disabled={loading || !data || data.length === 0}
          className={`btn btn-success ${getSizeClasses()} ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={`Exporter ${type === 'teachers' ? 'les enseignants' : 'les cours'} en Excel`}
        >
          {loading ? (
            <>
              <div className={`animate-spin mr-1 ${getIconSize()}`}>⏳</div>
              <span className="hidden sm:inline">Export...</span>
            </>
          ) : (
            <>
              <i className={`bi bi-file-earmark-excel mr-1 ${getIconSize()}`}></i>
              <span className="hidden sm:inline">
                Excel ({data?.length || 0})
              </span>
              <span className="sm:hidden">📊</span>
            </>
          )}
        </button>

        {/* Bouton dropdown pour options avancées */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={loading || !data || data.length === 0}
            className={`btn btn-outline-success ${getSizeClasses()} ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Options d'export"
          >
            <i className={`bi bi-three-dots-vertical ${getIconSize()}`}></i>
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <>
              {/* Overlay pour fermer le dropdown */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              ></div>
              
              {/* Menu dropdown */}
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase border-b">
                    Options d'export
                  </div>
                  
                  <button
                    onClick={() => handleExport('standard')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
                  >
                    <i className="bi bi-file-earmark-excel text-green-600 mr-2"></i>
                    Export standard Excel
                  </button>
                  
                  <button
                    onClick={() => handleExport('detailed')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
                  >
                    <i className="bi bi-file-earmark-spreadsheet text-blue-600 mr-2"></i>
                    Export détaillé
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <div className="px-3 py-2 text-xs text-gray-500">
                    {data?.length || 0} élément(s) à exporter
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickExportButtons;