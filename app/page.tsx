'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

const [previewImage, setPreviewImage] = useState<string | null>(null);
const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // 从 localStorage 读取登录用户
    const user = localStorage.getItem('currentUser');

console.log('localStorage user', user);

    if (!user) {
      alert('请先登录');
      return;
    }
    const parsedUser = JSON.parse(user);

console.log('parsedUser', parsedUser);
    setCurrentUser(parsedUser);

    // 查询其他用户
    const fetchUsers = async () => {
      const { data: allUsers } = await supabase
        .from('users')
        .select('*')
        .neq('id', parsedUser.id); // 排除自己
      setUsers(allUsers ?? []);
    };
    fetchUsers();
  }, []);

  const sendRequest = async (receiverId: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from('requests').insert([
      {
        sender_id: currentUser.id,
        receiver_id: receiverId,
        status: 'pending',
      },
    ]);
    if (error) alert('申请失败');
    else alert('已发送申请');
  };

  const payRequest = async (receiverId: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from('requests').insert([
      {
        sender_id: currentUser.id,
        receiver_id: receiverId,
        status: 'pending',
      },
    ]);
    if (error) alert('申请失败');
    else alert('已发送申请');

window.location.href = '/pay'
  };

  return (

<div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
      {users.map((u) => (
        <Card key={u.id} className="p-4 flex flex-col items-center">
          <img
            src={u.avatar_url}
            className="w-24 h-24 rounded-full object-cover mb-3 border"
            alt="avatar"
  onClick={() => {
    setPreviewImage(u.avatar_url);
    setShowPreview(true);
  }}
          />
          <p className="font-medium mb-2">
            {u.wechat_id
              ? u.wechat_id.charAt(0) + '***'
              : '***'}
          </p>
<div className="flex gap-3 mt-2">
  <Button size="sm" onClick={() => sendRequest(u.id)}>
    发申请
  </Button>
  <Button size="sm" onClick={() => payRequest(u.id)}>
    付费加
  </Button>
</div>
        </Card>
      ))}
    </div>

{showPreview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowPreview(false)}
        >
          <img
            src={previewImage ?? ''}
            className="max-w-[90%] max-h-[90%] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}