export function ProcessArt() {
  return <svg className="process-art" viewBox="0 0 520 480" role="img" aria-labelledby="process-art-title">
    <title id="process-art-title">نیازهای سازمان، قواعد مالی و داده‌ها در یک مدل مشترک به فرایند قابل اجرا تبدیل می‌شوند.</title>
    <g className="art-grid" fill="none" stroke="currentColor" strokeWidth="1">
      {[40, 120, 200, 280, 360, 440].map((y) => <path d={`M24 ${y}H496`} key={y}/>)}
      {[40, 120, 200, 280, 360, 440].map((x) => <path d={`M${x} 24V456`} key={x}/>)}
    </g>
    <g fill="none" stroke="var(--color-muted)" strokeWidth="1"><path d="M22 30h16m-8-8v16M482 30h16m-8-8v16M22 450h16m-8-8v16M482 450h16m-8-8v16"/></g>
    <g fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
      <path d="M405 115H320Q286 115 286 151V205"/><path d="M405 180H355Q330 180 330 205H315"/><path d="M405 245H360Q330 245 315 233"/>
      <path d="M224 239H174Q138 239 138 279V303" strokeWidth="2"/><path d="m132 293 6 10 6-10"/>
    </g>
    <g className="art-inputs"><text x="420" y="105">نیاز سازمان</text><text x="420" y="170">قواعد مالی</text><text x="420" y="235">داده و عملیات</text></g>
    <g fill="var(--color-accent)"><circle cx="405" cy="115" r="4"/><circle cx="405" cy="180" r="4"/><circle cx="405" cy="245" r="4"/></g>
    <path d="m175 140 92-44 85 48-91 47z" fill="var(--color-surface)" stroke="var(--color-border)"/>
    <path d="m175 159 92-44 85 48-91 47z" fill="var(--color-surface)" stroke="var(--color-accent)"/>
    <path d="M204 191h117v86H204z" fill="var(--navy-900)"/>
    <path d="M220 210h82M220 220h54" stroke="var(--art-line)" opacity=".6"/>
    <text x="263" y="252" textAnchor="middle" fill="var(--white)" fontSize="16">مدل مشترک</text>
    <path d="M61 321h207v124H61z" fill="var(--color-paper)" stroke="var(--color-border)"/>
    <path d="M72 309h207v124H72z" fill="var(--white)" stroke="var(--navy-900)"/>
    <path d="M89 328h173" stroke="var(--color-border)"/><path d="M91 391h123M91 404h87" stroke="var(--color-border)" strokeWidth="4"/>
    <path d="m242 384 6 6 12-15" fill="none" stroke="var(--color-accent)" strokeWidth="2"/>
    <text x="175" y="362" textAnchor="middle" fill="var(--navy-900)" fontSize="19" fontWeight="700">فرایند قابل اجرا</text>
    <text x="384" y="364" textAnchor="middle" fill="var(--burgundy-700)" fontSize="12">قابل آزمون</text>
    <text x="384" y="388" textAnchor="middle" fill="var(--color-muted)" fontSize="12">قابل پیگیری</text>
    <path d="M347 345h75" stroke="var(--burgundy-700)" strokeWidth="2"/>
    <text x="84" y="92" textAnchor="middle" fill="var(--color-muted)" fontSize="12">طرح روش</text>
    <path d="M84 110v48m-5-8 5 8 5-8" fill="none" stroke="var(--color-muted)"/>
  </svg>;
}
