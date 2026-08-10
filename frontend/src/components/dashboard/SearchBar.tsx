'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SearchParams } from '@/services/attendance.service';

interface SearchBarProps {
  params: SearchParams;
}

export function SearchBar({ params }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (formData: FormData) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    const search = formData.get('search') as string;
    const searchType = formData.get('searchType') as string;
    const fromDate = formData.get('fromDate') as string;
    const toDate = formData.get('toDate') as string;

    if (search) newParams.set('search', search);
    else newParams.delete('search');
    
    if (searchType) newParams.set('searchType', searchType);
    if (fromDate) newParams.set('fromDate', fromDate);
    if (toDate) newParams.set('toDate', toDate);
    
    newParams.set('page', '1');
    
    router.push(`?${newParams.toString()}`);
  };

  return (
    <form action={handleSearch} className="search-bar no-print">
      <select name="searchType" className="form-select search-select" defaultValue={params.searchType || 'general'}>
        <option value="general">Name / No.</option>
        <option value="emp_no">Emp No.</option>
        <option value="acc_no">AC-No.</option>
      </select>
      
      <input
        type="text"
        name="search"
        className="form-control search-input"
        placeholder="e.g. arif, islam, siam"
        defaultValue={params.search || ''}
      />
      
      <div className="date-range">
        <span className="text-muted">From</span>
        <input
          type="date"
          name="fromDate"
          className="form-control"
          defaultValue={params.fromDate || ''}
        />
        <span className="text-muted">To</span>
        <input
          type="date"
          name="toDate"
          className="form-control"
          defaultValue={params.toDate || ''}
        />
      </div>
      
      <button type="submit" className="btn btn-primary">
        <i className="fas fa-search"></i>
        Search
      </button>
    </form>
  );
}
