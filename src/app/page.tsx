"use client";

import React, { useRef, useState, useEffect } from "react";

export default function Workbook() {
  const [page, setPage] = useState(0);
  const pages = [
    { id: "cover", title: "Sampul" },
    { id: "trace", title: "Tracing & Penilaian" },
    { id: "match-food", title: "Pasangkan Hewan & Makanan" },
    { id: "shape", title: "Cocokkan Bentuk" },
    { id: "shadow", title: "Temukan Bayangan" },
    { id: "sizes", title: "Besar & Kecil" },
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
            <div className="text-sm text-gray-600">
              Halaman {page + 1} / {pages.length}
            </div>
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
          <div className="text-sm text-gray-600">
            Dirancang ramah anak: target sentuh besar, warna lembut, instruksi singkat.
          </div>
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
        <p className="mt-3 text-gray-700">
          Aktivitas menarik untuk anak usia 2 tahun — tracing, cocok bentuk,
          pasang gambar, dan lain-lain.
        </p>
      </div>
    </section>
  );
}

// ------------------- Tracing with scoring -------------------
function TracingWithScoring() {
  const svgPathRef = useRef<SVGSVGElement | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  function pointerDown(e: React.PointerEvent<SVGSVGElement>) {
    e.preventDefault();
    setIsDrawing(true);
    const p = getPointer(e);
    setDrawingPoints((s) => [...s, p]);
  }

  function pointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!isDrawing) return;
    const p = getPointer(e);
    setDrawingPoints((s) => [...s, p]);
  }

  function pointerUp() {
    setIsDrawing(false);
  }

  function getPointer(e: React.PointerEvent<SVGSVGElement>) {
    if (!svgPathRef.current) return { x: 0, y: 0 };
    const rect = svgPathRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function computeScore() {
    const pathEl = document.getElementById("guide-path") as SVGPathElement | null;
    if (!pathEl) return;
    const totalLength = pathEl.getTotalLength();
    const samples = 80;
    const threshold = 28;
    const hits: boolean[] = [];

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

  function starsFromPercent(pct: number | null) {
    if (pct === null) return 0;
    if (pct >= 80) return 3;
    if (pct >= 50) return 2;
    if (pct >= 25) return 1;
    return 0;
  }

  return (
    <section id="tracing-page-root">
      <h3 className="text-xl font-semibold mb-4">
        Ayo bantu 🐱 sampai rumahnya (Tracing)
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg bg-slate-50 relative" style={{ minHeight: 420 }}>
          <svg
            ref={svgPathRef}
            className="w-full h-full"
            viewBox="0 0 600 420"
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={pointerUp}
            onPointerLeave={pointerUp}
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
                points={drawingPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                stroke="#2b6cb0"
                strokeWidth={12}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.95}
              />
            )}

            <text x="10" y="380" fontSize="64">
              🐱
            </text>
            <text x="520" y="330" fontSize="48">
              🏠
            </text>
          </svg>

          <div className="mt-3 flex gap-2 absolute left-4 bottom-4">
            <button
              className="px-3 py-2 rounded bg-red-400 text-white"
              onClick={clearCanvas}
            >
              Ulangi
            </button>
            <button
              className="px-3 py-2 rounded bg-green-500 text-white"
              onClick={() => computeScore()}
            >
              Periksa
            </button>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-white flex flex-col items-center justify-center">
          <div className="text-7xl">🐱</div>
          <div className="mt-4 text-lg font-medium">Ayo ikuti garisnya!</div>
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              Skor: {score === null ? "-" : `${score}%`}
            </div>
            <div className="mt-3 text-3xl">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={i < starsFromPercent(score) ? "opacity-100" : "opacity-30"}
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------- Matching -------------------
function MatchFood() {
  const pairs = [
    { id: "dog", animal: "🐶", food: "🦴" },
    { id: "cat", animal: "🐱", food: "🐟" },
    { id: "duck", animal: "🦆", food: "🍞" },
  ];
  const [dropped, setDropped] = useState<Record<string, string>>({});

  function onDragStart(e: React.DragEvent<HTMLDivElement>, id: string) {
    e.dataTransfer.setData("text/plain", id);
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>, targetId: string) {
    const id = e.dataTransfer.getData("text/plain");
    setDropped((s) => ({ ...s, [targetId]: id }));
  }
  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

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
  const pairs = [
    { id: "circle", shape: "⚪", label: "Lingkaran", match: "⚽" },
    { id: "square", shape: "🟦", label: "Kotak", match: "📒" },
    { id: "triangle", shape: "🔺", label: "Segitiga", match: "🍕" },
    { id: "rect", shape: "🟨", label: "Persegi Panjang", match: "🛏️" },
  ];

  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  function handleChoice(shapeId: string, targetId: string) {
    setAnswers((s) => ({ ...s, [shapeId]: shapeId === targetId }));
    setSelectedShape(null);
  }

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Mencocokkan Bentuk</h3>
      <div className="grid md:grid-cols-2 gap-6">

        {/* Kolom bentuk */}
        <div className="p-4 border rounded-lg bg-green-50">
          <div className="grid grid-cols-2 gap-4">
            {pairs.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedShape(p.id)}
                className={`w-28 h-28 rounded-lg flex flex-col items-center justify-center text-5xl border-2 
                  ${selectedShape === p.id ? 'border-blue-500' : 'border-transparent'} 
                  ${answers[p.id] === true ? 'bg-green-200' : answers[p.id] === false ? 'bg-red-200' : 'bg-white'}`}
              >
                {p.shape}
                <span className="text-xs mt-1">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Kolom benda nyata */}
        <div className="p-4 border rounded-lg bg-yellow-50">
          <div className="grid grid-cols-2 gap-4">
            {pairs.map((p) => (
              <button
                key={p.id}
                onClick={() => selectedShape && handleChoice(selectedShape, p.id)}
                className="w-28 h-28 rounded-lg bg-white shadow flex items-center justify-center text-5xl"
              >
                {p.match}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        {Object.values(answers).filter(Boolean).length === pairs.length && (
          <div className="text-3xl mt-2">🎉 Hebat sekali! ⭐⭐⭐</div>
        )}
      </div>
    </section>
  );
}

// ------------------- Shadows -------------------
function Shadows() {
  const items = [
    { id: "rhino", emoji: "🦏" },
    { id: "car", emoji: "🚗" },
    { id: "book", emoji: "📚" },
  ];
  const [matched, setMatched] = useState<Record<string, string>>({});

  function onDragStart(e: React.DragEvent<HTMLDivElement>, id: string) {
    e.dataTransfer.setData("text/plain", id);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>, targetId: string) {
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId === targetId) {
      setMatched((prev) => ({ ...prev, [targetId]: draggedId }));
    }
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function resetGame() {
    setMatched({});
  }

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Temukan Bayangan</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Bayangan */}
        <div className="p-4 border rounded-lg bg-amber-50">
          {items.map((it) => (
            <div
              key={it.id}
              onDrop={(e) => onDrop(e, it.id)}
              onDragOver={onDragOver}
              className="flex items-center justify-center mb-6 text-6xl p-3 border-2 border-dashed border-gray-300 rounded-lg bg-white min-h-[80px]"
            >
              {matched[it.id] ? (
                <span>{items.find((x) => x.id === matched[it.id])?.emoji}</span>
              ) : (
                <span className="text-gray-400 opacity-40">{it.emoji}</span> // bayangan
              )}
            </div>
          ))}

          <button
            onClick={resetGame}
            className="mt-4 px-4 py-2 rounded-lg bg-red-400 text-white text-sm"
          >
            Ulangi
          </button>
        </div>

        {/* Gambar yang bisa diseret */}
        <div className="p-4 border rounded-lg bg-white flex gap-6 justify-center items-center text-6xl">
          {items.map((it) => (
            <div
              key={it.id}
              draggable
              onDragStart={(e) => onDragStart(e, it.id)}
              className="cursor-grab"
            >
              {it.emoji}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ------------------- Sizes -------------------
function Sizes() {
  const bigAnimals = ["🐘", "🦒", "🐳", "🦏", "🐂", "🐫"];
  const smallAnimals = ["🐭", "🐹", "🐇", "🐥", "🐸", "🐢"];

  const [big, setBig] = useState("🐘");
  const [small, setSmall] = useState("🐭");
  const [answer, setAnswer] = useState<string | null>(null);

  function newRound() {
    setBig(bigAnimals[Math.floor(Math.random() * bigAnimals.length)]);
    setSmall(smallAnimals[Math.floor(Math.random() * smallAnimals.length)]);
    setAnswer(null);
  }

  function choose(option: string) {
    setAnswer(option);
    setTimeout(() => setAnswer(null), 2000);
  }

  useEffect(() => {
    newRound();
  }, []);

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Membedakan Besar & Kecil</h3>
      <div className="p-6 rounded-lg bg-green-50 text-center">
        <div className="flex justify-center gap-12 text-7xl mb-6">
          <button onClick={() => choose("besar")} className="hover:scale-110 transition-transform">
            {big}
          </button>
          <button onClick={() => choose("kecil")} className="hover:scale-110 transition-transform">
            {small}
          </button>
        </div>
        <p className="text-lg font-medium">Mana yang besar? Mana yang kecil?</p>

        {answer && (
          <div className="mt-4 text-xl font-bold">
            {answer === "besar" && <span className="text-green-600">{big} Itu BESAR!</span>}
            {answer === "kecil" && <span className="text-blue-600">{small} Itu KECIL!</span>}
          </div>
        )}

        <button
          onClick={newRound}
          className="mt-4 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm"
        >
          Ulangi
        </button>
      </div>
    </section>
  );
}