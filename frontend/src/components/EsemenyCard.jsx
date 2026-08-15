function EsemenyCard({ esemeny }) {

  const formattedDate = new Date(esemeny.date_time).toLocaleString('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Kép beállítása (Ha a backend később küld képet, azt használja, ha nem, a defaultot)
  const imageUrl = esemeny.image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDrVNLcK82aASvChD0FRqXVOvxzCCnmznE4jNaFNop1gA8rh-4NO_dBEo7UCuLLkqpDg_8PmNxqTvcQ1OpMiE_B9ujKGvfEd3NaPrkhi-HvHIK7U3ryYicQlhWojkME1C6poA5cj1rLsnlSBTBJ37YhrkuV3Y-mNYgJjHJyTu-267CW1SV22Opo7JZF5RAL4wkMN_N2z-GCBanT4PfDX2fEkrlOgde8clsN7yT0UNO63hN8TlASkgLIpw";

  return (
    <article className="bg-surface border border-outline-variant rounded flex flex-col overflow-hidden hover:border-primary transition-colors group">
      
      <div className="h-48 border-b border-outline-variant relative overflow-hidden bg-surface-container">
        {/* Itt használjuk a te imageUrl változódat! */}
        <img 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          alt={esemeny.title} 
          src={imageUrl} 
        />
        <div className="absolute top-2 left-2 bg-surface/90 backdrop-blur-sm px-2 py-1 border border-outline-variant rounded font-label-technical text-label-technical text-primary">
          IPAR 4.0
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3 text-secondary font-label-technical text-label-technical">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          <span>{formattedDate}</span>
        </div>
        
        <h2 className="font-title-md text-title-md text-on-surface mb-3 group-hover:text-primary transition-colors">
          {esemeny.title}
        </h2>
        
        <p className="font-body-sm text-body-sm text-on-surface-variant flex-grow mb-6">
          {esemeny.description}
        </p>
        
        <button className="w-full py-2 bg-surface-container border border-outline-variant font-label-technical text-label-technical text-on-surface hover:bg-outline-variant transition-colors rounded flex items-center justify-center gap-2">
          Részletek <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

    </article>
  )
}

export default EsemenyCard;