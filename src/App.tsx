// Importiamo le funzioni e componenti di cui abbiamo bisogno
import { useState } from "react"; // Hook di React per salvare e gestire dati
import SetSelector from "./components/SetSelector"; // Menù a tendina per scegliere il set
import BoosterPack from "./components/BoosterPack"; // Componente che mostra il pacchetto di carte
import { CardData } from "./components/Card"; // Tipo TypeScript per definire com'è fatta una carta
import "bootstrap/dist/css/bootstrap.min.css"; // Stili di Bootstrap
import "./App.css"; // Stili personalizzati

import { useTheme } from "./context/ThemeContext";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  //variabili dell'app
  const [selectedSet, setSelectedSet] = useState<string>("eoe"); // set di default
  const [booster, setBooster] = useState<CardData[]>([]); // array di carte del booster
  //const [opening, setOpening] = useState<boolean>(false);

  const boosterPrice = 4.5; // Prezzo medio booster in USD

  /**
   * Funzione che prende una carta casuale da Scryfall
   * @param setCode - codice del set (es. "khm" per Kaldheim)
   * @param query - criteri di ricerca (es. "(rarity:rare OR rarity:mythic)")
   */
  async function fetchCard(setCode: string, query: string): Promise<CardData> {
    const res = await fetch(
      `https://api.scryfall.com/cards/search?q=set:${setCode}+${query}-type:land`
    );
    const data = await res.json();
    const cards: CardData[] = data.data; // Prendiamo l'array di carte
    // Ritorniamo una carta casuale dall'elenco
    return cards[Math.floor(Math.random() * cards.length)];
  }
  /**
   * Funzione che simula l'apertura di un booster pack
   */
  async function fetchLand(setCode: string): Promise<CardData> {
    const res = await fetch(
      `https://api.scryfall.com/cards/search?q=set:${setCode}+(type:land OR type:token)`
    );
    const data = await res.json();
    const lands: CardData[] = data.data;
    return lands[Math.floor(Math.random() * lands.length)];
  }

  async function openBooster() {
    //setOpening(true);

    setTimeout(async () => {
      // 1 rara o mitica
      const rare = await fetchCard(
        selectedSet,
        "(rarity:mythic OR rarity: rare )"
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
    }, 0);
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
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
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
      <BoosterPack booster={booster} />

      {booster.length > 0 && (
        <div className="text-center mt-4 ">
          <hr />
          <div className="alert alert-primary">
            <h3>Valore totale carte: ${getTotalPrice(booster).toFixed(2)} </h3>
          </div>
          <hr />
          <div className=" ">
            <h4>
              {getTotalPrice(booster) >= boosterPrice
                ? "💰 Hai vinto!"
                : "💸 Hai perso, compra le singole!"}
            </h4>
          </div>
          <small>Prezzo medio booster: ${boosterPrice.toFixed(2)}</small>
        </div>
      )}
    </div>
  );
}
