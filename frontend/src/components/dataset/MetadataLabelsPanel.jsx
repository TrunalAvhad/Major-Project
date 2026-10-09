import React, { useEffect, useState } from 'react';
import datasetService from '../../services/datasetService';
import { FileSpreadsheet, FolderOpen, Loader2 } from 'lucide-react';

// Same rule Module 4 enforces: class names become folder names in Module 5's output.
const CLASS_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9 _.-]{0,63}$/;
// Numeric codes (0/1, 1..7) say nothing about the class, so the operator must name them.
const isCode = (value) => /^-?\d+(\.\d+)?$/.test(value);

const control = {
  height: '30px', background: '#090d16', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)', fontSize: '12px', padding: '0 8px',
};

/**
 * Image labels from a metadata CSV (e.g. ISIC: one image folder plus a CSV) instead of
 * class folder names. Calls onChange with a Module 4 label source, or null while incomplete.
 */
const MetadataLabelsPanel = ({ onChange, disabled }) => {
  const [csvPath, setCsvPath] = useState('');
  const [columns, setColumns] = useState([]);
  const [cols, setCols] = useState({ image: '', label: '', group: '' });
  const [values, setValues] = useState([]);             // [{ value, count }]
  const [mapping, setMapping] = useState({});           // value -> { name, include }
  const [state, setState] = useState({ loading: false, error: null });

  const read = async (path, labelColumn) => {
    setState({ loading: true, error: null });
    try {
      const res = await datasetService.readMetadataCsv(path, labelColumn);
      setState({ loading: false, error: null });
      return res;
    } catch (err) {
      setState({ loading: false, error: err.message });
      return null;
    }
  };

  const loadColumns = async (path) => {
    setColumns([]); setValues([]); setCols({ image: '', label: '', group: '' });
    const res = path && await read(path);
    if (res) setColumns(res.columns);
  };

  const browse = async () => {
    try {
      const path = await datasetService.browseCsv();
      if (path) { setCsvPath(path); loadColumns(path); }
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };

  const chooseLabelColumn = async (label) => {
    setCols((c) => ({ ...c, label }));
    setValues([]);
    if (!label) return;
    const res = await read(csvPath, label);
    if (!res) return;
    const vals = res.values.filter((v) => v.value !== '');
    setValues(res.values);
    setMapping(Object.fromEntries(vals.map(({ value }) => [value, { name: isCode(value) ? '' : value, include: true }])));
  };

  const labelled = values.filter((v) => v.value !== '');
  const included = labelled.filter((v) => mapping[v.value]?.include);
  const badName = included.find((v) => !CLASS_NAME_RE.test(mapping[v.value].name.trim()));
  const classNames = [...new Set(included.map((v) => mapping[v.value].name.trim()))];
  const ready = csvPath && cols.image && cols.label && !badName && classNames.length >= 2
    && new Set([cols.image, cols.label, cols.group].filter(Boolean)).size === [cols.image, cols.label, cols.group].filter(Boolean).length;

  useEffect(() => {
    onChange(ready ? {
      csv_path: csvPath,
      image_column: cols.image,
      label_column: cols.label,
      group_column: cols.group || null,
      label_map: Object.fromEntries(labelled.map(({ value }) => [value, mapping[value].include ? mapping[value].name.trim() : null])),
    } : null);
  }, [ready, csvPath, cols, mapping, values]); // eslint-disable-line react-hooks/exhaustive-deps

  const select = (key, label, optional) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', flex: 1, minWidth: '160px' }}>
      {label}
      <select value={cols[key]} disabled={disabled || !columns.length} style={control}
        onChange={(e) => (key === 'label' ? chooseLabelColumn(e.target.value) : setCols((c) => ({ ...c, [key]: e.target.value })))}>
        <option value="">{optional ? 'None (split by image)' : 'Choose a column'}</option>
        {columns.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </label>
  );

  return (
    <div style={{ marginTop: '12px', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: '#0a101d' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <button type="button" className="btn btn-secondary" onClick={browse} disabled={disabled} style={{ padding: '0 12px' }}>
          <FolderOpen size={13} /> Browse CSV...
        </button>
        <input value={csvPath} onChange={(e) => setCsvPath(e.target.value)} onBlur={() => loadColumns(csvPath.trim())}
          placeholder="C:\path\to\train-metadata.csv" disabled={disabled}
          style={{ ...control, flex: 1, fontFamily: 'var(--font-mono)' }} />
        {state.loading && <Loader2 size={16} className="spin" style={{ alignSelf: 'center' }} />}
      </div>

      {state.error && <div style={{ fontSize: '11px', color: 'var(--status-danger)', marginBottom: '8px' }}>{state.error}</div>}

      {columns.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {select('image', 'Image id column (file name, name without extension, or relative path)')}
          {select('label', 'Label column')}
          {select('group', 'Lesion / patient id column (keeps a lesion in one split)', true)}
        </div>
      )}

      {labelled.length > 0 && (
        <>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileSpreadsheet size={12} /> Class mapping: name the class for each value of <code className="font-mono">{cols.label}</code>.
            Several values can share a class (e.g. MEL and BCC as malignant); unticked values are excluded.
          </div>
          <div className="table-container">
            <table className="fl-table">
              <thead><tr><th>Use</th><th>CSV value</th><th>Rows</th><th>Class name</th></tr></thead>
              <tbody>
                {labelled.map(({ value, count }) => {
                  const m = mapping[value] || { name: value, include: true };
                  const invalid = m.include && !CLASS_NAME_RE.test(m.name.trim());
                  return (
                    <tr key={value}>
                      <td><input type="checkbox" checked={m.include} disabled={disabled}
                        onChange={(e) => setMapping((s) => ({ ...s, [value]: { ...m, include: e.target.checked } }))} /></td>
                      <td className="font-mono" style={{ fontSize: '11px' }}>{value}</td>
                      <td className="font-mono" style={{ fontSize: '11px' }}>{count.toLocaleString()}</td>
                      <td>
                        <input value={m.name} disabled={disabled || !m.include} placeholder="e.g. melanoma"
                          onChange={(e) => setMapping((s) => ({ ...s, [value]: { ...m, name: e.target.value } }))}
                          style={{ ...control, width: '180px', borderColor: invalid ? 'var(--status-danger)' : 'var(--border-subtle)' }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {values.some((v) => v.value === '') && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              {values.find((v) => v.value === '').count.toLocaleString()} row(s) have no label and are not used.
            </div>
          )}
          <div style={{ fontSize: '11px', marginTop: '8px', color: ready ? 'var(--status-healthy)' : 'var(--status-warning)' }}>
            {ready ? `Classes: ${classNames.join(', ')}`
              : badName ? (mapping[badName.value].name.trim()
                ? `"${mapping[badName.value].name}" is not a valid class name (letters, digits, space, _ - .).`
                : `Type a class name for value "${badName.value}" (or untick it to exclude those images).`)
                : !cols.image ? 'Choose the image id column.'
                  : classNames.length < 2 ? 'At least two classes are needed.' : 'Each column can be used only once.'}
          </div>
        </>
      )}
    </div>
  );
};

export default MetadataLabelsPanel;
