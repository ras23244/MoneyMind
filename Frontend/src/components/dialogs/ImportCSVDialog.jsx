import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, AlertCircle } from 'lucide-react';

export default function ImportCSVDialog({ open, setOpen }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Parse CSV preview
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n').slice(0, 4); // Show first 3 rows
                setPreview(lines);
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                const csv = event.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());

                // Example: Parse transactions
                const transactions = lines.slice(1).filter(line => line.trim()).map(line => {
                    const values = line.split(',');
                    return {
                        date: values[0]?.trim(),
                        description: values[1]?.trim(),
                        amount: parseFloat(values[2]) || 0,
                        category: values[3]?.trim(),
                    };
                });

                console.log('Parsed transactions:', transactions);
                // Here you would send to backend
                setOpen(false);
                setFile(null);
                setPreview(null);
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('Import error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 text-white border-slate-700">
                <DialogHeader>
                    <DialogTitle>Import Transactions</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-blue-900/30 border border-blue-600/30 p-4 rounded-lg flex gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
                        <div className="text-sm text-blue-200">
                            <p className="font-medium mb-1">CSV Format Required</p>
                            <p>Please use this format: Date, Description, Amount,Type, Category</p>
                            <p className="mt-1 text-xs">Example: 2025-11-11, Grocery, 500,Expense, Food</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Select CSV File</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm"
                            />
                            <FileDown className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    {preview && (
                        <div>
                            <p className="text-sm font-medium mb-2">Preview</p>
                            <div className="bg-slate-800 p-3 rounded-lg text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
                                {preview.map((line, idx) => (
                                    <div key={idx} className="text-slate-300">
                                        {line}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOpen(false);
                                setFile(null);
                                setPreview(null);
                            }}
                            className="border-slate-600 hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={!file || loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? 'Importing...' : 'Import Transactions'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
