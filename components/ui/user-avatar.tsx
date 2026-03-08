type Props = {
  name?: string | null
  image?: string | null
  size?: number
}

export default function UserAvatar({ name, image, size = 32 }: Props) {

  const initials =
    name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "U"

  if (image) {
    return (
      <img
        src={image}
        alt={name || "User"}
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    )
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700"
    >
      {initials}
    </div>
  )
}