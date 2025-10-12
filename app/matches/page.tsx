'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function MatchesPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    // 从 localStorage 获取登录用户
    const user = localStorage.getItem('currentUser');
    if (!user) {
      alert('请先登录');
      return;
    }
    const parsedUser = JSON.parse(user);
    setCurrentUser(parsedUser);

    // 查询匹配成功的请求
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          sender:users!requests_sender_id_fkey(wechat_id, avatar_url),
          receiver:users!requests_receiver_id_fkey(wechat_id, avatar_url)
        `)
        .eq('status', 'accepted')
        .or(`sender_id.eq.${parsedUser.id},receiver_id.eq.${parsedUser.id}`);

      if (error) {
        console.error(error);
        return;
      }

      // 过滤出对方用户
      const matchList = data?.map((r: any) =>
        r.sender_id === parsedUser.id ? r.receiver : r.sender
      );
      setMatches(matchList ?? []);
    };

    fetchMatches();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">我的匹配</h1>
      {matches.length === 0 && <p>暂无匹配</p>}
      <div className="grid grid-cols-2 gap-4">
        {matches.map((u) => (
          <div key={u.wechat_id} className="border p-4 rounded text-center">
            <img
              src={u.avatar_url}
              alt="avatar"
              className="w-24 h-24 rounded-full mx-auto mb-2"
            />
            <p className="text-sm mb-2">微信号：{u.wechat_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}