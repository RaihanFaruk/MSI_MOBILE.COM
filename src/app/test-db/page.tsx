import { supabase } from '@/lib/supabase'

export default async function TestDB() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Database Connection Test</h1>
      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: 8, margin: '16px 0' }}>
          <strong>Error:</strong> {error.message}
        </div>
      )}
      <h3>Categories Data:</h3>
      <pre style={{ background: '#f1f5f9', padding: 16, borderRadius: 8, overflow: 'auto' }}>
        {JSON.stringify(categories, null, 2)}
      </pre>
    </div>
  )
}
