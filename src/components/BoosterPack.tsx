import Card, { CardData } from "./Card";

interface BoosterPackProps {
  booster: CardData[]; // tutte le carte da mostrare
}

export default function BoosterPack({ booster }: BoosterPackProps) {
  return (
    // row e col-* di Bootstrap creano una griglia
    <div className={`row g-3`}>
      {booster.map((card, i) => (
        <div
          key={i}
          className="col-12 mt-4 col-sm-6 col-md-4 d-flex justify-content-center"
        >
          <Card card={card} />
        </div>
      ))}
    </div>
  );
}
