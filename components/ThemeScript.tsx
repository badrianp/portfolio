'use client'
import Script from "next/script"

export default function ThemeScript() {
  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {`(function(){
        var mql = window.matchMedia('(prefers-color-scheme: dark)');
        function apply(v){ document.documentElement.classList.toggle('dark', v); }

        try {
          var ls = localStorage.getItem('theme'); // 'light' | 'dark' | null
          if (ls === 'dark' || ls === 'light') {
            apply(ls === 'dark');
          } else {
            apply(mql.matches);
          }
          mql.addEventListener('change', function(e){
            if (!localStorage.getItem('theme')) apply(e.matches);
          });
        } catch(e){}
      })();`}
    </Script>
  )
}