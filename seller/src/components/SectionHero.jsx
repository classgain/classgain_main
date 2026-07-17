export default function SectionHero({ eyebrow, title, description }) {
  return (
    <section className="hero-band">
      <div className="container-xl">
        <div className="hero-band__content">
          <span className="hero-band__eyebrow">{eyebrow}</span>
          <h1 className="hero-band__title">{title}</h1>
          <p className="hero-band__description">{description}</p>
        </div>
      </div>
    </section>
  );
}
