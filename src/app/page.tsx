"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useRef, useState, useEffect } from 'react';

export default function Workbook() {
  const [page, setPage] = useState(0);
  const pages = [
    { id: 'cover', title: 'Sampul' },
    { id: 'trace', title: 'Tracing & Penilaian' },
    { id: 'match-food', title: 'Pasangkan Hewan & Makanan' },
    { id: 'shape', title: 'Cocokkan Bentuk' },
    { id: 'shadow', title: 'Temukan Bayangan' },
    { id: 'sizes', title: 'Besar & Kecil' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-bold">Workbook Ceria - Usia 2+</h1>
          <nav className="flex gap-2 items-center">
            <button
              className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ←
            </button>
            <div className="text-sm text-gray-600">Halaman {page + 1} / {pages.length}</div>
            <button
              className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm"
              onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
            >
              →
            </button>
          </nav>
        </header>

        <main className="p-6">
          {page === 0 && <Cover />}
          {page === 1 && <TracingWithScoring />}
          {page === 2 && <MatchFood />}
          {page === 3 && <Shapes />}
          {page === 4 && <Shadows />}
          {page === 5 && <Sizes />}
        </main>

        <footer className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">Dirancang ramah anak: target sentuh besar, warna lembut, instruksi singkat.</div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm"
              onClick={() => window.print()}
            >
              Cetak Halaman
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm"
              onClick={() => setPage(0)}
            >
              Kembali Sampul
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Cover() {
  return (
    <section className="text-center py-12">
      <div className="inline-block p-8 rounded-xl bg-gradient-to-br from-pink-50 to-yellow-50 shadow-md">
        <div className="text-7xl">📘</div>
        <h2 className="text-3xl font-extrabold mt-4">Workbook Ceria</h2>
        <p className="mt-3 text-gray-700">Aktivitas menarik untuk anak usia 2 tahun — tracing, cocok bentuk, pasang gambar, dan lain-lain.</p>
      </div>
    </section>
  );
}

// ------------------- Tracing with scoring -------------------
function TracingWithScoring() {
  const svgPathRef = useRef(null);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    setDrawingPoints([]);
    setScore(null);
  }, []);

  function pointerDown(e) {
    e.preventDefault();
    setIsDrawing(true);
    const p = getPointer(e);
    setDrawingPoints((s) => [...s, p]);
  }
  function pointerMove(e) {
    if (!isDrawing) return;
    const p = getPointer(e);
    setDrawingPoints((s) => [...s, p]);
  }
  function pointerUp() {
    setIsDrawing(false);
  }

  function getPointer(e) {
    const rect = svgPathRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function computeScore() {
    const pathEl = document.getElementById('guide-path');
    if (!pathEl) return;
    const totalLength = pathEl.getTotalLength();
    const samples = 80;
    const threshold = 28;
    const hits = [];

    for (let i = 0; i < samples; i++) {
      const pt = pathEl.getPointAtLength((i / (samples - 1)) * totalLength);
      let matched = false;
      for (let j = 0; j < drawingPoints.length; j++) {
        const dx = drawingPoints[j].x - pt.x;
        const dy = drawingPoints[j].y - pt.y;
        if (dx * dx + dy * dy <= threshold * threshold) {
          matched = true;
          break;
        }
      }
      hits.push(matched);
    }
    const matchedCount = hits.filter(Boolean).length;
    const percent = Math.round((matchedCount / samples) * 100);
    setScore(percent);
    return percent;
  }

  function clearCanvas() {
    setDrawingPoints([]);
    setScore(null);
  }

  function starsFromPercent(pct) {
    if (pct === null) return 0;
    if (pct >= 80) return 3;
    if (pct >= 50) return 2;
    if (pct >= 25) return 1;
    return 0;
  }

  async function exportPDF() {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).jsPDF;
    const el = document.getElementById('tracing-page-root');
    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('tracing-page.pdf');
  }

  return (
    <section id="tracing-page-root">
      <h3 className="text-xl font-semibold mb-4">Ayo bantu 🐱 sampai rumahnya (Tracing)</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg bg-slate-50 relative" style={{ minHeight: 420 }}>
          <svg
            ref={svgPathRef}
            className="w-full h-full"
            viewBox="0 0 600 420"
            onMouseDown={pointerDown}
            onMouseMove={pointerMove}
            onMouseUp={pointerUp}
            onMouseLeave={pointerUp}
            onTouchStart={pointerDown}
            onTouchMove={pointerMove}
            onTouchEnd={pointerUp}
          >
            <path
              id="guide-path"
              d="M40 60 C160 40, 260 140, 360 120 C460 100, 520 200, 560 200"
              stroke="#c4cadd"
              strokeWidth="12"
              strokeDasharray="6 8"
              fill="none"
              strokeLinecap="round"
            />

            {drawingPoints.length > 0 && (
              <polyline
                points={drawingPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                stroke="#2b6cb0"
                strokeWidth={12}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.95}
              />
            )}

            <text x="10" y="380" fontSize="64">🐱</text>
            <text x="520" y="330" fontSize="48">🏠</text>
          </svg>

          <div className="mt-3 flex gap-2 absolute left-4 bottom-4">
            <button className="px-3 py-2 rounded bg-red-400 text-white" onClick={clearCanvas}>Ulangi</button>
            <button className="px-3 py-2 rounded bg-green-500 text-white" onClick={() => computeScore()}>Periksa</button>
            <button className="px-3 py-2 rounded bg-yellow-500 text-white" onClick={() => exportPDF()}>Simpan PDF</button>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-white flex flex-col items-center justify-center">
          <div className="text-7xl">🐱</div>
          <div className="mt-4 text-lg font-medium">Ayo ikuti garisnya!</div>
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">Skor: {score === null ? '-' : `${score}%`}</div>
            <div className="mt-3 text-3xl">{Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={i < starsFromPercent(score) ? 'opacity-100' : 'opacity-30'}>⭐</span>
            ))}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------- Matching -------------------
function MatchFood() {
  const pairs = [
    { id: 'dog', animal: '🐶', food: '🦴' },
    { id: 'cat', animal: '🐱', food: '🐟' },
    { id: 'duck', animal: '🦆', food: '🍞' },
  ];
  const [dropped, setDropped] = useState({});

  function onDragStart(e, id) { e.dataTransfer.setData('text/plain', id); }
  function onDrop(e, targetId) {
    const id = e.dataTransfer.getData('text/plain');
    setDropped((s) => ({ ...s, [targetId]: id }));
  }
  function onDragOver(e) { e.preventDefault(); }

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Pasangkan Hewan & Makanannya</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg bg-amber-50">
          {pairs.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm mb-3 text-4xl">
              <div>{p.animal}</div>
              <div
                onDrop={(e) => onDrop(e, p.id)}
                onDragOver={onDragOver}
                className="w-24 h-16 border-dashed border-2 border-gray-300 rounded flex items-center justify-center bg-white text-3xl"
              >
                {dropped[p.id] ? pairs.find(x => x.id === dropped[p.id]).food : '—'}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <div className="flex gap-4 items-center justify-center text-5xl">
            {pairs.map((p) => (
              <div
                key={p.id}
                draggable
                onDragStart={(e) => onDragStart(e, p.id)}
                className="cursor-grab"
              >
                {p.food}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------- Shapes -------------------
function Shapes() {
  const shapes = [
    { id: 'circle', label: 'Lingkaran', emoji: '⚪' },
    { id: 'square', label: 'Kotak', emoji: '🟦' },
    { id: 'triangle', label: 'Segitiga', emoji: '🔺' },
    { id: 'rect', label: 'Persegi Panjang', emoji: '🟨' },
  ];
  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Mencocokkan Bentuk</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg flex items-center justify-center bg-green-50">
          <div className="grid grid-cols-2 gap-6">
            {shapes.map((s) => (
              <div key={s.id} className="w-36 h-36 rounded-lg bg-white flex flex-col items-center justify-center shadow-sm text-6xl">
                {s.emoji}
                <div className="text-sm mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------- Shadows -------------------
function Shadows() {
  const items = [
    { id: 'rhino', emoji: '🦏', shadow: '⬛' },
    { id: 'car', emoji: '🚗', shadow: '⬛' },
    { id: 'book', emoji: '📚', shadow: '⬛' },
  ];
  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Temukan Bayangan</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg bg-amber-50">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-6 mb-4 text-6xl">
              <div>{it.emoji}</div>
              <div className="opacity-60">{it.shadow}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------- Sizes -------------------
function Sizes() {
  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Membedakan Besar & Kecil</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg bg-lime-50 flex flex-col gap-4 items-center">
          <div className="flex items-center gap-6 text-7xl">
            <div>🐘</div>
            <div className="text-4xl">🐭</div>
          </div>
          <div className="text-lg">Mana yang besar? Mana yang kecil?</div>
        </div>
      </div>
    </section>
  );
}
