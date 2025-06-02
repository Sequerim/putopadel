
import React, { useState } from "react";

const initialPlayers = [
  { name: "Andrés", elo1v1: 1000, elo2v2: 1000 },
  { name: "Pablo", elo1v1: 1000, elo2v2: 1000 },
  { name: "Javi", elo1v1: 1000, elo2v2: 1000 },
  { name: "Diego", elo1v1: 1000, elo2v2: 1000 },
  { name: "Mario", elo1v1: 1000, elo2v2: 1000 },
  { name: "Nico", elo1v1: 1000, elo2v2: 1000 },
  { name: "Toni", elo1v1: 1000, elo2v2: 1000 },
  { name: "Álvaro", elo1v1: 1000, elo2v2: 1000 },
  { name: "Luis", elo1v1: 1000, elo2v2: 1000 },
];

function calculateExpectedScore(eloA, eloB) {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

function updateElo(winnerElo, loserElo, actualScore, k = 32) {
  const expected = calculateExpectedScore(winnerElo, loserElo);
  const newEloA = Math.round(winnerElo + k * (actualScore - expected));
  const newEloB = Math.round(loserElo + k * ((1 - actualScore) - (1 - expected)));
  return [newEloA, newEloB];
}

function App() {
  const [players, setPlayers] = useState(initialPlayers);
  const [matchHistory, setMatchHistory] = useState([]);
  const [view, setView] = useState("ranking");
  const [form, setForm] = useState({ type: "1v1", playerA: "", playerB: "", sets: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const sets = form.sets.split(",").map(set => set.trim().split("-").map(Number));
    let gamesA = 0, gamesB = 0;
    sets.forEach(([a, b]) => {
      gamesA += a;
      gamesB += b;
    });
    const totalGames = gamesA + gamesB;
    const resultA = gamesA / totalGames;
    const updated = [...players];
    const record = { type: form.type, sets: form.sets };

    if (form.type === "1v1") {
      const iA = updated.findIndex(p => p.name === form.playerA);
      const iB = updated.findIndex(p => p.name === form.playerB);
      const [newA, newB] = updateElo(updated[iA].elo1v1, updated[iB].elo1v1, resultA);
      updated[iA].elo1v1 = newA;
      updated[iB].elo1v1 = newB;
      record.players = [form.playerA, form.playerB];
    } else {
      const iA1 = updated.findIndex(p => p.name === form.playerA);
      const iA2 = updated.findIndex(p => p.name === form.playerA2);
      const iB1 = updated.findIndex(p => p.name === form.playerB);
      const iB2 = updated.findIndex(p => p.name === form.playerB2);
      const avgA = (updated[iA1].elo2v2 + updated[iA2].elo2v2) / 2;
      const avgB = (updated[iB1].elo2v2 + updated[iB2].elo2v2) / 2;
      const [newA, newB] = updateElo(avgA, avgB, resultA);
      updated[iA1].elo2v2 += Math.round(newA - avgA);
      updated[iA2].elo2v2 += Math.round(newA - avgA);
      updated[iB1].elo2v2 += Math.round(newB - avgB);
      updated[iB2].elo2v2 += Math.round(newB - avgB);
      record.players = [form.playerA, form.playerA2, form.playerB, form.playerB2];
    }

    setPlayers(updated);
    setMatchHistory([...matchHistory, record]);
    setView("ranking");
  };

  return (
    <div className="p-4 bg-black min-h-screen text-white font-mono">
      <header className="text-center mb-6">
        <img src="https://cdn-icons-png.flaticon.com/512/722/722221.png" alt="logo" className="w-12 mx-auto mb-2" />
        <h1 className="text-3xl font-extrabold tracking-wide text-white">Putopadel</h1>
      </header>

      {view === "ranking" && (
        <>
          <h2 className="text-xl mb-2 border-b border-white pb-1">Ranking 1v1</h2>
          {[...players].sort((a, b) => b.elo1v1 - a.elo1v1).map((p, i) => (
            <p key={p.name} className="text-lg">{i + 1}. {p.name} - {p.elo1v1}</p>
          ))}

          <h2 className="text-xl mt-6 mb-2 border-b border-white pb-1">Ranking 2v2 Individual</h2>
          {[...players].sort((a, b) => b.elo2v2 - a.elo2v2).map((p, i) => (
            <p key={p.name} className="text-lg">{i + 1}. {p.name} - {p.elo2v2}</p>
          ))}

          <button onClick={() => setView("form")} className="mt-6 bg-white text-black px-6 py-2 rounded shadow-md hover:bg-gray-200">+ Nuevo Partido</button>

          <h2 className="text-xl mt-8 mb-2 border-b border-white pb-1">Historial</h2>
          {matchHistory.map((m, i) => (
            <p key={i} className="text-sm text-gray-300">{m.type.toUpperCase()} - {m.players.join(" vs ")} - Sets: {m.sets}</p>
          ))}
        </>
      )}

      {view === "form" && (
        <div className="space-y-4">
          <div>
            <label className="block">Tipo:
              <select name="type" onChange={handleChange} className="text-black ml-2">
                <option value="1v1">1v1</option>
                <option value="2v2">2v2</option>
              </select>
            </label>
          </div>

          <div>
            <label className="block">Jugador A:
              <input name="playerA" onChange={handleChange} className="text-black ml-2" />
            </label>
          </div>

          {form.type === "2v2" && (
            <>
              <label className="block">Jugador A2:
                <input name="playerA2" onChange={handleChange} className="text-black ml-2" />
              </label>
              <label className="block">Jugador B:
                <input name="playerB" onChange={handleChange} className="text-black ml-2" />
              </label>
              <label className="block">Jugador B2:
                <input name="playerB2" onChange={handleChange} className="text-black ml-2" />
              </label>
            </>
          )}

          {form.type === "1v1" && (
            <label className="block">Jugador B:
              <input name="playerB" onChange={handleChange} className="text-black ml-2" />
            </label>
          )}

          <label className="block">Sets (ej: 6-4,4-6,6-0):
            <input name="sets" onChange={handleChange} className="text-black ml-2" />
          </label>

          <div className="space-x-4">
            <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Registrar</button>
            <button onClick={() => setView("ranking")} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">← Volver</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
