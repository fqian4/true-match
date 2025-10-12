'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [wechatId, setWechatId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!wechatId) {
      alert('请输入微信号');
      return;
    }
    setLoading(true);

    // 查询 users 表
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('wechat_id', wechatId)
      .single();

    if (error || !user) {
      alert('用户不存在，请先注册');
      setLoading(false);
      return;
    }

    // 保存当前用户到 localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    router.push('/');
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">登录</h1>
      <input
        type="text"
        className="border p-2 mb-2 w-64"
        placeholder="请输入微信号"
        value={wechatId}
        onChange={(e) => setWechatId(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded w-64"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? '登录中…' : '登录'}
      </button>
    </div>
  );
}
