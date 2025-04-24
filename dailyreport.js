import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

const initialQueue = [
  { kodeSL: "SL001", line: "PWE 01", status: "Antri Timbang" },
  { kodeSL: "SL002", line: "PWE 02", status: "Antri Timbang" },
  { kodeSL: "SL003", line: "PWE 03", status: "Antri Timbang" },
  { kodeSL: "SL004", line: "PWE 04", status: "Antri Timbang" },
];

export default function DailyReportProduksi() {
  const [page, setPage] = useState("dashboard");
  const [line, setLine] = useState("");
  const [kodeSL, setKodeSL] = useState("");
  const [kodeBulk, setKodeBulk] = useState("");
  const [kodeItem, setKodeItem] = useState("");
  const [jumlahTeoritis, setJumlahTeoritis] = useState("");
  const [status, setStatus] = useState("Antri Timbang");
  const [operator, setOperator] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timer, setTimer] = useState(null);
  const [stopMode, setStopMode] = useState(null);
  const [issues, setIssues] = useState("");
  const [queue, setQueue] = useState(initialQueue);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const previousLeadTime = useRef(0);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setElapsedTime(previousLeadTime.current + Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    }
  }, [startTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleStart = () => {
    setStartTime(Date.now());
  };

  const handleStop = (mode) => {
    clearInterval(timer);
    setStopMode(mode);
    previousLeadTime.current = elapsedTime;

    if (mode === "done") {
      setQueue(queue.map((item) => item.kodeSL === kodeSL ? { ...item, status: "Selesai Timbang" } : item));
      setShowSummary(true);
    } else if (mode === "lanjut") {
      setQueue(queue.map((item) => item.kodeSL === kodeSL ? { ...item, status: "Proses Timbang" } : item));
    }
  };

  const reset = () => {
    setStartTime(null);
    setElapsedTime(previousLeadTime.current);
    setOperator("");
    setStopMode(null);
    setIssues("");
    setKodeSL("");
    setKodeBulk("");
    setKodeItem("");
    setJumlahTeoritis("");
    setShowSummary(false);
  };

  const handleLineChange = (selectedLine) => {
    setLine(selectedLine);
    const filtered = queue.filter((item) => item.line === selectedLine && item.status !== "Selesai Timbang");
    setFilteredItems(filtered);
  };

  return (
    <div className="p-4 grid gap-4">
      {page === "dashboard" && (
        <div className="grid grid-cols-1 gap-4">
          <Button onClick={() => setPage("antrian")}>Antrian Timbang (Leader)</Button>
          <Button onClick={() => setPage("daily")}>Daily Report Timbang (Operator)</Button>
        </div>
      )}

      {page === "antrian" && (
        <Card>
          <CardContent className="grid gap-2 p-4">
            <Input placeholder="KodeSL_Snfg" value={kodeSL} onChange={(e) => setKodeSL(e.target.value)} />
            <Select onValueChange={setLine}>
              <SelectTrigger>{line || "Pilih PWE"}</SelectTrigger>
              <SelectContent>
                <SelectItem value="PWE 01">PWE 01</SelectItem>
                <SelectItem value="PWE 02">PWE 02</SelectItem>
                <SelectItem value="PWE 03">PWE 03</SelectItem>
                <SelectItem value="PWE 04">PWE 04</SelectItem>
              </SelectContent>
            </Select>
            <Input value={status} disabled />
            <Button onClick={() => {
              setQueue([...queue, { kodeSL, line, status }]);
              setPage("dashboard");
              alert(`Input Antrian:
KodeSL: ${kodeSL}\nLine: ${line}\nStatus: ${status}`);
              setKodeSL("");
              setLine("");
            }}>Submit</Button>
          </CardContent>
        </Card>
      )}

      {page === "daily" && (
        <Card>
          <CardContent className="grid gap-2 p-4">
            <Select onValueChange={handleLineChange}>
              <SelectTrigger>{line || "Pilih PWE"}</SelectTrigger>
              <SelectContent>
                <SelectItem value="PWE 01">PWE 01</SelectItem>
                <SelectItem value="PWE 02">PWE 02</SelectItem>
                <SelectItem value="PWE 03">PWE 03</SelectItem>
                <SelectItem value="PWE 04">PWE 04</SelectItem>
              </SelectContent>
            </Select>
            {line && filteredItems.length > 0 && (
              <>
                <Select onValueChange={setKodeSL}>
                  <SelectTrigger>{kodeSL || "Pilih KodeSL_Snfg"}</SelectTrigger>
                  <SelectContent>
                    {filteredItems.map((item, idx) => (
                      <SelectItem key={idx} value={item.kodeSL}>{item.kodeSL}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Kode Bulk" value={kodeBulk} onChange={(e) => setKodeBulk(e.target.value)} />
                <Input placeholder="Kode Item" value={kodeItem} onChange={(e) => setKodeItem(e.target.value)} />
                <Input placeholder="Jumlah Teoritis (kg)" value={jumlahTeoritis} onChange={(e) => setJumlahTeoritis(e.target.value)} />
                <Input placeholder="Nama Operator" value={operator} onChange={(e) => setOperator(e.target.value)} />
                {!startTime ? (
                  <Button onClick={handleStart}>Start Timbang</Button>
                ) : (
                  <>
                    <div className="text-xl">Lead Time: {formatTime(elapsedTime)}</div>
                    <Button onClick={() => handleStop("done")}>Stop Timbang - Is Done</Button>
                    <Button onClick={() => handleStop("lanjut")}>Stop Timbang - Lanjut Shift</Button>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {stopMode && showSummary && (
        <Card>
          <CardContent className="grid gap-2 p-4">
            <div>KodeSL: {kodeSL}</div>
            <div>Operator: {operator}</div>
            <div>Total Lead Time: {formatTime(elapsedTime)}</div>
            <Input placeholder="Kendala selama proses?" value={issues} onChange={(e) => setIssues(e.target.value)} />
            <Button onClick={() => { reset(); setPage("dashboard"); }}>Finish</Button>
          </CardContent>
        </Card>
      )}

      {stopMode && !showSummary && (
        <Card>
          <CardContent className="grid gap-2 p-4">
            <div>Total Lead Time: {formatTime(elapsedTime)}</div>
            <Button onClick={() => { reset(); }}>Lanjut Shift - Start Lagi</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
