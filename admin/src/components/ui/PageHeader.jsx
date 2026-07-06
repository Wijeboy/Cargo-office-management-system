export default function PageHeader({ title, subtitle }) {
  return (
    <header className="page-heading">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  )
}
