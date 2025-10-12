'use client'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TestPage() {
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from('users').select('*')
      console.log('Supabase data:', data, 'error:', error)
    }
    test()
  }, [])

  return <h1>Supabase 测试页面</h1>
}
