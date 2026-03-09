import React, { useState, useEffect } from 'react';
import { calculateFirstFit, calculateBestFit } from '../utils/MemoryLogic';

export default function MemoryGrid({ partitions, requests, algorithm }) {
    const [allocationData, setAllocationData] = useState({ memory: [], results: [] });

    useEffect(() => {
        if (!partitions.length || !requests.length) return;

        if (algorithm === 'FirstFit') {
            setAllocationData(calculateFirstFit(partitions.map(p => p.size), requests.map(r => r.size)));
        } else {
            setAllocationData(calculateBestFit(partitions.map(p => p.size), requests.map(r => r.size)));
        }
    }, [partitions, requests, algorithm]);

    const { memory, results } = allocationData;

    if (!memory.length) {
        return (
            <div className="flex h-32 items-center justify-center border border-slate-300 bg-white rounded-none text-xs text-slate-400">
                Awaiting memory partitions...
            </div>
        );
    }

    const totalMemory = memory.reduce((sum, p) => sum + p.size, 0);

    return (
        <div className="space-y-6">
            <div className="w-full border border-slate-300 bg-white p-6 rounded-none">
                <h3 className="mb-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    RAM Layout ({totalMemory} KB)
                </h3>

                <div className="flex w-full h-32 bg-slate-50 rounded-none overflow-hidden border border-slate-300 p-1 gap-1">
                    {memory.map((part) => {
                        const widthPct = (part.size / totalMemory) * 100;
                        const remaining = part.size - part.used;

                        return (
                            <div
                                key={part.id}
                                className="relative flex flex-col h-full bg-slate-100 border border-slate-300"
                                style={{ width: `${widthPct}%` }}
                            >
                                {/* Partition Header */}
                                <div className="absolute -top-6 w-full text-center text-[10px] text-slate-500 font-mono">
                                    {part.id} ({part.size}K)
                                </div>

                                {/* Stack blocks horizontally within the partition */}
                                <div className="flex w-full h-full p-1 gap-1">
                                    {part.allocations.map((alloc, aIdx) => {
                                        const allocPct = (alloc.size / part.size) * 100;

                                        return (
                                            <div
                                                key={`${alloc.id}-${aIdx}`}
                                                className={`h-full bg-slate-800 text-white font-mono font-medium flex flex-col items-center justify-center border border-slate-900`}
                                                style={{ width: `${allocPct}%` }}
                                                title={`${alloc.id}: ${alloc.size}KB`}
                                            >
                                                <span className="text-[10px]">{alloc.id}</span>
                                                <span className="text-[9px] text-slate-300">{alloc.size}K</span>
                                            </div>
                                        )
                                    })}

                                    {/* Free space indicator / Internal Fragmentation */}
                                    {remaining > 0 && (
                                        <div
                                            className="h-full bg-slate-100 border border-dashed border-slate-400 flex flex-col items-center justify-center"
                                            style={{ width: `${(remaining / part.size) * 100}%` }}
                                            title={`Free Fragment: ${remaining}KB`}
                                        >
                                            <span className="text-[10px] text-slate-500 italic">Hole</span>
                                            <span className="text-[9px] text-slate-400">{remaining}K</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="h-6 w-full"></div>
            </div>

            {/* Allocation Status Table */}
            {results.length > 0 && (
                <div className="w-full border border-slate-300 bg-white p-6 rounded-none">
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Allocation Matrix
                    </h3>
                    <table className="w-full text-sm font-mono text-left">
                        <thead>
                            <tr className="border-b border-slate-300 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="py-2 px-2 border-r border-slate-200">Process / Request</th>
                                <th className="py-2 px-2 border-r border-slate-200">Size (KB)</th>
                                <th className="py-2 px-2 border-r border-slate-200">Status</th>
                                <th className="py-2 px-2">Assigned Block</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => (
                                <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="py-2 px-2 border-r border-slate-200 text-slate-800">{r.id}</td>
                                    <td className="py-2 px-2 border-r border-slate-200 text-slate-600">{r.size}</td>
                                    <td className="py-2 px-2 border-r border-slate-200">
                                        {r.success ? (
                                            <span className="text-emerald-700 font-medium">ALLOCATED</span>
                                        ) : (
                                            <span className="text-red-600 font-medium">FAULT</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-2 text-slate-700">
                                        {r.allocatedTo ? (
                                            <span className="bg-slate-200 px-2 py-0.5 rounded-none border border-slate-300">{r.allocatedTo}</span>
                                        ) : (
                                            <span className="text-slate-400 italic">No contiguous hole large enough</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
