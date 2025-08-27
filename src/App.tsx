// Importiamo le funzioni e componenti di cui abbiamo bisogno
import { useState } from "react"; // Hook di React per salvare e gestire dati
import SetSelector from "./components/SetSelector"; // Menù a tendina per scegliere il set
import BoosterPack from "./components/BoosterPack"; // Componente che mostra il pacchetto di carte
import { CardData } from "./components/Card"; // Tipo TypeScript per definire com'è fatta una carta
import "bootstrap/dist/css/bootstrap.min.css"; // Stili di Bootstrap
import "./App.css"; // Stili personalizzati
import { boosterPrices } from "./data/boosterPrices";

import { useTheme } from "./context/ThemeContext";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  //variabili dell'app
  const [selectedSet, setSelectedSet] = useState<string>("eoe"); // set di default
  const [booster, setBooster] = useState<CardData[]>([]); // array di carte del booster
  //const [opening, setOpening] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // dentro al componente
  const boosterPrice = boosterPrices[selectedSet] || 4.5; // fallback prezzo medio booster in USD

  /**
   * Funzione che prende una carta casuale da Scryfall
   * @param setCode - codice del set (es. "khm" per Kaldheim)
   * @param query - criteri di ricerca (es. "rarity:<common>")
   */
  async function fetchCard(setCode: string, query: string): Promise<CardData> {
    const res = await fetch(
      //-type:land NOT WORKING
      //TODO: trovare un modo per filtrare le carte, ci deve essere solo una terra/token
      `https://api.scryfall.com/cards/search?q=set:${setCode}+${query}`
    );
    const data = await res.json();
    const cards: CardData[] = data.data; // Prendiamo l'array di carte
    // Ritorniamo una carta casuale dall'elenco
    return cards[Math.floor(Math.random() * cards.length)];
  }

  //TODO ORDINARE LE CARTE
  function sortByBoosterOrder(cards: CardData[]): CardData[] {
    const order: Record<string, number> = {
      common: 1,
      uncommon: 2,
      rare: 3,
      mythic: 3,
      land: 4,
    };
    return cards.sort((a, b) => order[a.rarity] - order[b.rarity]);
  }

  async function fetchLand(setCode: string): Promise<CardData> {
    const res = await fetch(
      `https://api.scryfall.com/cards/search?q=set:${setCode}+(type:land)`
    );
    const data = await res.json();
    const lands: CardData[] = data.data;
    return lands[Math.floor(Math.random() * lands.length)];
  }

  /**
   * Funzione che simula l'apertura di un booster pack
   */
  async function openBooster() {
    //setOpening(true);
    setLoading(true); // inizia caricamento

    setTimeout(async () => {
      // 1 rara o mitica
      const isMythic = Math.random() < 0.125; // ~12.5% possibilità
      const rare = await fetchCard(
        selectedSet,
        isMythic ? "rarity:<mythic>" : "rarity:rare"
      );
      // 3 uncommon
      const uncommons = await Promise.all(
        Array(3)
          .fill(null)
          .map(() => fetchCard(selectedSet, "rarity:uncommon"))
      );
      // 10 common
      const commons = await Promise.all(
        Array(10)
          .fill(null)
          .map(() => fetchCard(selectedSet, "rarity:common"))
      );
      //TODO aggiugere una land o un token
      const land = await fetchLand(selectedSet);

      // Salviamo tutte le carte in stato
      setBooster([rare, ...uncommons, ...commons, land]);
      //setOpening(false);
      setLoading(false); // finito caricamento
    }, 500);
  }

  function getTotalPrice(cards: CardData[]) {
    return cards.reduce((sum, card) => {
      const price = parseFloat(card.prices?.usd || "0");
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }

  return (
    <div className="container py-4">
      <div className="position-relative text-center mb-3">
        <h1 className="fw-bold m-0  display-6 ">✨ Magic: The Gathering ✨</h1>
        <button
          className={`btn ${
            theme === "light" ? "btn-dark" : "btn-light"
          } position-absolute end-0 top-50 translate-middle-y`}
          onClick={toggleTheme}
        >
          {/* TODO aggiustare bottone da mobile */}
          {/* Solo emoji sempre visibile */}
          {theme === "light" ? "🌙" : "☀️"}

          {/* Testo visibile solo da md in su */}
          <span className="d-none d-md-inline ms-1">
            {theme === "light" ? "Dark" : "Light"}
          </span>
        </button>
      </div>

      <h2 className="text-center mb-4 display-7 ">Booster Pack Simulator</h2>
      <div className="d-flex justify-content-center mb-3">
        <SetSelector selectedSet={selectedSet} onChange={setSelectedSet} />
      </div>

      <div className="text-center mb-4">
        <button className="btn btn-primary btn-lg shadow" onClick={openBooster}>
          Apri Booster
        </button>
      </div>
      <hr />
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <p className="mt-2">Apertura Booster...</p>
        </div>
      ) : (
        <BoosterPack booster={booster} />
      )}

      {booster.length > 0 && (
        <div className="text-center mt-4 ">
          <hr />
          <div className="alert alert-primary">
            <h3>Valore totale carte: ${getTotalPrice(booster).toFixed(2)} </h3>
          </div>
          <hr />
          <div className=" ">
            <h4>
              {getTotalPrice(booster) >= boosterPrice ? (
                <p>
                  💰 Hai vinto! (Profitto: $
                  {(getTotalPrice(booster) - boosterPrice).toFixed(2)})
                </p>
              ) : (
                <p>
                  💸 Hai perso, compra le singole! (Perdita: $
                  {(getTotalPrice(booster) - boosterPrice).toFixed(2)}){" "}
                </p>
              )}
            </h4>
          </div>
          <small>Prezzo medio booster: ${boosterPrice.toFixed(2)}</small>
        </div>
      )}
    </div>
  );
}
