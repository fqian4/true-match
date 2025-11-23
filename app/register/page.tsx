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

const { data: existUser } = await supabase
  .from('users')
  .select('id')
  .eq('wechat_id', wechatId)
  .maybeSingle();

if (existUser) {
  alert('该账号已注册，请更换账号');
  setLoading(false);
  return;
}

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
<>
<div className="fixed top-4 right-4 z-50">
  <button
    className="text-sm text-gray-500 hover:text-gray-800 transition-colors duration-200"
    onClick={() => router.push('/login')}
  >
    登录
  </button>
</div>

    <div className="flex justify-center items-center h-screen bg-white">

      <div className="w-full max-w-lg flex flex-col gap-6 px-4">

<h1 className="text-xl font-normal text-center">TrueMatch</h1>

<div className="flex items-center gap-3">
          <Input
            placeholder="输入微信号"
            value={wechatId}
            onChange={(e) => setWechatId(e.target.value)}
className="h-12 text-lg placeholder:text-gray-460"
          />
<input
  id="avatarUpload"
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
/>

{/* 圆形灰色上传按钮，无边框 */}
<button
  type="button"
  onClick={() => document.getElementById('avatarUpload')?.click()}
  className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray text-xl"
>
  +
</button>
          <Button onClick={handleRegister} disabled={loading}>
            {loading ? '提交中…' : '注册'}

          </Button>
</div>
      </div>
    </div>
</>
  );
}