export default function Footer() {
  return (
    <footer className="border-t border-cream/[0.12] px-4 md:px-5 py-10 flex justify-between gap-5 flex-wrap font-mono text-[11px] tracking-[0.16em] uppercase text-cream/45">
      <span>BIG BONG THEORY © {new Date().getFullYear()}</span>
      <span>KOLKATA / EVERYWHERE</span>
      <span className="text-lime">TURNING MISFITS INTO MAIN CHARACTERS.</span>
    </footer>
  );
}
