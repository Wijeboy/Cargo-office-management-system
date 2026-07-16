import { MoreVertical } from 'lucide-react'

export default function DataTable({ columns, rows, renderCell, renderActions, loading = false, emptyMessage = 'No records found.' }) {
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
            {loading && (
              <tr>
                <td colSpan={columns.length + 1}>Loading records...</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1}>{emptyMessage}</td>
              </tr>
            )}
            {!loading && rows.map((row, rowIndex) => (
              <tr key={row[0]}>
                {row.map((cell, cellIndex) => (
                  <td key={`${row[0]}-${cellIndex}`}>
                    {renderCell ? renderCell(cell, cellIndex, row, rowIndex) : cell}
                  </td>
                ))}
                <td>{renderActions ? renderActions(row, rowIndex) : <button className="icon-button" aria-label="More actions"><MoreVertical size={18} /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
