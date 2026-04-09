/**
 * Page Replacement Algorithms Logic
 * This module exports FIFO, LRU, Optimal, Random, and NRU functions.
 */

/**
 * Common return structure for page replacement algorithms
 * @returns {Object} { history, metrics }
 */

const createMetrics = (hits, faults, total) => {
  const hitRatio = total > 0 ? (hits / total) : 0;
  const faultRatio = total > 0 ? (faults / total) : 0;
  return {
    totalHits: hits,
    totalFaults: faults,
    totalRequests: total,
    hitRatio: (hitRatio * 100).toFixed(2),
    faultRatio: (faultRatio * 100).toFixed(2),
    formula: `(${hits} / ${total}) * 100`
  };
};

export function calculateFIFO(referenceString, frameCount) {
  const frames = new Array(frameCount).fill(null);
  const history = [];
  let hits = 0;
  let faults = 0;

  referenceString.forEach((page) => {
    let isHit = frames.includes(page);
    if (isHit) {
      hits++;
    } else {
      faults++;
      frames.shift();
      frames.push(page);
    }
    history.push({
      page,
      status: isHit ? 'Hit' : 'Fault',
      frames: [...frames]
    });
  });

  return {
    history,
    metrics: createMetrics(hits, faults, referenceString.length)
  };
}

export function calculateLRU(referenceString, frameCount) {
  const frames = new Array(frameCount).fill(null);
  const history = [];
  const lastUsed = new Array(frameCount).fill(-1);
  let hits = 0;
  let faults = 0;

  referenceString.forEach((page, time) => {
    let isHit = frames.includes(page);
    if (isHit) {
      hits++;
      const idx = frames.indexOf(page);
      lastUsed[idx] = time;
    } else {
      faults++;
      let replaceIdx = -1;
      if (frames.includes(null)) {
        replaceIdx = frames.indexOf(null);
      } else {
        replaceIdx = 0;
        let minTime = lastUsed[0];
        for (let i = 1; i < frameCount; i++) {
          if (lastUsed[i] < minTime) {
            minTime = lastUsed[i];
            replaceIdx = i;
          }
        }
      }
      frames[replaceIdx] = page;
      lastUsed[replaceIdx] = time;
    }
    history.push({
      page,
      status: isHit ? 'Hit' : 'Fault',
      frames: [...frames]
    });
  });

  return {
    history,
    metrics: createMetrics(hits, faults, referenceString.length)
  };
}

export function calculateOptimal(referenceString, frameCount) {
  const frames = new Array(frameCount).fill(null);
  const history = [];
  let hits = 0;
  let faults = 0;

  referenceString.forEach((page, time) => {
    let isHit = frames.includes(page);
    if (isHit) {
      hits++;
    } else {
      faults++;
      let replaceIdx = -1;
      if (frames.includes(null)) {
        replaceIdx = frames.indexOf(null);
      } else {
        let farthestTime = -1;
        replaceIdx = 0;
        for (let i = 0; i < frameCount; i++) {
          const futureIndex = referenceString.slice(time + 1).indexOf(frames[i]);
          if (futureIndex === -1) {
            replaceIdx = i;
            break;
          } else if (futureIndex > farthestTime) {
            farthestTime = futureIndex;
            replaceIdx = i;
          }
        }
      }
      frames[replaceIdx] = page;
    }
    history.push({
      page,
      status: isHit ? 'Hit' : 'Fault',
      frames: [...frames]
    });
  });

  return {
    history,
    metrics: createMetrics(hits, faults, referenceString.length)
  };
}

export function calculateRAND(referenceString, frameCount) {
  const frames = new Array(frameCount).fill(null);
  const history = [];
  let hits = 0;
  let faults = 0;

  referenceString.forEach((page) => {
    let isHit = frames.includes(page);
    if (isHit) {
      hits++;
    } else {
      faults++;
      let replaceIdx = -1;
      if (frames.includes(null)) {
        replaceIdx = frames.indexOf(null);
      } else {
        replaceIdx = Math.floor(Math.random() * frameCount);
      }
      frames[replaceIdx] = page;
    }
    history.push({
      page,
      status: isHit ? 'Hit' : 'Fault',
      frames: [...frames]
    });
  });

  return {
    history,
    metrics: createMetrics(hits, faults, referenceString.length)
  };
}

export function calculateNRU(referenceString, frameCount) {
  const frames = new Array(frameCount).fill(null);
  // Each frame will store { page, R, M }
  const frameMetadata = new Array(frameCount).fill(null).map(() => ({ page: null, R: 0, M: 0 }));
  const history = [];
  let hits = 0;
  let faults = 0;

  referenceString.forEach((page, time) => {
    // In NRU, we find if page exists
    let existingIdx = frameMetadata.findIndex(f => f.page === page);
    let isHit = existingIdx !== -1;

    if (isHit) {
      hits++;
      frameMetadata[existingIdx].R = 1;
      // Simulate a "Modify" bit with 10% chance on hit too, or just keep it 
      if (Math.random() < 0.1) frameMetadata[existingIdx].M = 1;
    } else {
      faults++;
      let replaceIdx = -1;
      let emptyIdx = frameMetadata.findIndex(f => f.page === null);
      
      if (emptyIdx !== -1) {
        replaceIdx = emptyIdx;
      } else {
        // Find by class
        // 0: R=0, M=0
        // 1: R=0, M=1
        // 2: R=1, M=0
        // 3: R=1, M=1
        const getPageClass = (f) => (f.R << 1) | f.M; // This is a bit different from standard class but let's use standard:
        const getStandardClass = (f) => {
            if (f.R === 0 && f.M === 0) return 0;
            if (f.R === 0 && f.M === 1) return 1;
            if (f.R === 1 && f.M === 0) return 2;
            return 3;
        };

        let classes = [[], [], [], []];
        frameMetadata.forEach((f, i) => {
            classes[getStandardClass(f)].push(i);
        });

        for (let i = 0; i < 4; i++) {
            if (classes[i].length > 0) {
                // Pick random from the lowest class
                const options = classes[i];
                replaceIdx = options[Math.floor(Math.random() * options.length)];
                break;
            }
        }
      }
      
      frameMetadata[replaceIdx] = {
        page: page,
        R: 1,
        M: Math.random() < 0.3 ? 1 : 0 // Simulate R/M bits as proposed
      };
    }

    // Periodically clear R bits (every 10 references)
    if ((time + 1) % 10 === 0) {
        frameMetadata.forEach(f => { if(f.page !== null) f.R = 0; });
    }

    history.push({
      page,
      status: isHit ? 'Hit' : 'Fault',
      frames: frameMetadata.map(f => f.page),
      metadata: frameMetadata.map(f => ({ ...f }))
    });
  });

  return {
    history,
    metrics: createMetrics(hits, faults, referenceString.length)
  };
}
