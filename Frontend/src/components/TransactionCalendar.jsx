import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

export default function TransactionCalendar({ selectedDate, setSelectedDate }) {
    return (
        <Card className="bg-card-dark border border-white/10">
            <CardHeader>
                <CardTitle className="text-white">Select Date</CardTitle>
                <p className="text-white/60 text-sm">Click a date to view transactions</p>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && setSelectedDate(d)}
                    className="w-full bg-transparent text-white border-0"
                />
            </CardContent>
        </Card>
    );
}
