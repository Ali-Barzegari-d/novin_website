export function ProcessArt() {
  return <svg className="process-art" viewBox="0 0 480 380" role="img" aria-label="مسیر تبدیل مسئله به فرایند قابل اجرا">
    <defs><linearGradient id="path" x1="0" x2="1"><stop stopColor="#0B2545"/><stop offset="1" stopColor="#0E7490"/></linearGradient></defs>
    <path d="M70 278C116 91 225 312 273 126S377 248 430 67" fill="none" stroke="url(#path)" strokeWidth="8" strokeLinecap="round"/>
    {[[70,278,'مسئله'],[166,142,'مدل'],[273,126,'سامانه'],[372,196,'پذیرش'],[430,67,'نتیجه']].map(([x,y,label]) => <g key={String(label)}><circle cx={x as number} cy={y as number} r="28" fill="#fff" stroke="#B7791F" strokeWidth="4"/><text x={x as number} y={(y as number)+5} textAnchor="middle" fill="#0B2545" fontSize="13" fontFamily="Vazirmatn">{label as string}</text></g>)}
    <path d="M44 55h120v68H44zM222 232h120v68H222zM316 27h96v54h-96z" fill="#0B2545" opacity=".06" stroke="#0E7490"/>
  </svg>;
}
