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

    // 保存当前用户到 localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    router.push('/');
    setLoading(false);
  };

  

 return (

    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>登录</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            placeholder="请输入微信号"
        value={wechatId}
        onChange={(e) => setWechatId(e.target.value)}
          />

          <Button
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? '登录中…' : '登录'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

}
