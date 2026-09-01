'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ArrowRight } from "lucide-react";
import { Plus, PlusCircle, ListPlus, CalendarPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [wechatId, setWechatId] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!wechatId) {
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
let avatarUrl = null;
  if (avatarFile) {
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

    avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`;
}

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
<div className="fixed top-4 right-6 z-50">
  <Button
  variant="ghost"
  className="cursor-pointer text-[#ef4b58] bg-transparent border border-[rgba(15,23,42,.16)] shadow-none text-xs py-1 h-8"
    onClick={() => router.push('/login')}
  >
    登录
  </Button>
</div>



<div className="flex flex-col justify-center items-center h-screen bg-[#f6fdfe] px-4">

<div className="latest-post-card w-full max-w-[420px]">

{/*
<input
  id="avatarUpload"
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
/> 
<label
  htmlFor="avatarUpload"
  className="latest-post-badge cursor-pointer select-none"
>
  <Plus size={14} strokeWidth={3}/>
</label>
*/}

<input type="text" placeholder="请填写微信号"
            value={wechatId}
            onChange={(e) => setWechatId(e.target.value)}
/>

<span className="latest-post-link cursor-pointer"
onClick={handleRegister}
><ArrowRight size={14} /></span>



</div>

</div>

</>
  );
}