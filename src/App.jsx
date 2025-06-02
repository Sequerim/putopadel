
import React, { useState, useEffect } from "react";
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
  const [matchHistory, setMatchHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("putopadel_history");
    if (stored) setMatchHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("putopadel_history", JSON.stringify(matchHistory));
  }, [matchHistory]);

  const handleChangeSet = (index, value) => {
    const newSets = [...form.sets];
    newSets[index] = value;
    setForm({ ...form, sets: newSets });
  };

  const renderForm = () => (
    <div>
      <h2>Registrar Partido</h2>
      <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
        <option value="1v1">1 vs 1</option>
        <option value="2v2">2 vs 2</option>
      </select>
      {[form.playerA, form.playerA2, form.playerB, form.playerB2].map((_, idx) => (
        (form.type === "2v2" || idx % 2 === 0) && (
          <select
            key={idx}
            value={form[["playerA", "playerA2", "playerB", "playerB2"][idx]]}
            onChange={e => setForm({ ...form, [["playerA", "playerA2", "playerB", "playerB2"][idx]]: e.target.value })}
          >
            <option value="">Jugador</option>
            {jugadores.map(j => <option key={j}>{j}</option>)}
          </select>
        )
      ))}
      {form.sets.map((set, idx) => (
        <input key={idx} value={set} onChange={e => handleChangeSet(idx, e.target.value)} placeholder={`Set ${idx + 1}`} />
      ))}
    </div>
  );

  return (
    <main>
      <h1>Putopadel</h1>
      {view === "ranking" ? <Button onClick={() => setView("form")}>Nuevo Partido</Button> : renderForm()}
    </main>
  );
};

export default App;
