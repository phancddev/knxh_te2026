export default function Background() {
  const motes = Array.from({ length: 14 }, (_, index) => index)

  return (
    <div className="scene" aria-hidden="true">
      <img
        className="scene-art"
        src={`${import.meta.env.BASE_URL}assets/enchanted-arena.webp`}
        width="1672"
        height="941"
        alt=""
      />
      <div className="scene-scrim" />
      <div className="scene-mist scene-mist--one" />
      <div className="scene-mist scene-mist--two" />
      <div className="scene-rune-ring" />
      <div className="scene-motes">
        {motes.map((index) => <span className={`mote mote--${index + 1}`} key={index} />)}
      </div>
      <div className="scene-vignette" />
    </div>
  )
}
