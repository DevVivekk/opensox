import Script from "next/script";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script id="blog-theme-init" strategy="beforeInteractive">
        {`(function(){
        try{
        var v=localStorage.getItem("blog-theme");
        var ok=["dark","light","sepia","green"];
        if(!v||ok.indexOf(v)===-1){
        //fallback to system dark/light mode
         v = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
        }
        document.documentElement.setAttribute("data-blog-theme",v);
        }catch(e){
        document.documentElement.setAttribute("data-blog-theme","dark");
        }})();`}
      </Script>
      {children}
    </>
  );
}
