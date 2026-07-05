import { MoreVertical } from 'lucide-react'

export default function DataTable({ columns, rows, renderCell }) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => <th key={column}>{column}</th>)}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row[0]}>
                {row.map((cell, cellIndex) => (
                  <td key={`${row[0]}-${cellIndex}`}>
                    {renderCell ? renderCell(cell, cellIndex, row, rowIndex) : cell}
                  </td>
                ))}
                <td><button className="icon-button" aria-label="More actions"><MoreVertical size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
