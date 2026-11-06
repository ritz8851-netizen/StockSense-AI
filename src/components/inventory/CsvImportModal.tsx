import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface CsvImportModalProps {
  onClose: () => void;
}

interface ParsedRow {
  rowIndex: number;
  data: Partial<Product>;
  errors: string[];
  isValid: boolean;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ onClose }) => {
  const { products, addProduct, suppliers } = useStore();

  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [hasParsed, setHasParsed] = useState(false);

  // Download sample CSV template
  const handleDownloadSample = () => {
    const sample = `sku,name,category,sellingPrice,purchaseCost,currentStock,minStock,maxStock,avgDailySales,supplierName,leadTimeDays,unit
GR-BAS-101,Kohinoor Super Basmati Rice 5kg,Grocery & Staples,420,340,25,10,60,2.5,Balaji Agro Distributors,3,bag
PK-WAF-102,Lays India Magic Masala Chips 50g,Packaged Foods & Snacks,20,16,40,15,80,5.2,South India FMCG Wholesalers,2,pack
BV-GRN-103,Tetley Pure Green Tea 100 Bags,Beverages,360,290,12,8,30,1.4,Royal Tea & Beverage Depot,3,box
PC-FAC-104,Himalaya Purifying Neem Face Wash 150ml,Personal Care,180,145,18,10,35,1.8,Hindustan Home & Personal Care Hub,4,tube`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'StockSense_Sample_Template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Parse CSV string and validate columns and rows
  const handleParseCsv = (rawContent: string) => {
    const lines = rawContent.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      alert('CSV file is empty or does not contain a header line.');
      return;
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

    const requiredHeaders = ['sku', 'name', 'category', 'sellingprice', 'purchasecost', 'currentstock'];
    const missing = requiredHeaders.filter((h) => !header.includes(h));

    if (missing.length > 0) {
      alert(`Missing required columns in CSV header: ${missing.join(', ')}`);
      return;
    }

    const existingSkus = new Set(products.map((p) => p.sku.toLowerCase()));
    const seenSkusInFile = new Set<string>();

    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic CSV splitter considering quotes
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const cleanValues = values.map((v) => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

      const rowObj: any = {};
      header.forEach((h, idx) => {
        rowObj[h] = cleanValues[idx] || '';
      });

      const errors: string[] = [];

      // Validation
      const sku = (rowObj['sku'] || '').trim();
      if (!sku) {
        errors.push('SKU is required.');
      } else if (existingSkus.has(sku.toLowerCase())) {
        errors.push(`SKU '${sku}' already exists in your inventory.`);
      } else if (seenSkusInFile.has(sku.toLowerCase())) {
        errors.push(`Duplicate SKU '${sku}' found multiple times in this file.`);
      } else {
        seenSkusInFile.add(sku.toLowerCase());
      }

      const name = (rowObj['name'] || '').trim();
      if (!name) errors.push('Product name is required.');

      const category = (rowObj['category'] || '').trim() || 'General';

      const sellingPrice = parseFloat(rowObj['sellingprice']);
      if (isNaN(sellingPrice) || sellingPrice <= 0) {
        errors.push('Selling price must be a positive number.');
      }

      const purchaseCost = parseFloat(rowObj['purchasecost']);
      if (isNaN(purchaseCost) || purchaseCost < 0) {
        errors.push('Purchase cost must be a valid number (>= 0).');
      }

      const currentStock = parseInt(rowObj['currentstock'], 10);
      if (isNaN(currentStock) || currentStock < 0) {
        errors.push('Current stock must be a whole number (>= 0).');
      }

      const minStock = parseInt(rowObj['minstock'] || '10', 10);
      const maxStock = parseInt(rowObj['maxstock'] || '50', 10);
      const avgDailySales = parseFloat(rowObj['avgdailysales'] || '2.0');
      const leadTimeDays = parseInt(rowObj['leadtimedays'] || '3', 10);
      const unit = (rowObj['unit'] || 'unit').trim();
      const supplierName = (rowObj['suppliername'] || suppliers[0]?.name || 'Direct Wholesale').trim();

      const parsedProduct: Partial<Product> = {
        sku,
        name,
        category,
        description: `${name} (${category})`,
        sellingPrice: isNaN(sellingPrice) ? 0 : sellingPrice,
        purchaseCost: isNaN(purchaseCost) ? 0 : purchaseCost,
        currentStock: isNaN(currentStock) ? 0 : currentStock,
        minStock: isNaN(minStock) ? 10 : minStock,
        maxStock: isNaN(maxStock) ? 50 : maxStock,
        avgDailySales: isNaN(avgDailySales) ? 2.0 : avgDailySales,
        supplierId: suppliers[0]?.id || 'sup_default',
        supplierName,
        leadTimeDays: isNaN(leadTimeDays) ? 3 : leadTimeDays,
        unit,
      };

      rows.push({
        rowIndex: i + 1,
        data: parsedProduct,
        errors,
        isValid: errors.length === 0,
      });
    }

    setParsedRows(rows);
    setHasParsed(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      handleParseCsv(text);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('No valid rows found to import.');
      return;
    }

    validRows.forEach((row) => {
      addProduct(row.data as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
    });

    alert(`Successfully imported ${validRows.length} products into StockSense!`);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Import Products via CSV</h2>
              <p className="text-xs text-slate-500">Preview and validate row data before committing to inventory</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Download Sample & Upload Area */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-800">Need the correct column format?</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Download our pre-formatted template with sample Indian retail products.
              </p>
            </div>
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sample CSV</span>
            </button>
          </div>

          {/* File Dropzone */}
          {!hasParsed && (
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-emerald-500 transition-colors bg-white">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">Drag & Drop your CSV file here or browse</p>
              <p className="text-xs text-slate-400 mt-1">Supports standard CSV & Excel UTF-8 CSV</p>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="mt-4 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>
          )}

          {/* Preview Table */}
          {hasParsed && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-slate-700">File: {fileName}</span>
                  <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {validCount} Valid
                  </span>
                  {errorCount > 0 && (
                    <span className="flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errorCount} Invalid (Will be skipped)
                    </span>
                  )}
                </div>

                <label className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer">
                  Upload different file
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Row</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Cost</th>
                      <th className="py-2 px-3 text-center">Stock</th>
                      <th className="py-2 px-3">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r) => (
                      <tr key={r.rowIndex} className={r.isValid ? 'hover:bg-slate-50' : 'bg-red-50/40'}>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">#{r.rowIndex}</td>
                        <td className="py-2 px-3">
                          {r.isValid ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              Ready
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                              Error
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono">{r.data.sku || '—'}</td>
                        <td className="py-2 px-3 font-semibold truncate max-w-[160px]">{r.data.name || '—'}</td>
                        <td className="py-2 px-3 text-slate-500">{r.data.category || '—'}</td>
                        <td className="py-2 px-3 text-right">{r.data.sellingPrice || 0}</td>
                        <td className="py-2 px-3 text-right">{r.data.purchaseCost || 0}</td>
                        <td className="py-2 px-3 text-center font-bold">{r.data.currentStock || 0}</td>
                        <td className="py-2 px-3 text-red-600 text-[11px]">
                          {r.errors.length > 0 ? r.errors.join('; ') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>

          {hasParsed && (
            <button
              onClick={handleConfirmImport}
              disabled={validCount === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              Import {validCount} Products
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
