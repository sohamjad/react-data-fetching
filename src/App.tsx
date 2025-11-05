import { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { fetchArtworks, type Artwork } from './api'; // ✅ Correct import
import { SelectionProvider, useSelection } from './SelectionContext';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';


function ArtTable() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const rowsPerPage = 12;

  const { selection, setSelection } = useSelection();

  const [selectedIdsOnPage, setSelectedIdsOnPage] = useState<number[]>([]);
  const [numInput, setNumInput] = useState('');
  const overlayRef = useRef<OverlayPanel | null>(null);

  // Fetch API Data 
  useEffect(() => {
    setLoading(true);
    fetchArtworks(page, rowsPerPage)
      .then(res => {
        console.log("Fetched totalRecords from API:", res.total);
        setArtworks(res.data);
        setTotalRecords(res.total || 10000);
        setLoading(false);

        const selectedHere = res.data
  .filter((a: Artwork) => selection.selectedIds.has(a.id))
  .map((a: Artwork) => a.id);

        setSelectedIdsOnPage(selectedHere);
      })
      .catch(() => setLoading(false));
  }, [page]); // 

  //  Handle Single Row Selection 
  const handleSelectionChange = (selectedObjects: Artwork[]) => {
    const ids = selectedObjects.map(a => a.id);

    const newSet = new Set(selection.selectedIds);
    artworks.forEach(a => {
      if (ids.includes(a.id)) newSet.add(a.id);
      else newSet.delete(a.id);
    });

    setSelection({ ...selection, selectedIds: newSet });
    setSelectedIdsOnPage(ids);
  };

  //  Select/Unselect All on Page 
  const handleSelectAllPage = (checked: boolean) => {
    const newSet = new Set(selection.selectedIds);
    if (checked) artworks.forEach(a => newSet.add(a.id));
    else artworks.forEach(a => newSet.delete(a.id));

    setSelection({ ...selection, selectedIds: newSet });
    setSelectedIdsOnPage(checked ? artworks.map(a => a.id) : []);
  };

  //  Custom "Select N" Overlay 
  const handleCustomSelect = () => {
    const n = parseInt(numInput);
    if (!isNaN(n) && n > 0) {
      setSelection({ ...selection, nSelect: n });
      overlayRef.current?.hide();
      setNumInput('');
    }
  };

  //  Apply N-selection lazily (no prefetch) 
  useEffect(() => {
    if (selection.nSelect && selection.selectedIds.size < selection.nSelect) {
      const needed = selection.nSelect - selection.selectedIds.size;
      const available = artworks.filter(a => !selection.selectedIds.has(a.id));

      const toAdd = available.slice(0, needed);
      if (toAdd.length > 0) {
        const newSet = new Set(selection.selectedIds);
        toAdd.forEach(a => newSet.add(a.id));
        setSelection({ ...selection, selectedIds: newSet });
        setSelectedIdsOnPage(
          artworks.filter(a => newSet.has(a.id)).map(a => a.id)
        );
      }
    }
  }, [artworks, selection, setSelection]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Art Institute of Chicago — Artworks</h2>

      {/* -------- Custom Select Overlay -------- */}
      <div style={{ marginBottom: 12 }}>
        <Button
          label="Custom Select N"
          icon="pi pi-list-check"
          onClick={e => overlayRef.current?.toggle(e)}
        />
        <OverlayPanel ref={overlayRef} showCloseIcon>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 200 }}>
            <label htmlFor="numInput">Select N Rows</label>
            <input
              id="numInput"
              type="number"
              min={1}
              value={numInput}
              onChange={e => setNumInput(e.target.value)}
              style={{ padding: 6 }}
            />
            <Button label="Confirm" size="small" onClick={handleCustomSelect} />
          </div>
        </OverlayPanel>
      </div>

      {/* -------- PrimeReact DataTable -------- */}
      <DataTable
        value={artworks}
        loading={loading}
        paginator
        paginatorTemplate="PrevPageLink PageLinks NextPageLink"
        lazy                                
        rows={rowsPerPage}
        totalRecords={totalRecords || 10000}
        first={(page - 1) * rowsPerPage}
        onPage={(e) => {
          const newPage = (e?.page ?? 0) + 1;
          console.log("Page clicked:", newPage);
          setPage(newPage);
        }}
        selection={artworks.filter(a => selectedIdsOnPage.includes(a.id))}
        onSelectionChange={(e: any) => handleSelectionChange(e.value as Artwork[])}
        dataKey="id"
        selectionMode="checkbox"
        header={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={selectedIdsOnPage.length === artworks.length && artworks.length > 0}
              onChange={e => handleSelectAllPage(!!e.checked)}
            />
            <span style={{ marginLeft: 8 }}>Select All (Current Page)</span>
          </div>
        }
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
        <Column field="title" header="Title" sortable />
        <Column field="place_of_origin" header="Place of Origin" sortable />
        <Column field="artist_display" header="Artist" sortable />
        <Column field="inscriptions" header="Inscriptions" sortable />
        <Column field="date_start" header="Date Start" sortable />
        <Column field="date_end" header="Date End" sortable />
      </DataTable>

      {/* -------- Debug info -------- */}
      <div style={{ marginTop: 16 }}>
        <strong>Selected IDs:</strong> {[...selection.selectedIds].join(', ') || 'None'}
        {selection.nSelect && (
          <div>
            <strong>Target N:</strong> {selection.nSelect}
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper 
export default function App() {
  return (
    <SelectionProvider>
      <ArtTable />
    </SelectionProvider>
  );
}
