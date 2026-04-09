/**
 * Memory Allocation Algorithms Logic
 * This module exports FirstFit and BestFit functions using MFT (Fixed Partitioning).
 * In MFT, each partition can hold ONLY ONE process.
 */

/**
 * 1. First-Fit Allocation (MFT)
 * Allocates the first free memory partition that is big enough.
 */
export function calculateFirstFit(rawPartitions, rawRequests) {
    if (!rawPartitions || !rawRequests) return { memory: [], results: [] };

    // Format partitions into objects
    const memory = rawPartitions.map((size, idx) => ({
        id: `M${idx + 1}`,
        size: size,
        used: 0,
        internalFragmentation: 0,
        isAllocated: false,
        allocatedProcess: null
    }));

    const results = [];
    const requests = rawRequests.map((r, idx) => ({ id: `R${idx + 1}`, size: r }));

    for (const req of requests) {
        let allocated = false;

        for (let i = 0; i < memory.length; i++) {
            // MFT: Partition must be FREE and big enough
            if (!memory[i].isAllocated && memory[i].size >= req.size) {
                memory[i].used = req.size;
                memory[i].internalFragmentation = memory[i].size - req.size;
                memory[i].isAllocated = true;
                memory[i].allocatedProcess = req.id;
                
                results.push({ 
                    ...req, 
                    allocatedTo: memory[i].id, 
                    internalFragmentation: memory[i].internalFragmentation,
                    success: true 
                });
                allocated = true;
                break;
            }
        }

        if (!allocated) {
            results.push({ ...req, allocatedTo: null, success: false });
        }
    }

    return { memory, results };
}

/**
 * 2. Best-Fit Allocation (MFT)
 * Allocates the smallest free memory partition that is big enough.
 */
export function calculateBestFit(rawPartitions, rawRequests) {
    if (!rawPartitions || !rawRequests) return { memory: [], results: [] };

    const memory = rawPartitions.map((size, idx) => ({
        id: `M${idx + 1}`,
        size: size,
        used: 0,
        internalFragmentation: 0,
        isAllocated: false,
        allocatedProcess: null
    }));

    const results = [];
    const requests = rawRequests.map((r, idx) => ({ id: `R${idx + 1}`, size: r }));

    for (const req of requests) {
        let bestIdx = -1;
        let minDiff = Infinity;

        for (let i = 0; i < memory.length; i++) {
            if (!memory[i].isAllocated && memory[i].size >= req.size) {
                const diff = memory[i].size - req.size;
                if (diff < minDiff) {
                    minDiff = diff;
                    bestIdx = i;
                }
            }
        }

        if (bestIdx !== -1) {
            memory[bestIdx].used = req.size;
            memory[bestIdx].internalFragmentation = minDiff;
            memory[bestIdx].isAllocated = true;
            memory[bestIdx].allocatedProcess = req.id;
            
            results.push({ 
                ...req, 
                allocatedTo: memory[bestIdx].id, 
                internalFragmentation: minDiff,
                success: true 
            });
        } else {
            results.push({ ...req, allocatedTo: null, success: false });
        }
    }

    return { memory, results };
}

