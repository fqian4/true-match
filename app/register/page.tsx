'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [wechatId, setWechatId] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!wechatId || !avatarFile) {
      alert('请填写微信号并上传头像');
      return;
    }
    setLoading(true);

    // 上传头像到 Supabase Storage
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile);

    if (uploadError) {
      alert('头像上传失败');
      setLoading(false);
      return;
    }

    const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`;

    // 插入用户数据
    const { error } = await supabase
      .from('users')
      .insert([{ wechat_id: wechatId, avatar_url: avatarUrl }]);

if (error) {
      alert('注册失败: ' + error.message);
      setLoading(false);
      return;
    }

    // ⭐ 新增：注册后自动登录
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('wechat_id', wechatId)
      .single();

    if (!user) {
      alert('注册成功，但登录失败，请手动登录');
      setLoading(false);
      return;
    }

    // 保存登录态
    localStorage.setItem('currentUser', JSON.stringify(user));

    // 跳转主页
    router.push('/');

    setLoading(false);
  };

  return (

    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>注册账号</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            placeholder="输入微信号"
            value={wechatId}
            onChange={(e) => setWechatId(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
          />
          <Button onClick={handleRegister} disabled={loading}>
            {loading ? '提交中…' : '注册'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}