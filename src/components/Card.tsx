import "./Card.css";

// Tipo TypeScript che rappresenta una carta mtg di Scryfall
export interface CardData {
  name: string;
  image_uris?: { normal: string }; // immagine se è una faccia singola
  card_faces?: { image_uris?: { normal: string } }[]; // immagini se ha più facce
  prices?: { usd?: string }; // Prezzo in dollari USD
  scryfall_uri: string; // link alla pagina ufficiale su Scryfall
  rarity: string; // rarità della carta
}
// funzione per dare una classe di colore in base alla rarità
function rarityClass(rarity: string) {
  switch (rarity) {
    case "common":
      return "rarity-common"; // grigio
    case "uncommon":
      return "rarity-uncommon"; // blu/argento
    case "rare":
      return "rarity-rare"; // dorato
    case "mythic":
      return "rarity-mythic"; // arancione
    default:
      return "";
  }
}

export default function Card({ card }: { card: CardData }) {
  // Se la carta è double-faced prendo la prima faccia
  const img =
    card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;

  // Prezzo della carta in dollari, se non presente N/A
  const price = card.prices?.usd
    ? `$${parseFloat(card.prices.usd).toFixed(2)}`
    : "N/A";

  return (
    <div
      className={`card text-center p-2 shadow-sm ${rarityClass(card.rarity)}`}
    >
      <a
        href={card.scryfall_uri}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="mb-1 fw-bold">{card.name}</div>
        {img ? (
          <img src={img} alt={card.name} className="img-fluid" />
        ) : (
          <div className="placeholder">NO IMG</div>
        )}
      </a>
      <div className="mt-2 fw-bold">{price}</div>
    </div>
  );
}
