import React from 'react';

export default function CalculationTable({ results }) {
    if (!results || results.length === 0) return null;

    // Deduplicate processes (e.g. RR slices) to get final completion times
    const uniqueProcesses = Object.values(
        results.reduce((acc, curr) => {
            if (!curr.isIdle) {
                acc[curr.id] = curr;
            }
            return acc;
        }, {})
    );

    if (uniqueProcesses.length === 0) return null;

    const totalTAT = uniqueProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const totalWT = uniqueProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
    const avgTAT = (totalTAT / uniqueProcesses.length).toFixed(2);
    const avgWT = (totalWT / uniqueProcesses.length).toFixed(2);

    return (
        <div className="border border-slate-300 bg-white p-4 md:p-6 rounded-none w-full overflow-x-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Calculation Demonstration</h3>
                <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
                    <span title="Turnaround Time = Completion Time - Arrival Time">TAT = CT - AT</span>
                    <span title="Waiting Time = Turnaround Time - Burst Time">WT = TAT - BT</span>
                </div>
            </div>

            <div className="w-full overflow-x-auto whitespace-nowrap">
                <table className="w-full text-xs font-mono text-left">
                    <thead>
                        <tr className="border-b-2 border-slate-300 text-slate-500 uppercase tracking-wider">
                            <th className="py-2 px-2 border-r border-slate-200">Process_ID</th>
                            <th className="py-2 px-2 border-r border-slate-200">Arrival (AT)</th>
                            <th className="py-2 px-2 border-r border-slate-200">Burst (BT)</th>
                            <th className="py-2 px-2 border-r border-slate-200">Completion (CT)</th>
                            <th className="py-2 px-2 border-r border-slate-200 font-bold text-slate-700">TAT</th>
                            <th className="py-2 px-2 font-bold text-slate-700">WT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {uniqueProcesses.map((p, i) => (
                            <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-2 px-2 font-bold text-slate-900 border-r border-slate-200">{p.id}</td>
                                <td className="py-2 px-2 text-slate-700 border-r border-slate-200">{p.arrivalTime}</td>
                                <td className="py-2 px-2 text-slate-700 border-r border-slate-200">{p.burstTime}</td>
                                <td className="py-2 px-2 text-slate-700 border-r border-slate-200">{p.finalCompletion || p.completionTime}</td>
                                <td className="py-2 px-2 text-slate-900 font-bold border-r border-slate-200">{p.turnaroundTime}</td>
                                <td className="py-2 px-2 text-slate-900 font-bold">{p.waitingTime}</td>
                            </tr>
                        ))}
                        {/* Summary Row */}
                        <tr className="bg-slate-100 border-t-2 border-slate-300">
                            <td colSpan="4" className="py-3 px-2 text-right font-bold text-slate-600 uppercase tracking-wider">
                                Averages:
                            </td>
                            <td className="py-3 px-2 text-slate-900 font-bold border-l-2 border-slate-300 border-r border-slate-200">
                                {avgTAT}
                            </td>
                            <td className="py-3 px-2 text-slate-900 font-bold">
                                {avgWT}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
