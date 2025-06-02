import { Button } from "./components/ui/button";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Carga desde localStorage al iniciar
    const stored = localStorage.getItem("putopadel-matches");
    if (stored) {
      setMatchHistory(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    // Guarda en localStorage cada vez que cambia historial
    localStorage.setItem("putopadel-matches", JSON.stringify(matchHistory));
  }, [matchHistory]);

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

  const handleEditMatch = (index) => {
    setEditIndex(index);
    setForm(matchHistory[index]);
    setView("nuevo");
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

  // Aquí iría el resto del componente (ranking, historial, etc.), que ya tenías funcionando bien.

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-5xl mx-auto">
      <Toaster />
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Putopadel</h1>
        <nav>
          <button className="mr-4" onClick={() => setView("ranking")}>Ranking</button>
          <button onClick={() => setView("nuevo")}>Nuevo Partido</button>
        </nav>
      </header>

      {view === "nuevo" && renderForm()}
      {view === "ranking" && (
        <>
          {/* Aquí tu código para mostrar el ranking 1v1 y 2v2 */}
          {/* Y también la lista de partidos con botones de editar y eliminar */}
          {/* Implementación que tenías funcionando */}
        </>
      )}
    </div>
  );
};

export default App;
