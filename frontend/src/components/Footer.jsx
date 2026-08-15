function Footer() {
  return (
    <footer className="bg-surface-container-high border-t border-outline-variant w-full mt-auto">
      <div className="w-full py-8 px-margin-desktop max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-label-technical text-label-technical text-on-surface-variant text-center md:text-left">
            BSZC © 2026. Békéscsabai Szakképzési Centrum Trefort Ágoston Technikum, Szakképző Iskola és Kollégium OM: 203029 Szervezeti egység kód: 031104
          </div>
          <div className="flex gap-6">
            <a className="font-label-technical text-label-technical text-on-surface-variant hover:text-primary transition-colors" href="#">
              Adatvédelem
            </a>
            <a className="font-label-technical text-label-technical text-on-surface-variant hover:text-primary transition-colors" href="#">
              Házirend
            </a>
            <a className="font-label-technical text-label-technical text-on-surface-variant hover:text-primary transition-colors" href="#">
              Technikai Segítség
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;