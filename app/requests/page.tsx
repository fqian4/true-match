'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    // 1️⃣ 从 localStorage 获取当前用户
    const user = localStorage.getItem('currentUser');
    if (!user) {
      alert('请先登录');
      return;
    }
    const parsedUser = JSON.parse(user);
    setCurrentUser(parsedUser);

    // 2️⃣ 查询收到的申请
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('*, sender:users!requests_sender_id_fkey(wechat_id, avatar_url)')
        .eq('receiver_id', parsedUser.id) // 只看收到的申请
        .eq('status', 'pending');        // 只显示待处理
      if (!error) setRequests(data ?? []);
    };
    fetchRequests();
  }, []);

  // 3️⃣ 接受申请
  const acceptRequest = async (id: string) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('requests')
      .update({ status: 'accepted' })
      .eq('id', id);

    if (error) alert('操作失败: ' + error.message);
    else {
      alert('已接受申请');
      // 更新本地显示
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">收到的申请</h1>
      {requests.length === 0 && <p>暂无申请</p>}
      {requests.map((r) => (
        <div key={r.id} className="border p-4 mb-2 flex items-center gap-4">
          <img
            src={r.sender.avatar_url}
            alt="avatar"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <p>来自微信号：{r.sender.wechat_id}</p>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded mt-1"
              onClick={() => acceptRequest(r.id)}
            >
              接受
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}