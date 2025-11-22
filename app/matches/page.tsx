'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function MatchesPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [matches, setMatches] = useState<any[]>([]);

const [previewImage, setPreviewImage] = useState<string | null>(null);
const [showPreview, setShowPreview] = useState(false);

const [loading, setLoading] = useState(true);

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
setLoading(false);
        return;
      }

      // 过滤出对方用户
      const matchList = data?.map((r: any) =>
        r.sender_id === parsedUser.id ? r.receiver : r.sender
      );
      setMatches(matchList ?? []);
setLoading(false);
    };

    fetchMatches();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">我的匹配</h1>
{loading ? (

) : matches.length === 0 ? (
  <p>暂无匹配</p>
) : (
      <div className="grid grid-cols-2 gap-4">
        {matches.map((u) => (
          <div key={u.wechat_id} className="border p-4 rounded text-center">
            <img
              src={u.avatar_url}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border"
  onClick={() => {
    setPreviewImage(u.avatar_url);
    setShowPreview(true);
}}
            />
            <p className="text-sm mb-2">微信号：{u.wechat_id}</p>
          </div>
        ))}
      </div>
)}

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