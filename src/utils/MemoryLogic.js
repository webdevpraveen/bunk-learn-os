/**
 * Memory Allocation Algorithms Logic
 * This module exports FirstFit and BestFit functions.
 */

/**
 * 1. First-Fit Allocation
 * Allocates the first memory hole that is big enough to accommodate the process.
 * 
 * @param {Array<Number>} rawPartitions - Array of memory block sizes (e.g. [100, 500, 200, 300, 600])
 * @param {Array<Number>} rawRequests - Array of process sizes requested (e.g. [212, 417, 112, 426])
 * @returns {Object} { memory: [...blocks], results: [...allocation_status] }
 */
export function calculateFirstFit(rawPartitions, rawRequests) {
    if (!rawPartitions || !rawRequests) return { memory: [], results: [] };

    // Format partitions into objects to track usage
    const memory = rawPartitions.map((size, idx) => ({
        id: `M${idx + 1}`,
        size: size,
        used: 0,
        allocations: [] // Will hold objects like { id: 'R1', size: 212 }
    }));

    const results = [];

    // Format requests into objects
    const requests = rawRequests.map((r, idx) => ({ id: `R${idx + 1}`, size: r }));

    // Step 1: Iterate through each process request
    for (const req of requests) {
        let allocated = false;

        // Step 2: For each request, scan memory blocks from the beginning
        for (let i = 0; i < memory.length; i++) {
            // Check if this block has enough remaining space (Total Size - Used Size)
            if (memory[i].size - memory[i].used >= req.size) {
                // Step 3: If enough space, allocate it here
                memory[i].used += req.size;
                memory[i].allocations.push(req);
                results.push({ ...req, allocatedTo: memory[i].id, success: true });
                allocated = true;
                break; // Stop scanning once we found the First Fit!
            }
        }

        // Step 4: If we checked all blocks and none had space, it fails
        if (!allocated) {
            results.push({ ...req, allocatedTo: null, success: false });
        }
    }

    return { memory, results };
}

/**
 * 2. Best-Fit Allocation
 * Allocates the smallest memory hole that is big enough. This minimizes wasted space in the chosen hole.
 * 
 * @param {Array<Number>} rawPartitions - Array of memory block sizes Wait
 * @param {Array<Number>} rawRequests - Array of process sizes requested
 * @returns {Object} { memory: [...blocks], results: [...allocation_status] }
 */
export function calculateBestFit(rawPartitions, rawRequests) {
    if (!rawPartitions || !rawRequests) return { memory: [], results: [] };

    // Format partitions into objects
    const memory = rawPartitions.map((size, idx) => ({
        id: `M${idx + 1}`,
        size: size,
        used: 0,
        allocations: []
    }));

    const results = [];
    const requests = rawRequests.map((r, idx) => ({ id: `R${idx + 1}`, size: r }));

    // Step 1: Iterate through each process
    for (const req of requests) {
        let bestIdx = -1;
        let minDiff = Infinity; // Keeps track of the smallest difference (hole) found so far

        // Step 2: Scan ALL memory blocks to find the "best" fit
        for (let i = 0; i < memory.length; i++) {
            const remainingSpace = memory[i].size - memory[i].used;

            // Check if the block has enough space AND if that space is tighter than previously found
            if (remainingSpace >= req.size && remainingSpace < minDiff) {
                minDiff = remainingSpace;
                bestIdx = i;
            }
        }

        // Step 3: If we found a suitable block, allocate it
        if (bestIdx !== -1) {
            memory[bestIdx].used += req.size;
            memory[bestIdx].allocations.push(req);
            results.push({ ...req, allocatedTo: memory[bestIdx].id, success: true });
        } else {
            // Step 4: No block had enough space
            results.push({ ...req, allocatedTo: null, success: false });
        }
    }

    return { memory, results };
}
