'use client'
import Script from 'next/script'

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID

export default function GoogleAnalytics() {
  if (!GA4_ID) return null
  return (
    <>
      <Script id="ga4-opt-out" strategy="afterInteractive">
        {`
          (function(){
            try {
              var q = location.search;
              if(q.indexOf('ga_opt_out=1') !== -1){
                localStorage.setItem('ga_opt_out','1');
              }
              if(localStorage.getItem('ga_opt_out')==='1'){
                window['ga-disable-${GA4_ID}']=true;
              }
            } catch(e){}
          })();
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_ID}', { send_page_view: true });
        `}
      </Script>
    </>
  )
}
