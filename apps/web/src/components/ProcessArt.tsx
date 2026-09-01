const nodes = [
  [66, 292, 'مسئله'],
  [160, 144, 'مدل'],
  [272, 220, 'سامانه'],
  [364, 96, 'پذیرش'],
  [454, 172, 'نتیجه']
] as const;

export function ProcessArt() {
  return <svg className="process-art" viewBox="0 0 520 400" role="img" aria-label="مسیر تبدیل مسئله به فرایند قابل اجرا">
    <path d="M66 292C92 218 111 164 160 144C209 124 222 204 272 220C322 236 328 112 364 96C400 80 416 156 454 172" fill="none" stroke="#71e3d2" strokeLinecap="round" strokeWidth="5" />
    <path d="M58 54H180V118H58zM214 260H340V324H214zM350 230H464V282H350z" fill="none" opacity=".24" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M84 66H150M84 82H132M242 276H312M242 292H286M378 244H438" opacity=".5" stroke="#71e3d2" strokeLinecap="round" strokeWidth="3" />
    {nodes.map(([x, y, label], index) => <g key={label}>
      <circle cx={x} cy={y} fill="#0a66c2" opacity=".28" r="42" />
      <circle cx={x} cy={y} fill="#ffffff" r="29" />
      <circle cx={x} cy={y} fill="none" r="29" stroke={index === nodes.length - 1 ? '#f8e6b7' : index === 3 ? '#f0a2b7' : '#71e3d2'} strokeWidth="3" />
      <text x={x} y={y + 5} fill="#0b2545" fontFamily="Vazirmatn, Tahoma, sans-serif" fontSize="12" fontWeight="700" textAnchor="middle">{label}</text>
    </g>)}
    <circle cx="476" cy="62" fill="#f9e7be" r="7" />
    <circle cx="194" cy="350" fill="#71e3d2" r="5" />
  </svg>;
}
