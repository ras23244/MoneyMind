import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CSVImporter from "@/components/import/CSVImporter";

export default function ImportCSVDialog({ open, setOpen }) {
    const handleComplete = (result) => {
       
        if (result && (result.inserted || result.cancelled)) {
            setOpen(false);
        } else if (result && result.attempted) {
          
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 text-white border-slate-700">
                <DialogHeader>
                    <DialogTitle>Import Transactions</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <CSVImporter onComplete={handleComplete} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
