// Dekoracje tła hero sekcji — motywy inspirowane zdjęciem marki EduSmyk
// Klocki drewniane, kredki, plan z checklistą, miseczka z elementami

function BlocksSVG() {
  return (
    <svg width="175" height="165" viewBox="0 0 148 165" fill="none">
      {/* Niebieski klocek (tył-lewo) */}
      <polygon points="0,52 12,40 68,40 56,52" fill="#7BAEF5" />
      <rect x="0" y="52" width="56" height="56" rx="4" fill="#5B8FD6" />
      <polygon points="56,52 68,40 68,96 56,108" fill="#4574BE" />

      {/* Pomarańczowy klocek (tył-prawo) */}
      <polygon points="62,42 74,30 128,30 116,42" fill="#F7C06B" />
      <rect x="62" y="42" width="54" height="54" rx="4" fill="#F5A623" />
      <polygon points="116,42 128,30 128,84 116,96" fill="#D48810" />

      {/* Żółty klocek (przód, przykrywa oba) */}
      <polygon points="16,84 29,71 91,71 78,84" fill="#FAE090" />
      <rect x="16" y="84" width="62" height="62" rx="4" fill="#F7D060" />
      <polygon points="78,84 91,71 91,133 78,146" fill="#E0B840" />
    </svg>
  );
}

function PencilsSVG() {
  return (
    <svg width="155" height="52" viewBox="0 0 155 52" fill="none">
      {/* Kredka 1 – teal */}
      <g>
        <rect x="0" y="3" width="14" height="15" rx="4" fill="#FF8FAD" />
        <rect x="12" y="4" width="6" height="13" fill="#C8A0A0" />
        <rect x="17" y="3" width="93" height="15" rx="2" fill="#4BBFCA" />
        <rect x="17" y="3" width="93" height="5" rx="2" fill="#7BD5E0" opacity="0.55" />
        <polygon points="110,3 130,10.5 110,18" fill="#F5DEB3" />
        <polygon points="126,7 134,10.5 126,14" fill="#3A3A3A" />
      </g>
      {/* Kredka 2 – pomarańczowa */}
      <g transform="translate(10,28)">
        <rect x="0" y="3" width="14" height="15" rx="4" fill="#AED6F1" />
        <rect x="12" y="4" width="6" height="13" fill="#C8A0A0" />
        <rect x="17" y="3" width="93" height="15" rx="2" fill="#F5A623" />
        <rect x="17" y="3" width="93" height="5" rx="2" fill="#F7C06B" opacity="0.55" />
        <polygon points="110,3 130,10.5 110,18" fill="#F5DEB3" />
        <polygon points="126,7 134,10.5 126,14" fill="#3A3A3A" />
      </g>
    </svg>
  );
}

function WorksheetSVG() {
  return (
    <svg width="96" height="120" viewBox="0 0 96 120" fill="none">
      {/* Cień karty */}
      <rect x="4" y="4" width="88" height="112" rx="12" fill="rgba(0,0,0,0.07)" />
      {/* Karta */}
      <rect x="0" y="0" width="88" height="112" rx="12" fill="white" />
      {/* Nagłówek */}
      <rect x="0" y="0" width="88" height="26" rx="12" fill="#4BBFCA" />
      <rect x="0" y="14" width="88" height="12" fill="#4BBFCA" />
      <rect x="10" y="8" width="30" height="6" rx="3" fill="white" opacity="0.85" />
      <rect x="44" y="9" width="18" height="4" rx="2" fill="white" opacity="0.4" />

      {/* Wiersz 1 – checkbox niezaznaczony */}
      <rect x="10" y="33" width="10" height="10" rx="2.5" fill="#E0F2F4" stroke="#4BBFCA" strokeWidth="1.5" />
      <rect x="25" y="35" width="50" height="5" rx="2.5" fill="#E5E7EB" />

      {/* Wiersz 2 – checkbox zaznaczony (teal) */}
      <rect x="10" y="50" width="10" height="10" rx="2.5" fill="#4BBFCA" />
      <polyline points="11.5,55.5 13.5,58 18,52.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="25" y="52" width="44" height="5" rx="2.5" fill="#E5E7EB" />

      {/* Wiersz 3 – checkbox niezaznaczony */}
      <rect x="10" y="67" width="10" height="10" rx="2.5" fill="#E0F2F4" stroke="#4BBFCA" strokeWidth="1.5" />
      <rect x="25" y="69" width="48" height="5" rx="2.5" fill="#E5E7EB" />

      {/* Wiersz 4 – checkbox zaznaczony (zielony) */}
      <rect x="10" y="84" width="10" height="10" rx="2.5" fill="#7BC44C" />
      <polyline points="11.5,89.5 13.5,92 18,86.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="25" y="86" width="38" height="5" rx="2.5" fill="#E5E7EB" />

      {/* Separator i logo-tag na dole */}
      <rect x="10" y="100" width="68" height="1.5" rx="1" fill="#E5E7EB" />
      <rect x="24" y="104" width="40" height="6" rx="3" fill="#F5A623" opacity="0.45" />
    </svg>
  );
}

function BowlSVG() {
  return (
    <svg width="88" height="72" viewBox="0 0 88 72" fill="none">
      {/* Cień miski */}
      <ellipse cx="44" cy="67" rx="34" ry="5" fill="rgba(0,0,0,0.08)" />
      {/* Ciało miski */}
      <path d="M4 42 Q4 70 44 70 Q84 70 84 42 Z" fill="#F0E8DF" />
      {/* Rim górny */}
      <ellipse cx="44" cy="42" rx="40" ry="10" fill="#E0D5C8" />
      {/* Wnętrze */}
      <ellipse cx="44" cy="42" rx="34" ry="8" fill="#EDE3D8" />
      {/* Kolorowe elementy w misce */}
      <ellipse cx="28" cy="37" rx="11" ry="7" fill="#F5A623" />
      <ellipse cx="46" cy="35" rx="10" ry="7" fill="#7BC44C" />
      <ellipse cx="63" cy="38" rx="9" ry="6" fill="#4BBFCA" />
      <ellipse cx="35" cy="28" rx="8" ry="6" fill="#FF8FAD" />
      <ellipse cx="54" cy="28" rx="7" ry="5" fill="#F7D060" />
    </svg>
  );
}

export function HeroDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      {/* Klocki drewniane — lewy dół */}
      <div
        className="animate-float absolute"
        style={{
          bottom: "52px",
          left: "-14px",
          animationDuration: "4.2s",
          filter: "drop-shadow(0 8px 22px rgba(0,0,0,0.16))",
          opacity: 0.88,
        }}
      >
        <BlocksSVG />
      </div>

      {/* Kredki — prawy dół */}
      <div
        className="animate-float-slow absolute hidden sm:block"
        style={{
          bottom: "96px",
          right: "-28px",
          transform: "rotate(-20deg)",
          animationDuration: "5.5s",
          animationDelay: "1.2s",
          filter: "drop-shadow(0 5px 14px rgba(0,0,0,0.13))",
          opacity: 0.78,
        }}
      >
        <PencilsSVG />
      </div>

      {/* Plan z checklistą — prawy górny róg, za obrazem hero */}
      <div
        className="animate-float absolute hidden lg:block"
        style={{
          top: "68px",
          right: "72px",
          transform: "rotate(7deg)",
          animationDuration: "6s",
          animationDelay: "2s",
          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.1))",
          opacity: 0.42,
        }}
      >
        <WorksheetSVG />
      </div>

      {/* Miseczka — lewy górny róg */}
      <div
        className="animate-float-slow absolute hidden lg:block"
        style={{
          top: "52px",
          left: "36px",
          animationDelay: "0.6s",
          filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.1))",
          opacity: 0.52,
        }}
      >
        <BowlSVG />
      </div>

    </div>
  );
}
