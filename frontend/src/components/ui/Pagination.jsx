// Fichier: src/components/ui/Pagination.jsx

import React from 'react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage,
  onItemsPerPageChange,
  totalItems 
}) {
  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Première page
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => onPageChange(1)}
          className="btn btn-outline btn-sm"
          title="Première page"
        >
          <i className="bi bi-chevron-double-left"></i>
        </button>
      );
    }

    // Précédent
    if (currentPage > 1) {
      buttons.push(
        <button
          key="prev"
          onClick={() => onPageChange(currentPage - 1)}
          className="btn btn-outline btn-sm"
          title="Page précédente"
        >
          <i className="bi bi-chevron-left"></i>
        </button>
      );
    }

    // Pages numérotées
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline'}`}
        >
          {i}
        </button>
      );
    }

    // Suivant
    if (currentPage < totalPages) {
      buttons.push(
        <button
          key="next"
          onClick={() => onPageChange(currentPage + 1)}
          className="btn btn-outline btn-sm"
          title="Page suivante"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      );
    }

    // Dernière page
    if (endPage < totalPages) {
      buttons.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages)}
          className="btn btn-outline btn-sm"
          title="Dernière page"
        >
          <i className="bi bi-chevron-double-right"></i>
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-md py-lg border-t">
      <div className="flex items-center gap-md">
        <span className="text-sm text-secondary">
          Afficher
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="form-select w-24"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span className="text-sm text-secondary">
          résultats par page
        </span>
      </div>

      <div className="flex items-center gap-sm">
        {getPaginationButtons()}
      </div>

      <div className="text-sm text-secondary text-center sm:text-right">
        <div>Page {currentPage} sur {totalPages}</div>
        <div className="text-xs">{totalItems} résultats au total</div>
      </div>
    </div>
  );
}