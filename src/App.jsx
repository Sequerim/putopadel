// ... (importaciones y configuraciones previas)

import { Button } from "./components/ui/button";
import { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";

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
  const [matchHistory, setMatchHistory] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(matchHistory));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "putopadel-historial.json");
    dlAnchorElem.click();
  };

  const handleImport = (event) => {
    const fileReader = new FileReader();
    fileReader.onload = e => {
      try {
        const imported = JSON.parse(e.target.result);
        setMatchHistory(imported);
        toast.success("Historial importado correctamente");
      } catch {
        toast.error("Archivo inválido");
      }
    };
    if (event.target.files[0]) fileReader.readAsText(event.target.files[0]);
  };

  const renderHistoryControls = () => (
    <div className="flex gap-4 mt-4">
      <Button onClick={handleExport}>📥 Exportar JSON</Button>
      <Button onClick={() => fileInputRef.current?.click()}>📤 Importar JSON</Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );

  const handleChangeSet = (index, value) => {
    const newSets = [...form.sets];
    newSets[index] = value;
    setForm({ ...form, sets: newSets });
  };

  const handleRegisterMatch = () => {
    const newMatch = { ...form };
    if (editIndex !== null) {
      const updated = [...matchHistory];
      updated[editIndex] = newMatch;
      setMatchHistory(updated);
      toast.success("Partido actualizado correctamente");
      setEditIndex(null);
    } else {
      setMatchHistory([...matchHistory, newMatch]);
      toast.success("Partido registrado con éxito");
    }
    setForm({ type: "1v1", playerA: "", playerA2: "", playerB: "", playerB2: "", sets: ["", "", ""] });
    setView("ranking");
  };

  const handleDeleteMatch = (index) => {
    const updated = [...matchHistory];
    updated.splice(index, 1);
    setMatchHistory(updated);
    toast.success("Partido eliminado correctamente");
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setForm({ type: "1v1", playerA: "", playerA2: "", playerB: "", playerB2: "", sets: ["", "", ""] });
    setView("ranking");
    toast.success("Edición cancelada");
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
        <Button variant="secondary" onClick={handleCancelEdit}>Cancelar</Button>
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
      {matchHistory.length === 0 && <p className="text-sm text-gray-400">No hay partidos registrados.</p>}
      <ul className="text-sm">
        {matchHistory.map((match, idx) => (
          <li key={idx} className="border-b border-zinc-700 py-2 flex justify-between">
            <span>
              {match.type === "1v1"
                ? `${match.playerA} vs ${match.playerB}`
                : `${match.playerA} y ${match.playerA2} vs ${match.playerB} y ${match.playerB2}`}
              {" - "}
              {match.sets.filter(Boolean).join(", ")}
            </span>
            <div className="space-x-2">
              <Button onClick={() => { setForm(match); setEditIndex(idx); setView("form"); }} className="text-xs px-2 py-1">Editar</Button>
              <Button onClick={() => handleDeleteMatch(idx)} className="text-xs px-2 py-1" variant="secondary">Borrar</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <main className="max-w-4xl mx-auto p-4 bg-black min-h-screen text-white">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <img src="/icono-putopadel.jpg" alt="Putopadel logo" className="w-12 h-12" />
        <h1 className="text-3xl font-bold">Putopadel</h1>
      </div>
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
          <Button onClick={() => { setForm({ type: "1v1", playerA: "", playerA2: "", playerB: "", playerB2: "", sets: ["", "", ""] }); setView("form"); }} className="mt-6 w-full">+ Nuevo Partido</Button>
          {renderHistoryControls()}
          {renderHistory()}
        </>
      )}
      {view === "form" && renderForm()}
    </main>
  );
};

export default App;
