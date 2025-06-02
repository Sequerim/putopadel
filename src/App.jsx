import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const jugadores = ["Robert", "Pepe", "Jorge", "Kike", "Luis", "Joao", "Pepe2", "Oscar", "Alex"];

const App = () => {
  const [players, setPlayers] = useState(jugadores.map(j => ({ name: j, elo1v1: 1000, elo2v2: 1000 })));
  const [form, setForm] = useState({
    type: "1v1",
    playerA: "",
    playerA2: "",
    playerB: "",
    playerB2: "",
    sets: ["", "", ""]
  });
  const [view, setView] = useState("ranking");
  const [matchHistory, setMatchHistory] = useState(() => {
    const stored = localStorage.getItem("matchHistory");
    return stored ? JSON.parse(stored) : [];
  });
  const [editIndex, setEditIndex] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem("matchHistory", JSON.stringify(matchHistory));
  }, [matchHistory]);

  const handleChangeSet = (index, value) => {
    const newSets = [...form.sets];
    newSets[index] = value;
    setForm({ ...form, sets: newSets });
  };

  const handleRegisterMatch = () => {
    const newMatch = { ...form };
    const newHistory = [...matchHistory];
    if (editIndex !== null) {
      newHistory[editIndex] = newMatch;
      setEditIndex(null);
      setToast("Partido actualizado correctamente ✅");
    } else {
      newHistory.push(newMatch);
      setToast("Partido registrado correctamente ✅");
    }
    setMatchHistory(newHistory);
    setForm({ type: "1v1", playerA: "", playerA2: "", playerB: "", playerB2: "", sets: ["", "", ""] });
    setView("ranking");
    setTimeout(() => setToast(""), 3000);
  };

  const handleEditMatch = (index) => {
    const match = matchHistory[index];
    setForm(match);
    setEditIndex(index);
    setView("form");
  };

  const handleDeleteMatch = (index) => {
    const updatedHistory = matchHistory.filter((_, i) => i !== index);
    setMatchHistory(updatedHistory);
  };

  const renderForm = () => (
    <div className="bg-zinc-900 p-4 rounded-xl shadow-xl">
      <h2 className="text-xl font-semibold mb-4">Registrar Partido</h2>
      <div className="grid grid-cols-2 gap-4 text-black">
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="p-1 rounded">
          <option value="1v1">1 vs 1</option>
          <option value="2v2">2 vs 2</option>
        </select>
        <select value={form.playerA} onChange={e => setForm({ ...form, playerA: e.target.value })} className="p-1 rounded">
          <option value="">Jugador A</option>
          {jugadores.map(j => <option key={j}>{j}</option>)}
        </select>
        {form.type === "2v2" && (
          <select value={form.playerA2} onChange={e => setForm({ ...form, playerA2: e.target.value })} className="p-1 rounded">
            <option value="">Jugador A2</option>
            {jugadores.map(j => <option key={j}>{j}</option>)}
          </select>
        )}
        <select value={form.playerB} onChange={e => setForm({ ...form, playerB: e.target.value })} className="p-1 rounded">
          <option value="">Jugador B</option>
          {jugadores.map(j => <option key={j}>{j}</option>)}
        </select>
        {form.type === "2v2" && (
          <select value={form.playerB2} onChange={e => setForm({ ...form, playerB2: e.target.value })} className="p-1 rounded">
            <option value="">Jugador B2</option>
            {jugadores.map(j => <option key={j}>{j}</option>)}
          </select>
        )}
        {form.sets.map((set, idx) => (
          <input
            key={idx}
            type="text"
            value={set}
            onChange={e => handleChangeSet(idx, e.target.value)}
            placeholder={`Set ${idx + 1} (ej. 6-4)`}
            className="col-span-2 p-1 rounded"
          />
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <Button onClick={handleRegisterMatch}>{editIndex !== null ? "Actualizar" : "Registrar"}</Button>
        <Button variant="secondary" onClick={() => setView("ranking")}>Cancelar</Button>
      </div>
    </div>
  );

  const renderRanking = (type) => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-white">
        <thead>
          <tr className="bg-zinc-800">
            <th className="px-2 py-1">#</th>
            <th className="px-2 py-1">Jugador</th>
            <th className="px-2 py-1">ELO</th>
          </tr>
        </thead>
        <tbody>
          {[...players]
            .sort((a, b) => b[type] - a[type])
            .map((p, i) => (
              <tr key={p.name} className="border-b border-zinc-700">
                <td className="px-2 py-1">{i + 1}</td>
                <td className="px-2 py-1">{p.name}</td>
                <td className="px-2 py-1">{p[type]}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  const renderHistory = () => (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Historial de Partidos</h2>
      {matchHistory.map((match, index) => (
        <div key={index} className="bg-zinc-800 p-3 rounded mb-2">
          <p><strong>{match.type === "1v1" ? `${match.playerA} vs ${match.playerB}` : `${match.playerA} y ${match.playerA2} vs ${match.playerB} y ${match.playerB2}`}</strong></p>
          <p>Sets: {match.sets.join(", ")}</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => handleEditMatch(index)}>Editar</Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteMatch(index)}>Eliminar</Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="max-w-4xl mx-auto p-4 bg-black min-h-screen text-white">
      <div className="flex items-center justify-between mb-6">
        <img src="/icono-putopadel.jpg" alt="Putopadel logo" className="w-12 h-12" />
        <h1 className="text-3xl font-bold">Putopadel</h1>
      </div>
      {toast && <div className="bg-green-600 text-white text-center p-2 rounded mb-4">{toast}</div>}
      {view === "ranking" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Ranking 1v1</h2>
              {renderRanking("elo1v1")}
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Ranking 2v2 Individual</h2>
              {renderRanking("elo2v2")}
            </div>
          </div>
          <Button onClick={() => setView("form")} className="mt-6 w-full">+ Nuevo Partido</Button>
          {renderHistory()}
        </>
      )}
      {view === "form" && renderForm()}
    </main>
  );
};

export default App;