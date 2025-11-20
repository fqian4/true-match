'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

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

// 如果用户有密码 → 要求输入
  if (user.password && user.password.trim() !== "") {
    const inputPwd = prompt("请输入密码：");
    if (inputPwd === null) {
      setLoading(false);
      return; // 用户取消
    }

    if (inputPwd !== user.password) {
      alert("密码错误");
      setLoading(false);
      return;
    }
  }


    // 保存当前用户到 localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    router.push('/');
    setLoading(false);
  };

  

 return (

    <div className="flex justify-center items-center h-screen bg-white">
      <div className="w-full max-w-lg flex flex-col gap-6 px-4">
<h1 className="text-xl font-normal text-center">登录</h1>
<div className="flex items-center gap-3">
          <Input
            placeholder="请输入微信号"
        value={wechatId}
        onChange={(e) => setWechatId(e.target.value)}
className="h-12 text-lg placeholder:text-gray-460"
          />

          <Button
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? '登录中…' : '登录'}
          </Button>
</div>
    </div>
    </div>
  );

}
