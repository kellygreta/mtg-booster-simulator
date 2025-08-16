import { useEffect, useState } from "react";

// Tipo di dato per un set di Magic
interface SetInfo {
  code: string;
  name: string;
  //TODO aggiungere icona
}

interface SetSelectorProps {
  selectedSet: string; // set attualmente selezionato
  onChange: (value: string) => void; // funzione per cambiare il set
}

export default function SetSelector({
  selectedSet,
  onChange,
}: SetSelectorProps) {
  const [sets, setSets] = useState<SetInfo[]>([]); // elenco set da API
  const [loading, setLoading] = useState<boolean>(true); // stato di caricamento

  // useEffect serve per eseguire codice quando il componente viene caricato
  useEffect(() => {
    async function fetchSets() {
      try {
        // Prende tutti i set disponibili da Scryfall
        const res = await fetch("https://api.scryfall.com/sets");
        const data = await res.json();

        // Filtra solo set "expansion" o "core" e con boosters
        const filteredSets = data.data
          .filter(
            (set: any) =>
              (set.set_type === "expansion" || set.set_type === "core") &&
              !set.digital // esclude set solo digitali
          )
          // Ordiniamo dal più recente al più vecchio
          .sort(
            (a: any, b: any) =>
              new Date(b.released_at).getTime() -
              new Date(a.released_at).getTime()
          )
          // Prendiamo solo nome e codice
          .map((set: any) => ({
            code: set.code,
            name: set.name,
          }));

        setSets(filteredSets);
        setLoading(false);
      } catch (error) {
        console.error("Errore nel caricamento dei set:", error);
        setLoading(false);
      }
    }

    fetchSets();
  }, []); // [] significa che lo esegue solo quando il componente si carica la prima volta

  if (loading) return <p>Caricamento set...</p>;

  return (
    <div className="form-floating">
      <select
        className="form-select"
        value={selectedSet}
        onChange={(e) => onChange(e.target.value)}
      >
        {sets.map((set) => (
          <option key={set.code} value={set.code}>
            {set.name} ({set.code.toUpperCase()})
          </option>
        ))}
      </select>
      <label htmlFor="floatingSelect">Scegli un set:</label>
    </div>
  );
}
