
export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const maxShown = 5;
    if (pages <= maxShown) return Array.from({ length: pages }, (_, i) => i + 1);
    const numbers = [];
    if (page > 3) numbers.push(1);
    if (page > 4) numbers.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
      numbers.push(i);
    }
    if (page < pages - 3) numbers.push('...');
    if (page < pages - 2) numbers.push(pages);
    return numbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex justify-center my-8" aria-label="Pagination">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          <button
            className="px-3 py-2 text-sm rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            aria-label="First page"
          >
            « First
          </button>
        </li>
        <li>
          <button
            className="px-3 py-2 text-sm rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            ‹ Prev
          </button>
        </li>
        {pageNumbers.map((p, idx) => (
          <li key={idx}>
            {p === '...'
              ? <span className="px-2 py-2 text-gray-400">…</span>
              : <button
                  className={`px-4 py-2 text-sm rounded-full border transition-colors ${p === page ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => onPageChange(p)}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
            }
          </li>
        ))}
        <li>
          <button
            className="px-3 py-2 text-sm rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(page + 1)}
            disabled={page === pages}
            aria-label="Next page"
          >
            Next ›
          </button>
        </li>
        <li>
          <button
            className="px-3 py-2 text-sm rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(pages)}
            disabled={page === pages}
            aria-label="Last page"
          >
            Last »
          </button>
        </li>
      </ul>
    </nav>
  );
}


