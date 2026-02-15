// import { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import Tesseract from "tesseract.js";
// import axiosInstance from "../../lib/axiosInstance";

// export default function ImageImportDialog({ open, setOpen }) {
//     const [file, setFile] = useState(null);
//     const [progress, setProgress] = useState(0);
//     const [result, setResult] = useState("");
//     const [airesult, setAiresult] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const onFileChange = (e) => {
//         setFile(e.target.files[0]);
//     };

//     const processImage = async () => {
//         if (!file) return alert("Please select an image");

//         setProgress(0);
//         setResult("");

//         const { data: { text } } = await Tesseract.recognize(
//             file,
//             "eng",
//             {
//                 logger: (m) => {
//                     if (m.status === "recognizing text") {
//                         setProgress(m.progress);
//                     }
//                 },
//             }
//         );

//         setResult(text);
//     };
//     const getAiresponse = async () => {
//         // here make a backend call to get the ai response for structuring the data by using axiosInstance and set the result to the response from backend
//         setLoading(true);
//         try {
//             const response = await axiosInstance.post("/transactions/structure-receipt", { text: result });
//             console.log("AI Response:", response.data);
//             setAiresult(response.data); // This is now an array of objects
//         } catch (error) {
//             console.error("Error structuring receipt:", error);
//             alert("Failed to structure receipt.");
//         } finally {
//             setLoading(false);
//         }
//     }



//     return (
//         <Dialog open={open} onOpenChange={setOpen}>
//             <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col bg-slate-900 text-white border-slate-700">
//                 <DialogHeader className="shrink-0">
//                     <DialogTitle>Import Receipt</DialogTitle>
//                 </DialogHeader>

//                 {/* MAIN CONTENT */}
//                 <div className="flex flex-col flex-1 min-h-0 space-y-4">

//                     {/* FILE INPUT + ACTIONS */}
//                     <div className="space-y-3 shrink-0">
//                         <input type="file" accept="image/*" onChange={onFileChange} />

//                         {file && <p className="text-sm">Selected: {file.name}</p>}

//                         <p className="text-sm">
//                             Progress: {Math.round(progress * 100)}%
//                         </p>

//                         <div className="flex justify-between">
//                             <button
//                                 className="bg-blue-600 px-3 py-1 rounded"
//                                 onClick={processImage}
//                             >
//                                 Process Image
//                             </button>

//                             <button
//                                 className="bg-red-600 px-3 py-1 rounded"
//                                 onClick={() => {
//                                     setFile(null);
//                                     setResult("");
//                                     setProgress(0);
//                                 }}
//                             >
//                                 Clear
//                             </button>
//                         </div>
//                     </div>

//                     {/* OCR RESULT (SCROLLABLE BUT CAPPED) */}
//                     {result && (
//                         <div className="max-h-48 overflow-y-auto rounded bg-slate-800 p-3">
//                             <pre className="whitespace-pre-wrap break-words text-xs text-slate-100">
//                                 {result}
//                             </pre>
//                         </div>
//                     )}

//                     {/* AI STRUCTURING BUTTON */}
//                     <div className="flex justify-center shrink-0">
//                         <button
//                             onClick={getAiresponse}
//                             disabled={loading}
//                             className="bg-yellow-700 px-4 py-1.5 rounded disabled:opacity-50"
//                         >
//                             {loading ? "Structuring..." : "AI Structuring"}
//                         </button>
//                     </div>

//                     {/* AI RESULTS SECTION */}
//                     {airesult.length > 0 && (
//                         <div className="flex flex-col flex-1 min-h-0 border-t border-slate-700 pt-4">

//                             <h3 className="text-sm font-bold text-yellow-500 mb-2 shrink-0">
//                                 Detected Transactions ({airesult.length})
//                             </h3>

//                             {/* SCROLLABLE LIST */}
//                             <div className="flex-1 overflow-y-auto pr-2 space-y-2">
//                                 {airesult.map((tx, idx) => (
//                                     <div
//                                         key={idx}
//                                         className="bg-slate-800 p-3 rounded-lg border border-slate-600 flex justify-between items-center gap-4"
//                                     >
//                                         <div className="min-w-0 flex-1">
//                                             <p
//                                                 className="font-medium text-sm truncate text-slate-100"
//                                                 title={tx.description}
//                                             >
//                                                 {tx.description}
//                                             </p>
//                                             <p className="text-[10px] text-slate-400 truncate">
//                                                 {tx.category} • {tx.merchant}
//                                             </p>
//                                         </div>

//                                         <p className="text-green-400 font-bold shrink-0 text-sm">
//                                             ${tx.amount.toFixed(2)}
//                                         </p>
//                                     </div>
//                                 ))}
//                             </div>

//                             {/* CONFIRM BUTTON */}
//                             <button
//                                 className="w-full bg-green-600 hover:bg-green-700 py-2 rounded mt-4 text-sm font-semibold transition-colors shrink-0"
//                             >
//                                 Confirm & Save {airesult.length} Items
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </DialogContent>

//         </Dialog>
//     );
//     }

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Tesseract from "tesseract.js";
import axiosInstance from "../../lib/axiosInstance";

export default function ImageImportDialog({ open, setOpen }) {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState("");
    const [airesult, setAiresult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const onFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const processImage = async () => {
        if (!file) return alert("Please select an image");

        setProgress(0);
        setResult("");

        const { data: { text } } = await Tesseract.recognize(file, "eng", {
            logger: (m) => {
                if (m.status === "recognizing text") {
                    setProgress(m.progress);
                }
            },
        });

        setResult(text);
    };

    const getAiresponse = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                "/transactions/structure-receipt",
                { text: result }
            );

            // Ensure editable defaults
            const structured = response.data.map((tx) => ({
                description: tx.description || "",
                amount: tx.amount || 0,
                category: tx.category || "Other",
                merchant: tx.merchant || "",
                date: tx.date || new Date().toISOString().slice(0, 10),
                type: tx.type || "expense",
            }));

            setAiresult(structured);
        } catch (error) {
            alert("Failed to structure receipt.");
        } finally {
            setLoading(false);
        }
    };

    const updateTransaction = (index, field, value) => {
        setAiresult((prev) =>
            prev.map((tx, i) =>
                i === index ? { ...tx, [field]: value } : tx
            )
        );
    };

    const removeTransaction = (index) => {
        setAiresult((prev) => prev.filter((_, i) => i !== index));
    };

    const saveTransactions = async () => {
        if (airesult.length === 0) return;

        setSaving(true);
        try {
            await axiosInstance.post("/transactions/bulk-create-transactions", {
                transactions: airesult,
            });

            alert("Transactions saved successfully!");
            setOpen(false);
            setAiresult([]);
            setResult("");
            setFile(null);
        } catch (error) {
            alert("Failed to save transactions.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col bg-slate-900 text-white border-slate-700">
                <DialogHeader>
                    <DialogTitle>Import Receipt</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col flex-1 space-y-4 overflow-hidden">

                    {/* FILE */}
                    <div className="space-y-2">
                        <input type="file" accept="image/*" onChange={onFileChange} />
                        <p className="text-sm">Progress: {Math.round(progress * 100)}%</p>

                        <div className="flex gap-2">
                            <button
                                className="bg-blue-600 px-3 py-1 rounded"
                                onClick={processImage}
                            >
                                Process Image
                            </button>
                            <button
                                className="bg-red-600 px-3 py-1 rounded"
                                onClick={() => {
                                    setFile(null);
                                    setResult("");
                                    setProgress(0);
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* OCR RESULT */}
                    {result && (
                        <div className="max-h-40 overflow-y-auto bg-slate-800 p-2 rounded text-xs">
                            <pre className="whitespace-pre-wrap">{result}</pre>
                        </div>
                    )}

                    {/* AI STRUCTURE */}
                    <button
                        onClick={getAiresponse}
                        disabled={loading}
                        className="bg-yellow-700 px-4 py-1.5 rounded disabled:opacity-50"
                    >
                        {loading ? "Structuring..." : "AI Structuring"}
                    </button>

                    {/* EDITABLE AI RESULTS */}
                    {airesult.length > 0 && (
                        <div className="flex flex-col flex-1 overflow-hidden border-t border-slate-700 pt-3">
                            <h3 className="text-sm font-bold text-yellow-500 mb-2">
                                Review & Edit Transactions
                            </h3>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                {airesult.map((tx, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-slate-800 p-3 rounded border border-slate-600 space-y-2"
                                    >
                                        <input
                                            className="w-full bg-slate-900 p-1 text-sm rounded"
                                            value={tx.description}
                                            onChange={(e) =>
                                                updateTransaction(idx, "description", e.target.value)
                                            }
                                            placeholder="Description"
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                className="bg-slate-900 p-1 rounded text-sm"
                                                value={tx.amount}
                                                onChange={(e) =>
                                                    updateTransaction(idx, "amount", Number(e.target.value))
                                                }
                                            />
                                            <input
                                                className="bg-slate-900 p-1 rounded text-sm"
                                                value={tx.category}
                                                onChange={(e) =>
                                                    updateTransaction(idx, "category", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                className="bg-slate-900 p-1 rounded text-sm"
                                                value={tx.merchant}
                                                onChange={(e) =>
                                                    updateTransaction(idx, "merchant", e.target.value)
                                                }
                                            />
                                            <input
                                                type="date"
                                                className="bg-slate-900 p-1 rounded text-sm"
                                                value={tx.date}
                                                onChange={(e) =>
                                                    updateTransaction(idx, "date", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <select
                                                className="bg-slate-900 p-1 rounded text-sm"
                                                value={tx.type}
                                                onChange={(e) =>
                                                    updateTransaction(idx, "type", e.target.value)
                                                }
                                            >
                                                <option value="expense">Expense</option>
                                                <option value="income">Income</option>
                                            </select>

                                            <button
                                                className="text-red-400 text-xs"
                                                onClick={() => removeTransaction(idx)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={saveTransactions}
                                disabled={saving}
                                className="mt-3 bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-semibold"
                            >
                                {saving
                                    ? "Saving..."
                                    : `Confirm & Save ${airesult.length} Transactions`}
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
