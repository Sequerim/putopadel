
import React, { useEffect, useState } from "react";

const initialPlayers = [
  { name: "Robert", elo1v1: 1000, elo2v2: 1000 },
  { name: "Pepe", elo1v1: 1000, elo2v2: 1000 },
  { name: "Jorge", elo1v1: 1000, elo2v2: 1000 },
  { name: "Kike", elo1v1: 1000, elo2v2: 1000 },
  { name: "Luis", elo1v1: 1000, elo2v2: 1000 },
  { name: "Joao", elo1v1: 1000, elo2v2: 1000 },
  { name: "Pepe2", elo1v1: 1000, elo2v2: 1000 },
  { name: "Oscar", elo1v1: 1000, elo2v2: 1000 },
  { name: "Alex", elo1v1: 1000, elo2v2: 1000 }
];

function App() {
  const [players, setPlayers] = useState(() => {
    const stored = localStorage.getItem("players");
    return stored ? JSON.parse(stored) : initialPlayers;
  });
  const [matchHistory, setMatchHistory] = useState(() => {
    const stored = localStorage.getItem("history");
    return stored ? JSON.parse(stored) : [];
  });
  const [form, setForm] = useState({ type: "1v1", playerA: "", playerA2: "", playerB: "", playerB2: "", sets: "" });
  const [view, setView] = useState("ranking");
  const [editIndex, setEditIndex] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(matchHistory));
  }, [matchHistory]);

  const updateElo = (eloA, eloB, scoreA) => {
    const expectedA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
    const k = 32;
    const newA = Math.round(eloA + k * (scoreA - expectedA));
    const newB = Math.round(eloB + k * ((1 - scoreA) - (1 - expectedA)));
    return [newA, newB];
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegisterMatch = () => {
    const sets = form.sets.split(",").map(s => s.trim().split("-").map(Number));
    let gamesA = 0, gamesB = 0;
    sets.forEach(([a, b]) => { gamesA += a; gamesB += b; });
    const resultA = gamesA / (gamesA + gamesB);

    const updated = [...players];
    let record = { type: form.type, sets: form.sets };

    if (form.type === "1v1") {
      const iA = updated.findIndex(p => p.name === form.playerA);
      const iB = updated.findIndex(p => p.name === form.playerB);
      const [eloA, eloB] = updateElo(updated[iA].elo1v1, updated[iB].elo1v1, resultA);
      updated[iA].elo1v1 = eloA;
      updated[iB].elo1v1 = eloB;
      record.players = [form.playerA, form.playerB];
    } else {
      const iA1 = updated.findIndex(p => p.name === form.playerA);
      const iA2 = updated.findIndex(p => p.name === form.playerA2);
      const iB1 = updated.findIndex(p => p.name === form.playerB);
      const iB2 = updated.findIndex(p => p.name === form.playerB2);
      const teamA = (updated[iA1].elo2v2 + updated[iA2].elo2v2) / 2;
      const teamB = (updated[iB1].elo2v2 + updated[iB2].elo2v2) / 2;
      const [eloA, eloB] = updateElo(teamA, teamB, resultA);
      updated[iA1].elo2v2 += Math.round(eloA - teamA);
      updated[iA2].elo2v2 += Math.round(eloA - teamA);
      updated[iB1].elo2v2 += Math.round(eloB - teamB);
      updated[iB2].elo2v2 += Math.round(eloB - teamB);
      record.players = [form.playerA, form.playerA2, form.playerB, form.playerB2];
    }

    setPlayers(updated);
    const newHistory = [...matchHistory];
    if (editIndex !== null) {
      newHistory[editIndex] = record;
      setEditIndex(null);
      setToast("Partido actualizado ✅");
    } else {
      newHistory.push(record);
      setToast("Partido registrado ✅");
    }
    setMatchHistory(newHistory);
    setForm({ type: "1v1", playerA: "", playerA2: "", playerB: "", playerB2: "", sets: "" });
    setView("ranking");
    setTimeout(() => setToast(""), 3000);
  };

  const editMatch = (index) => {
    const match = matchHistory[index];
    const [a, a2, b, b2] = match.players;
    setForm({ type: match.type, playerA: a, playerA2: a2 || "", playerB: b, playerB2: b2 || "", sets: match.sets });
    setEditIndex(index);
    setView("form");
  };

  const deleteMatch = (index) => {
    const h = [...matchHistory];
    h.splice(index, 1);
    setMatchHistory(h);
  };

  return (
    <div className="min-h-screen p-4 text-white bg-black">
      <h1 className="text-3xl text-center font-bold mb-4">Putopadel</h1>
      {toast && <div className="bg-green-600 text-white text-center p-2 rounded mb-4">{toast}</div>}
      {view === "ranking" && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><h2 className="text-lg font-bold">Ranking 1v1</h2>
              <ul>{[...players].sort((a, b) => b.elo1v1 - a.elo1v1).map(p => <li key={p.name}>{p.name}: {p.elo1v1}</li>)}</ul>
            </div>
            <div><h2 className="text-lg font-bold">Ranking 2v2</h2>
              <ul>{[...players].sort((a, b) => b.elo2v2 - a.elo2v2).map(p => <li key={p.name}>{p.name}: {p.elo2v2}</li>)}</ul>
            </div>
          </div>
          <button className="bg-blue-600 w-full p-2 rounded" onClick={() => setView("form")}>+ Nuevo partido</button>
          <h2 className="mt-6 mb-2 font-bold">Historial</h2>
          <ul className="space-y-2">{matchHistory.map((m, i) => (
            <li key={i} className="bg-zinc-800 p-2 rounded">
              <div>{m.players.join(" vs ")} | Sets: {m.sets}</div>
              <div className="flex gap-2 mt-2">
                <button className="bg-gray-600 px-2 rounded" onClick={() => editMatch(i)}>Editar</button>
                <button className="bg-red-600 px-2 rounded" onClick={() => deleteMatch(i)}>Eliminar</button>
              </div>
            </li>
          ))}</ul>
        </>
      )}
      {view === "form" && (
        <div className="space-y-2">
          <select name="type" value={form.type} onChange={handleChange} className="text-black w-full p-2">
            <option value="1v1">1v1</option>
            <option value="2v2">2v2</option>
          </select>
          <select name="playerA" value={form.playerA} onChange={handleChange} className="text-black w-full p-2">
            <option value="">Jugador A</option>{players.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
          {form.type === "2v2" && (
            <select name="playerA2" value={form.playerA2} onChange={handleChange} className="text-black w-full p-2">
              <option value="">Jugador A2</option>{players.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          )}
          <select name="playerB" value={form.playerB} onChange={handleChange} className="text-black w-full p-2">
            <option value="">Jugador B</option>{players.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
          {form.type === "2v2" && (
            <select name="playerB2" value={form.playerB2} onChange={handleChange} className="text-black w-full p-2">
              <option value="">Jugador B2</option>{players.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          )}
          <input name="sets" value={form.sets} onChange={handleChange} placeholder="Sets (ej. 6-4,6-2,3-6)" className="text-black w-full p-2" />
          <div className="flex gap-2">
            <button onClick={handleRegisterMatch} className="bg-green-600 w-full p-2 rounded">
              {editIndex !== null ? "Actualizar" : "Registrar"}
            </button>
            <button onClick={() => setView("ranking")} className="bg-gray-600 w-full p-2 rounded">← Volver</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
