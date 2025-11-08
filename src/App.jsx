import React, { useMemo, useState } from 'react';
import HeaderHero from './components/HeaderHero';
import BudgetInput from './components/BudgetInput';
import ResultCard from './components/ResultCard';
import FooterNote from './components/FooterNote';

// ---- Mock Data ----
const cpus = [
  { id:"r3-3200g", name:"AMD Ryzen 3 3200G (APU)", socket:"AM4", tdp:65, score:55, price:1200000, hasIGPU:true },
  { id:"i3-10100", name:"Intel Core i3-10100", socket:"LGA1200", tdp:65, score:65, price:1300000, hasIGPU:true },
  { id:"r5-3600", name:"AMD Ryzen 5 3600", socket:"AM4", tdp:65, score:90, price:1700000, hasIGPU:false },
];

const motherboards = [
  { id:"a320", name:"A320 mATX (AM4)", socket:"AM4", ram:"DDR4", price:700000 },
  { id:"b450", name:"B450 mATX (AM4)", socket:"AM4", ram:"DDR4", price:1000000 },
  { id:"h410", name:"H410 mATX (LGA1200)", socket:"LGA1200", ram:"DDR4", price:800000 },
];

const rams = [
  { id:"8g-ddr4", name:"8GB DDR4 3200", sizeGB:8, type:"DDR4", price:350000, score:20 },
  { id:"16g-ddr4", name:"16GB (2x8) DDR4 3200", sizeGB:16, type:"DDR4", price:650000, score:40 },
];

const storages = [
  { id:"ssd240", name:"SSD 240GB SATA", type:"SATA", sizeGB:240, price:300000, score:20 },
  { id:"ssd480", name:"SSD 480GB SATA", type:"SATA", sizeGB:480, price:450000, score:30 },
];

const gpus = [
  { id:"gtx1650", name:"GTX 1650 4GB", tdp:75, score:90, price:2000000 },
  { id:"rx560", name:"RX 560 4GB", tdp:80, score:70, price:1400000 },
  { id:"used-gt1030", name:"GT 1030 2GB (Used)", tdp:30, score:40, price:800000 },
];

const psus = [
  { id:"400w", name:"PSU 400W 80+", watt:400, price:350000 },
  { id:"500w", name:"PSU 500W 80+", watt:500, price:450000 },
];

const cases = [
  { id:"mcase", name:"Micro ATX Case (Airflow)", price:300000 },
  { id:"scase", name:"Standard ATX Case", price:350000 },
];

// ---- Helpers ----
const formatIDR = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

function estimatePerformance(cpu, gpu, ram, storage) {
  return (cpu?.score || 0) + (gpu?.score || 0) + (ram?.score || 0) + (storage?.score || 0);
}

function totalTDP(cpu, gpu) {
  return (cpu?.tdp || 0) + (gpu?.tdp || 0);
}

function psuSatisfies(psu, cpu, gpu) {
  const needed = Math.ceil(totalTDP(cpu, gpu) * 1.3);
  return psu.watt >= Math.max(needed, 400);
}

// Try to select a balanced build within budget
function selectBuild(budget) {
  // Sort options by value (score per price) for CPU/GPU, and price for others
  const cpuSorted = [...cpus].sort((a, b) => b.score / b.price - a.score / a.price);
  const gpuSorted = [...gpus].sort((a, b) => b.score / b.price - a.score / a.price);
  const ramSorted = [...rams].sort((a, b) => a.price - b.price);
  const storageSorted = [...storages].sort((a, b) => a.price - b.price);
  const psuSorted = [...psus].sort((a, b) => a.price - b.price);
  const caseSorted = [...cases].sort((a, b) => a.price - b.price);

  // Evaluate combinations from better to cheaper while respecting budget
  let best = null;

  for (const cpu of cpuSorted) {
    // Compatible motherboards
    const mobos = motherboards.filter(m => m.socket === cpu.socket);
    const moboSorted = [...mobos].sort((a, b) => a.price - b.price);

    for (const mobo of moboSorted) {
      for (const ram of [...ramSorted].reverse()) { // try higher RAM first
        if (ram.sizeGB < 8) continue;
        if (mobo.ram !== ram.type) continue;
        for (const storage of [...storageSorted].reverse()) { // larger SSD first
          if (storage.sizeGB < 240) continue;

          const needDedicatedGPU = !cpu.hasIGPU;
          const gpuCandidates = needDedicatedGPU ? gpuSorted : [null, ...gpuSorted]; // try iGPU first

          for (const gpu of gpuCandidates) {
            // PSU selection based on TDP
            const psuCandidates = psuSorted.filter(p => psuSatisfies(p, cpu, gpu || { tdp: 0 }));
            if (!psuCandidates.length) continue;
            const psu = psuCandidates[0];

            const chosenCase = caseSorted[0];

            const totalPrice = cpu.price + mobo.price + ram.price + storage.price + psu.price + chosenCase.price + (gpu ? gpu.price : 0);

            const buildOK = totalPrice <= budget;

            const perf = estimatePerformance(cpu, gpu, ram, storage);

            const candidate = {
              items: {
                cpu, mobo, ram, storage, gpu, psu, case: chosenCase,
              },
              totalPrice,
              performance: perf,
              needGPU: needDedicatedGPU,
            };

            if (buildOK) {
              // Track best by performance within budget; tie-breaker by cheaper
              if (!best || candidate.performance > best.performance || (candidate.performance === best.performance && candidate.totalPrice < best.totalPrice)) {
                best = candidate;
              }
            }
          }
        }
      }
    }
  }

  // If we couldn't find any within budget, detect if even the cheapest valid set exceeds budget
  if (!best) {
    // Find absolute cheapest valid build
    let cheapest = Infinity;

    for (const cpu of cpus) {
      const mobos = motherboards.filter(m => m.socket === cpu.socket);
      for (const mobo of mobos) {
        const ram = rams.find(r => r.sizeGB >= 8 && r.type === mobo.ram);
        const storage = storages.find(s => s.sizeGB >= 240);
        const needGPU = !cpu.hasIGPU;
        const gpu = needGPU ? gpus[gpus.length - 1] : null; // cheapest acceptable
        const psu = psus.find(p => psuSatisfies(p, cpu, gpu || { tdp: 0 }));
        const chosenCase = cases[0];
        if (!ram || !storage || !psu) continue;
        const price = cpu.price + mobo.price + ram.price + storage.price + psu.price + chosenCase.price + (gpu ? gpu.price : 0);
        if (price < cheapest) cheapest = price;
      }
    }

    if (!Number.isFinite(cheapest) || cheapest > budget) {
      return { tooLow: true };
    }
  }

  // If there's room, propose upgrades (RAM -> Storage -> GPU)
  const tips = [];
  if (best) {
    let remaining = budget - best.totalPrice;
    // RAM upgrade
    const betterRAM = rams.find(r => r.sizeGB > best.items.ram.sizeGB && r.type === best.items.ram.type);
    if (betterRAM && remaining >= betterRAM.price - best.items.ram.price) {
      tips.push('Consider upgrading to 16GB RAM for better multitasking.');
      remaining -= (betterRAM.price - best.items.ram.price);
    }
    // Storage upgrade
    const betterSSD = storages.find(s => s.sizeGB > best.items.storage.sizeGB);
    if (betterSSD && remaining >= betterSSD.price - best.items.storage.price) {
      tips.push('Consider upgrading to SSD 480GB for more space.');
      remaining -= (betterSSD.price - best.items.storage.price);
    }
    // GPU upgrade
    if (!best.items.gpu && remaining >= gpus[2].price) {
      tips.push('Add a discrete GPU for improved gaming performance.');
    } else if (best.items.gpu) {
      const betterGPU = gpus.find(g => g.price > best.items.gpu.price && g.price - best.items.gpu.price <= remaining);
      if (betterGPU) tips.push('Consider upgrading the GPU for higher FPS.');
    }

    return {
      build: [
        { category: 'CPU', name: best.items.cpu.name, price: best.items.cpu.price },
        { category: 'Motherboard', name: best.items.mobo.name, price: best.items.mobo.price },
        { category: 'RAM', name: best.items.ram.name, price: best.items.ram.price },
        { category: 'Storage', name: best.items.storage.name, price: best.items.storage.price },
        ...(best.items.gpu ? [{ category: 'GPU', name: best.items.gpu.name, price: best.items.gpu.price }] : []),
        { category: 'PSU', name: best.items.psu.name, price: best.items.psu.price },
        { category: 'Case', name: best.items.case.name, price: best.items.case.price },
      ],
      totalPrice: best.totalPrice,
      performance: best.performance,
      budget,
      status: best.totalPrice <= budget ? 'within' : 'over',
      remaining: budget - best.totalPrice,
      tips,
    };
  }

  // Fallback
  return { tooLow: true };
}

export default function App() {
  const [budget, setBudget] = useState(3000000);
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      const res = selectBuild(budget);
      setResult(res);
      setLoading(false);
    }, 300);
  };

  return (
    <div className={`${dark ? 'bg-neutral-950' : 'bg-slate-50'} min-h-screen`}> 
      <HeaderHero dark={dark} onToggleDark={() => setDark(v => !v)} />
      <main className="px-4">
        <BudgetInput budget={budget} setBudget={setBudget} onSubmit={handleSubmit} dark={dark} loading={loading} />
        <ResultCard result={result} dark={dark} />
        <FooterNote dark={dark} />
      </main>
    </div>
  );
}
